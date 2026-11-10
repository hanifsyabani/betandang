<script lang="ts">
  import { NativeSelect } from "$lib/components/ui/native-select/index.js";
  import StatisticsChart from "./statistics-chart.svelte";
  import {
    buildAccessHeatmap,
    buildStatisticsChart,
    buildStatisticsTrend,
    canShowComposition,
    formatStatisticsValue,
    getSheetRows,
    getStatisticsTrendRows,
    isChartNumber,
  } from "../../lib/statistics";
  import {
    statisticsPresentations,
    statisticsTopicColors,
  } from "../../constants/statistics-presentation";
  import type { StatisticsSheetProps } from "../../types/statistics";

  let { sheet }: StatisticsSheetProps = $props();
  let selectedGroup = $state("");
  let selectedPeriod = $state("");
  let selectedColumn = $state("");
  let selectedCategory = $state("");
  let selectedView = $state("trend");
  const presentation = $derived(statisticsPresentations[sheet.id]);
  const trendAvailable = $derived(presentation?.chart === "line");
  const trend = $derived(trendAvailable && selectedView === "trend");
  const groups = $derived([...new Set(sheet.rows.map((row) => row.group))]);
  const group = $derived(
    groups.includes(selectedGroup) ? selectedGroup : (groups[0] ?? "Utama"),
  );
  const periods = $derived(
    [
      ...new Set(
        sheet.rows
          .filter((row) => row.group === group)
          .map((row) => row.period),
      ),
    ]
      .sort()
      .reverse(),
  );
  const period = $derived(
    periods.includes(selectedPeriod)
      ? selectedPeriod
      : (periods[0] ?? sheet.periods[0]),
  );
  const column = $derived(
    selectedColumn !== ""
      ? Number(selectedColumn)
      : ["3.1", "3.2", "4.1.2", "4.1.3", "4.1.4", "4.1.5"].includes(sheet.id)
        ? 2
        : ["1.3", "2.1.1"].includes(sheet.id)
          ? 1
          : 0,
  );
  const categories = $derived([
    ...new Set(
      sheet.rows.filter((row) => row.group === group).map((row) => row.label),
    ),
  ]);
  const category = $derived(
    categories.includes(selectedCategory)
      ? selectedCategory
      : (sheet.rows.find(
          (row) =>
            row.group === group &&
            row.period === period &&
            isChartNumber(row.values[0], row.unit ?? sheet.unit) &&
            row.values[0] > 0,
        )?.label ??
          sheet.rows.find(
            (row) =>
              row.group === group &&
              isChartNumber(row.values[0], row.unit ?? sheet.unit),
          )?.label ??
          categories[0] ??
          ""),
  );
  const rows = $derived(
    trend
      ? getStatisticsTrendRows(sheet, group, category)
      : getSheetRows(sheet, group, period),
  );
  const model = $derived.by(() => {
    if (trend) return buildStatisticsTrend(sheet, group, category);
    if (presentation?.chart === "heatmap")
      return buildAccessHeatmap(sheet, rows);
    const data = buildStatisticsChart(sheet, rows, column);
    const kind = presentation?.chart ?? "bar";
    return {
      ...data,
      kind:
        kind === "donut"
          ? canShowComposition(data)
            ? ("donut" as const)
            : ("bar" as const)
          : kind === "line"
            ? ("column" as const)
            : kind,
    };
  });
  const hasNumbers = $derived(
    Boolean(model.matrix?.values.length) ||
      model.series.some((series) =>
        series.values.some((value) => value !== null),
      ),
  );
  const reference = $derived(sheet.kind === "glossary");
  const hasEnglish = $derived(
    reference && rows.some((row) => row.values[1] !== null),
  );
  const sheetKey = $derived(sheet.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
</script>

<article
  class="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border-default bg-surface"
  id={`sheet-${sheetKey}`}
  aria-labelledby={`title-${sheetKey}`}
>
  <header class="px-5 pt-5 pb-2">
    <div
      class="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted"
    >
      <span class="tabular-nums"
        >{trend ? `${model.labels[0]}–${model.labels.at(-1)}` : period}</span
      >
    </div>
    <h3 id={`title-${sheetKey}`} class=" leading-snug font-semibold text-ink">
      {sheet.title}
    </h3>
  </header>

  <div class="flex flex-1 flex-col px-5 pt-4 pb-5">
    {#if sheet.kind === "withheld"}
      <div
        class="flex flex-col justify-center border-l-3 border-bps-orange bg-bps-orange-light p-4"
      >
        <strong class="text-sm text-bps-orange-text"
          >Data ditandai tidak digunakan</strong
        >
        <p class="mt-2 text-sm text-body">{sheet.notes[1]}</p>
      </div>
    {:else if reference}
      <p class="mb-3 text-sm text-body">
        Daftar istilah pendamping tabel statistik. Isi berupa teks disajikan
        sebagai referensi.
      </p>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable tables need a keyboard focus target.) -->
      <div
        class="max-h-80 overflow-auto rounded border border-border-default focus-visible:outline-3 focus-visible:outline-bps-sky"
        role="region"
        aria-label={sheet.title}
        tabindex="0"
      >
        <table class="w-full text-left text-sm">
          <caption class="sr-only">{sheet.title}</caption>
          <thead class="sticky top-0 bg-base text-xs text-ink"
            ><tr
              ><th class="p-3" scope="col">Singkatan</th><th
                class="p-3"
                scope="col">Arti</th
              >{#if hasEnglish}<th class="p-3" scope="col"
                  >Istilah bahasa Inggris</th
                >{/if}</tr
            ></thead
          >
          <tbody
            >{#each rows as row}<tr class="border-t border-border-subtle"
                ><th scope="row" class="p-3 align-top font-semibold text-ink"
                  >{row.label}</th
                ><td class="p-3">{formatStatisticsValue(row.values[0])}</td
                >{#if hasEnglish}<td class="p-3"
                    >{formatStatisticsValue(row.values[1])}</td
                  >{/if}</tr
              >{/each}</tbody
          >
        </table>
      </div>
    {:else}
      {#if sheet.kind !== "directory"}
        {#if trendAvailable}
          <div
            class="mb-3 flex w-fit gap-1 rounded-md bg-base p-1"
            aria-label={`Tampilan ${sheet.title}`}
          >
            <button
              type="button"
              class={[
                "min-h-11 rounded px-3 text-xs font-semibold",
                trend
                  ? "bg-surface text-bps-green-text shadow-sm"
                  : "text-muted hover:text-ink",
              ]}
              aria-pressed={trend}
              onclick={() => (selectedView = "trend")}>Tren tahunan</button
            >
            <button
              type="button"
              class={[
                "min-h-11 rounded px-3 text-xs font-semibold",
                !trend
                  ? "bg-surface text-bps-green-text shadow-sm"
                  : "text-muted hover:text-ink",
              ]}
              aria-pressed={!trend}
              onclick={() => (selectedView = "categories")}>Per kategori</button
            >
          </div>
        {/if}
        <div class="mb-4 flex flex-wrap gap-3">
          {#if groups.length > 1}
            <label
              class="grid min-w-0 flex-1 gap-1 text-xs font-semibold text-body"
              >Tabel
              <NativeSelect
                class="w-full min-w-36"
                value={group}
                onchange={(event) => {
                  selectedGroup = event.currentTarget.value;
                  selectedPeriod = "";
                }}
              >
                {#each groups as item}<option value={item}>{item}</option
                  >{/each}
              </NativeSelect>
            </label>
          {/if}
          {#if periods.length > 1 && !trend}
            <label class="grid min-w-0 gap-1 text-xs font-semibold text-body"
              >Periode
              <NativeSelect
                class="w-full min-w-28"
                value={period}
                onchange={(event) =>
                  (selectedPeriod = event.currentTarget.value)}
              >
                {#each periods as item}<option value={item}>{item}</option
                  >{/each}
              </NativeSelect>
            </label>
          {/if}
          {#if trend}
            <label
              class="grid min-w-0 flex-1 gap-1 text-xs font-semibold text-body"
              >Jenis tanaman
              <NativeSelect
                class="w-full min-w-36"
                value={category}
                onchange={(event) =>
                  (selectedCategory = event.currentTarget.value)}
              >
                {#each categories as item}<option value={item}>{item}</option
                  >{/each}
              </NativeSelect>
            </label>
          {/if}
          {#if sheet.columns.length > 1 && presentation?.chart !== "heatmap"}
            <label
              class="grid min-w-0 flex-1 gap-1 text-xs font-semibold text-body"
              >Indikator
              <NativeSelect
                class="w-full min-w-36"
                value={String(column)}
                onchange={(event) =>
                  (selectedColumn = event.currentTarget.value)}
              >
                {#if sheet.id === "3.2"}<option value="-1"
                    >Perbandingan jenis kelamin</option
                  >{/if}
                {#each sheet.columns as item, i}<option value={String(i)}
                    >{item.label}</option
                  >{/each}
              </NativeSelect>
            </label>
          {/if}
        </div>
        {#if !rows.length}
          <p
            class="grid min-h-64 place-items-center bg-base p-6 text-center text-sm text-muted"
            role="status"
          >
            Data kecamatan untuk pilihan ini belum tersedia.
          </p>
        {:else if hasNumbers}
          <StatisticsChart
            {model}
            colorToken={statisticsTopicColors[sheet.topic]}
          />
          {#if model.labels.length > (model.kind === "column" ? 12 : model.kind === "heatmap" ? 12 : 10) && model.kind !== "line"}<p
              class="mt-1 text-[11px] text-muted"
            >
              Geser pengatur grafik untuk melihat kategori lainnya. Semua nilai
              tersedia di tabel.
            </p>{/if}
        {:else}
          <div
            class="grid min-h-40 place-content-center gap-2 rounded-md bg-base p-6 text-center"
            role="status"
          >
            <strong class="text-sm text-ink">Tidak ada Data</strong>
          </div>
        {/if}
        
      {/if}

      <details
        class="mt-3 border-t border-border-subtle"
        open={sheet.kind === "directory"}
      >
        <summary
          class="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-bps-sky-text underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bps-sky"
          >Lihat tabel data</summary
        >
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable tables need a keyboard focus target.) -->
        <div
          class="max-h-96 overflow-auto border border-border-default focus-visible:outline-3 focus-visible:outline-bps-sky"
          role="region"
          aria-label={`Tabel ${sheet.title}`}
          tabindex="0"
        >
          <table class="w-full text-left text-xs">
            <caption class="sr-only"
              >{sheet.title}, {trend ? "seluruh periode" : period}, {group}.
              Setiap judul kolom menyebutkan satuan.</caption
            >
            <thead class="sticky top-0 bg-base text-ink"
              ><tr>
                <th scope="col" class="min-w-36 p-3"
                  >{trend
                    ? "Periode"
                    : [
                          "1.3",
                          "2.1.1",
                          "2.2.1",
                          "2.2.2",
                          "2.2.3",
                          "3.1",
                          "4.1.5",
                          "4.1.6",
                        ].includes(sheet.id)
                      ? "Desa/kelurahan"
                      : "Kategori"}</th
                >
                {#each sheet.columns as item}<th
                    scope="col"
                    class="min-w-32 p-3"
                    >{item.label}{#if sheet.kind === "numeric"}<span
                        class="mt-1 block font-normal text-muted"
                        >({rows[0]?.unit ?? item.unit})</span
                      >{/if}</th
                  >{/each}
              </tr></thead
            >
            <tbody
              >{#each rows as row}<tr class="border-t border-border-subtle">
                  <th scope="row" class="p-3 font-medium text-ink"
                    >{trend ? row.period : row.label}</th
                  >
                  {#each row.values as value, i}<td class="p-3 tabular-nums"
                      >{formatStatisticsValue(value)}
                      {#if sheet.kind === "numeric" && typeof value === "number" && !isChartNumber(value, row.unit ?? sheet.columns[i].unit)}<span
                          class="mt-1 block text-bps-orange-text"
                          >Perlu verifikasi</span
                        >{/if}
                    </td>{/each}
                </tr>{/each}</tbody
            >
          </table>
        </div>
      </details>
    {/if}
  </div>
</article>
