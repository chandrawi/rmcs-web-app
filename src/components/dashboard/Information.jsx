import { useParams } from "@solidjs/router";
import { DEFAULT_DASHBOARD } from "../../store";
import Breadcrumb from "../navigation/Breadcrumb";
import Description from "../information/Description";
import Specification from "../information/Specification";
import Gallery from "../information/Gallery";

export default function Information() {

  const params = useParams();
  const dashboardName = () => params.name ? params.name : DEFAULT_DASHBOARD;
  const child1 = () => params.submenu ? params.submenu : undefined;

  const children1 = [
    {
      name: "description",
      text: "Description"
    },
    {
      name: "specification",
      text: "Specification"
    },
    {
      name: "gallery",
      text: "Gallery"
    }
  ];

  return (
    <>
    <Breadcrumb dashboard={dashboardName()} parent={{ name: "information", text: "Information" }} children1={children1} child1={child1()} />
    <Switch fallback={
      <Description />
    }>
      <Match when={child1() == "description"}>
        <Description />
      </Match>
      <Match when={child1() == "specification"}>
        <Specification />
      </Match>
      <Match when={child1() == "gallery"}>
        <Gallery />
      </Match>
    </Switch>
    </>
  );
}
