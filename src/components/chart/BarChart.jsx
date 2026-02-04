import { createEffect } from "solid-js";
import { darkTheme, stringToDate } from "../../store";

export default function BarChart(props) {

  function domainRange() {
    let min = undefined;
    let max = undefined;
    if (props.data && props.valueColumn && props.valueRange) {
      const rangeStep = props.valueRange[0];
      const rangeMin = props.valueRange[1];
      const rangeMax = props.valueRange[2];
      for (const row of props.data) {
        if (min === undefined || row[props.valueColumn] < min) min = row[props.valueColumn];
        if (max === undefined || row[props.valueColumn] > max) max = row[props.valueColumn];
      }
      min = Math.floor(min / rangeStep) * rangeStep;
      max = Math.ceil(max / rangeStep) * rangeStep;
      if (typeof rangeMin == "number") min = rangeMin;
      if (typeof rangeMax == "number") max = rangeMax;
    }
    return [min, max];
  };

  function formatDataTimestamp(data) {
    if (!Array.isArray(data)) return [];
    for(const i in data) {
      if (props.timeFrame == "hourly") {
        data[i][props.timestampColumn] = data[i][props.timestampColumn].slice(0, -3);
      }
      if (props.timeFrame == "daily" || props.timeFrame == "weekly") {
        data[i][props.timestampColumn] = data[i][props.timestampColumn].slice(0, -9);
      }
    }
    return data;
  }

  const idstring = (id) => {
    const okstring = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let okid = "";
    for (const c of id) okid += okstring.indexOf(c) >= 0 ? c : "_";
    return okid;
  };

  const vlSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    background: 'transparent',
    width: 'container',
    data: {
      values: formatDataTimestamp(props.data)
    },
    mark: {
      type: 'bar'
    },
    encoding: {
      x: {
        field: props.timestampColumn, 
        title: "Timestamp"
      },
      y: {
        field: props.valueColumn,
        type: "quantitative",
        title: props.valueColumn,
        scale: {
          domainMin: domainRange()[0],
          domainMax: domainRange()[1]
        }
      },
      xOffset: {},
      color: {}
    },
    config: {
      axis: {}
    }
  };

  if (props.legend) {
    vlSpec.encoding.xOffset.field = props.legend;
    vlSpec.encoding.color.field = props.legend;
    vlSpec.encoding.color.type = "nominal";
  }

  createEffect(() => {
    vlSpec.data.values = formatDataTimestamp(props.data);
    vlSpec.config.axis.gridColor = darkTheme() ? "#1f2937" : "#e5e7eb";
    vlSpec.config.axis.labelColor = darkTheme() ? "#e5e7eb" : "#1f2937";
    vlSpec.config.axis.titleColor = darkTheme() ? "#e5e7eb" : "#1f2937";
    vegaEmbed('#chart-' + idstring(props.valueColumn), vlSpec);
  });

  return (
    <div id={"chart-" + idstring(props.valueColumn)} style="width:100%"></div>
  );
}
