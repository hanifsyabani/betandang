import { mubaKecamatanRoutes } from "../constants/maps";
import { isChartNumber } from "./statistics";
import type { StatisticsComparisonMetric, StatisticsComparisonRow } from "../types/statistics";

export function rankStatisticsComparison(
  districts: string[],
  metric: StatisticsComparisonMetric,
  period: string,
  order = "descending",
): StatisticsComparisonRow[] {
  const rows = districts.map((slug, index) => {
    const raw = metric.values[period]?.[index];
    return {
      slug,
      name: mubaKecamatanRoutes.find((route) => route.slug === slug)?.name ?? slug,
      value: isChartNumber(raw, metric.unit) && raw >= 0 ? raw : null,
      rank: null as number | null,
    };
  }).sort((a, b) => {
    if (a.value === null) return b.value === null ? a.name.localeCompare(b.name, "id") : 1;
    if (b.value === null) return -1;
    return (order === "ascending" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name, "id");
  });
  rows.forEach((row, index) => {
    if (row.value !== null) row.rank = index > 0 && row.value === rows[index - 1].value ? rows[index - 1].rank : index + 1;
  });
  return rows;
}
