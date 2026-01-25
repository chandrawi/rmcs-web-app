import { createEffect } from "solid-js";
import { darkTheme, stringToDate } from "../../store";

export default function TimeChart(props) {

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

  function timeUnit() {
    let unit = "seconds";
    if (props.data && props.timestampColumn) {
      let tsmin = undefined;
      let tsmax = undefined;
      for (const row of props.data) {
        const ts = row[props.timestampColumn];
        const timestamp = ts instanceof Date ? ts : stringToDate(row[props.timestampColumn]);
        if (tsmin === undefined || timestamp.valueOf() < tsmin.valueOf()) tsmin = timestamp;
        if (tsmax === undefined || timestamp.valueOf() > tsmax.valueOf()) tsmax = timestamp;
      }
      const range = tsmin && tsmax ? tsmax.valueOf() - tsmin.valueOf() : 0;
      if (range < 90000) unit = "seconds";
      else if (range < 5400000) unit = "hoursminutesseconds";
      else if (range < 129600000) unit = "hoursminutesseconds";
      else unit = "monthdate";
    }
    return unit;
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
      values: props.data
    },
    mark: {
      type: 'line',
      interpolate: 'basis'
    },
    encoding: {
      x: {
        timeUnit: timeUnit(), 
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
      }
    },
    config: {
      axis: {}
    }
  };

  if (props.legend) {
    vlSpec.encoding.color = {
      field: props.legend,
      type: "nominal"
    };
  }

  createEffect(() => {
    vlSpec.data.values = props.data;
    vlSpec.config.axis.gridColor = darkTheme() ? "#1f2937" : "#e5e7eb";
    vlSpec.config.axis.labelColor = darkTheme() ? "#e5e7eb" : "#1f2937";
    vlSpec.config.axis.titleColor = darkTheme() ? "#e5e7eb" : "#1f2937";
    vegaEmbed('#chart-' + idstring(props.valueColumn), vlSpec);
  });

  return (
    <div id={"chart-" + idstring(props.valueColumn)} style="width:100%"></div>
  );
}
