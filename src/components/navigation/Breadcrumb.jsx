import { Show, For } from "solid-js";

export default function Breadcrumb(props) {

  const child1Text = () => {
    if (props.children1) {
      return props.children1
        .filter((value) => value.name == props.child1)
        .reduce((prev, cur) => { return cur }, {}).text
    }
  };
  const child2Text = () => {
    if (props.children2) {
      return props.children2
        .filter((value) => value.name == props.child2)
        .reduce((prev, cur) => { return cur }, {}).text
    }
  };

  const setLink = (menu, submenu, item) => {
    return "/dashboard/" + [props.dashboard, menu, submenu, item].join("/")
  };

  return (
    <div class="w-full px-2 pt-1.5 pb-2 flex flex-row items-center font-medium text-gray-800 dark:text-gray-200">
      <Show when={props.parent.name}>
        <a href={setLink(props.parent.name)} class="hover:text-sky-800 dark:hover:text-sky-300">
          {props.parent.text}
        </a>
        <span class="icon-arrow_fill_right text-[0.75rem] text-sky-800 dark:text-sky-300 px-1"></span>
      </Show>

      <Show when={child1Text()} fallback={
        <div class="dropdown min-w-24 h-full relative bg-sky-100 dark:bg-sky-950 text-sm rounded-sm">
        <button tabindex="0" class="group w-full h-full px-2 py-0.5 flex flex-row items-center justify-between text-gray-800 hover:text-sky-800 dark:text-gray-50 dark:hover:text-sky-300">
          <span class="w-full text-center">{child1Text() ? child1Text() : "————"}</span>
          <span class="icon-arrow_fill_down text-[0.75rem] ml-1"></span>
        </button>
        <div tabindex="0" class="dropdown-content min-w-full absolute flex flex-col justify-center bg-white shadow-md shadow-slate-200 dark:shadow-slate-950 dark:bg-slate-800">
          <For each={props.children1}>
          {(item) => (
            <a href={setLink(props.parent.name, item.name)} class="w-full px-2 py-1 break-words hover:text-sky-800 border-t border-slate-200 border-dotted dark:hover:text-sky-300 dark:border-slate-700">
              {item.text}
            </a>
          )}
          </For>
        </div>
      </div>
      }>
        <a href={setLink(props.parent.name, props.child1)} class="hover:text-sky-800 dark:hover:text-sky-300">
          {child1Text()}
        </a>
        <Show when={props.children2}>
          <span class="icon-arrow_fill_right text-[0.75rem] text-sky-800 dark:text-sky-300 px-1"></span>
        </Show>
      </Show>

      <Show when={child1Text() && props.children2}>
        <div class="dropdown min-w-24 h-full relative bg-sky-100 dark:bg-sky-950 text-sm rounded-sm">
          <button tabindex="0" class="group w-full h-full px-2 py-0.5 flex flex-row items-center justify-between text-gray-800 hover:text-sky-800 dark:text-gray-50 dark:hover:text-sky-300">
            <span class="w-full text-center">{child2Text() ? child2Text() : "————"}</span>
            <span class="icon-arrow_fill_down text-[0.75rem] ml-1"></span>
          </button>
          <div tabindex="0" class="dropdown-content min-w-full absolute flex flex-col justify-center bg-white shadow-md shadow-slate-200 dark:shadow-slate-950 dark:bg-slate-800">
            <For each={props.children2}>
            {(item) => (
              <Show when={item.parent == props.child1}>
                <a href={setLink(props.parent.name, item.parent, item.name)} class="w-full px-2 py-1 break-words hover:text-sky-800 border-t border-slate-200 border-dotted dark:hover:text-sky-300 dark:border-slate-700">
                  {item.name}
                </a>
              </Show>
            )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
