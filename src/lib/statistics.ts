import type {
  StatisticsCell,
  StatisticsChartModel,
  StatisticsRow,
  StatisticsSheet,
} from "../types/statistics";
import { accessCategories } from "../constants/statistics-presentation";

const numbers = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const countUnits = new Set(["jiwa", "orang", "sekolah", "desa/kelurahan", "SLS", "jenjang", "perguruan tinggi"]);

export function formatStatisticsValue(value: StatisticsCell | undefined) {
  return typeof value === "number" ? numbers.format(value) : value?.trim() || "Tidak tersedia";
}

export function isChartNumber(value: StatisticsCell | undefined, unit: string): value is number {
  return typeof value === "number" && Number.isFinite(value) &&
    (!countUnits.has(unit) || Number.isInteger(value));
}

export function getSheetRows(sheet: StatisticsSheet, group: string, period: string) {
  return sheet.rows.filter((row) => row.group === group && row.period === period);
}

export function canShowComposition(model: StatisticsChartModel) {
  const values = model.series[0]?.values ?? [];
  return model.series.length === 1 && model.missing === 0 && values.length > 0 && values.length <= 6 &&
    values.every((value) => value !== null && value >= 0) && values.some((value) => value !== null && value > 0);
}

export function getStatisticsTrendRows(sheet: StatisticsSheet, group: string, label: string): StatisticsRow[] {
  const groupRows = sheet.rows.filter((row) => row.group === group);
  return [...new Set(groupRows.map((row) => row.period))].sort().map((period) =>
    groupRows.find((row) => row.label === label && row.period === period) ??
    { label, period, group, values: sheet.columns.map(() => null), unit: groupRows[0]?.unit });
}

export function buildStatisticsTrend(sheet: StatisticsSheet, group: string, label: string): StatisticsChartModel {
  const rows = getStatisticsTrendRows(sheet, group, label);
  const model = buildStatisticsChart(sheet, rows, 0);
  return { ...model, kind: "line", title: label, labels: rows.map((row) => row.period), series: [{ name: label, values: model.series[0].values }] };
}

export function buildAccessHeatmap(sheet: StatisticsSheet, rows: StatisticsRow[]): StatisticsChartModel {
  const values: [number, number, number][] = [];
  let missing = 0;
  rows.forEach((row, y) => row.values.forEach((value, x) => {
    const index = accessCategories.findIndex((category) => category.toLocaleLowerCase("id-ID") === String(value).trim().toLocaleLowerCase("id-ID"));
    if (index < 0) missing++;
    else values.push([x, y, index]);
  }));
  return {
    title: "Kemudahan akses pendidikan", kind: "heatmap", labels: rows.map((row) => row.label),
    series: [], unit: "kategori kemudahan", missing, totalValues: rows.length * sheet.columns.length,
    matrix: { columns: sheet.columns.map((column) => column.label), categories: accessCategories, values },
  };
}

export function buildStatisticsChart(
  sheet: StatisticsSheet,
  rows: StatisticsRow[],
  column: number,
): StatisticsChartModel {
  const unit = rows[0]?.unit ?? sheet.columns[column]?.unit ?? sheet.unit;
  const name = sheet.columns[column]?.label ?? sheet.title;
  let missing = 0;
  if (sheet.id === "3.2" && column === -1) {
    const series = sheet.columns.slice(0, 2).map((item, index) => ({
      name: item.label,
      values: rows.map((row) => {
        if (isChartNumber(row.values[index], item.unit)) return row.values[index] as number;
        missing++;
        return null;
      }),
    }));
    return { title: "Penduduk menurut umur dan jenis kelamin", labels: rows.map((row) => row.label), series, unit: sheet.unit, missing };
  }
  if (sheet.kind === "categorical" || sheet.kind === "directory") {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = row.values[column];
      const text = typeof value === "string" ? value.trim() : "";
      if (!text || /^[.\-–]+$/.test(text)) {
        missing++;
        continue;
      }
      const category = sheet.kind === "directory"
        ? (text.startsWith("Dikecualikan") ? "Dikecualikan (PJ/PLT)" : "Tercatat di sumber")
        : text.toLocaleLowerCase("id-ID");
      const label = category.charAt(0).toLocaleUpperCase("id-ID") + category.slice(1);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return {
      title: name,
      labels: [...counts.keys()],
      series: [{ name, values: [...counts.values()] }],
      unit: "desa/kelurahan",
      missing,
    };
  }
  const values = rows.map((row) => {
    const value = row.values[column];
    if (isChartNumber(value, row.unit ?? unit)) return value;
    missing++;
    return null;
  });
  return { title: name, labels: rows.map((row) => row.label), series: [{ name, values }], unit, missing };
}

export function getKecamatanSummary(sheets: StatisticsSheet[]) {
  const population = sheets.find((sheet) => sheet.id === "3.1");
  const villages = sheets.find((sheet) => sheet.id === "2.2.3");
  const sls = sheets.find((sheet) => sheet.id === "2.1.1");
  function sum(sheet: StatisticsSheet | undefined, column: number, period: string) {
    const values = sheet?.rows.filter((row) => row.period === period).map((row) => row.values[column]);
    return values?.length && values.every((value) => isChartNumber(value, "jiwa"))
      ? values.reduce<number>((total, value) => total + (value as number), 0)
      : null;
  }
  return {
    population: sum(population, 2, "2026"),
    villages: villages?.rows.filter((row) => row.period === "2025").length ?? null,
    sls: sum(sls, 1, "2025"),
  };
}
