# Pojok BPS Muba

Portal informasi statistik dan layanan untuk BPS Kabupaten Musi Banyuasin,
Sumatera Selatan. Website ini dikembangkan untuk membantu masyarakat, perangkat
daerah, akademisi, peneliti, dan pelaku usaha menemukan informasi statistik dan
kanal pelayanan yang sesuai dengan kebutuhan mereka.

Proyek sudah beralih dari tahap prototype ke pengembangan website. Dokumentasi
dan konten halaman mengikuti tujuan tersebut, dengan status layanan yang tetap
sesuai implementasi saat ini.

## Ruang Lingkup

- Beranda: akses topik statistik, ringkasan indikator, dan informasi layanan.
- Profil BPS: peran lembaga, organisasi, informasi kantor, dan kontak.
- Statistik & Data: indikator daerah, tren, serta tautan publikasi dan tabel BPS.
- Layanan: informasi kebutuhan layanan dan akses kanal pelayanan resmi.
- Perbaikan Data Desil DTSEN: pengisian data pemohon dan pengiriman dokumen pengajuan.
- Kegiatan: kalender periode sensus dan survei, rincian tanggal, serta rujukan BPS.
- Admin Dashboard: pencarian, filter status, dan ringkasan pengajuan.

## Kondisi Implementasi

- Frontend menggunakan Svelte dan routing di sisi klien.
- Jaringan portal Beranda menyediakan akses Statistik & Data, form DTSEN, dan
  kalender Kegiatan, serta tautan PST, Publikasi BPS, dan Pengaduan dari kanal
  yang sudah dicantumkan di proyek. Tautan eksternal membuka tab baru.
- Beranda setelah jumbotron menampilkan Sekilas Musi Banyuasin, sorotan lima
  kecamatan dengan pilihan indikator, peta ringkas interaktif beserta pilihan
  kecamatan, akses layanan, tiga publikasi pilihan, dan ringkasan agenda.
  Angka menggunakan sumber KCDA yang sama dengan halaman statistik. Publikasi
  dan sampul merujuk halaman BPS; tautan baca membuka halaman sumber. Agenda
  memakai jadwal nasional yang tersedia dan menampilkan keadaan kosong jika
  belum ada agenda mendatang, dengan periode terdahulu ditandai selesai.
- Indikator, profil, kontak, dan kegiatan publik merujuk sumber BPS yang
  dicantumkan pada halaman. Konten disimpan lokal dan tidak diperbarui otomatis.
- Tautan layanan mengarah ke kanal resmi BPS yang sudah tersedia.
- Form DTSEN memakai Zod dan service Axios khusus create ke API Satu Portal.
  Tombol kirim membuka AlertDialog konfirmasi, tanpa tahap tinjauan. Setelah
  berhasil, form menampilkan ID penyimpanan dan pilihan membuat pengajuan baru.
  API create berjalan sebagai Supabase Edge Function `dtsen-create` yang dikelola
  di repo Satu Portal; pengiriman dinonaktifkan ketika URL fungsi belum
  dikonfigurasi. Form ini tidak menyediakan baca, ubah, hapus, atau unduh
  pengajuan. Database dan Storage menjadi tanggung jawab backend Satu Portal.
- Dashboard admin masih memakai data contoh yang ditandai. Autentikasi dan
  pengelolaan pengajuan nyata belum terhubung.
- Halaman `/login` menyediakan form email dan password tanpa pendaftaran.
  Form memvalidasi isian secara lokal dan menampilkan status autentikasi yang
  belum tersedia; form belum mengirim atau menyimpan kredensial.
- Statistik per kecamatan menampilkan dashboard ECharts dari workbook lokal
  `public/Data KCDA 2026.xlsx`. Semua 38 sheet tersedia pada 15 halaman
  kecamatan, dilengkapi pencarian, filter topik, pilihan tabel/periode/indikator,
  tabel nilai, dan unduhan sumber. Daftar singkatan disajikan sebagai referensi;
  sheet 1.1 dan 1.2 mengikuti catatan sumber bahwa datanya tidak digunakan.
  Layout dikelompokkan per topik dengan navigasi samping, grafik utama lebar,
  panel komposisi, dan direktori berbentuk tabel. Visualisasi memakai kolom,
  batang horizontal, donut untuk komposisi lengkap, tren garis/area pertanian,
  dan peta warna akses pendidikan. Nilai kosong tidak disambungkan pada tren;
  pilihan Per kategori tetap menyediakan seluruh jenis tanaman per tahun.
- Halaman Statistik & Data menampilkan ringkasan KCDA, peta interaktif, dan
  daftar kecamatan dengan pencarian. Sorotan peta dan daftar saling terhubung.
  Ringkasan penduduk administrasi (DKB Dukcapil Semester I 2026), desa/kelurahan,
  dan SLS terkecil (2025) berasal dari agregasi seluruh kecamatan, disertai
  periode dan unduhan workbook sumber. Luas wilayah tidak digunakan pada kartu
  ringkasan peta karena sheet sumber ditandai tidak digunakan.
- Bagian Chart umum membandingkan 15 kecamatan pada seluruh 13 sheet yang
  berakhiran `.1`, dengan pilihan indikator/tahun, urutan nilai, sorotan
  tertinggi/terendah, tabel data, dan sumber. Pada bagian ini angka luas 2024
  dari sheet 1.1 tetap ditampilkan meskipun ditandai tidak digunakan dalam
  workbook, dengan catatan yang terlihat. Kepadatan merupakan perhitungan
  penduduk administrasi DKB Semester I 2026 dibagi luas 2024 tersebut, bukan
  kepadatan resmi yang telah diverifikasi. Kategori fasilitas tidak dijumlahkan
  karena desa dapat muncul di beberapa kategori; penanda kosong tetap kosong.
- Halaman Kegiatan berisi satu kalender interaktif. Jadwal disimpan lokal di
  `src/constants/activities.ts`, bersumber dari pengumuman BPS, dan
  ditandai dengan cakupan nasional. Kalender memakai zona waktu Asia/Jakarta,
  navigasi bulan, pilihan tanggal, serta rincian sumber. Jadwal kunjungan khusus
  Musi Banyuasin belum tersedia dan tidak diasumsikan dari periode nasional.
- Repository ini hanya berisi frontend di root proyek. Backend lokal sudah
  dihapus; API, database, dan Storage dikelola terpisah oleh Satu Portal.
  Penyimpanan bukan persetujuan atau perubahan desil DTSEN dan belum terhubung
  ke sistem penetapan DTSEN atau petugas resmi.

## Stack Saat Ini

- Bun, satu paket frontend tanpa workspace
- Svelte + Vite
- TypeScript
- Tailwind CSS 4 melalui plugin Vite, dengan theme token BPS
- shadcn-svelte dan Bits UI untuk kontrol form serta dialog
- Zod untuk validasi frontend; Axios untuk service API Satu Portal
- API, PostgreSQL Supabase, dan Storage dikelola terpisah oleh Satu Portal

## Struktur

```text
public/              Aset statis, peta, sampul, dan workbook KCDA
src/
  components/        Komponen halaman dan form
  constants/         Konten, data lokal, dan konfigurasi
  lib/               Utilitas dan komponen UI shadcn-svelte
  pages/             Halaman dengan routing di sisi klien
  schemas/           Skema validasi Zod DTSEN
  services/          Service Axios ke API Satu Portal
  types/             Definisi tipe frontend
  App.svelte         State routing dan layout utama
  app.css            Token tema BPS dan utility bersama
  main.ts            Entry frontend
scripts/             Importir workbook KCDA
tests/               Tes statistik, beranda, dan service DTSEN
index.html           Entry HTML Vite
package.json         Dependency dan perintah frontend
tsconfig.json        Konfigurasi TypeScript
vite.config.ts       Konfigurasi Vite
vercel.json          Deployment frontend dan fallback route SPA
```

## Palette

Palette frontend saat ini mengikuti warna BPS:

```text
Sky Blue  #2D95CA
Green     #75B547
Orange    #E28939
Ink       #102033
Base      #F8FAFC
```

Token warna utama berada di blok `@theme` dalam `src/app.css`.
Halaman Statistik (termasuk rincian kecamatan), Kegiatan, dan form DTSEN
memakai utility `orange-page` untuk latar hangat, aksen oranye, border krem,
serta grafik dan peta dengan variasi warna oranye. Tema ini dibatasi pada
konten halaman dan dialog konfirmasi DTSEN. Warna validasi berhasil/gagal
tetap memakai token status tersendiri agar hasilnya mudah dibedakan.
Halaman dan komponen menggunakan utility Tailwind. Utility bersama untuk tombol,
input, dan container juga didefinisikan dalam file tersebut.

Tipe frontend berada di `src/types`. Konten, data lokal, navigasi, dan
konfigurasi berada di `src/constants`. Nama file `prototype.ts` merupakan
penamaan lama, bukan penanda status proyek saat ini. `App.svelte` mengelola route
dan `components/layout/nav-bottom.svelte` menampilkan halaman yang aktif.
Halaman admin tersedia pada `/admin-dashboard`.

`components/dtsen/form-dtsen.svelte` memiliki state, validasi, dokumen, dan
pemanggilan service form. `DesilRepairPage.svelte` hanya mengatur layout halaman.
Komponen shadcn berada di `src/lib/components/ui`; alias `$lib` dan konfigurasi
`components.json` mendukung penambahan komponen dengan CLI dari root proyek.
Notifikasi global memakai Sonner melalui `Toaster` di `App.svelte`. Pemanggilan
`showToast` yang sudah ada tetap tersedia dan kini menggunakan `svelte-sonner`.

## Perintah

### Memperbarui Data Dashboard Kecamatan

Workbook sumber berada di `public/Data KCDA 2026.xlsx`. Dashboard memakai
hasil ekstraksi per kecamatan dalam `src/constants/kcda/`, yang dimuat
sesuai halaman. Importir juga menghasilkan `src/constants/kcda-overview.json`
untuk ringkasan umum, tanpa memuat seluruh tabel kecamatan di halaman peta.
Data ringkas perbandingan untuk Chart umum dihasilkan sebagai
`src/constants/kcda-general.json`; konfigurasi sorotannya berada di
`src/constants/statistics-comparison.ts`.
Konfigurasi tampilannya berada di `src/constants/statistics-overview.ts`.
Setelah mengganti atau memperbaiki workbook, jalankan importir
sebelum build (Python 3, tanpa paket tambahan):

```bash
python scripts/import-kcda.py
bun test tests/statistics.test.ts
bun test tests/statistics-comparison.test.ts
bun test tests/home.test.ts
```

Importir mempertahankan periode, nilai nol, penanda kosong, dan sumber pada tiap
sheet. Tabel utama, rincian madrasah, dan riwayat pendidikan dipisahkan agar
angka berulang tidak dijumlahkan. Satuan pohon, tangkai, dan luas dipisahkan.
Angka pecahan pada jumlah orang tetap terlihat di tabel sebagai nilai yang perlu
verifikasi dan tidak digrafikkan; importir tidak menebak pemisah ribuan pada sel
numerik Excel. Nama kepala desa yang diberi sorotan kuning dikecualikan sesuai
catatan PJ/PLT pada sumber.

Penduduk administrasi pada sheet 3.1 bersumber dari DKB Dukcapil Semester I 2026,
sedangkan sheet 3.2 memuat proyeksi penduduk BPS. Kedua basis data disajikan
terpisah. Periode mengikuti blok dan kolom sumber, termasuk data pertanian 2021
di luar rentang pada judul sheet. Tidak ada sinkronisasi otomatis atau klaim
bahwa workbook ini merupakan publikasi resmi yang telah disahkan.

### Menjalankan Website

```bash
bun install
bun run dev
```

Web berjalan di `http://localhost:5173`.

### API DTSEN Satu Portal

Website ini hanya memanggil endpoint **POST create** Supabase Edge Function
`dtsen-create`. Kode fungsi berada di
`supabase/functions/dtsen-create/` pada repo Satu Portal. Tabel `dtsen`, akses
database, dan bucket Storage privat `dtsen` tetap dikelola di backend tersebut.
Betandang tidak memanggil tabel Supabase secara langsung dan tidak memerlukan
kunci rahasia Supabase di frontend.

Isi `VITE_DTSEN_CREATE_URL` di `.env.local` dengan **URL lengkap endpoint
create**, misalnya `https://your-project.supabase.co/functions/v1/dtsen-create`.
Biarkan kosong selama fungsi belum dideploy;
form menampilkan status belum tersedia dan menonaktifkan pengiriman.
`VITE_API_BASE_URL` dan proxy backend lokal tidak lagi digunakan.

Variabel `VITE_*` bersifat publik. `DATABASE_URL`, kunci rahasia Supabase, dan
konfigurasi Storage hanya berada di backend Satu Portal. Mengubah env database
tidak membuat endpoint API secara otomatis. Konfigurasi frontend dibaca dari
`.env.local` di root proyek.

#### Kontrak Create

Request memakai `multipart/form-data`; browser menetapkan boundary secara
otomatis. Form publik tidak mengirim token admin, cookie login, atau bearer
credential sesi lama.

| Kolom | Isi |
| --- | --- |
| `id` | UUID acak untuk identitas penyimpanan dan pengiriman ulang |
| `nama` | Nama lengkap, 3–160 karakter |
| `desa` | Desa/kelurahan, 1–160 karakter |
| `kecamatan` | Salah satu kecamatan pada `DESIL_KECAMATAN` |
| `surat` | Dokumen surat keterangan |
| `identitas` | Dokumen identitas |
| `domisili` | Dokumen pendukung domisili |

Tiga file wajib berupa PDF, JPG/JPEG, atau PNG, tidak kosong, maksimal 5 MB per
file. Skema request ada pada `desilCreateSchema` di
`src/schemas/desil.ts`. API harus memvalidasi ulang semua isian, ukuran,
ekstensi, MIME, dan signature file di server.

Respons berhasil: HTTP 201 (baru) atau 200 (pengiriman ulang), berisi objek
`{ data: { id, createdAt } }`. `id` adalah UUID pengajuan yang tersimpan dan
`createdAt` adalah waktu ISO 8601 UTC. Respons hanya boleh menyatakan berhasil
setelah data dan ketiga dokumen tersimpan. Frontend memvalidasi respons dengan
`desilCreateResponseSchema`; respons tanpa bukti penyimpanan tidak menampilkan
pesan berhasil.

Respons gagal memakai HTTP 4xx/5xx dan `{ message, fieldErrors? }`.
`fieldErrors` memetakan nama kolom ke daftar pesan string, misalnya kolom `surat`
untuk file yang ditolak. Form mempertahankan isian dan berkas saat gagal.
ID request dipertahankan saat pengiriman ulang tanpa perubahan isian; API perlu
menjamin idempotensi agar timeout tidak menyebabkan pengajuan ganda. UUID ini
bukan kredensial untuk membaca atau mengelola pengajuan.

Fungsi memvalidasi ulang isian serta ukuran, ekstensi, MIME, dan signature berkas.
Bucket dibuat privat pada pengajuan valid pertama jika belum ada; bucket yang
sudah publik ditolak. Fingerprint isian dan isi dokumen memverifikasi retry
dengan UUID yang sama. Data berbeda dengan UUID yang sudah tersimpan ditolak
dengan HTTP 409. Dokumen dari percobaan yang gagal dibersihkan jika aman;
respons database yang belum pasti dikonfirmasi sebelum penghapusan apa pun.

Origin frontend harus masuk secret `DTSEN_ALLOWED_ORIGINS` pada Edge Function.
Fungsi membatasi 20 request per IP per menit pada setiap worker dan membatasi
body saat dibaca. Pembatasan ini bukan kuota global antar-worker. Satu Portal
tetap bertanggung jawab atas autentikasi dan otorisasi baca/ubah/hapus/unduh;
fungsi publik ini hanya menyediakan create. Jangan membuka akses publik ke
data pemohon atau menaruh kunci server pada variabel `VITE_*`.

### Pemeriksaan

```bash
bun run test
bun run test:desil
bun run typecheck
bun run build
```

Tes create di repo ini memakai respons tiruan dan tidak menulis ke database
atau Storage. Pengujian langsung pada 12 November 2026 menggunakan service
frontend ke fungsi yang dideploy: create 201, retry 200 dengan satu baris,
tiga dokumen privat, dan penolakan akses anonim. Data latihan beserta dokumennya
dihapus setelah pengujian. Tes fungsi terpisah tersedia melalui
`bun run test:dtsen` di repo Satu Portal.

### Deployment Vercel

Konfigurasi `vercel.json` membangun frontend Vite dari root proyek dan memakai
output `dist/`. Fallback ke `index.html` mendukung akses langsung ke route SPA.
Konfigurasi route mengikuti [panduan Vite di Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).
Gunakan root repository sebagai Root Directory di pengaturan project Vercel.
Perintah `dev`, `build`, `preview`, `typecheck`, dan `test` dijalankan dari root.
Gunakan Bun 1.4 atau lebih baru untuk format lockfile saat ini.

Set `VITE_DTSEN_CREATE_URL` pada environment project frontend setelah API siap,
lalu build/deploy ulang karena Vite membaca env saat build. Backend Satu Portal
dideploy dan dikonfigurasi terpisah; tidak ada service API lokal dalam deployment
website ini. Dashboard admin lokal tetap memakai data contoh.

## Sumber Konten

Publikasi pilihan Beranda dan sampulnya diperiksa pada 27 Oktober 2026:
[Kabupaten Musi Banyuasin Dalam Angka 2026](https://musibanyuasinkab.bps.go.id/id/publication/2026/02/27/b3b3d2d27b2e4d45d27aefb6/kabupaten-musi-banyuasin-dalam-angka-2026.html),
[Statistik Daerah Kabupaten Musi Banyuasin 2025](https://musibanyuasinkab.bps.go.id/id/publication/2025/09/30/0be1ebbaa8f19df66ba1bc3f/statistik-daerah-kabupaten-musi-banyuasin-2025.html), dan
[Statistik Kesejahteraan Rakyat Kabupaten Musi Banyuasin 2025](https://musibanyuasinkab.bps.go.id/id/publication/2025/11/28/b8e08bbb3f2c400b0d0628b4/statistik-kesejahteraan-rakyat-kabupaten-musi-banyuasin-2025.html).
Sampul asli dari metadata `og:image` halaman tersebut disimpan lokal dalam
`public/publications/`. Konfigurasi Beranda berada di
`src/constants/home.ts`.

Konten diperiksa pada 11 Oktober 2026. Periode statistik mengikuti masing-masing
indikator, bukan tahun pemeriksaan konten.

- [Website BPS Kabupaten Musi Banyuasin](https://musibanyuasinkab.bps.go.id/id):
  alamat kantor, kontak, dan jam pelayanan.
- [Profil BPS](https://ppid.bps.go.id/app/konten/1606/Profil-BPS.html): peran lembaga
  dan struktur organisasi.
- [Kabupaten Musi Banyuasin Dalam Angka 2026](https://musibanyuasinkab.bps.go.id/id/publication/2026/02/27/b3b3d2d27b2e4d45d27aefb6/kabupaten-musi-banyuasin-dalam-angka-2026.html):
  statistik kunci halaman xxxix, indikator dan tren 2023-2025. Penduduk menggunakan
  proyeksi pertengahan tahun hasil SP2020, kemiskinan kondisi Maret, dan
  pengangguran kondisi Agustus.
- [Pertumbuhan Ekonomi 2025](https://musibanyuasinkab.bps.go.id/id/pressrelease/2026/04/13/1226/economic-growth-of-musi-banyuasin-regency-in-2025.html):
  rilis pertumbuhan ekonomi tahunan.
- [Pelayanan Statistik Terpadu](https://pst.bps.go.id/) dan
  [Layanan BPS Muba](https://ppid.bps.go.id/app/konten/1606/Layanan-BPS.html):
  kanal pelayanan dan informasi standar layanan.
- Rujukan kalender diperiksa pada 14 Oktober 2026:
  [Susenas Maret 2026](https://okukab.bps.go.id/id/news/2026/02/18/1021/supervisi-pendataan-susenas-maret-2026-ke-kecamatan-semidang-aji.html)
  untuk periode nasional 1-20 Februari 2026, serta
  [SE2026](https://yogyakarta.bps.go.id/id/news/2026/06/15/598/pendampingan-pendataan-lapangan-sensus-ekonomi-2026-kabupaten-bantul.html)
  untuk periode pendataan lapangan nasional 15 Juni-31 Agustus 2026 yang
  diumumkan pada sumber tersebut. Kalender tidak diperbarui otomatis dan
  bukan jadwal kunjungan petugas lokal.

## Pedoman Pengembangan

- Tulis konten untuk kebutuhan pengguna, dengan bahasa Indonesia yang jelas.
- Statistik, kegiatan, kontak, dan persyaratan resmi harus memiliki sumber yang
  dapat diperiksa. Jangan mengganti label data contoh tanpa mengganti datanya.
- Jangan menampilkan keberhasilan pengiriman atau penyimpanan jika proses itu
  belum tersedia. Jelaskan keterbatasan pada tindakan yang terdampak.
- Pertahankan stack, tema, aksesibilitas, dan perilaku responsif yang tersedia.
- Kembangkan backend, autentikasi, penyimpanan, dan integrasi sesuai lingkup tugas
  yang diminta; perubahan konten saja tidak memerlukan implementasi fitur tersebut.

## Konteks Untuk AI Agent

Pojok BPS Muba adalah website informasi statistik dan layanan untuk BPS Kabupaten
Musi Banyuasin. Proyek sudah masuk tahap pengembangan website. Gunakan konten
institusional yang relevan bagi pengguna dan sumber BPS yang terverifikasi.
Pertahankan Bun, Svelte + Vite, TypeScript, Tailwind CSS 4, serta tema yang tersedia.
Frontend DTSEN hanya memanggil Supabase Edge Function `dtsen-create` yang
dikelola Satu Portal; pengiriman dinonaktifkan selama URL lengkap fungsi belum
dikonfigurasi. Repository ini hanya memuat frontend, tanpa backend lokal atau
paket workspace. Dashboard admin
masih memakai data contoh dan penetapan desil DTSEN tidak diotomatisasi. Pesan
antarmuka harus mencerminkan kondisi tersebut. Baca `AGENTS.md` sebelum membuat
perubahan.
