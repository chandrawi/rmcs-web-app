import { Show, For, createSignal, createResource, createEffect } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { read_set, list_model_by_ids, list_device_by_ids, list_data_set_by_later, list_data_set_by_range, read_data_set } from "bbthings_grpc";
import { resourceServer, dateToString } from "../../store";
import DataTable from "../table/DataTable";
import TimeChart from "../chart/TimeChart";

export default function SoilMovement(props) {

  const config = (key) => {
    const analysis = props.analysis;
    if (analysis) if (analysis.config) return analysis.config[key];
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const initViewMode = searchParams.view ? searchParams.view : config("view_mode") ? config("view_mode") : "table";
  const initTimeMode = searchParams.time ? searchParams.time : "live";
  const initDatasetMode = searchParams.dataset ? searchParams.dataset : "displacement_direction";
  const initTimeLater= searchParams.later ? parseInt(searchParams.later) : config("live_range") ? config("live_range") : 300000;
  const initTimeBegin = searchParams.begin && new Date(searchParams.begin) < new Date() ? new Date(searchParams.begin) : new Date();
  const initTimeEnd = searchParams.end && new Date(searchParams.end) < new Date() ? new Date(searchParams.end) : new Date();

  let [viewMode, setViewMode] = createSignal(initViewMode);
  let [timeMode, setTimeMode] = createSignal(initTimeMode);
  let [datasetMode, setDatasetMode] = createSignal(initDatasetMode);

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
  /**
   * @returns {Object.<string, number>|undefined}
   */
  const positionMap = () => {
    const configs = device_config();
    let map = {};
    let position = 0;
    if (configs) {
      for (const config of configs) {
        if (config.name == "space") {
          position = position - config.value;
          map[config.device_id] = position;
        }
      }
      return map;
    }
  };

  const [dataset, {refetch}] = createResource(props.analysis, async (input) => {
    if (timeMode() == "live") {
      const tLater = new Date(Date.now() - timeLater());
      return await list_data_set_by_range(resourceServer.get(props.apiId), {
        set_id: input.set_id,
        begin: tLater,
        end: new Date(Date.now())
      });
    }
    else if (timeMode() == "history") {
      return await list_data_set_by_range(resourceServer.get(props.apiId), {
        set_id: input.set_id,
        begin: timeBegin(),
        end: timeEnd()
      });
    }
  });

  /**
   * @returns {{ timestamp: Date|undefined, position: number, data: number[], group: string }[]}
   */
  const datasetMap = () => {
    let datasets = dataset();
    const sets = set();
    const positions = positionMap();
    let map = [];

    if (datasets && positions) {
      for (const dataset of datasets) {
        let index = 0;
        for (const member of sets.members) {
          if (dataset.data.length >= (index + member.data_index.length)) {
            map.push({
              timestamp: dataset.timestamp,
              position: positions[member.device_id],
              data: dataset.data.slice(index, index + member.data_index.length)
            });
          }
          index += member.data_index.length;
        }
      }
    }
    return map;
  };

  function columns() {
    if (model_config()) {
      const configs = model_config();
      const subset = config("subset")[datasetMode()];
      const cols = {
        ts: { content: "Timestamp", sortable: true, align: "left" },
        position: { content: "Position [mm]", sortable: true }
      };
      for (const i in configs) {
        if (Array.isArray(subset)) {
          if (!subset.includes(parseInt(i))) continue;
        }
        const scale = configs[i].filter((conf) => conf.name == "scale").reduce((_, conf) => conf).value;
        const symbol = configs[i].filter((conf) => conf.name == "symbol").reduce((_, conf) => conf).value;
        cols[scale] = {
          content: scale + " [" + symbol + "]",
          sortable: true,
          float_precission: config("float_precission")[scale]
        }
      }
      return cols;
    }
  }

  function dataTable() {
    if (datasetMap() && model_config()) {
      const configs = model_config();
      const dataTable = [];
      const subset = config("subset")[datasetMode()];
      for (const dataset of datasetMap()) {
        const dataRow = {
          ts: dataset.timestamp ? dateToString(dataset.timestamp) : null,
          position: dataset.position
        };
        for (const i in dataset.data) {
          if (Array.isArray(subset)) {
            if (!subset.includes(parseInt(i))) continue;
          }
          const scale = configs[i].filter((conf) => conf.name == "scale").reduce((_, conf) => conf).value;
          let value = dataset.data[i];
          dataRow[scale] = value;
        }
        dataTable.push(dataRow);
      }
      return dataTable;
    }
  }

  function dataCharts() {
    if (datasetMap() && model_config()) {
      const configs = model_config();
      const dataCharts = {};
      const subset = config("subset")[datasetMode()];
      for (const dataset of datasetMap()) {
        for (const i in dataset.data) {
          if (Array.isArray(subset)) {
            if (!subset.includes(parseInt(i))) continue;
          }
          const dataRow = {
            ts: dataset.timestamp ? dateToString(dataset.timestamp) : null,
            Position: dataset.position
          };
          const scale = configs[i].filter((conf) => conf.name == "scale").reduce((_, conf) => conf).value;
          let value = dataset.data[i];
          dataRow[scale] = value;
          if (dataCharts[scale] === undefined) dataCharts[scale] = [];
          dataCharts[scale].push(dataRow);
        }
      }
      return dataCharts;
    }
  }

  function itemCharts() {
    if (model_config() && dataCharts()) {
      const configs = model_config();
      const subset = config("subset")[datasetMode()];
      const items = [];
      const scales = [];
      for (const i in configs) {
        if (Array.isArray(subset)) {
          if (!subset.includes(parseInt(i))) continue;
        }
        const scale = configs[i].filter((conf) => conf.name == "scale").reduce((_, conf) => conf).value;
        const symbol = configs[i].filter((conf) => conf.name == "symbol").reduce((_, conf) => conf).value;
        if (!scales.includes(scale)) {
          items.push({
            scale: scale,
            content: scale + " [" + symbol + "]",
            range: config("chart_value_range") ? config("chart_value_range")[i] : undefined,
            range_domain: config("chart_domain_range") ? config("chart_domain_range")[i] : undefined
          });
        }
        scales.push(scale);
      }
      return items;
    }
    return [];
  }

  let selectTimeMode;
  let selectDatasetMode;
  let selectRange;
  let datetimeBegin;
  let datetimeEnd;

  function submitMode(e) {
    e.preventDefault();
    if (selectTimeMode.value == "live") {
      setSearchParams({
        time: "live",
        dataset: selectDatasetMode.value,
        later: selectRange.value,
        begin: null,
        end: null
      });
      setTimeLater(parseInt(selectRange.value));
      refetch();
    }
    else if (selectTimeMode.value == "history") {
      setSearchParams({
        time: "history",
        dataset: selectDatasetMode.value,
        later: null,
        begin: datetimeBegin.value,
        end: datetimeEnd.value
      });
      if (datetimeBegin.value && datetimeEnd.value) {
        if (new Date(datetimeBegin.value) < new Date()) setTimeBegin(new Date(datetimeBegin.value));
        if (new Date(datetimeEnd.value) < new Date()) setTimeEnd(new Date(datetimeEnd.value));
      }
      refetch();
    }
  }

  function changeViewMode(mode) {
    setViewMode(mode);
    setSearchParams({
      view: mode
    });
  }

  createEffect(() => {
    if (searchParams.time) selectTimeMode.value = searchParams.time;
    if (searchParams.later) selectRange.value = searchParams.later;
    if (searchParams.begin) datetimeBegin.value = searchParams.begin;
    if (searchParams.end) datetimeEnd.value = searchParams.end;
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

  return (
    <>
    <div class="w-full xs:px-1 py-1">
      <div class="w-full max-w-[48rem] xs:rounded-sm border border-slate-200 dark:border-slate-700">
        <div class="w-full flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-800">
          <div class="mx-2 my-1.5 flex flex-row items-center font-semibold">
            <span class={(props.analysis.icon ? props.analysis.icon : "icon-list_square") + " text-[1.5rem] align-middle"}></span>
            <span class="ml-1 align-middle">{props.analysis.name}&nbsp;</span>
          </div>
          <div class="mx-3 my-auto flex flex-row text-sm">
            <button class={"px-2 py-0.5 text-gray-100 rounded-l-sm " 
              + (viewMode() == 'graph' ? "bg-sky-700 cursor-default" : "bg-slate-500 hover:bg-sky-800 hover:text-white")}
              onclick={() => changeViewMode("graph")}
            >
              Graph
            </button>
            <button class={"px-2 py-0.5 text-gray-100 rounded-r-sm " 
              + (viewMode() == 'table' ? "bg-sky-700 cursor-default" : "bg-slate-500 hover:bg-sky-800 hover:text-white")}
              onclick={() => changeViewMode("table")}
            >
              Table
            </button>
          </div>
        </div>
        <div class="w-full bg-white dark:bg-gray-900 text-sm">
          <form action="#" class="px-2 py-2 flex flex-row flex-wrap" onsubmit={submitMode}>
            <div class="mx-1 my-1 flex flex-row">
              <label for="time-mode" class="px-1.5 py-0.5 rounded-l-sm bg-sky-100 dark:bg-sky-950">Mode</label>
              <select name="time-mode" class="px-1 bg-white border border-sky-100 dark:bg-slate-800 dark:border-sky-950"
                ref={selectTimeMode} onChange={() => setTimeMode(selectTimeMode.value)}
              >
                <option value="live">Live</option>
                <option value="history">History</option>
              </select>
            </div>
            <div class="mx-1 my-1 flex flex-row">
              <label for="dataset-mode" class="px-1.5 py-0.5 rounded-l-sm bg-sky-100 dark:bg-sky-950">Dataset</label>
              <select name="dataset-mode" class="px-1 bg-white border border-sky-100 dark:bg-slate-800 dark:border-sky-950"
                ref={selectDatasetMode} onChange={() => setDatasetMode(selectDatasetMode.value)}
              >
                <option value="displacement_component">Displacement Component</option>
                <option value="displacement_direction" selected>Displacement & Direction</option>
                <option value="all">All</option>
              </select>
            </div>
            <div class="grow"></div>
            <div class="flex flex-row flex-wrap justify-between">
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "live"}}>
                <label for="input-later" class="px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Range</label>
                <select name="time-later" class="px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  ref={selectRange}
                >
                  <For each={rangeList()}>
                  {(item) => (
                    <option value={item}>{rangeName(item)}</option>
                  )}
                  </For>
                </select>
              </div>
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "history"}}>
                <label for="input-begin" class="min-w-[3rem] px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Begin</label>
                <input type="datetime-local" step="1" name="time-begin" class="w-[12rem] px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                  ref={datetimeBegin}
                />
              </div>
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "history"}}>
                <label for="input-end" class="min-w-[3rem] px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">End</label>
                <input type="datetime-local" step="1" name="time-end" class="w-[12rem] px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                  ref={datetimeEnd}
                />
              </div>
              <div class="grow mx-1 my-1 flex flex-row justify-end">
                <button class="px-2 py-0.5 bg-sky-700 text-gray-100 hover:bg-sky-800 rounded-sm hover:text-white">Set</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <Show when={viewMode() == "graph"}>
      <div class="w-full flex flex-row flex-wrap">
        <For each={itemCharts()}>
        {(item) => (
          <div class="w-full xl:w-1/2 xs:px-1 py-1 max-w-[36rem]">
            <div class="xs:rounded-sm border border-slate-200 dark:border-slate-700">
              <div class="flex flex-row items-center bg-gray-100 dark:bg-gray-800">
                <div class="mx-3 my-1.5 flex flex-row items-center font-medium">
                  <span class="align-middle text-sm">{props.analysis.name}&nbsp;</span>
                  <span class="icon-chevron_right align-middle text-[0.875rem]"></span>
                  <span class="align-middle text-sm">&nbsp;{item.content}</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-900">
                <TimeChart data={dataCharts()[item.scale]} timestampColumn="ts" valueColumn={item.scale} valueRange={item.range} legend="Position" />
              </div>
            </div>
          </div>
        )}
        </For>
      </div>
    </Show>

    <Show when={viewMode() == "table"}>
      <div class="w-full xs:px-1 py-1 overflow-hidden">
        <div class="w-full max-w-[48rem] xs:rounded-sm border border-slate-200 dark:border-slate-700">
          <div class="flex flex-row items-center bg-gray-100 dark:bg-gray-800">
            <div class="mx-3 my-1.5 flex flex-row items-center font-medium">
              <span class="align-middle text-sm leading-6">{props.analysis.name}&nbsp;</span>
            </div>
          </div>
          <div class="w-full xs:px-4 py-2 bg-white dark:bg-gray-900 text-sm overflow-x-auto scrollbar-custom scrollbar-gutter-auto">
            <DataTable columns={columns()} data={dataTable()} />
          </div>
        </div>
      </div>
    </Show>
    </>
  );
}
