import data from "./kcda-general.json";
import { rankStatisticsComparison } from "../lib/statistics-comparison";
import type { StatisticsComparisons } from "../types/statistics";

export const statisticsComparisons: StatisticsComparisons = data;

export const statisticsComparisonHighlights = [
  { label: "Kecamatan terluas", sheet: "1.1", metric: "area", period: "2024", note: "Luas ditandai tidak digunakan pada sumber" },
  { label: "Kecamatan terpadat", sheet: "3.1", metric: "density", period: "2026", note: "Perhitungan penduduk 2026 ÷ luas 2024*" },
  { label: "Penduduk terbanyak", sheet: "3.1", metric: "column-2", period: "2026", note: "DKB Dukcapil · Semester I 2026" },
  { label: "SLS terkecil terbanyak", sheet: "2.1.1", metric: "column-1", period: "2025", note: "Master File Desa · 2025" },
].map((highlight) => {
  const metric = statisticsComparisons.sheets.find((sheet) => sheet.id === highlight.sheet)?.metrics.find((metric) => metric.id === highlight.metric);
  const ranking = metric ? rankStatisticsComparison(data.districts, metric, highlight.period) : [];
  const highest = ranking.find((row) => row.value !== null)?.value ?? null;
  return { ...highlight, unit: metric?.unit ?? "", value: highest, leaders: ranking.filter((row) => row.value !== null && row.value === highest) };
});
