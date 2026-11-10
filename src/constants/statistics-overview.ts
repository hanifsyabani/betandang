import data from "./kcda-overview.json";
import { mubaKecamatanRoutes } from "./maps";
import type { StatisticsOverview } from "../types/statistics";

export const statisticsOverview: StatisticsOverview = data;

export const statisticsDistricts = mubaKecamatanRoutes.map((route) => ({
  ...route,
  villages: statisticsOverview.districts.find((district) => district.slug === route.slug)?.villages ?? null,
}));

function total(metric: "population" | "villages" | "sls") {
  const values = statisticsOverview.districts.map((district) => district[metric]);
  return values.length === mubaKecamatanRoutes.length &&
    values.every((value) => typeof value === "number" && Number.isInteger(value) && value >= 0)
    ? values.reduce<number>((sum, value) => sum + (value as number), 0)
    : null;
}

export const statisticsOverviewCards = [
  { id: "population", label: "Penduduk administrasi", value: total("population"), unit: "jiwa", period: `Semester I ${data.periods.population}`, source: "DKB Dukcapil · Tabel 3.1", tone: "bg-bps-orange-light text-bps-orange-text" },
  { id: "villages", label: "Desa/kelurahan", value: total("villages"), unit: "desa/kelurahan", period: data.periods.villages, source: "Master File Desa · Tabel 2.2.3", tone: "bg-bps-green-light text-bps-green-text" },
  { id: "sls", label: "Lingkungan setempat", value: total("sls"), unit: "SLS terkecil", period: data.periods.sls, source: "Master File Desa · Tabel 2.1.1", tone: "bg-bps-sky-light text-bps-sky-text" },
  { id: "districts", label: "Kecamatan", value: data.districts.length, unit: "kecamatan", period: "Cakupan KCDA 2026", source: "Wilayah dalam workbook KCDA", tone: "bg-bps-orange-light text-bps-orange-text" },
] as const;
