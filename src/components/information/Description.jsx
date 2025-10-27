
export default function Description() {
  return (
    <>
      <div class="w-full flex flex-row flex-wrap">
        <div class="w-full xs:px-1 py-1">
          <div class="xs:rounded-sm border border-slate-200 dark:border-slate-700">
            <div class="flex flex-row items-center bg-gray-100 dark:bg-gray-800">
              <div class="mx-3 my-1.5 flex flex-row items-center font-medium">
                <span class="align-middle text-sm">Sistem Pemantauan Longsor PGE Hululais</span>
              </div>
            </div>
            <div class="flex flex-row justify-center p-3 bg-white dark:bg-gray-900">
              <article class="prose text-gray-900 py-4 max-w-[80ch]">              
                <h3>Objek Pemantauan</h3>
                <p class="text-base/6 my-2">
                  Sistem pemantauan longsor adalah sistem untuk memantau pergerakan tanah di suatu area dan memberi peringatan sebelum terjadinya longsor. Salah satu metode untuk mengukur pergerakan tanah adalah dengan mengukur kemiringan beberapa titik di bawah tanah. Data kemiringan lalu diolah menjadi pergerakan tanah. Kumpulan data pergerakan tanah ini dipantau secara berkala untuk dibandingkan dengan kriteria ambang batas longsor. Peringatan akan diberikan saat pergerakan tanah melebihi kriteria ambang batas longsor.
                </p>
                <p class="text-base/6 my-2">
                  Sumur uap panas bumi banyak terletak pada daerah rawan longsor. Salah satunya di sumur uap milik PT Pertamina Geothermal Energy (PGE) di Hululais, kabupaten Lebong, Bengkulu. Sistem pemantauan ditempat ini ditujukan sebagai bagian dari tindak pengamanan asset-aset di lokasi sekitar sumur uap dari resiko longsor.
                </p>
                <h3>Aplikasi</h3>
                <p class="text-base/6 my-2">
                  Pemantauan longsor di sumur uap PGE Hululais dilakukan dengan cara mengebor tanah lalu memasang susunan sensor inclinometer digital. Sensor tersebut akan mengukur kemiringan secara terus menerus. Selain sensor inklinometer, dipasang juga sensor-sensor kondisi lingkungan antara lain sensor curah hujan, sensor piezometer untuk mengukur permukaan air tanah, serta sensor temperatur dan kelembaban udara.
                </p>
                <p class="text-base/6 my-2">
                  Sensor inklinometer yang digunakan adalah inklinometer tiga sumbu. Sumbu X sensor ditempatkan sejajar dengan vektor gravitasi, sumbu Y searah timur, dan sumbu Z searah utara. Penempatan sensor diilustrasikan pada gambar berikut.
                </p>
                <div class="flex flex-row justify-center w-full">
                  <img src="/image/arrow_direction.png" alt="" class="w-full lg:w-[80%] max-w-[520px] my-2" />
                </div>
                <div class="flex flex-row justify-center w-full">
                  <p class="text-base/2 mt-0 mb-2"><b>Gambar 1. </b>Sumbu dan arah sensor inklinometer.</p>
                </div>
                <p class="text-base/6 my-2">
                  Berdasarkan ilustrasi di atas, kemiringan sumbu Y arah sudut positif miring ke arah timur dan kemiringan sumbu Z arah sudut positif miring ke arah utara. Jadi, peningkatan kemiringan Y dan Z berputar ke arah timur dan utara, dan penurunannya berputar ke arah barat dan selatan. Arah pergerakan mengikuti arah kemiringan. Arah positif untuk sumbu Y bergerak ke timur, dan sumbu Z bergerak ke utara. Jadi, peningkatan pergerakan Y dan Z bergerak ke timur dan utara, dan penurunannya bergerak ke barat dan selatan.
                </p>
                <p class="text-base/6 my-2">
                  Data kemiringan diperoleh dari pembacaan sensor. Data pergerakan dihitung berdasarkan data kemiringan dan posisi kedalaman masing-masing sensor. Dengan kedalaman (e), kemiringan Y (θ), dan kemiringan Z (ψ) sensor yang diketahui, pergerakan ke arah Y (δ<sub>y</sub>) dan Z (δ<sub>z</sub>) pada setiap tingkat susunan inklinometer dihitung dengan rumus berikut.
                </p>
                <math display="block" class="text-lg my-3">
                  <mrow>
                    <msub><mi>δ</mi><mi>y0</mi></msub><mo>=</mo><mn>0;&nbsp;</mn>
                  </mrow>
                  <mrow>
                    <msub><mi>δ</mi><mi>z0</mi></msub><mo>=</mo><mn>0;&nbsp;</mn>
                  </mrow>
                </math>
                <math display="block" class="text-lg my-3">
                  <mrow>
                    <msub><mi>δ</mi><mi>y,i</mi></msub>
                    <mo>=</mo>
                    <mo>(</mo>
                      <msub><mi>e</mi><mi>i</mi></msub>
                      <mo>-</mo>
                      <msub><mi>e</mi><mi>i-1</mi></msub>
                    <mo>)</mo>
                    <mo>*</mo>
                    <mo>(</mo>
                    <mfrac>
                      <mrow>
                        <mo>sin</mo><msub><mi>θ</mi><mi>i</mi></msub>
                        <mo>+</mo>
                        <mo>sin</mo><msub><mi>θ</mi><mi>i-1</mi></msub>
                      </mrow>
                      <mrow><mn>2</mn></mrow>
                    </mfrac>
                    <mo>)</mo>
                  </mrow>
                </math>
                <math display="block" class="text-lg my-3">
                  <mrow>
                    <msub><mi>δ</mi><mi>z,i</mi></msub>
                    <mo>=</mo>
                    <mo>(</mo>
                      <msub><mi>e</mi><mi>i</mi></msub><mo>-</mo><msub><mi>e</mi><mi>i-1</mi></msub>
                    <mo>)</mo>
                    <mo>*</mo>
                    <mo>(</mo>
                    <mfrac>
                      <mrow>
                        <mo>sin</mo><msub><mi>ψ</mi><mi>i</mi></msub>
                        <mo>+</mo>
                        <mo>sin</mo><msub><mi>ψ</mi><mi>i-1</mi></msub>
                        </mrow>
                      <mrow><mn>2</mn></mrow>
                    </mfrac>
                    <mo>)</mo>
                  </mrow>
                </math>
                <p class="text-base/6 my-2">
                  Selanjutnya data pergerakan total (δ<sub>tot</sub>) dan arah pergerakan (φ) dihitung dengan rumus trigonometri sebagai berikut.
                </p>
                <math display="block" class="text-lg my-3">
                  <mrow>
                    <msub><mi>δ</mi><mi>tot,i</mi></msub>
                    <mo>=</mo>
                    <msqrt>
                      <msubsup><mi>δ</mi><mi>y,i</mi><mn>2</mn></msubsup>
                      <mo>+</mo>
                      <msubsup><mi>δ</mi><mi>z,i</mi><mn>2</mn></msubsup>
                      </msqrt>
                  </mrow>
                </math>
                <math display="block" class="text-lg my-3">
                  <mrow>
                    <msub><mi>δ</mi><mi>tot,i</mi></msub>
                    <mo>=</mo>
                    <msup><mo>tan</mo><mn>-1</mn></msup>
                    <mfrac>
                      <msub><mo>δ</mo><mo>z,i</mo></msub>
                      <msub><mo>δ</mo><mo>y,i</mo></msub>
                    </mfrac>
                  </mrow>
                </math>
                <p class="text-base/6 my-2">
                  Data pergerakan total dan arah pergerakan harian dilaporkan dalam bagian <strong>overview</strong> selama periode pemantauan bulanan. Untuk hasil yang lebih realistis dan akurat, data pergerakan harian pada pukul 00:00 digunakan.
                </p>
                <p class="text-base/6 my-2">
                  Sensor-sensor kondisi lingkungan ditujukan untuk mengamati hubungan kondisi lingkungan terhadap pergerakan tanah. Sensor curah hujan untuk melihat hubungan pergerakan tanah dengan waktu dan jumlah hujan. Sensor piezometer untuk mengetahui hubungan pergerakan tanah dengan serapan air hujan dan level kebasahan tanah. Sensor temperatur dan kelembaban udara sebagai catatan kondisi lingkungan seperti apa saat dan sebelum pergerakan tanah terjadi.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
