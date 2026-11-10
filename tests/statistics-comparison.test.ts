import { expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { statisticsComparisons as data, statisticsComparisonHighlights } from "../src/constants/statistics-comparison";
import { rankStatisticsComparison } from "../src/lib/statistics-comparison";
import { getKecamatanSummary, isChartNumber } from "../src/lib/statistics";
import type { StatisticsComparisonMetric, StatisticsWorkbook } from "../src/types/statistics";

const directory = new URL("../src/constants/kcda/", import.meta.url);
const files = (await readdir(directory)).filter((file) => file.endsWith(".json"));
const workbooks: StatisticsWorkbook[] = await Promise.all(files.map((file) => Bun.file(new URL(file, directory)).json()));
const area = data.sheets.find((sheet) => sheet.id === "1.1")!.metrics[0];

test("general comparisons cover every .1 sheet, period and district without loading district tables", () => {
  expect(data.sheets.map((sheet) => sheet.id)).toEqual(workbooks[0].sheets.filter((sheet) => sheet.id.endsWith(".1")).map((sheet) => sheet.id));
  expect(data.sheets).toHaveLength(13);
  expect(data.districts).toHaveLength(15);
  for (const book of workbooks) expect(data.sha256).toBe(book.sha256);
  for (const sheet of data.sheets) {
    expect(sheet.sources.length).toBeGreaterThan(0);
    expect(sheet.metrics.length).toBeGreaterThan(0);
    for (const metric of sheet.metrics) {
      for (const period of metric.periods) {
        expect(metric.values[period]).toHaveLength(data.districts.length);
        expect(metric.values[period]!.every((value) => value === null || (isChartNumber(value, metric.unit) && value >= 0))).toBe(true);
      }
    }
  }
});

test("general area uses marked workbook figures and density divides district population by area", () => {
  expect(area.values["2024"]![data.districts.indexOf("bayung-lencir")]).toBeCloseTo(4505.45496292639, 8);
  expect(area.values["2024"]!.reduce<number>((sum, value) => sum + value!, 0)).toBeCloseTo(14602.5206280175, 6);
  expect(area.note).toContain("Ditandai tidak digunakan");
  const density = data.sheets.find((sheet) => sheet.id === "3.1")!.metrics.find((metric) => metric.id === "density")!;
  expect(density.note).toContain("2026");
  expect(density.note).toContain("2024");
  expect(density.note).toContain("tidak digunakan");
  workbooks.forEach((book) => {
    const index = data.districts.indexOf(book.district);
    const population = getKecamatanSummary(book.sheets).population!;
    expect(density.values["2026"]![index]).toBeCloseTo(population / area.values["2024"]![index]!, 8);
    expect(book.sheets.find((sheet) => sheet.id === "1.1")!.rows).toHaveLength(0);
  });
  expect(statisticsComparisonHighlights.find((card) => card.metric === "area")!.leaders.map((row) => row.slug)).toEqual(["bayung-lencir"]);
});

test("general metrics preserve the source categories and never sum overlapping facilities or village densities", () => {
  for (const book of workbooks) {
    const index = data.districts.indexOf(book.district);
    for (const sheet of data.sheets.filter((sheet) => sheet.id !== "1.1")) {
      const original = book.sheets.find((source) => source.id === sheet.id)!;
      for (const metric of sheet.metrics.filter((metric) => metric.id !== "density")) {
        for (const period of metric.periods) {
          let expected: number | null;
          if (metric.id.startsWith("column-")) {
            const column = Number(metric.id.split("-")[1]);
            const values = original.rows.filter((row) => row.period === period).map((row) => row.values[column]);
            expected = sheet.id === "2.2.1"
              ? values.filter((value) => value === "ADA").length
              : values.length && values.every((value) => isChartNumber(value, metric.unit))
                ? values.reduce<number>((sum, value) => sum + Number(value), 0) : null;
          } else {
            const [group, label] = metric.id.split("|");
            const row = original.rows.find((row) => row.group === group && row.label === label && row.period === period);
            expected = isChartNumber(row?.values[0], metric.unit) ? row!.values[0] as number : null;
          }
          expect(metric.values[period]![index]).toBe(expected);
        }
      }
    }
  }
  expect(data.sheets.find((sheet) => sheet.id === "2.1.1")!.metrics).toHaveLength(1);
  expect(data.sheets.find((sheet) => sheet.id === "3.1")!.metrics.map((metric) => metric.id)).toEqual(["column-2", "column-0", "column-1", "density"]);
});

test("ranking handles ties, real zero, missing data and both sort orders", () => {
  const metric: StatisticsComparisonMetric = { id: "test", label: "Test", unit: "jiwa", periods: ["2025"], values: { "2025": [10, null, 10, 0, 1.5] } };
  const districts = ["sekayu", "lalan", "lais", "keluang", "sanga-desa"];
  const descending = rankStatisticsComparison(districts, metric, "2025");
  expect(descending.map((row) => row.value)).toEqual([10, 10, 0, null, null]);
  expect(descending.map((row) => row.rank)).toEqual([1, 1, 3, null, null]);
  const ascending = rankStatisticsComparison(districts, metric, "2025", "ascending");
  expect(ascending.map((row) => row.value)).toEqual([0, 10, 10, null, null]);
  expect(ascending.map((row) => row.rank)).toEqual([1, 2, 2, null, null]);
  expect(rankStatisticsComparison(districts, metric, "2024").every((row) => row.value === null)).toBe(true);
});

test("harvested mushroom area retains square metres separately from hectare crops", () => {
  const crops = data.sheets.find((sheet) => sheet.id === "5.1")!;
  expect(crops.metrics.filter((metric) => metric.label.startsWith("Jamur")).map((metric) => metric.unit)).toEqual(["m²", "m²", "m²"]);
  expect(crops.metrics.find((metric) => metric.label === "Bayam")!.unit).toBe("ha");
  for (const book of workbooks) {
    const rows = book.sheets.find((sheet) => sheet.id === "5.1")!.rows;
    expect(rows.filter((row) => row.label.startsWith("Jamur")).every((row) => row.unit === "m²" && row.group === "Satuan (m²)")).toBe(true);
    expect(rows.filter((row) => !row.label.startsWith("Jamur")).every((row) => row.unit === "ha")).toBe(true);
  }
});
