
export default function TitleMenuDashboard() {
  return (
    <div class="dropdown h-full static sm:relative">
      <div class="w-full h-full flex flex-row justify-center md:justify-start overflow-hidden break-all">
        <button class="group h-full flex flex-row items-center justify-center md:justify-start hover:text-sky-800 dark:hover:text-sky-300 overflow-hidden break-all">
          <svg viewBox="0 0 300 300" class="w-6 h-6 text-gray-500 group-hover:text-sky-950 dark:group-hover:text-sky-100">
            <use href="/icon/dashboard.svg#landslide"></use>
          </svg>
          <h1 class="h-full leading-[3.5rem] ml-1 mr-0.5 xs:ml-2 xs:mr-1 font-medium text-lg sm:hidden">Landslide Monitoring</h1>
          <h1 class="h-full leading-[3.5rem] ml-1 mr-0.5 xs:ml-2 xs:mr-1 font-medium text-lg hidden sm:inline">Landslide Monitoring</h1>
          <span class="icon-arrow_fill_down text-[1rem] text-sky-700"></span>
        </button>
      </div>
      <div class="w-full sm:w-auto flex flex-row absolute left-0 justify-center sm:justify-start break-words">
        <div class="dropdown-content w-80 bg-white shadow-md_res shadow-slate-200 rounded-b-sm dark:bg-gray-800 dark:shadow-slate-950">
          <a href="/#/" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-list_square text-[1rem]"></span>
            <span class="ml-1.5">Structural Health Monitoring</span>
          </a>
          <a href="/#/category/bridge" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-list_square text-[1rem]"></span>
            <span class="ml-1.5">Category: Infrastucture</span>
          </a>
          <a href="/#/region/province/kalimantan_selatan" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-globe text-[1rem]"></span>
            <span class="ml-1.5">Region: DKI Jakarta</span>
          </a>
          <a href="/#/" class="w-full px-2 py-1.5 flex flex-row items-center border-t border-slate-200 hover:text-sky-800 dark:border-slate-700 dark:hover:text-sky-300">
            <span class="icon-monitoring text-[1rem]"></span>
            <span class="ml-1.5">Gundala Monitoring System</span>
          </a>
        </div>
      </div>
    </div>
  );
}
