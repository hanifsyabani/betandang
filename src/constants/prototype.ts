import type {
  ActivityItem,
  DatasetExample,
  DesilSubmission,
  FeaturedIndicator,
  OfficeInformation,
  PortalTopic,
  ProfileHighlight,
  ServiceItem,
  StatisticCard
} from "../types/prototype";

export const contentSources = {
  website: "https://musibanyuasinkab.bps.go.id/id",
  profile: "https://ppid.bps.go.id/app/konten/1606/Profil-BPS.html",
  services: "https://ppid.bps.go.id/app/konten/1606/Layanan-BPS.html",
  pst: "https://pst.bps.go.id/",
  publications: "https://musibanyuasinkab.bps.go.id/id/publication",
  annualPublication: "https://musibanyuasinkab.bps.go.id/id/publication/2026/02/27/b3b3d2d27b2e4d45d27aefb6/kabupaten-musi-banyuasin-dalam-angka-2026.html",
  economicGrowth: "https://musibanyuasinkab.bps.go.id/id/pressrelease/2026/04/13/1226/economic-growth-of-musi-banyuasin-regency-in-2025.html",
  poverty: "https://musibanyuasinkab.bps.go.id/id/statistics-table/2/MzIjMg%3D%3D/persentase-penduduk-miskin-menurut-kabupaten-kota.html",
  news: "https://musibanyuasinkab.bps.go.id/id/news",
  complaints: "https://s.bps.go.id/1606pengaduan"
} as const;

export const quickStatistics: StatisticCard[] = [
  {
    label: "Jumlah Penduduk",
    value: "659.302",
    helper: "Proyeksi Juni 2025 (jiwa)",
    tone: "sky",
    sourceUrl: contentSources.annualPublication
  },
  {
    label: "Tingkat Kemiskinan",
    value: "9,97%",
    helper: "Maret 2025",
    tone: "orange",
    sourceUrl: contentSources.annualPublication
  },
  {
    label: "Pengangguran Terbuka",
    value: "2,04%",
    helper: "Agustus 2025",
    tone: "green",
    sourceUrl: contentSources.annualPublication
  },
  {
    label: "Pertumbuhan Ekonomi",
    value: "5,11%",
    helper: "Tahun 2025 (y-on-y)",
    tone: "sky",
    sourceUrl: contentSources.economicGrowth
  }
];

export const portalNetworkCenter = { x: 450, y: 168 };

export const portalTopics: PortalTopic[] = [
  { label: "Kependudukan", icon: "users-round", helper: "Data sosial", tone: "sky", x: 120, y: 128, path: "/statistik-data" },
  { label: "Kemiskinan", icon: "hand-coins", helper: "Indikator sosial", tone: "orange", x: 280, y: 62, path: "/statistik-data" },
  { label: "Ekonomi", icon: "chart-no-axes-combined", helper: "Tren daerah", tone: "green", x: 650, y: 66, path: "/statistik-data" },
  { label: "Publikasi", icon: "book-open", helper: "Publikasi BPS", tone: "sky", x: 790, y: 136, path: "/layanan" },
  { label: "DTSEN", icon: "file-text", helper: "Perbaikan desil", tone: "orange", x: 760, y: 226, path: "/perbaikan-data-desil" },
  { label: "PST", icon: "database", helper: "Layanan data", tone: "green", x: 180, y: 224, path: "/layanan" },
  { label: "Kegiatan", icon: "calendar-days", helper: "Berita kegiatan", tone: "sky", x: 355, y: 290, path: "/kegiatan" },
  { label: "Admin", icon: "monitor", helper: "Kelola pengajuan", tone: "green", x: 575, y: 292, path: "/admin-dashboard" }
];

export const profileHighlights: ProfileHighlight[] = [
  {
    title: "Penyediaan data",
    body:
      "BPS menyediakan data dari sensus, survei, dan sumber lainnya untuk kebutuhan pemerintah dan masyarakat."
  },
  {
    title: "Pembinaan statistik",
    body:
      "BPS mendukung instansi pemerintah dalam pengembangan kegiatan statistik dan penggunaan metodologi yang sesuai."
  },
  {
    title: "Pelayanan masyarakat",
    body:
      "Pelayanan Statistik Terpadu membantu pengguna mencari data, mengakses publikasi, dan berkonsultasi tentang statistik."
  },
  {
    title: "Informasi publik",
    body:
      "Informasi kelembagaan dan dokumen publik dapat diakses melalui kanal Pejabat Pengelola Informasi dan Dokumentasi (PPID) BPS."
  }
];

export const featuredIndicators: FeaturedIndicator[] = [
  {
    name: "Penduduk",
    value: "659.302",
    unit: "jiwa",
    note: "Proyeksi penduduk pertengahan tahun hasil SP2020, 2023-2025.",
    tone: "sky",
    sourceUrl: contentSources.annualPublication,
    trend: [
      { year: "2023", value: 644386 },
      { year: "2024", value: 651950 },
      { year: "2025", value: 659302 }
    ]
  },
  {
    name: "Kemiskinan",
    value: "9,97",
    unit: "persen",
    note: "Persentase penduduk miskin kondisi Maret, 2023-2025.",
    tone: "orange",
    sourceUrl: contentSources.annualPublication,
    trend: [
      { year: "2023", value: 14.9 },
      { year: "2024", value: 12.88 },
      { year: "2025", value: 9.97 }
    ]
  },
  {
    name: "Pertumbuhan Ekonomi",
    value: "5,11",
    unit: "persen",
    note: "Pertumbuhan PDRB harga konstan 2010, 2023-2025.",
    tone: "green",
    sourceUrl: contentSources.annualPublication,
    trend: [
      { year: "2023", value: 4.51 },
      { year: "2024", value: 4.94 },
      { year: "2025", value: 5.11 }
    ]
  }
];

export const services: ServiceItem[] = [
  {
    title: "Permintaan Data",
    description: "Layanan informasi statistik untuk masyarakat, perangkat daerah, akademisi, dan pelaku usaha.",
    requirements: ["Identitas pemohon", "Topik data yang dibutuhkan", "Tujuan penggunaan data"],
    procedure: "Sampaikan topik, periode, dan wilayah data yang dibutuhkan melalui Pelayanan Statistik Terpadu.",
    tone: "sky",
    sourceUrl: contentSources.pst
  },
  {
    title: "Konsultasi Statistik",
    description: "Konsultasi tentang data, metadata, klasifikasi, metodologi, dan interpretasi statistik.",
    requirements: ["Ringkasan kebutuhan", "Daftar indikator", "Kontak aktif"],
    procedure: "Buka kanal PST dan pilih layanan konsultasi sesuai topik yang ingin dibahas.",
    tone: "green",
    sourceUrl: contentSources.pst
  },
  {
    title: "Publikasi Statistik",
    description: "Akses katalog publikasi BPS untuk kebutuhan referensi, perencanaan, dan pelaporan.",
    requirements: ["Judul publikasi", "Periode data", "Format yang diinginkan"],
    procedure: "Telusuri katalog publikasi BPS Muba dan buka halaman publikasi untuk mengakses dokumen.",
    tone: "orange",
    sourceUrl: contentSources.publications
  },
  {
    title: "Rekomendasi Kegiatan Statistik",
    description: "Informasi layanan rekomendasi bagi instansi pemerintah yang merencanakan kegiatan statistik.",
    requirements: ["Rancangan kegiatan", "Instansi penyelenggara", "Instrumen pendataan"],
    procedure: "Pelajari informasi layanan dan ajukan rancangan kegiatan melalui kanal rekomendasi di PST BPS.",
    tone: "sky",
    sourceUrl: contentSources.pst
  },
  {
    title: "Informasi Statistik",
    description: "Pusat jawaban cepat untuk definisi indikator, jadwal rilis, dan kategori data daerah.",
    requirements: ["Pertanyaan layanan", "Kategori statistik", "Kontak aktif"],
    procedure: "Telusuri informasi pada website BPS atau hubungi PST untuk penjelasan lebih lanjut.",
    tone: "green",
    sourceUrl: contentSources.website
  },
  {
    title: "Pengaduan",
    description: "Kanal pengaduan untuk menyampaikan kendala pelayanan, kritik, dan saran kepada BPS Muba.",
    requirements: ["Nama pelapor", "Uraian kendala", "Bukti pendukung jika ada"],
    procedure: "Sampaikan laporan melalui kanal pengaduan yang tercantum pada website BPS Muba.",
    tone: "orange",
    sourceUrl: contentSources.complaints
  }
];

export const activities: ActivityItem[] = [
  {
    title: "Koordinasi Program Pengentasan Kemiskinan",
    date: "15 Januari 2025",
    location: "Kantor BPS Kabupaten Musi Banyuasin",
    category: "Koordinasi",
    description: "BPS Muba bersama pemerintah daerah dan Dinas Sosial membahas sinkronisasi program pengentasan kemiskinan.",
    sourceUrl: "https://musibanyuasinkab.bps.go.id/id/news/2025/01/15/223/rapat-koordinasi-sinkronisasi-program-kegiatan-pengentasan-kemiskinan.html"
  },
  {
    title: "Muba Berdering: Quality Gates dan Angka Kemiskinan",
    date: "6 Maret 2025",
    location: "BPS Kabupaten Musi Banyuasin",
    category: "Berbagi Pengetahuan",
    description: "Program Muba Berdering membahas penerapan Quality Gates 2025 dan penghitungan angka kemiskinan.",
    sourceUrl: "https://musibanyuasinkab.bps.go.id/id/news/2025/03/06/235/berdering-7-implementasi-quality-gates-2025-dan-menghitung-angka-kemiskinan.html"
  },
  {
    title: "Peluncuran Program Bantu Umak",
    date: "26 Maret 2025",
    location: "Bank BRI Cabang Sekayu",
    category: "Kegiatan Daerah",
    description: "BPS Muba menghadiri peluncuran program bantuan tunai Pemerintah Kabupaten Musi Banyuasin untuk masyarakat miskin.",
    sourceUrl: "https://musibanyuasinkab.bps.go.id/id/news/2025/03/26/241/kepala-bps-kabupaten-musi-banyuasin-hadiri-launching-penyaluran-bantuan-tunai-untuk-masyarakat-miskin--bantu-umak-.html"
  },
  {
    title: "Penyerahan Buku Tabungan Program Bantu Umak",
    date: "26 Mei 2025",
    location: "Kantor Camat Sekayu",
    category: "Kegiatan Daerah",
    description: "Perwakilan BPS Muba menghadiri kegiatan penyerahan buku tabungan penerima program Bantu Umak di Sekayu.",
    sourceUrl: "https://musibanyuasinkab.bps.go.id/id/news/2025/05/26/252/the-head-of-the-general-affairs-sub-division-of-bps-statistics-musi-banyuasin-attends-the-ceremonial-distribution-of-cash-assistance-savings-books-for-the-poor--bantu-umak-.html"
  }
];

export const adminKpis: StatisticCard[] = [
  {
    label: "Total Pengajuan",
    value: "5",
    helper: "Data contoh",
    tone: "sky"
  },
  {
    label: "Menunggu Verifikasi",
    value: "2",
    helper: "Perlu ditinjau",
    tone: "orange"
  },
  {
    label: "Disetujui",
    value: "1",
    helper: "Selesai verifikasi",
    tone: "green"
  },
  {
    label: "Perlu Perbaikan",
    value: "1",
    helper: "Menunggu revisi",
    tone: "orange"
  }
];

export const submissions: DesilSubmission[] = [
  {
    id: "DTSEN-001",
    name: "Ahmad Saputra",
    kecamatan: "Sekayu",
    desa: "Balai Agung",
    status: "Menunggu",
    date: "08/10/2026"
  },
  {
    id: "DTSEN-002",
    name: "Siti Aminah",
    kecamatan: "Sungai Lilin",
    desa: "Sungai Lilin Jaya",
    status: "Disetujui",
    date: "07/10/2026"
  },
  {
    id: "DTSEN-003",
    name: "Budi Hartono",
    kecamatan: "Bayung Lencir",
    desa: "Mendis",
    status: "Perlu Perbaikan",
    date: "06/10/2026"
  },
  {
    id: "DTSEN-004",
    name: "Marlina",
    kecamatan: "Lais",
    desa: "Teluk",
    status: "Ditolak",
    date: "05/10/2026"
  },
  {
    id: "DTSEN-005",
    name: "Rizky Pratama",
    kecamatan: "Tungkal Jaya",
    desa: "Pandan Sari",
    status: "Menunggu",
    date: "04/10/2026"
  }
];

export const officeInformation: OfficeInformation[] = [
  { label: "Wilayah", value: "Kabupaten Musi Banyuasin, Sumatera Selatan" },
  { label: "Alamat", value: "Jalan Merdeka Lk. I, Kelurahan Serasan Jaya, Sekayu 30711" },
  { label: "Jam pelayanan PST", value: "Senin - Jumat, 08.00 - 15.30 WIB" },
  { label: "Telepon/Faks", value: "(0714) 321023" },
  { label: "Email", value: "bps1606@bps.go.id" }
];

export const organizationUnits: string[] = [
  "Kepala BPS Kabupaten",
  "Subbagian Umum",
  "Kelompok Jabatan Fungsional"
];

export const datasetExamples: DatasetExample[] = [
  { title: "Statistik Kunci Musi Banyuasin", domain: "Sosial & Ekonomi", period: "2023-2025", status: "Publikasi BPS", sourceUrl: contentSources.annualPublication },
  { title: "Pertumbuhan Ekonomi Kabupaten", domain: "Ekonomi", period: "2025", status: "Berita Resmi Statistik", sourceUrl: contentSources.economicGrowth },
  { title: "Persentase Penduduk Miskin", domain: "Sosial", period: "2025", status: "Tabel Statistik", sourceUrl: contentSources.poverty }
];

export const footerContactInformation: string[] = [
  "Jalan Merdeka Lk. I, Kelurahan Serasan Jaya, Sekayu 30711.",
  "Telepon/Faks: (0714) 321023.",
  "Email: bps1606@bps.go.id.",
  "Pelayanan PST: Senin - Jumat, 08.00 - 15.30 WIB."
];
