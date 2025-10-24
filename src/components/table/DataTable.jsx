import { Show, For, createSignal } from "solid-js";

export default function DataTable(props) {

  const [sortDirection, setSortDirection] = createSignal({});
  const [currentPage, setCurrentPage] = createSignal(0);
  const [pageCount, setPageCount] = createSignal(1);
  const [rowPerPages, setRowPerPages] = createSignal(20);
  const maxPagination = 10;

  // Create list of columns
  function columnList() {
    const list = [];
    for (const col in props.columns) {
      list.push(col);
    }
    return list;
  };

  // Create list of sortable columns
  function sortableList() {
    const dict = {};
    for (const col in props.columns) {
      dict[col] = props.columns[col].sortable ? true : false;
    }
    return dict;
  }

  // Create list of page number to show in pagination
  function pageList() {
    if (Array.isArray(props.data)) {
      setPageCount(Math.ceil(props.data.length / rowPerPages()));
      let start = 0;
      let end = pageCount();
      if (pageCount() > maxPagination) {
        if (currentPage() < (maxPagination / 2)) end = maxPagination;
        else if (currentPage() > (pageCount() - (maxPagination / 2))) start = pageCount() - maxPagination;
        else {
          start = currentPage() - (maxPagination / 2);
          end = currentPage() + 1 + (maxPagination / 2);
          end = end > pageCount() ? pageCount() : end;
        }
      }
      const list = [];
      for (let i=start; i<end; i++) list.push(i);
      return list;
    }
  }

  // Sort and filter table data to be shown on the page
  function pageData() {
    if (props.data) {
      const start = rowPerPages() * currentPage();
      const end = start + rowPerPages();
      let dataSorted = props.data;
      for (const col in sortDirection()) {
        dataSorted = dataSorted.sort((a, b) => {
          if (sortDirection()[col]) {
            return a[col] < b[col] ? -1 : 1;
          } else {
            return a[col] < b[col] ? 1 : -1;
          }
        });
      }
      return dataSorted.slice(start, end);
    }
  }

  // Switch to selected page of pagination
  function switchPage(page) {
    setCurrentPage(page);
  }

  // Change row per pages option
  function changeRowPerPages(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    setRowPerPages(parseInt(formData.get('rowNum')));
  }

  // Set sort direction ascending or descending of selected column
  function sortColumn(column, direction) {
    if (props.columns[column].sortable) {
      if (sortDirection()[column] !== direction) {
        setSortDirection((value) => {
          return {...value, [column]: direction};
        });
      } else {
        setSortDirection((value) => {
          const { [column]: _, ...newValue } = value;
          return newValue;
        });
      }
    }
  }

  // Format data value based on column configuration
  function dataValue(value, column) {
    if (props.columns[column].float_precission) {
      if (typeof value == "number") if (value % 1 !== 0) return value.toFixed(props.columns[column].float_precission);
    }
    else if (props.columns[column].string_limit) {
      if (typeof value == "string") return value.substring(0, props.columns[column].string_limit);
    }
    return value;
  }

  const align = (col) => {
    if (props.columns[col].align == "left") return "justify-left";
    else if (props.columns[col].align == "right") return "justify-right";
    return "justify-center"
  }

  return (
    <>
    <table class="w-full">
      <thead class="text-xs sm:text-sm break-words">
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <For each={columnList()}>
          {(col) => (
            <th class="px-3 py-1.5 font-semibold">
              <div class={"flex flex-row items-center " + align(col)}>
                <span>{ props.columns[col].content }</span>
                <Show when={sortableList()[col]}>
                  <button class="flex flex-col ml-1 my-auto text-xs leading-none">
                    <span class={"icon-chevron_up" + (sortDirection()[col] !== true ? " text-gray-300 dark:text-gray-700" : "")}
                      onclick={() => sortColumn(col, true)}
                    ></span>
                    <span class={"icon-chevron_down" + (sortDirection()[col] !== false ? " text-gray-300 dark:text-gray-700" : "")}
                      onclick={() => sortColumn(col, false)}
                    ></span>
                  </button>
                </Show>
              </div>
            </th>
          )}
          </For>
        </tr>
      </thead>
      <tbody class="text-xs sm:text-sm">
        <For each={pageData()}>
        {(row) => (
          <tr class={"even:bg-gray-50 border-b border-gray-100 dark:border-gray-700 dark:even:bg-gray-800"
            + (row.__link__ ? " hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer" : "")
          }>
            <For each={columnList()}>
            {(col) => (
              <td class="px-2 py-1 text-left">
                <Show when={props.columns[col].html} fallback={
                  <a href={row.__link__} class={"flex " + align(col)}>
                    { dataValue(row[col], col) }
                  </a>
                }>
                  <a href={row.__link__}>
                    {row[col]}
                  </a>
                </Show>
              </td>
            )}
            </For>
          </tr>
        )}
        </For>
      </tbody>
    </table>

    <div class="w-full py-2 flex flex-row flex-wrap items-center justify-between">
      <form action="#" class="h-full my-1 flex flex-row flex-wrap" onsubmit={changeRowPerPages}>
        <div class="flex flex-row">
          <label for="input-row" class="px-1.5 py-0.5 rounded-l-sm bg-slate-200 dark:bg-slate-700">Rows</label>
          <select name="rowNum" class="px-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20" selected>20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div class="ml-2 flex flex-row">
          <button class="px-2 py-0.5 bg-sky-700 text-gray-100 hover:bg-sky-800 rounded-sm hover:text-white">Set</button>
        </div>
      </form>

      <div class="h-[1.25rem] my-1 flex flex-row flex-wrap text-xs text-gray-50">
        <button onclick={() => switchPage(0)} class="flex flex-row items-stretch bg-slate-500 hover:bg-sky-800 mr-1">
          <span class="icon-arrow_fill_left text-base leading-none px-0.5 my-auto"></span>
        </button>
        <For each={pageList()}>
        {(page) => (
          <button onclick={() => switchPage(page)} class="min-w-[1.25rem] mx-[0.0625rem] px-1 inline-block align-middle hover:bg-sky-800" 
           classList={{ 'bg-sky-700': page === currentPage(), 'bg-slate-500': page !== currentPage() }}
          >
            { page + 1 }
          </button>
        )}
        </For>
        <button onclick={() => switchPage(pageCount() - 1)} class="flex flex-row bg-slate-500 hover:bg-sky-800 ml-1">
          <span class="icon-arrow_fill_right text-base leading-none px-0.5 my-auto"></span>
        </button>
      </div>
    </div>
    </>
  );
}
