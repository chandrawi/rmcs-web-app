import { Switch, Match, createResource } from "solid-js";
import { useParams } from "@solidjs/router";
import { DEFAULT_DASHBOARD } from "../../store";
import Breadcrumb from "../navigation/Breadcrumb";
import ItemList from "./ItemList";
import InclinometerShape from "../analysis/InclinometerShape";
import SoilMovement from "../analysis/SoilMovement";

export default function Analysis() {

  const params = useParams();
  const dashboardName = () => params.name ? params.name : DEFAULT_DASHBOARD;
  const analysisType = () => params.submenu ? params.submenu : undefined;
  const analysisName = () => params.rest ? params.rest.split("/")[0] : undefined;

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
    const response = await fetch(`/data/dashboard/${dashboard.name}/analysis.json`);
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

  const children1 = () => {
    const items = analyses();
    if (items) {
      return Object.keys(items).map((key) => { 
        return {
          name: key, 
          text: items[key].text
        }; 
      });
    }
  };

  const children2 = () => {
    const items = analyses();
    const children2 = [];
    if (items) {
      for (const type in items) {
        for (const setName in items[type].set_id) {
          children2.push({
            parent: type,
            name: setName,
            text: setName
          })
        }
      }
      return children2;
    }
  };

  const itemListConfig = () => {
    let text = "Analysis";
    let icon = "icon-analysis";
    const analysisMap = analyses();
    const type = analysisType();
    if (analysisMap) if (type in analysisMap) {
      text = analysisMap[type].text;
      icon = analysisMap[type].icon;
    }
    return {
      dashboard: dashboardName(),
      menu: "analysis",
      type: analysisType(),
      text: text,
      icon: icon
    };
  };

  return (
    <>
    <Breadcrumb dashboard={dashboardName()} parent={{ name: "analysis", text: "Analysis" }} children1={children1()} children2={children2()} child1={analysisType()} child2={analysisName()} />
    <Switch fallback={
      <ItemList apiId={apiId()} sets={analyses} config={itemListConfig()} />
    }>
      <Match when={analysis() && analysisType() == "inclinometer_shape"}>
        <InclinometerShape apiId={apiId()} analysis={analysis} />
      </Match>
      <Match when={analysis() && analysisType() == "soil_movement"}>
        <SoilMovement apiId={apiId()} analysis={analysis} />
      </Match>
    </Switch>
    </>
  );
}
