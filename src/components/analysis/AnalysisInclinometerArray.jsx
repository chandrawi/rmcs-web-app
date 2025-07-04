import { Show, For, createSignal, createResource, createEffect } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { read_set, read_model, read_device, list_data_set_by_last_time, list_data_set_by_range_time, read_data_set } from "rmcs-api-client";
import { resourceServer, dateToString } from "../../store";
import DataTable from "../table/DataTable";
import LineChart from "../chart/LineChart";

export default function AnalysisSoilInclinometer(props) {

  const config = (key) => {
    const analysis = props.analysis();
    if (analysis) if (analysis.config) return analysis.config[key];
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const initViewMode = searchParams.view ? searchParams.view : config("view_mode") ? config("view_mode") : "table";
  const initTimeMode = searchParams.time ? searchParams.time : "live";
  const initDataMode = searchParams.data ? searchParams.data : "old_new";
  const initTimeLast= searchParams.last ? parseInt(searchParams.last) : config("live_range") ? config("live_range") : 300000;
  const initTimeBegin = searchParams.begin ? new Date(searchParams.begin) : new Date();
  const initTimeEnd = searchParams.end ? new Date(searchParams.end) : new Date();
  const initTimeSpecific = searchParams.specific ? new Date(searchParams.specific) : new Date();

  let [viewMode, setViewMode] = createSignal(initViewMode);
  let [timeMode, setTimeMode] = createSignal(initTimeMode);
  let [dataMode, setDataMode] = createSignal(initDataMode);

  let [timeLast, setTimeLast] = createSignal(initTimeLast);
  let [timeBegin, setTimeBegin] = createSignal(initTimeBegin);
  let [timeEnd, setTimeEnd] = createSignal(initTimeEnd);
  let [timeSpecific, setTimeSpecific] = createSignal(initTimeSpecific);

  const [set] = createResource(props.analysis, async (input) => {
    return await read_set(resourceServer.get(props.apiId), { id: input.set_id })
  });
  const [model_config] = createResource(set, async (input) => {
    let configs = [];
    for (const member of input.members) {
      const model = await read_model(resourceServer.get(props.apiId), { id: member.model_id });
      const model_conf = model.configs.filter((_, index) => member.data_index.includes(index));
      configs = configs.concat(model_conf);
    }
    return configs;
  });
  const [device_config] = createResource(set, async (input) => {
    let configs = [];
    for (const member of input.members) {
      const device = await read_device(resourceServer.get(props.apiId), { id: member.device_id });
      configs = configs.concat(device.configs);
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
      let first_id = configs[0].device_id;
      for (const config of configs) {
        if (config.name == "space") {
          position = position + config.value;
          map[config.device_id] = position;
        }
      }
      return map;
    }
  };

  const [dataset, {refetch}] = createResource(props.analysis, async (input) => {
    if (timeMode() == "live") {
      const tLast = new Date(Date.now() - timeLast());
      return await list_data_set_by_last_time(resourceServer.get(props.apiId), {
        set_id: input.set_id,
        timestamp: tLast
      });
    }
    else if (timeMode() == "history" && dataMode() != "specific") {
      return await list_data_set_by_range_time(resourceServer.get(props.apiId), {
        set_id: input.set_id,
        begin: timeBegin(),
        end: timeEnd()
      });
    }
    else if (timeMode() == "history" && dataMode() == "specific") {
      return await read_data_set(resourceServer.get(props.apiId), {
        set_id: input.set_id,
        timestamp: timeSpecific()
      })
      .then((value) => [value]);
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
      if (dataMode() == "old_new") {
        datasets = datasets.filter((_, index) => index == 0 || index + 1 == datasets.length);
      }
      else if (dataMode() == "average") {
        let dataSum = [];
        let number = 0;
        for (const dataset of datasets) {
          for (const i in dataset.data) {
            if (typeof dataSum[i] == "number") {
              dataSum[i] = dataSum[i] + dataset.data[i];
            } else {
              dataSum[i] = dataset.data[i];
            }
          }
          number += 1;
        }
        const dataAverage = dataSum.map((value) => value / number);
        datasets = [{ data: dataAverage }];
      }

      for (const dataset of datasets) {
        let index = 0;
        for (const member of sets.members) {
          if (dataset.data.length >= (index + member.data_index.length)) {
            let group = dataMode();
            if (dataMode() == "old_new") {
              group = "newest";
              if (dataset.timestamp == datasets[0].timestamp) group = "oldest";
            }
            map.push({
              timestamp: dataset.timestamp,
              position: positions[member.device_id],
              data: dataset.data.slice(index, index + member.data_index.length),
              group: group
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
      const cols = {
        ts: { content: "Timestamp", sortable: true, align: "left" },
        position: { content: "Position [mm]", sortable: true }
      };
      for (const i in configs) {
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
      for (const dataset of datasetMap()) {
        const dataRow = {
          ts: dataset.timestamp ? dateToString(dataset.timestamp) : null,
          position: dataset.position
        };
        for (const i in dataset.data) {
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
      for (const dataset of datasetMap()) {
        for (const i in dataset.data) {
          const dataRow = {
            "Data set": dataset.group,
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
      const items = [];
      const scales = [];
      for (const i in configs) {
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
  let selectDataMode;
  let selectRange;
  let datetimeBegin;
  let datetimeEnd;
  let datetimeSpecific;

  function submitMode(e) {
    e.preventDefault();
    if (selectTimeMode.value == "live") {
      setSearchParams({
        time: "live",
        data: selectDataMode.value,
        last: selectRange.value,
        begin: null,
        end: null,
        specific: null
      });
      setTimeLast(parseInt(selectRange.value));
      refetch();
    }
    else if (selectTimeMode.value == "history") {
      setSearchParams({
        time: "history",
        data: selectDataMode.value,
        last: null,
        begin: dataMode() != "specific" ? datetimeBegin.value : null,
        end: dataMode() != "specific" ? datetimeEnd.value : null,
        specific: dataMode() == "specific" ? datetimeSpecific.value : null
      });
      if (datetimeBegin.value && datetimeEnd.value) {
        setTimeBegin(new Date(datetimeBegin.value));
        setTimeEnd(new Date(datetimeEnd.value));
      }
      if (datetimeSpecific.value) {
        setTimeSpecific(new Date(datetimeSpecific.value));
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
    if (searchParams.data) selectDataMode.value = searchParams.data;
    if (searchParams.last) selectRange.value = searchParams.last;
    if (searchParams.begin) datetimeBegin.value = searchParams.begin;
    if (searchParams.end) datetimeEnd.value = searchParams.end;
    if (searchParams.specific) datetimeSpecific.value = searchParams.specific;
  });

  const [rangeList, setRangeList] = createSignal([300000, 900000, 1800000, 3600000]);
  createEffect(() => {
    if (Array.isArray(config("live_ranges"))) setRangeList(config("live_ranges"));
    if (config("live_range")) selectRange.value = searchParams.last ? searchParams.last : config("live_range");
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
            <span class={(props.analysis().icon ? props.analysis().icon : "icon-list_square") + " text-[1.5rem] align-middle"}></span>
            <span class="ml-1 align-middle">{props.analysis().name}&nbsp;</span>
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
              <label for="input-mode" class="px-1.5 py-0.5 rounded-l-sm bg-sky-100 dark:bg-sky-950">Mode</label>
              <select name="time-mode" class="px-1 bg-white border border-sky-100 dark:bg-slate-800 dark:border-sky-950"
                ref={selectTimeMode} onChange={() => setTimeMode(selectTimeMode.value)}
              >
                <option value="live">Live</option>
                <option value="history">History</option>
              </select>
            </div>
            <div class="mx-1 my-1 flex flex-row">
              <label for="input-mode" class="px-1.5 py-0.5 rounded-l-sm bg-sky-100 dark:bg-sky-950">Data</label>
              <select name="data-mode" class="px-1 bg-white border border-sky-100 dark:bg-slate-800 dark:border-sky-950"
                ref={selectDataMode} onChange={() => setDataMode(selectDataMode.value)}
              >
                <option value="old_new">Old-New</option>
                <option value="average">Average</option>
                <option value="all">All</option>
                <option value="specific" classList={{"hidden": timeMode() != "history"}}>Specific</option>
              </select>
            </div>
            <div class="grow"></div>
            <div class="flex flex-row flex-wrap justify-between">
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "live" || dataMode() == "specific"}}>
                <label for="input-last" class="px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Range</label>
                <select name="time-last" class="px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  ref={selectRange}
                >
                  <For each={rangeList()}>
                  {(item) => (
                    <option value={item}>{rangeName(item)}</option>
                  )}
                  </For>
                </select>
              </div>
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "history" || dataMode() == "specific"}}>
                <label for="input-begin" class="min-w-[3rem] px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Begin</label>
                <input type="datetime-local" step="1" name="time-begin" class="w-[12rem] px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                  ref={datetimeBegin}
                />
              </div>
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": timeMode() != "history" || dataMode() == "specific"}}>
                <label for="input-end" class="min-w-[3rem] px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">End</label>
                <input type="datetime-local" step="1" name="time-end" class="w-[12rem] px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                  ref={datetimeEnd}
                />
              </div>
              <div class="mx-1 my-1 flex flex-row" classList={{"hidden": dataMode() != "specific"}}>
                <label for="input-end" class="min-w-[3rem] px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Datetime</label>
                <input type="datetime-local" step="1" name="time-end" class="w-[12rem] px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                  ref={datetimeSpecific}
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
                  <span class="align-middle text-sm">{props.analysis().name}&nbsp;</span>
                  <span class="icon-chevron_right align-middle text-[0.875rem]"></span>
                  <span class="align-middle text-sm">&nbsp;{item.content}</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-900">
                <Show when={config("chart_domain") == "y"} fallback={
                  <LineChart data={dataCharts()[item.scale]} domain="Position" xColumn="Position" yColumn={item.scale} yRange={item.range} xRange={item.range_domain} />
                }>
                  <LineChart data={dataCharts()[item.scale]} domain="Position" yColumn="Position" xColumn={item.scale} xRange={item.range} yRange={item.range_domain} />
                </Show>
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
              <span class="align-middle text-sm leading-6">{props.analysis().name}&nbsp;</span>
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
