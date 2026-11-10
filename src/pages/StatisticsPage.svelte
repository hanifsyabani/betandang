<script lang="ts">
  import {
    House,
    MapPinned,
    Network,
    Search,
    UsersRound,
    X,
  } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import MubaMap from "../components/stats/muba-map.svelte";
  import GeneralDashboard from "../components/stats/general-dashboard.svelte";
  import {
    statisticsDistricts,
    statisticsOverviewCards,
  } from "../constants/statistics-overview";
  import { formatStatisticsValue } from "../lib/statistics";
  import type { StatisticsPageProps } from "../types/components";
  import HeaderPage from "../components/common/header-page.svelte";

  let { navigate }: StatisticsPageProps = $props();
  let search = $state("");
  let activeKecamatan = $state<string | null>(null);
  const visibleDistricts = $derived(
    statisticsDistricts.filter((district) =>
      district.name
        .toLocaleLowerCase("id-ID")
        .includes(search.trim().toLocaleLowerCase("id-ID")),
    ),
  );
</script>

<HeaderPage title="Statistik" />
<section
  class="bg-home-base py-7 sm:py-9 lg:py-10"
  aria-labelledby="statistics-title"
>
  <div class="statistics-container">
    <div
      class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,0.85fr)_minmax(0,2.25fr)_minmax(18rem,1.2fr)]"
    >
      <section
        aria-label="Ringkasan statistik Musi Banyuasin"
        class="grid min-w-0 grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4 xl:col-span-1 xl:grid-cols-1 xl:gap-4"
      >
        {#each statisticsOverviewCards as card (card.id)}
          <article
            class="relative isolate flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-col lg:items-start xl:flex-row xl:items-center xl:px-5 xl:py-6"
          >
            <img
              src="/gambo-pattern.png"
              alt=""
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-4"
            />
            <div
              class={[
                "grid size-11 shrink-0 place-items-center rounded-2xl sm:size-14 xl:size-15",
                card.tone,
              ]}
              aria-hidden="true"
            >
              {#if card.id === "population"}<UsersRound
                  class="size-6 sm:size-7"
                  strokeWidth={2}
                />
              {:else if card.id === "villages"}<House
                  class="size-6 sm:size-7"
                  strokeWidth={2}
                />
              {:else if card.id === "sls"}<Network
                  class="size-6 sm:size-7"
                  strokeWidth={2}
                />
              {:else}<MapPinned class="size-6 sm:size-7" strokeWidth={2} />{/if}
            </div>
            <div class="min-w-0">
              <h2
                class="text-xs leading-relaxed font-medium text-body sm:text-sm"
              >
                {card.label}
              </h2>
              <p class="mt-0.5 text-xs text-muted">{card.period}</p>
              <p
                class={[
                  "mt-1.5 leading-tight font-bold text-ink tabular-nums",
                  card.value === null
                    ? "text-base"
                    : "text-2xl sm:text-[1.75rem]",
                ]}
              >
                {formatStatisticsValue(card.value)}
              </p>
              <p class="mt-1 text-xs text-muted">{card.unit}</p>
            </div>
          </article>
        {/each}
      </section>

      <section
        aria-label="Peta interaktif kecamatan"
        class="min-w-0 rounded-xl border border-border-subtle bg-surface p-1.5"
      >
        <MubaMap {navigate} bind:activeKecamatan />
      </section>

      <aside
        aria-labelledby="district-list-title"
        class="min-w-0 rounded-xl border border-border-subtle bg-surface px-4 pt-5 pb-3 sm:px-5"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 id="district-list-title" class=" font-bold text-ink">
            Daftar Kecamatan
          </h2>
        </div>
        <div class="mt-4">
          <div class="relative">
            <Search
              class="pointer-events-none absolute top-3.5 left-3 size-4 text-muted"
              aria-hidden="true"
            />
            <Input
              id="district-search"
              type="search"
              bind:value={search}
              placeholder="Ketik nama kecamatan..."
              class="h-11 bg-base pr-10 pl-9 text-sm [&::-webkit-search-cancel-button]:appearance-none"
            />
            {#if search}
              <button
                type="button"
                class="absolute top-0 right-0 grid size-11 place-items-center rounded-md text-muted hover:text-ink"
                aria-label="Hapus pencarian kecamatan"
                onclick={() => (search = "")}
                ><X class="size-4" aria-hidden="true" /></button
              >
            {/if}
          </div>
        </div>
        <p class="sr-only" role="status">
          {visibleDistricts.length} kecamatan ditemukan.
        </p>
        <ul class="mt-3 divide-y divide-border-subtle">
          {#each visibleDistricts as district (district.slug)}
            <li>
              <ul
                class={[
                  "group flex min-h-11 items-center gap-2.5 rounded-md px-2 py-2 text-xs transition-colors hover:bg-bps-sky-light focus-visible:bg-bps-sky-light",
                  activeKecamatan === district.geoName && "bg-bps-sky-light",
                ]}
              >
                <span
                  class="size-3 shrink-0 rounded-full"
                  style:background-color={`var(${district.colorToken})`}
                  aria-hidden="true"
                ></span>
                <span class="min-w-0 flex-1 font-medium text-ink"
                  >{district.name}</span
                >
                <span class="shrink-0 text-[0.65rem] text-body"
                  >{district.villages === null
                    ? "Belum tersedia"
                    : `${district.villages} desa/kel.`}</span
                >
              </ul>
            </li>
          {:else}
            <li class="py-9 text-center">
              <p class="text-sm font-semibold text-ink">
                Kecamatan tidak ditemukan
              </p>
              <p class="mt-2 text-xs text-muted">
                Coba nama lain atau hapus pencarian.
              </p>
              <Button
                variant="outline"
                class="mt-4 min-h-11"
                onclick={() => (search = "")}>Tampilkan semua kecamatan</Button
              >
            </li>
          {/each}
        </ul>
      </aside>
    </div>
  </div>
</section>

<GeneralDashboard />
