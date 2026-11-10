import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import { buildAccessHeatmap, buildStatisticsChart, buildStatisticsTrend, canShowComposition, getKecamatanSummary, getSheetRows, getStatisticsTrendRows } from "../src/lib/statistics";
import type { StatisticsWorkbook } from "../src/types/statistics";
import { statisticsDistricts, statisticsOverview, statisticsOverviewCards } from "../src/constants/statistics-overview";

const directory = new URL("../src/constants/kcda/", import.meta.url);
const files = (await readdir(directory)).filter((file) => file.endsWith(".json"));
const workbooks: StatisticsWorkbook[] = await Promise.all(files.map((file) => Bun.file(new URL(file, directory)).json()));
const sanga = workbooks.find((book) => book.district === "sanga-desa")!;

test("the general statistics and village list match all KCDA district sheets", () => {
  expect(statisticsOverview.districts).toHaveLength(workbooks.length);
  expect(new Set(statisticsOverview.districts.map((district) => district.slug)).size).toBe(workbooks.length);
  for (const book of workbooks) {
    expect(statisticsOverview.sha256).toBe(book.sha256);
    const summary = getKecamatanSummary(book.sheets);
    expect(statisticsOverview.districts.find((district) => district.slug === book.district)).toEqual({ slug: book.district, ...summary });
    expect(statisticsDistricts.find((district) => district.slug === book.district)?.villages).toBe(summary.villages);
  }
  expect(statisticsOverviewCards.find((card) => card.id === "population")?.value).toBe(766680);
  expect(statisticsOverviewCards.find((card) => card.id === "villages")?.value).toBe(242);
});

test("all 15 districts cover all 38 sheets and match the source workbook", async () => {
  const hash = createHash("sha256").update(await Bun.file(new URL("../public/Data KCDA 2026.xlsx", import.meta.url)).bytes()).digest("hex");
  expect(workbooks).toHaveLength(15);
  for (const book of workbooks) {
    expect(book.sha256).toBe(hash);
    expect(book.sheets).toHaveLength(38);
    expect(new Set(book.sheets.map((sheet) => sheet.id)).size).toBe(38);
    for (const sheet of book.sheets) {
      expect(sheet.sources.length).toBeGreaterThan(0);
      if (sheet.kind === "withheld") {
        expect(sheet.rows).toHaveLength(0);
        continue;
      }
      expect(sheet.rows.length).toBeGreaterThan(0);
      expect(new Set(sheet.rows.map((row) => `${row.label}|${row.period}|${row.group}`)).size).toBe(sheet.rows.length);
      for (const row of sheet.rows) expect(row.values).toHaveLength(sheet.columns.length);
    }
  }
});

test("administrative population and population projections remain separate", () => {
  expect(getKecamatanSummary(sanga.sheets).population).toBe(38682);
  expect(getKecamatanSummary(sanga.sheets).villages).toBe(19);
  const age = sanga.sheets.find((sheet) => sheet.id === "3.2")!;
  expect(age.rows.reduce((sum, row) => sum + Number(row.values[2]), 0)).toBe(35121);
  const chart = buildStatisticsChart(age, age.rows, -1);
  expect(chart.series.map((series) => series.name)).toEqual(["Laki-laki", "Perempuan"]);
  expect(chart.series[0].values).toEqual([5016, 11816, 1149]);
});

test("Indonesian text numbers, missing markers, and historic periods retain their meaning", () => {
  const crops = sanga.sheets.find((sheet) => sheet.id === "5.7")!;
  expect(crops.rows.find((row) => row.period === "2025" && row.label === "Duku")?.values[0]).toBe(3868);
  expect(crops.periods).toContain("2021");
  const fuel = sanga.sheets.find((sheet) => sheet.id === "4.3.2")!;
  const model = buildStatisticsChart(fuel, fuel.rows, 0);
  expect(model.series[0].values.filter((value) => value !== null)).toEqual([19]);
  expect(model.missing).toBe(10);
  const pupils = sanga.sheets.find((sheet) => sheet.id === "4.1.4")!;
  const rows = getSheetRows(pupils, "Tabel utama", "2025/2026");
  expect(rows.find((row) => row.label === "SD")?.values[2]).toBe(4.256);
  expect(buildStatisticsChart(pupils, rows, 2).series[0].values[rows.findIndex((row) => row.label === "SD")]).toBeNull();
});

test("charts never combine production units or duplicate education blocks", () => {
  for (const book of workbooks) {
    for (const sheet of book.sheets) {
      if (["4.1.2", "4.1.3", "4.1.4"].includes(sheet.id)) {
        expect(getSheetRows(sheet, "Rincian madrasah", "2024/2025").map((row) => row.label)).toEqual(["RA", "MI", "MTS", "MA"]);
      }
      for (const group of new Set(sheet.rows.map((row) => row.group))) {
        for (const period of sheet.periods) {
          const rows = getSheetRows(sheet, group, period);
          expect(new Set(rows.map((row) => row.unit ?? sheet.unit)).size).toBeLessThanOrEqual(1);
        }
      }
    }
  }
});

test("composition requires a complete, nonnegative set of parts", () => {
  const age = sanga.sheets.find((sheet) => sheet.id === "3.2")!;
  expect(canShowComposition(buildStatisticsChart(age, age.rows, 2))).toBe(true);
  expect(canShowComposition(buildStatisticsChart(age, age.rows, -1))).toBe(false);
  const fuel = sanga.sheets.find((sheet) => sheet.id === "4.3.2")!;
  expect(canShowComposition(buildStatisticsChart(fuel, fuel.rows, 0))).toBe(false);
});

test("crop trends use chronological years and retain absent or missing values as null", () => {
  const crop = sanga.sheets.find((sheet) => sheet.id === "5.7")!;
  const model = buildStatisticsTrend(crop, "Utama", "Durian");
  expect(model.kind).toBe("line");
  expect(model.labels).toEqual(["2021", "2022", "2023", "2024", "2025"]);
  expect(model.series[0].values.at(-1)).toBe(2270);
  const partial = { ...crop, rows: crop.rows.filter((row) => !(row.label === "Durian" && row.period === "2023")) };
  expect(buildStatisticsTrend(partial, "Utama", "Durian").series[0].values[2]).toBeNull();
  expect(getStatisticsTrendRows(partial, "Utama", "Durian")[2].values).toEqual([null]);
});

test("education heatmaps preserve category labels and exclude unknown markers", () => {
  const book = workbooks.find((book) => book.district === "sekayu")!;
  const sheet = book.sheets.find((sheet) => sheet.id === "4.1.6")!;
  const rows = getSheetRows(sheet, "Utama", "2025");
  const model = buildAccessHeatmap(sheet, rows);
  expect(model.matrix?.columns).toEqual(sheet.columns.map((column) => column.label));
  expect(model.matrix?.values).not.toContainEqual([0, 0, 0]);
  expect(model.matrix?.values).toContainEqual([3, 0, 1]);
  expect(model.missing + (model.matrix?.values.length ?? 0)).toBe(rows.length * 10);
  expect(model.matrix?.categories).toEqual(["Sangat mudah", "Mudah", "Sulit", "Sangat sulit"]);
});
