import { Show, createResource, createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import { DEFAULT_DASHBOARD } from "../../store";
import OverviewSparing from "../overview/OverviewSparing";

export default function Overview() {

  const params = useParams();
  const dashboardName = () => params.name ? params.name : DEFAULT_DASHBOARD;
  const analysisType = () => "sparing_sensors";
  const analysisName = () => "Sparing_Sensor";

  const [dashboard] = createResource(dashboardName, async (name) => {
    const response = await fetch(`/data/dashboard/${name}/dashboard.json`);
    /** 
     * @type {{ api_id:string, group_id:string, name: string }}
     */
    const dashboard = await response.json();
    dashboard.name = name;
    return dashboard;
  });
  const apiId = () => dashboard().api_id;

  const [analyses] = createResource(dashboard, async (dashboard) => {
    const response = await fetch(`/data/dashboard/${dashboard.name}/overview.json`);
    /**
     * @type {Object.<string, { text:string, set_id:Object.<string,string>, config:Object }>}
     */
    const analyses = await response.json();
    return analyses;
  });

  const analysis = () => {
    const type = analysisType();
    const name = analysisName();
    const analysisMap = analyses();
    if (type && name && analysisMap) {
      const filter = Object.keys(analysisMap[type].set_id).filter((deviceName) => deviceName == name);
      if (filter.length > 0) {
        return {
          name: name,
          icon: analysisMap[type].icon,
          set_id: analysisMap[type].set_id[filter[0]],
          config: analysisMap[type].config
        };
      }
    }
  };

  // createEffect(() => {
  //   console.log(analyses());
  //   console.log(analysis());
  // });

  return (
    <Show when={analysis()}>
      <OverviewSparing apiId={apiId()} analysis={analysis()} />
    </Show>
  );
}
