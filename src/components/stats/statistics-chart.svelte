<script lang="ts">
  import { onMount } from "svelte";
  import * as echarts from "echarts/core";
  import type { EChartsOption } from "echarts";
  import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
  import { AriaComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import LoadingIndicator from "../common/loader.svelte";
  import { formatStatisticsValue } from "../../lib/statistics";
  import type { StatisticsChartProps } from "../../types/statistics";

  let { model, colorToken = "--color-bps-sky", height }: StatisticsChartProps = $props();
  let container: HTMLDivElement;
  let chart = $state.raw<ReturnType<typeof echarts.init> | null>(null);
  let failed = $state(false);
  let ready = $state(false);
  const total = $derived(model.series[0]?.values.reduce<number>((sum, value) => sum + (value ?? 0), 0) ?? 0);

  echarts.use([BarChart, LineChart, PieChart, HeatmapChart, AriaComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent, CanvasRenderer]);

  $effect(() => {
    if (!chart) return;
    const theme = getComputedStyle(container);
    const color = (token: string) => theme.getPropertyValue(token).trim();
    const palette = [color(colorToken), color("--color-bps-green-hover"), color("--color-gambo-gold"), color("--color-chart-four")];
    const kind = model.kind ?? "bar";
    const horizontal = kind === "bar";
    const visibleItems = model.visibleItems ?? 10;
    const many = model.labels.length > (horizontal ? visibleItems : 12);
    const option: EChartsOption = {
      animation: false,
      color: palette,
      textStyle: { fontFamily: theme.fontFamily, color: color("--color-body") },
      aria: { enabled: true, label: { description: `${model.title}. Satuan ${model.unit}. Nilai lengkap tersedia pada tabel data.` } },
      tooltip: {
        trigger: kind === "donut" || kind === "heatmap" ? "item" : "axis",
        confine: true, renderMode: "richText",
        valueFormatter: (value: unknown) => `${formatStatisticsValue(typeof value === "number" ? value : null)} ${model.unit}`,
      },
    };
    if (kind === "donut") {
      option.legend = {
        bottom: 0, left: "center", itemWidth: 10, itemHeight: 10, icon: "circle",
        selectedMode: false,
        textStyle: { color: color("--color-body"), fontSize: 11 },
        formatter: (name: string) => `${name}  ${formatStatisticsValue(model.series[0].values[model.labels.indexOf(name)])}`,
      };
      option.series = [{
        type: "pie", radius: ["57%", "75%"], center: ["50%", "43%"],
        label: { show: false }, labelLine: { show: false },
        itemStyle: { borderColor: color("--color-surface"), borderWidth: 4, borderRadius: 4 },
        emphasis: { scale: false },
        data: model.labels.map((name, index) => ({ name, value: model.series[0].values[index] ?? 0 })),
      }];
    } else if (kind === "heatmap" && model.matrix) {
      const matrix = model.matrix;
      option.grid = { top: 10, bottom: 90, left: 110, right: 30 };
      option.xAxis = { type: "category", data: matrix.columns, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: color("--color-body"), fontSize: 10, rotate: 35, interval: 0 } };
      option.yAxis = { type: "category", inverse: true, data: model.labels, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: color("--color-body"), fontSize: 10, width: 95, overflow: "truncate" } };
      option.visualMap = {
        type: "piecewise", orient: "horizontal", left: "center", bottom: 0, itemWidth: 12, itemHeight: 12,
        selectedMode: false,
        textStyle: { color: color("--color-body"), fontSize: 10 },
        pieces: matrix.categories.map((label, value) => ({ value, label, color: [color("--color-bps-orange-light"), color("--color-bps-orange-border"), color("--color-bps-orange"), color("--color-bps-orange-text")][value] })),
      };
      option.tooltip = {
        trigger: "item", confine: true, renderMode: "richText",
        formatter: (params: unknown) => {
          const value = (params as { value: [number, number, number] }).value;
          return `${model.labels[value[1]]}\n${matrix.columns[value[0]]}: ${matrix.categories[value[2]]}`;
        },
      };
      option.dataZoom = model.labels.length > 12 ? [{ type: "slider", yAxisIndex: 0, right: 0, width: 12, startValue: 0, endValue: 11, showDetail: false, brushSelect: false, filterMode: "filter" }] : [];
      option.series = [{ type: "heatmap", data: matrix.values, itemStyle: { borderColor: color("--color-surface"), borderWidth: 3, borderRadius: 3 }, emphasis: { itemStyle: { borderColor: color("--color-ink"), borderWidth: 2 } } }];
    } else {
      const compact = new Intl.NumberFormat("id-ID", { notation: "compact" });
      const valueAxis = {
        type: "value" as const, min: 0, splitNumber: 4,
        axisLabel: { color: color("--color-muted"), fontSize: 10, hideOverlap: true, formatter: (value: number) => compact.format(value) },
        splitLine: { lineStyle: { color: color("--color-border-subtle"), type: "dashed" as const } },
      };
      const categoryAxis = {
        type: "category" as const, data: model.labels,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: color("--color-body"), fontSize: 10, width: horizontal ? 110 : 70, overflow: "truncate" as const, rotate: !horizontal && kind !== "line" ? 32 : 0, hideOverlap: !horizontal },
      };
      option.legend = { show: model.series.length > 1, top: 0, textStyle: { color: color("--color-body"), fontSize: 11 } };
      option.grid = { top: model.series.length > 1 ? 35 : 15, bottom: many ? 55 : 30, left: horizontal ? 12 : 0, right: horizontal ? (many ? 28 : 65) : 12, containLabel: true };
      option.xAxis = horizontal ? valueAxis : { ...categoryAxis, boundaryGap: kind !== "line" };
      option.yAxis = horizontal ? { ...categoryAxis, inverse: true } : valueAxis;
      option.dataZoom = many ? [horizontal
        ? { type: "slider", yAxisIndex: 0, right: 0, width: 12, startValue: 0, endValue: visibleItems - 1, showDetail: false, brushSelect: false, filterMode: "empty" }
        : { type: "slider", xAxisIndex: 0, bottom: 0, height: 14, startValue: 0, endValue: 11, showDetail: false, brushSelect: false, filterMode: "empty" }
      ] : [];
      option.series = model.series.map((series) => kind === "line" ? {
        name: series.name, type: "line", data: series.values, connectNulls: false,
        symbol: "circle", symbolSize: 7, smooth: false, lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.1 }, emphasis: { focus: "series" },
      } : {
        name: series.name, type: "bar", data: series.values, barMaxWidth: horizontal ? 20 : 28,
        itemStyle: { borderRadius: horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0] },
        label: { show: horizontal && !many, position: "right", color: color("--color-body"), fontSize: 10, formatter: (params: { value: unknown }) => typeof params.value === "number" ? formatStatisticsValue(params.value) : "" },
        emphasis: { focus: "series" },
      });
    }
    try {
      chart.setOption(option, { notMerge: true });
      failed = false;
      ready = true;
    } catch {
      const failedChart = chart;
      chart = null;
      failed = true;
      failedChart.getZr().animation.stop();
      try { failedChart.dispose(); }
      catch { container.replaceChildren(); }
    }
  });

  onMount(() => {
    const resize = new ResizeObserver(() => chart?.resize());
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      try {
        chart = echarts.init(container, null, { renderer: "canvas" });
        resize.observe(container);
      } catch { failed = true; }
    }, { rootMargin: "250px" });
    observer.observe(container);
    return () => { observer.disconnect(); resize.disconnect(); chart?.dispose(); chart = null; };
  });
</script>

<div class="relative min-w-0" style:height={`${height ?? (model.kind === "heatmap" ? 400 : 288)}px`} data-chart-kind={model.kind ?? "bar"}>
  <div bind:this={container} class="h-full w-full" role="img" aria-label={`${model.title}, satuan ${model.unit}. Nilai lengkap tersedia pada tabel data.`}></div>
  {#if model.kind === "donut" && ready && !failed}
    <div class="pointer-events-none absolute top-[43%] left-1/2 w-40 -translate-x-1/2 -translate-y-1/2 text-center" aria-hidden="true">
      <strong class="block text-2xl leading-tight font-bold text-ink tabular-nums">{formatStatisticsValue(total)}</strong>
      <span class="mt-1 block text-[11px] text-muted">{model.unit}</span>
    </div>
  {/if}
  {#if failed}
    <p class="absolute inset-0 grid place-items-center bg-base p-6 text-center text-sm text-body" role="status">Grafik belum dapat ditampilkan. Buka tabel data untuk melihat seluruh nilai.</p>
  {:else if !ready}
    <div class="absolute inset-0 grid place-items-center">
      <LoadingIndicator label="Menyiapkan grafik…" />
    </div>
  {/if}
</div>
