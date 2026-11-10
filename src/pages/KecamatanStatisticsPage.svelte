<script lang="ts">
  import { onMount } from "svelte";
  import { NativeSelect } from "$lib/components/ui/native-select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import LoadingIndicator from "../components/common/loader.svelte";
  import StatisticsSheet from "../components/stats/statistics-sheet.svelte";
  import {
    getKecamatanRouteFromPath,
    mubaKecamatanRoutes,
  } from "../constants/maps";
  import {

    loadKecamatanStatistics,
    statisticsTopics,
  } from "../constants/statistics";
  import {
    statisticsPresentations,
    statisticsTopicDescriptions,
    statisticsWidthClasses,
  } from "../constants/statistics-presentation";
  import {
    formatStatisticsValue,
    getKecamatanSummary,
  } from "../lib/statistics";
  import type { KecamatanStatisticsPageProps } from "../types/components";
  import type { StatisticsWorkbook } from "../types/statistics";
  import Sidebar from "../components/stats/sidebar.svelte";

  let { currentPath, navigate }: KecamatanStatisticsPageProps = $props();
  const kecamatan = $derived(getKecamatanRouteFromPath(currentPath));
  let workbook = $state.raw<StatisticsWorkbook | null>(null);
  let status = $state<"loading" | "ready" | "error">("loading");
  let selectedTopic = $state("semua");
  let search = $state("");
  const summary = $derived(getKecamatanSummary(workbook?.sheets ?? []));
  const visibleSheets = $derived(
    (workbook?.sheets ?? []).filter((sheet) => {
      const query = search.trim().toLocaleLowerCase("id-ID");
      return (
        (selectedTopic === "semua" || sheet.topic === selectedTopic) &&
        `${sheet.id} ${sheet.title} ${sheet.columns.map((column) => column.label).join(" ")}`
          .toLocaleLowerCase("id-ID")
          .includes(query)
      );
    }),
  );
  const sectionGroups = $derived(
    statisticsTopics
      .filter((topic) => topic.id !== "semua")
      .map((topic) => ({
        ...topic,
        sheets: visibleSheets
          .filter((sheet) => sheet.topic === topic.id)
          .sort((a, b) => {
            const order = Object.keys(statisticsPresentations);
            return order.indexOf(a.id) - order.indexOf(b.id);
          }),
      }))
      .filter((topic) => topic.sheets.length),
  );

  onMount(() => {
    let disposed = false;
    if (kecamatan) {
      loadKecamatanStatistics(kecamatan.slug)
        .then((data) => {
          if (disposed) return;
          workbook = data;
          status = "ready";
        })
        .catch(() => {
          if (!disposed) status = "error";
        });
    }
    return () => {
      disposed = true;
    };
  });
</script>

<svelte:head>
  <title
    >{kecamatan
      ? `Statistik Kecamatan ${kecamatan.name}`
      : "Kecamatan tidak ditemukan"} - Pojok BPS Muba</title
  >
</svelte:head>

<section class="min-h-160 bg-base pb-12 md:pb-16">
  <header class="statistics-container pt-4 pb-6 md:pt-5">
    <nav
      class="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted"
      aria-label="Breadcrumb"
    >
      <a
        class="inline-flex min-h-11 items-center font-semibold text-bps-sky-text hover:underline"
        href="/statistik-data"
        onclick={(event) => {
          event.preventDefault();
          navigate("/statistik-data");
        }}>Statistik & Data</a
      >
      <span aria-hidden="true">/</span><span
        >{kecamatan?.name ?? "Kecamatan tidak ditemukan"}</span
      >
    </nav>
    {#if kecamatan}
      <div
        class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
      >
        <div>
          <h1 class="text-3xl leading-tight font-bold text-ink">
            {kecamatan.name}
          </h1>
          <p class="mt-1.5 text-xs text-muted">
            Kabupaten Musi Banyuasin, Sumatera Selatan
          </p>
        </div>
       
      </div>
    {:else}
      <h1 class="text-3xl font-bold text-ink">Kecamatan tidak ditemukan</h1>
      <p class="mt-3 text-muted">
        Pilih kecamatan melalui peta Statistik & Data.
      </p>
      <Button
        class="mt-5 min-h-11"
        href="/statistik-data"
        onclick={(event) => {
          event.preventDefault();
          navigate("/statistik-data");
        }}>Buka peta kecamatan</Button
      >
    {/if}
  </header>

  {#if kecamatan}
    <div class="statistics-container">
      {#if status === "loading"}
        <div
          class="grid min-h-96 place-items-center px-4 py-12 md:min-h-112"
        >
          <LoadingIndicator label={`Memuat statistik ${kecamatan.name}…`} />
        </div>
      {:else if status === "error"}
        <div
          class="rounded-lg border border-bps-orange-border bg-surface p-6"
          role="alert"
        >
          <h2 class="text-lg font-semibold text-ink">
            Data kecamatan belum dapat dimuat
          </h2>
          <p class="mt-2 text-sm text-body">
            Periksa koneksi, lalu muat ulang halaman untuk mencoba kembali.
          </p>
          <Button
            variant="outline"
            class="mt-4 min-h-11"
            onclick={() => window.location.reload()}>Muat ulang halaman</Button
          >
        </div>
      {:else if workbook}
        <div class="flex min-w-0 flex-col gap-6 xl:flex-row">
          <Sidebar
            {workbook}
            {selectedTopic}
            onTopicChange={(topic) => (selectedTopic = topic)}
          />

          <div class="min-w-0 flex-1">
            <section
              aria-label="Ringkasan kecamatan"
              class="grid grid-cols-2 gap-3 md:grid-cols-3"
            >
              <article
                class="rounded-lg border border-border-default border-t-2 border-t-bps-sky bg-surface p-4"
              >
                <h2 class="text-[11px] font-medium text-body">
                  Penduduk administrasi
                </h2>
                <p
                  class="mt-2 text-2xl leading-tight font-bold text-ink tabular-nums"
                >
                  {formatStatisticsValue(summary.population)}
                </p>
                
              </article>
              <article
                class="rounded-lg border border-border-default border-t-2 border-t-bps-green bg-surface p-4"
              >
                <h2 class="text-[11px] font-medium text-body">
                  Desa/kelurahan tercatat
                </h2>
                <p
                  class="mt-2 text-2xl leading-tight font-bold text-ink tabular-nums"
                >
                  {formatStatisticsValue(summary.villages)}
                </p>
              </article>
              <article
                class="rounded-lg border border-border-default border-t-2 border-t-bps-orange bg-surface p-4"
              >
                <h2 class="text-[11px] font-medium text-body">
                  Satuan lingkungan terkecil
                </h2>
                <p
                  class="mt-2 text-2xl leading-tight font-bold text-ink tabular-nums"
                >
                  {formatStatisticsValue(summary.sls)}
                </p>
              
              </article>

            </section>

            {#if !visibleSheets.length}
              <div
                class="rounded-lg border border-border-default bg-surface p-8 text-center"
                role="status"
              >
                <h3 class="font-semibold text-ink">
                  Tidak ada sheet yang sesuai
                </h3>
                <p class="mt-2 text-sm text-muted">
                  Coba kata pencarian lain atau tampilkan seluruh topik.
                </p>
                <Button
                  variant="outline"
                  class="mt-4 min-h-11"
                  onclick={() => {
                    search = "";
                    selectedTopic = "semua";
                  }}>Reset pencarian dan topik</Button
                >
              </div>
            {:else}
              <div class="space-y-8 mt-10">
                {#each sectionGroups as topic (topic.id)}
                  <section aria-labelledby={`topic-${topic.id}`}>
                    <div
                      class="mb-3 flex flex-wrap items-baseline justify-between gap-2"
                    >
                      <h3
                        id={`topic-${topic.id}`}
                        class="text-sm font-bold text-ink"
                      >
                        {topic.label}
                      </h3>
                      <p class="text-[11px] text-muted">
                        {statisticsTopicDescriptions[topic.id]}
                      </p>
                    </div>
                    <div
                      class="grid min-w-0 items-stretch grid-cols-1 gap-4 lg:grid-cols-12"
                    >
                      {#each topic.sheets as sheet (sheet.id)}
                        <div
                          class={[
                            "min-w-0",
                            statisticsWidthClasses[
                              statisticsPresentations[sheet.id]?.width ?? "half"
                            ],
                          ]}
                        >
                          <StatisticsSheet {sheet} />
                        </div>
                      {/each}
                    </div>
                  </section>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</section>
