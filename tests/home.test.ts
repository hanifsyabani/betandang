import { expect, test } from "bun:test";
import { homeDistricts, homeOverviewCards, homePublications, homeServices, homeSpotlightMetrics } from "../src/constants/home";
import { statisticsOverview, statisticsOverviewCards } from "../src/constants/statistics-overview";
import { scheduledActivities } from "../src/constants/activities";
import { rankStatisticsComparison } from "../src/lib/statistics-comparison";
import { getHomeAgenda } from "../src/lib/home";

test("home summary, district information and spotlight use the same KCDA source", () => {
  expect(homeOverviewCards.map((card) => card.value)).toEqual(statisticsOverviewCards.map((card) => card.value));
  expect(homeDistricts).toHaveLength(15);
  for (const district of homeDistricts) {
    const source = statisticsOverview.districts.find((row) => row.slug === district.slug)!;
    expect([district.population, district.villages, district.sls]).toEqual([source.population, source.villages, source.sls]);
  }
  for (const metric of homeSpotlightMetrics) {
    expect(metric.values[metric.periods[0]]).toHaveLength(15);
    const rows = rankStatisticsComparison(statisticsOverview.districts.map((district) => district.slug), metric, metric.periods[0]);
    expect(rows).toHaveLength(15);
    expect(rows.every((row) => row.value !== null)).toBe(true);
    expect(rows[0].value).toBe(Math.max(...metric.values[metric.periods[0]]!.map((value) => value!)));
  }
});

test("home agenda separates upcoming, ongoing and archived schedules without mutating the source", () => {
  const before = JSON.stringify(scheduledActivities);
  const october = getHomeAgenda(scheduledActivities, "2026-10-27");
  expect(october.upcoming).toHaveLength(0);
  expect(october.recent.map((activity) => activity.id)).toEqual(["se2026-lapangan", "susenas-maret-2026"]);
  expect(getHomeAgenda(scheduledActivities, "2026-08-31").upcoming.map((activity) => activity.id)).toEqual(["se2026-lapangan"]);
  expect(getHomeAgenda(scheduledActivities, "2026-02-01").upcoming).toHaveLength(2);
  expect(getHomeAgenda([], "2026-10-27")).toEqual({ upcoming: [], recent: [] });
  expect(JSON.stringify(scheduledActivities)).toBe(before);
});

test("home destinations and publication covers reference real project files and BPS pages", async () => {
  expect(homeServices.filter((service) => !service.external).map((service) => service.href)).toEqual(["/statistik-data", "/perbaikan-data-desil"]);
  for (const publication of homePublications) {
    expect(new URL(publication.sourceUrl).hostname).toBe("musibanyuasinkab.bps.go.id");
    const cover = await Bun.file(new URL(`../public${publication.cover}`, import.meta.url)).bytes();
    expect([...cover.slice(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  }
});
