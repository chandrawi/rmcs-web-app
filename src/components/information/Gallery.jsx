import { For } from 'solid-js';

export default function Gallery() {

  const items = [
    {
      file: "plan_view_2.jpg",
      description: "Plan view area cluster E PGE Hululais",
      width: "100%"
    },
    {
      file: "view_arah_selatan.jpg",
      description: "Aerial view arah selatan",
      width: "100%"
    },
    {
      file: "soil_inclinometer_belum_terpasang.jpg",
      description: "Soil inclinometer sebelum terpasang",
      width: "100%"
    },
    {
      file: "penyetelan_mesin_bor.jpg",
      description: "Penyetelan mesin bor",
      width: "100%"
    },
    {
      file: "proses_pengeboran_tanah.jpg",
      description: "Proses pengeboran tanah",
      width: "56%"
    },
    {
      file: "sistem_pemantauan_longsor.jpg",
      description: "Sistem pemantauan longsor terpasang",
      width: "56%"
    }
  ];

  return (
    <>
      <div class="w-full flex flex-row flex-wrap">
        <For each={items}>{(item, i) =>
          <div class="w-full xl:w-1/2 xs:px-1 py-1 max-w-[36rem]">
            <div class="xs:rounded-sm border border-slate-200 dark:border-slate-700">
              <div class="flex flex-row items-center bg-gray-100 dark:bg-gray-800">
                <div class="mx-3 my-1.5 flex flex-row items-center font-medium">
                  <span class="align-middle text-sm">{item.description}&nbsp;</span>
                </div>
              </div>
              <div class="flex flex-row justify-center p-3 bg-white dark:bg-gray-900">
                <img src={"/image/" + item.file} alt="" width={item.width} />
              </div>
            </div>
          </div>
        }</For>
      </div>
    </>
  );
}
