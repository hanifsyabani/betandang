import { statisticsDistricts, statisticsOverview, statisticsOverviewCards } from "./statistics-overview";
import { contentSources } from "./prototype";
import type { HomePublication, HomeService, HomeSpotlightMetric } from "../types/home";

export const homeOverviewCards = statisticsOverviewCards.map((card) => ({
  ...card,
  label: card.id === "sls" ? "SLS terkecil" : card.label,
}));

export const homeDistricts = statisticsDistricts.map((district) => ({
  ...district,
  population: statisticsOverview.districts.find((row) => row.slug === district.slug)?.population ?? null,
  sls: statisticsOverview.districts.find((row) => row.slug === district.slug)?.sls ?? null,
}));

export const homeSpotlightMetrics: HomeSpotlightMetric[] = [
  { id: "population", label: "Jumlah penduduk", unit: "jiwa", source: "DKB Dukcapil · Semester I 2026 · Tabel 3.1" },
  { id: "villages", label: "Desa/kelurahan", unit: "desa/kelurahan", source: "Master File Desa · 2025 · Tabel 2.2.3" },
  { id: "sls", label: "SLS terkecil", unit: "SLS", source: "Master File Desa · 2025 · Tabel 2.1.1" },
].map((metric) => {
  const key = metric.id as "population" | "villages" | "sls";
  const period = statisticsOverview.periods[key];
  return { ...metric, periods: [period], values: { [period]: statisticsOverview.districts.map((district) => district[key]) } };
});

export const homeServices: HomeService[] = [
  { id: "research", title: "Butuh data penelitian?", description: "Temukan data dan publikasi untuk referensi akademik, penelitian, dan perencanaan.", action: "Telusuri data", href: "/statistik-data", external: false, tone: "sky" },
  { id: "consultation", title: "Ingin konsultasi statistik?", description: "Diskusikan kebutuhan data, metadata, dan interpretasi statistik melalui PST BPS.", action: "Buka PST BPS", href: contentSources.pst, external: true, tone: "orange" },
  { id: "desil", title: "Mengajukan perbaikan data DTSEN?", description: "Isi data pemohon dan unggah dokumen pengajuan. Penyimpanan bukan penetapan atau perubahan desil.", action: "Buka form pengajuan", href: "/perbaikan-data-desil", external: false, tone: "green" },
];

export const homePublications: HomePublication[] = [
  { id: "muba-dalam-angka-2026", title: "Kabupaten Musi Banyuasin Dalam Angka 2026", year: "2026", releaseDate: "2026-02-27", cover: "/publications/muba-dalam-angka-2026.jpg", sourceUrl: contentSources.annualPublication },
  { id: "statistik-daerah-2025", title: "Statistik Daerah Kabupaten Musi Banyuasin 2025", year: "2025", releaseDate: "2025-09-30", cover: "/publications/statistik-daerah-2025.jpg", sourceUrl: "https://musibanyuasinkab.bps.go.id/id/publication/2025/09/30/0be1ebbaa8f19df66ba1bc3f/statistik-daerah-kabupaten-musi-banyuasin-2025.html" },
  { id: "kesejahteraan-rakyat-2025", title: "Statistik Kesejahteraan Rakyat Kabupaten Musi Banyuasin 2025", year: "2025", releaseDate: "2025-11-28", cover: "/publications/kesejahteraan-rakyat-2025.jpg", sourceUrl: "https://musibanyuasinkab.bps.go.id/id/publication/2025/11/28/b8e08bbb3f2c400b0d0628b4/statistik-kesejahteraan-rakyat-kabupaten-musi-banyuasin-2025.html" },
];
