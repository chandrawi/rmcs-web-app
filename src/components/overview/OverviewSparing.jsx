import { Show, For, createSignal, createResource, createEffect } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { read_set, list_model_by_ids, list_device_by_ids, list_data_set_by_later, list_data_set_by_range, read_data_set } from "bbthings_grpc";
import { resourceServer, dateToString } from "../../store";

export default function OverviewSparing(props) {

  const config = (key) => {
    const analysis = props.analysis;
    if (analysis) if (analysis.config) return analysis.config[key];
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const initTimeLater= searchParams.later ? parseInt(searchParams.later) : config("live_range") ? parseInt(config("live_range")) : 300000;
  const initTimeBegin = searchParams.begin && new Date(searchParams.begin) < new Date() ? new Date(searchParams.begin) : new Date(Date.now() - parseInt(initTimeLater));
  const initTimeEnd = searchParams.end && new Date(searchParams.end) < new Date() ? new Date(searchParams.end) : new Date();

  let [timeLater, setTimeLater] = createSignal(initTimeLater);
  let [timeBegin, setTimeBegin] = createSignal(initTimeBegin);
  let [timeEnd, setTimeEnd] = createSignal(initTimeEnd);

  const [set] = createResource(props.analysis, async (input) => {
    return await read_set(resourceServer.get(props.apiId), { id: input.set_id })
  });
  const [model_config] = createResource(set, async (input) => {
    const model_ids = input.members.map(member => member.model_id);
    const models = await list_model_by_ids(resourceServer.get(props.apiId), { ids: model_ids });
    let configs = [];
    for (const member of input.members) {
      const model = models.find(model => model.id == member.model_id);
      if (model) {
        const model_conf = model.configs.filter((_, index) => member.data_index.includes(index));
        configs = configs.concat(model_conf);
      }
    }
    return configs;
  });
  const [device_config] = createResource(set, async (input) => {
    const device_ids = input.members.map(member => member.device_id);
    const devices = await list_device_by_ids(resourceServer.get(props.apiId), { ids: device_ids });
    let configs = [];
    for (const member of input.members) {
      const device = devices.find(device => device.id == member.device_id);
      if (device) {
        configs = configs.concat(device.configs);
      }
    }
    return configs;
  });

  const [dataset, {refetch}] = createResource(props.analysis, async (input) => {
    const tEnd = Date.now();
    const tBegin = tEnd - parseInt(timeLater());
    return await list_data_set_by_range(resourceServer.get(props.apiId), {
      set_id: input.set_id,
      begin: new Date(tBegin),
      end: new Date(tEnd)
    });
  });

  function datasetLast() {
    const configs = model_config();
    const datasets = dataset();
    if (datasets && configs) {
      if (datasets.length > 0) {
        const dataset = datasets[datasets.length-1];
        const dataLast = [];
        for (const i in dataset.data) {
          const scale = configs[i].filter((conf) => conf.name == "scale").reduce((_, conf) => conf).value;
          const symbol = configs[i].filter((conf) => conf.name == "symbol").reduce((_, conf) => conf).value;
          dataLast.push({
            ts: dataset.timestamp ? dateToString(dataset.timestamp) : null,
            data: dataset.data[i],
            scale: scale,
            symbol: symbol
          });
        }
        return dataLast;
      }
    }
  }

  let selectRange;

  function submitMode(e) {
    e.preventDefault();
    setSearchParams({
      later: selectRange.value
    });
    setTimeLater(parseInt(selectRange.value));
    refetch();
  }

  createEffect(() => {
    if (searchParams.later) selectRange.value = searchParams.later;
  });

  const [rangeList, setRangeList] = createSignal([300000, 900000, 1800000, 3600000]);
  createEffect(() => {
    if (Array.isArray(config("live_ranges"))) setRangeList(config("live_ranges"));
    if (config("live_range")) selectRange.value = searchParams.later ? searchParams.later : config("live_range");
  });
  function rangeName(range) {
    if (range < 60000) return String(range / 1000) + " seconds";
    else if(range == 60000) return "1 minute";
    else if(range < 3600000) return String(range / 60000) + " minutes";
    else if(range == 3600000) return "1 hour";
    else if(range < 86400000) return String(range / 3600000) + " hours";
    else if(range == 86400000) return "1 day";
    else return String(range / 86400000) + " day(s)";
  }

  createEffect(() => {
    // console.log(set());
    console.log(dataset());
    console.log(datasetLast());
  });

  return (
    <>

      <div class="w-full xs:px-1 py-1">
        <div class="w-full max-w-[48rem] xs:rounded-sm border border-slate-200 dark:border-slate-700">
          <div class="w-full flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-800">
            <div class="mx-2 my-1.5 flex flex-row items-center font-semibold">
              <span class={(props.analysis.icon ? props.analysis.icon : "icon-list_square") + " text-[1.5rem] align-middle"}></span>
              <span class="ml-1 align-middle">{props.analysis.name}&nbsp;</span>
            </div>
          </div>
          <div class="w-full bg-white dark:bg-gray-900 text-sm">
            <form action="#" class="px-2 py-2 flex flex-row flex-wrap" onsubmit={submitMode}>
              <div class="w-full flex flex-row flex-wrap justify-between">
                <div class="mx-1 my-1 flex flex-row">
                  <label for="input-later" class="px-1.5 py-0.5 rounded-l-sm bg-sky-100 dark:bg-sky-950">Range</label>
                  <select name="time-later" class="px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    ref={selectRange}
                  >
                    <For each={rangeList()}>
                    {(item) => (
                      <option value={item} selected={timeLater() == item}>{rangeName(item)}</option>
                    )}
                    </For>
                  </select>
                </div>
                <div class="grow mx-1 my-1 flex flex-row justify-end">
                  <button class="px-2 py-0.5 bg-sky-700 text-gray-100 hover:bg-sky-800 rounded-sm hover:text-white">Check</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="w-full flex flex-row flex-wrap">
        <For each={datasetLast()}>
        {(item) => (
          <div class="w-full min-w-[10rem] max-w-[18rem] xs:px-1 py-1">
            <div class="xs:rounded-sm border border-slate-200 dark:border-slate-700">
              <div class="flex flex-row justify-center items-center bg-gray-100 dark:bg-gray-800">
                <div class="mx-3 my-2 flex flex-row items-center font-medium">
                  <span class="align-middle text-md font-semibold">{item.scale}&nbsp;</span>
                </div>
              </div>
              <div class="flex flex-row justify-center pt-5 pb-4 bg-white dark:bg-gray-900">
                <span class="text-2xl/8 font-semibold">{item.data}&nbsp;</span>
                <span class="text-sm/8">&nbsp;{item.symbol}</span>
              </div>
              <div class="flex flex-row justify-center py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900">
                <span class="text-sm">{item.ts}&nbsp;</span>
              </div>
            </div>
          </div>
        )}
        </For>
      </div>

    </>
  );
}
