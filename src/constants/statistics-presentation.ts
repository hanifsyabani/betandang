import type { StatisticsPresentation } from "../types/statistics";

// Width follows the amount and role of the data, rather than the sheet's position.
export const statisticsPresentations: Record<string, StatisticsPresentation> = {
  "3.1": { chart: "column", width: "wide" },
  "3.2": { chart: "donut", width: "narrow" },
  "2.1.1": { chart: "bar", width: "wide" },
  "2.2.3": { chart: "donut", width: "narrow" },
  "2.2.2": { chart: "column", width: "wide" },
  "2.2.1": { chart: "donut", width: "narrow" },
  "1.3": { chart: "bar", width: "full" },
  "4.1.2": { chart: "column", width: "wide" },
  "4.2.1": { chart: "bar", width: "narrow" },
  "4.1.1": { chart: "column", width: "wide" },
  "4.3.1": { chart: "bar", width: "narrow" },
  "4.1.3": { chart: "bar", width: "half" },
  "4.1.4": { chart: "column", width: "half" },
  "4.1.6": { chart: "heatmap", width: "full" },
  "4.1.5": { chart: "bar", width: "half" },
  "4.3.2": { chart: "bar", width: "half" },
  "4.4.1": { chart: "column", width: "half" },
  "4.4.2": { chart: "bar", width: "half" },
  "4.4.3": { chart: "bar", width: "full" },
  "5.2": { chart: "line", width: "wide" },
  "5.1": { chart: "line", width: "narrow" },
  "5.7": { chart: "line", width: "wide" },
  "5.4": { chart: "line", width: "narrow" },
  "5.3": { chart: "line", width: "half" },
  "5.6": { chart: "line", width: "half" },
  "5.5": { chart: "line", width: "full" },
  "5.8": { chart: "column", width: "half" },
  "5.9": { chart: "bar", width: "half" },
  "6.2.1": { chart: "column", width: "wide" },
  "6.1.1": { chart: "bar", width: "narrow" },
  "6.3.1": { chart: "column", width: "full" },
  "7.3": { chart: "column", width: "wide" },
  "7.1": { chart: "bar", width: "narrow" },
  "7.2": { chart: "column", width: "full" },
};

export const statisticsWidthClasses = {
  wide: "lg:col-span-8",
  narrow: "lg:col-span-4",
  half: "lg:col-span-6",
  full: "lg:col-span-12",
};

export const statisticsTopicDescriptions: Record<string, string> = {
  penduduk: "Sebaran penduduk administrasi dan komposisi umur dari proyeksi BPS.",
  pemerintahan: "Satuan lingkungan, aparatur, status desa, dan direktori kantor.",
  sosial: "Pendidikan, kesehatan, fasilitas dasar, dan kondisi kebencanaan.",
  pertanian: "Perkembangan luas panen dan produksi menurut jenis tanaman.",
  infrastruktur: "Akomodasi, transportasi antardesa, dan sarana komunikasi.",
  ekonomi: "Keberadaan sarana perdagangan, perbankan, dan koperasi.",
  geografi: "Status ketersediaan data geografi sesuai catatan workbook.",
  referensi: "Daftar singkatan untuk membaca tabel dan publikasi.",
};

export const statisticsTopicColors: Record<string, string> = {
  pertanian: "--color-bps-green-hover",
  ekonomi: "--color-bps-orange-hover",
};

export const accessCategories = ["Sangat mudah", "Mudah", "Sulit", "Sangat sulit"];
