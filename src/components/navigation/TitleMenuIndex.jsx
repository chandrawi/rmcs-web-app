
export default function TitleMenuIndex() {
  return (
    <>
    <div class="dropdown h-full static sm:relative">
      <div class="w-full h-full overflow-hidden break-words">
        <button tabindex="0" class="group h-full pl-3 pr-2.5 flex flex-row items-center justify-center md:justify-start hover:text-sky-800 sm:border-x border-slate-200 dark:hover:text-sky-300 dark:border-slate-700">
          <span class="icon-monitoring text-[1.5rem] text-gray-500 group-hover:text-sky-950 dark:group-hover:text-sky-100"></span>
          <h1 class="h-full leading-[3.5rem] ml-1 mr-0.5 xs:ml-2 xs:mr-1 font-medium text-lg">Monitoring</h1>
          <span class="icon-arrow_fill_down text-[1rem] text-sky-700"></span>
        </button>
      </div>
      <div class="w-full sm:w-auto flex flex-row absolute left-0 justify-center sm:justify-start break-words">
        <div class="dropdown-content w-80 bg-white shadow-md_res shadow-slate-200 rounded-b-sm dark:bg-gray-800 dark:shadow-slate-950">
          <a href="/#/" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-monitoring text-[1.25rem]"></span>
            <span class="ml-1.5">Monitoring System</span>
          </a>
          <div class="w-full px-2 py-1.5 sm:hidden flex flex-row items-center border-t border-slate-200 dark:border-slate-700">
            <span class="icon-grid_view text-[1.25rem]"></span>
            <span class="ml-1.5">Category</span>
          </div>
          <div class="w-full block sm:hidden text-sm">
            <a href="/#/category" class="w-full pl-8 pr-2 py-1 flex flex-row items-center border-t border-slate-200 border-dotted hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
              <span class="icon-list_square text-[1rem]"></span>
              <span class="ml-1.5">----</span>
            </a>
          </div>
          <div class="w-full px-2 py-1.5 sm:hidden flex flex-row items-center border-t border-slate-200 dark:border-slate-700">
            <span class="icon-globe text-[1.25rem]"></span>
            <span class="ml-1.5">Region</span>
          </div>
          <div class="w-full block sm:hidden text-sm">
            <a href="/#/region" class="w-full pl-8 pr-2 py-1 flex flex-row items-center border-t border-slate-200 border-dotted hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
              <span class="icon-list_square text-[1rem]"></span>
              <span class="ml-1.5">----</span>
            </a>
          </div>
          <a href="/#/" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-home text-[1.25rem]"></span>
            <span class="ml-1.5">Home</span>
          </a>
        </div>
      </div>
    </div>
    <div class="dropdown h-full static sm:relative">
      <div class="w-full h-full overflow-hidden break-words">
        <button tabindex="0" class="group h-full pl-3 pr-2.5 hidden sm:flex flex-row items-center hover:text-sky-800 border-r border-slate-200 dark:hover:text-sky-300 dark:border-slate-700">
          <span class="icon-grid_view text-[1.5rem] text-gray-500 group-hover:text-sky-950 dark:group-hover:text-sky-100"></span>
          <h1 class="h-full leading-[3.5rem] ml-1 mr-0.5 xs:ml-2 xs:mr-1 font-medium text-lg">Category</h1>
          <span class="icon-arrow_fill_down text-[1rem] text-sky-700"></span>
        </button>
      </div>
      <div class="w-full sm:w-auto flex flex-row break-words">
        <div class="dropdown-content w-60 bg-white shadow-md_res shadow-slate-200 rounded-b-sm dark:bg-gray-800 dark:shadow-slate-950">
          <a href="/#/category" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-list_square text-[1rem]"></span>
            <span class="ml-1.5">----</span>
          </a>
        </div>
      </div>
    </div>
    <div class="dropdown h-full static sm:relative">
      <div class="w-full h-full overflow-hidden break-words">
        <button tabindex="0" class="group h-full pl-3 pr-2.5 hidden sm:flex flex-row items-center hover:text-sky-800 border-r border-slate-200 dark:hover:text-sky-300 dark:border-slate-700">
          <span class="icon-globe text-[1.5rem] text-gray-500 group-hover:text-sky-950 dark:group-hover:text-sky-100"></span>
          <h1 class="h-full leading-[3.5rem] ml-1 mr-0.5 xs:ml-2 xs:mr-1 font-medium text-lg">Region</h1>
          <span class="icon-arrow_fill_down text-[1rem] text-sky-700"></span>
        </button>
      </div>
      <div class="w-full sm:w-auto flex flex-row justify-end lg:justify-start break-words">
        <div class="dropdown-content w-60 bg-white shadow-md_res shadow-slate-200 rounded-b-sm dark:bg-gray-800 dark:shadow-slate-950">
          <a href="/#/region" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-list_square text-[1rem]"></span>
            <span class="ml-1.5">----</span>
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
