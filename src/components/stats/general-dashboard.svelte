<script lang="ts">
  import { Info } from "lucide-svelte";
  import { NativeSelect } from "$lib/components/ui/native-select/index.js";
  import StatisticsChart from "./statistics-chart.svelte";
  import {
    statisticsComparisons,
    statisticsComparisonHighlights,
  } from "../../constants/statistics-comparison";
  import { statisticsTopics } from "../../constants/statistics";
  import { statisticsTopicColors } from "../../constants/statistics-presentation";
  import { formatStatisticsValue } from "../../lib/statistics";
  import { rankStatisticsComparison } from "../../lib/statistics-comparison";
  import type { StatisticsChartModel } from "../../types/statistics";

  let selectedSheet = $state("3.1");
  let selectedMetric = $state("column-2");
  let selectedPeriod = $state("");
  let order = $state("descending");
  const sheet = $derived(
    statisticsComparisons.sheets.find((sheet) => sheet.id === selectedSheet) ??
      statisticsComparisons.sheets[0],
  );
  const metric = $derived(
    sheet.metrics.find((metric) => metric.id === selectedMetric) ??
      sheet.metrics.find((metric) =>
        metric.values[metric.periods[0]]?.some(
          (value) => value !== null && value > 0,
        ),
      ) ??
      sheet.metrics[0],
  );
  const period = $derived(
    metric.periods.includes(selectedPeriod)
      ? selectedPeriod
      : metric.periods[0],
  );
  const rows = $derived(
    rankStatisticsComparison(
      statisticsComparisons.districts,
      metric,
      period,
      order,
    ),
  );
  const available = $derived(rows.filter((row) => row.value !== null));
  const maximum = $derived(
    available.length ? Math.max(...available.map((row) => row.value!)) : null,
  );
  const minimum = $derived(
    available.length ? Math.min(...available.map((row) => row.value!)) : null,
  );
  const highest = $derived(available.filter((row) => row.value === maximum));
  const lowest = $derived(available.filter((row) => row.value === minimum));
  const model: StatisticsChartModel = $derived({
    title: metric.label,
    labels: rows.map((row) => row.name),
    series: [{ name: metric.label, values: rows.map((row) => row.value) }],
    unit: metric.unit,
    missing: rows.length - available.length,
    kind: "bar",
    visibleItems: rows.length,
  });

  function selectSheet(id: string) {
    selectedSheet = id;
    selectedMetric = "";
    selectedPeriod = "";
  }
</script>

<section
  id="chart-umum"
  class="border-t border-border-subtle bg-base pb-12 sm:pb-16"
  aria-labelledby="general-statistics-title"
>
  <div class="statistics-container">
    <div
      class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Sorotan antarkecamatan"
    >
      {#each statisticsComparisonHighlights as highlight}
        <button
          type="button"
          class={[
            "min-w-0 rounded-lg border bg-surface p-4 text-left transition-colors hover:border-bps-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bps-sky sm:p-5",
            selectedSheet === highlight.sheet && metric.id === highlight.metric
              ? "border-bps-sky"
              : "border-border-subtle",
          ]}
          aria-pressed={selectedSheet === highlight.sheet &&
            metric.id === highlight.metric}
          onclick={() => {
            selectedSheet = highlight.sheet;
            selectedMetric = highlight.metric;
            selectedPeriod = highlight.period;
          }}
        >
          <span class="block text-xs font-medium text-body"
            >{highlight.label}</span
          >
          <strong class="mt-2 block text-lg font-bold text-ink"
            >{highlight.leaders.map((row) => row.name).join(", ") ||
              "Belum tersedia"}</strong
          >
          <span
            class="mt-1 block text-xl font-bold text-bps-sky-text tabular-nums"
            >{formatStatisticsValue(highlight.value)}
            <span class="text-xs font-medium">{highlight.unit}</span></span
          >
          
        </button>
      {/each}
    </div>

    <article
      class="mt-6 min-w-0 rounded-lg border border-border-subtle bg-surface"
      aria-labelledby="comparison-title"
    >
      <div class="border-b border-border-subtle p-4 sm:p-6">
        <div
          class="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_0.7fr_0.8fr]"
        >
          <div class="min-w-0">
            <label
              for="general-sheet"
              class="mb-2 block text-xs font-semibold text-ink">Topik</label
            >
            <NativeSelect
              id="general-sheet"
              value={sheet.id}
              onchange={(event) => selectSheet(event.currentTarget.value)}
              class="w-full min-w-0 bg-base"
            >
              {#each statisticsTopics.filter((topic) => topic.id !== "semua") as topic}
                <optgroup label={topic.label}>
                  {#each statisticsComparisons.sheets.filter((sheet) => sheet.topic === topic.id) as option}
                    <option value={option.id}
                      >{option.id} · {option.title}</option
                    >
                  {/each}
                </optgroup>
              {/each}
            </NativeSelect>
          </div>
          <div class="min-w-0">
            <label
              for="general-metric"
              class="mb-2 block text-xs font-semibold text-ink">Indikator</label
            >
            <NativeSelect
              id="general-metric"
              value={metric.id}
              onchange={(event) => {
                selectedMetric = event.currentTarget.value;
                selectedPeriod = "";
              }}
              class="w-full min-w-0 bg-base"
            >
              {#each sheet.metrics as option}<option value={option.id}
                  >{option.label}</option
                >{/each}
            </NativeSelect>
          </div>
          <div class="min-w-0">
            <label
              for="general-period"
              class="mb-2 block text-xs font-semibold text-ink"
              >Tahun data</label
            >
            <NativeSelect
              id="general-period"
              value={period}
              onchange={(event) => (selectedPeriod = event.currentTarget.value)}
              class="w-full min-w-0 bg-base"
            >
              {#each metric.periods as year}<option value={year}>{year}</option
                >{/each}
            </NativeSelect>
          </div>
          <div class="min-w-0">
            <label
              for="general-order"
              class="mb-2 block text-xs font-semibold text-ink"
              >Urutan nilai</label
            >
            <NativeSelect
              id="general-order"
              bind:value={order}
              class="w-full min-w-0 bg-base"
            >
              <option value="descending">Terbesar</option>
              <option value="ascending">Terkecil</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <div class="min-w-0">
          <h4 class="font-bold text-ink">{metric.label}</h4>
        </div>
        

        {#if available.length}
          <dl
            class="mt-5 grid gap-4 border-y border-border-subtle py-4 sm:grid-cols-2"
          >
            <div>
              <dt class="text-xs text-body">
                Tertinggi{available.length < rows.length
                  ? " pada data tersedia"
                  : ""}
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">
                {highest.map((row) => row.name).join(", ")}
              </dd>
              <dd class="mt-1 text-sm text-bps-sky-text tabular-nums">
                {formatStatisticsValue(maximum)}
                {metric.unit}{highest.length > 1 ? " (nilai sama)" : ""}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-body">
                Terendah{available.length < rows.length
                  ? " pada data tersedia"
                  : ""}
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">
                {lowest.map((row) => row.name).join(", ")}
              </dd>
              <dd class="mt-1 text-sm text-body tabular-nums">
                {formatStatisticsValue(minimum)}
                {metric.unit}{lowest.length > 1 ? " (nilai sama)" : ""}
              </dd>
            </div>
          </dl>
          <div
            class="mt-5 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
          >
            <div class="min-w-0">
              <StatisticsChart
                {model}
                colorToken={statisticsTopicColors[sheet.topic]}
                height={480}
              />
            </div>
            <div class="min-w-0">
              <h5 class="mb-3 text-sm font-semibold text-ink">Tabel data</h5>
              <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable table needs keyboard scrolling.) -->
              <div
                class="max-h-120 overflow-auto rounded-md border border-border-subtle focus-visible:outline-2 focus-visible:outline-bps-sky"
                tabindex="0"
                role="region"
                aria-label="Tabel data perbandingan kecamatan"
              >
                <table class="w-full text-left text-xs">
                  <caption class="sr-only"
                    >{metric.label}, {period}, dalam {metric.unit}. Urutan {order ===
                    "descending"
                      ? "terbesar"
                      : "terkecil"} dahulu. Nilai sama mendapat peringkat sama.</caption
                  >
                  <thead class="sticky top-0 bg-base text-ink">
                    <tr
                      ><th scope="col" class="w-10 px-3 py-3">No</th><th
                        scope="col"
                        class="px-3 py-3">Kecamatan</th
                      ><th scope="col" class="px-3 py-3 text-right"
                        >Nilai <span class="font-normal">({metric.unit})</span
                        ></th
                      ></tr
                    >
                  </thead>
                  <tbody class="divide-y divide-border-subtle text-body">
                    {#each rows as row (row.slug)}
                      <tr
                        ><td class="px-3 py-3 tabular-nums">{row.rank ?? ""}</td
                        ><th scope="row" class="px-3 py-3 font-medium text-ink"
                          >{row.name}</th
                        ><td class="px-3 py-3 text-right tabular-nums"
                          >{formatStatisticsValue(row.value)}</td
                        ></tr
                      >
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="mt-5 rounded-md border border-border-subtle bg-base px-5 py-12 text-center"
            role="status"
          >
            <h5 class=" font-semibold text-ink">
              Data belum tersedia
            </h5>
          
          </div>
        {/if}
      </div>
    </article>
  </div>
</section>
