<script module lang="ts">
  let isMubaMapRegistered = false;
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import * as echarts from "echarts/core";
  import { MapChart } from "echarts/charts";
  import { TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import LoadingIndicator from "../common/loader.svelte";
  import {
    formatKecamatanName,
    getKecamatanRouteByGeoName,
    mubaKecamatanRoutes,
    mubaMapGeoJsonPath,
    mubaMapName
  } from "../../constants/maps";
  import { statisticsDistricts, statisticsOverview } from "../../constants/statistics-overview";
  import type { MubaMapProps } from "../../types/components";

  type KecamatanGeoJson = {
    features?: Array<{ properties?: { nmkec?: string } }>;
  };

  type MapEventParams = {
    name?: string;
  };

  let { navigate, activeKecamatan = $bindable(null), compact = false }: MubaMapProps = $props();
  let mapElement: HTMLDivElement;
  let mapStatus = $state<"loading" | "ready" | "error">("loading");
  let chart: ReturnType<typeof echarts.init> | null = null;
  const focusedKecamatanIndex = $derived(mubaKecamatanRoutes.findIndex((route) => route.geoName === activeKecamatan));

  echarts.use([MapChart, TooltipComponent, CanvasRenderer]);

  function clearMapFocus() {
    activeKecamatan = null;
  }

  $effect(() => {
    if (mapStatus !== "ready" || !chart) return;
    if (compact) {
      chart.dispatchAction({ type: "unselect", seriesIndex: 0 });
      if (focusedKecamatanIndex >= 0) chart.dispatchAction({ type: "select", seriesIndex: 0, dataIndex: focusedKecamatanIndex });
      return;
    }
    chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
    if (focusedKecamatanIndex >= 0) {
      chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: focusedKecamatanIndex });
      chart.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: focusedKecamatanIndex });
    } else {
      chart.dispatchAction({ type: "hideTip" });
    }
  });

  function handleMapKeydown(event: KeyboardEvent) {
    if (mapStatus !== "ready" || !chart) return;

    if (event.key === "Enter" && focusedKecamatanIndex >= 0) {
      event.preventDefault();
      navigate(mubaKecamatanRoutes[focusedKecamatanIndex].path);
      return;
    }
    if (event.key === "Escape") {
      clearMapFocus();
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = focusedKecamatanIndex < 0 ? (direction === 1 ? 0 : -1) : focusedKecamatanIndex + direction;
    activeKecamatan = mubaKecamatanRoutes[(nextIndex + mubaKecamatanRoutes.length) % mubaKecamatanRoutes.length].geoName;
  }

  onMount(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function renderMap() {
      try {
        const response = await fetch(mubaMapGeoJsonPath);
        if (!response.ok) throw new Error("GeoJSON tidak dapat dimuat.");

        const geoJson = (await response.json()) as KecamatanGeoJson;
        if (!geoJson.features?.length) throw new Error("GeoJSON tidak berisi wilayah kecamatan.");
        if (disposed) return;

        if (!isMubaMapRegistered) {
          echarts.registerMap(mubaMapName, geoJson as Parameters<typeof echarts.registerMap>[1]);
          isMubaMapRegistered = true;
        }
        const theme = getComputedStyle(mapElement);
        const color = (token: string) => theme.getPropertyValue(token).trim();
        chart = echarts.init(mapElement, null, { renderer: "canvas" });
        chart.setOption({
          animation: false,
          textStyle: { fontFamily: theme.fontFamily },
          tooltip: {
            show: !compact,
            trigger: "item",
            confine: true,
            backgroundColor: color("--color-surface"),
            borderColor: color("--color-border-default"),
            borderWidth: 1,
            padding: [12, 16],
            textStyle: { color: color("--color-ink"), fontSize: 12 },
            extraCssText: "border-radius: 6px; line-height: 1.6; white-space: normal; letter-spacing: 0;",
            formatter: (params: MapEventParams) => {
              const district = statisticsDistricts.find((route) => route.geoName === params.name);
              if (!district) return "";
              return `<strong>Kecamatan ${district.name}</strong><br>${district.villages === null ? "Jumlah desa/kelurahan belum tersedia" : `${district.villages} desa/kelurahan (${statisticsOverview.periods.villages})`}<br>Klik untuk melihat statistik`;
            }
          },
          series: [
            {
              type: "map",
              name: "Kecamatan",
              map: mubaMapName,
              nameProperty: "nmkec",
              roam: false,
              selectedMode: compact ? "single" : false,
              select: {
                label: { show: false },
                itemStyle: { areaColor: color("--color-bps-orange"), borderColor: color("--color-bps-orange-hover"), borderWidth: 1 }
              },
              cursor: "pointer",
              layoutCenter: ["50%", "50%"],
              layoutSize: "94%",
              data: mubaKecamatanRoutes.map((route) => ({
                name: route.geoName,
                value: 1,
                itemStyle: { areaColor: color(compact ? "--color-bps-orange-light" : route.colorToken) },
                emphasis: { itemStyle: { areaColor: color(compact ? "--color-bps-orange" : route.colorToken) } }
              })),
              label: {
                show: !compact,
                formatter: (params: MapEventParams) => {
                  const name = formatKecamatanName(params.name ?? "");
                  const words = name.split(" ");
                  return words.length > 1 ? `${words.slice(0, -1).join(" ")}\n${words.at(-1)}` : name;
                },
                color: color("--color-ink"),
                fontSize: mapElement.clientWidth < 400 ? 9 : 11,
                fontWeight: 600,
                lineHeight: 13,
                textBorderColor: color("--color-surface"),
                textBorderWidth: 3
              },
              itemStyle: {
                borderColor: color(compact ? "--color-bps-orange-border" : "--color-surface"),
                borderWidth: compact ? 0.8 : 1.5
              },
              emphasis: {
                focus: "self",
                label: { show: !compact },
                itemStyle: {
                  borderColor: color(compact ? "--color-bps-orange-hover" : "--color-ink"),
                  borderWidth: compact ? 1 : 2
                }
              },
              blur: {
                label: { show: !compact, opacity: 1 },
                itemStyle: { opacity: 0.55 }
              }
            }
          ]
        });

        chart.on("click", (params: MapEventParams) => {
          const route = getKecamatanRouteByGeoName(params.name ?? "");
          if (!route) return;
          if (compact) activeKecamatan = route.geoName;
          else navigate(route.path);
        });
        chart.on("mouseover", (params: MapEventParams) => {
          activeKecamatan = getKecamatanRouteByGeoName(params.name ?? "")?.geoName ?? null;
        });
        chart.on("mouseout", () => { if (!compact) clearMapFocus(); });

        resizeObserver = new ResizeObserver(() => {
          chart?.resize();
          chart?.setOption({ series: [{ label: { fontSize: mapElement.clientWidth < 400 ? 9 : 11 } }] });
        });
        resizeObserver.observe(mapElement);
        mapStatus = "ready";
      } catch {
        mapStatus = "error";
      }
    }

    renderMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      chart?.dispose();
      chart = null;
    };
  });
</script>

  {#if !compact}<p id="map-scroll-hint" class="px-3 py-2 text-xs text-muted sm:hidden">Geser peta ke samping untuk melihat seluruh wilayah.</p>{/if}
  <div class={["relative overflow-x-auto overflow-y-hidden rounded-lg", compact ? "h-64 sm:h-72" : "h-120 bg-bps-sky-light/45 sm:h-160 lg:h-206"]}>
    
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (This map implements arrow-key selection and Enter navigation.) -->
    <div
      bind:this={mapElement}
      class={["h-full w-full focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-bps-sky", !compact && "min-w-140 sm:min-w-0"]}
      role="application"
      tabindex="0"
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Escape"
      aria-describedby={compact ? undefined : "map-scroll-hint"}
      aria-label={focusedKecamatanIndex >= 0
        ? `Kecamatan ${mubaKecamatanRoutes[focusedKecamatanIndex].name}`
        : `Peta kecamatan Kabupaten Musi Banyuasin: ${mubaKecamatanRoutes.map((route) => route.name).join(", ")}. Gunakan tombol panah untuk memilih kecamatan, Enter untuk membuka halaman, dan Escape untuk menutup tooltip.`}
      onkeydown={handleMapKeydown}
      onblur={() => { if (!compact) clearMapFocus(); }}
    ></div>

    {#if mapStatus === "loading"}
      <div class="absolute inset-0 grid place-items-center bg-base">
        <LoadingIndicator label="Memuat peta kecamatan..." />
      </div>
    {:else if mapStatus === "error"}
      <div class="absolute inset-0 grid content-center justify-items-center gap-3 bg-bps-orange-light p-5 text-center" role="status">
        <p class="text-sm font-semibold text-ink">Peta belum dapat dimuat</p>
        <p class="max-w-xs text-xs leading-relaxed text-body">Anda tetap dapat membuka statistik melalui {compact ? "pilihan" : "daftar"} kecamatan. Muat ulang halaman untuk mencoba memuat peta kembali.</p>
      </div>
    {/if}
  </div>
