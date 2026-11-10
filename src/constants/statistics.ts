import type { StatisticsWorkbook } from "../types/statistics";

export const kcdaWorkbookUrl = "/Data%20KCDA%202026.xlsx";
export const kcdaWorkbookName = "Data KCDA 2026.xlsx";

export const statisticsTopics = [
  { id: "semua", label: "Semua" },
  { id: "penduduk", label: "Penduduk" },
  { id: "pemerintahan", label: "Pemerintahan" },
  { id: "sosial", label: "Sosial & pendidikan" },
  { id: "pertanian", label: "Pertanian" },
  { id: "infrastruktur", label: "Infrastruktur" },
  { id: "ekonomi", label: "Ekonomi" },
  { id: "geografi", label: "Geografi" },
] as const;

const workbooks = import.meta.glob<StatisticsWorkbook>("./kcda/*.json", {
  import: "default",
});

export async function loadKecamatanStatistics(slug: string) {
  const load = workbooks[`./kcda/${slug}.json`];
  if (!load) throw new Error("Data kecamatan belum tersedia.");
  const workbook = await load();
  if (workbook.district !== slug || !Array.isArray(workbook.sheets)) {
    throw new Error("Data kecamatan tidak sesuai.");
  }
  return workbook;
}
