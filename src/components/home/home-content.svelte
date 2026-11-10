<script lang="ts">
  import { today } from "@internationalized/date";
  import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Building2,
    CalendarDays,
    Database,
    FileText,
    House,
    Layers3,
    MessageSquare,
    UsersRound,
  } from "lucide-svelte";
  import { NativeSelect } from "$lib/components/ui/native-select/index.js";
  import MubaMap from "../stats/muba-map.svelte";
  import {
    homeDistricts,
    homeOverviewCards,
    homePublications,
    homeServices,
    homeSpotlightMetrics,
  } from "../../constants/home";
  import {
    activityCalendarTimeZone,
    activityCategories,
    activityScheduleCheckedAt,
    scheduledActivities,
  } from "../../constants/activities";
  import { statisticsOverview } from "../../constants/statistics-overview";
  import { kcdaWorkbookUrl } from "../../constants/statistics";
  import { contentSources } from "../../constants/prototype";
  import { toneClasses } from "../../constants/styles";
  import { formatStatisticsValue } from "../../lib/statistics";
  import { rankStatisticsComparison } from "../../lib/statistics-comparison";
  import { getHomeAgenda } from "../../lib/home";
  import type { NavigationProps } from "../../types/components";

  let { navigate }: NavigationProps = $props();
  let metricId = $state("population");
  let activeKecamatan = $state<string | null>("SEKAYU");
  let selectedSlug = $state("sekayu");
  let failedCovers = $state<string[]>([]);
  const metric = $derived(
    homeSpotlightMetrics.find((metric) => metric.id === metricId) ??
      homeSpotlightMetrics[0],
  );
  const ranking = $derived(
    rankStatisticsComparison(
      statisticsOverview.districts.map((district) => district.slug),
      metric,
      metric.periods[0],
    ).filter((row) => row.value !== null),
  );
  const topDistricts = $derived(ranking.slice(0, 5));
  const maximum = $derived(topDistricts[0]?.value ?? 0);
  const district = $derived(
    homeDistricts.find((district) => district.geoName === activeKecamatan) ??
      homeDistricts.find((district) => district.slug === selectedSlug) ??
      homeDistricts[0],
  );
  const currentDate = today(activityCalendarTimeZone).toString();
  const agenda = getHomeAgenda(scheduledActivities, currentDate);
  const visibleAgenda = (
    agenda.upcoming.length ? agenda.upcoming : agenda.recent
  ).slice(0, 3);
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: activityCalendarTimeZone,
  });

  function formatDate(date: string) {
    return dateFormatter.format(new Date(`${date}T00:00:00+07:00`));
  }

  function openRoute(event: MouseEvent, path: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(path);
  }
</script>

<div
  id="home-content"
  class="relative isolate bg-home-base py-8 sm:py-10 lg:py-12"
>
  <div class="page-container max-w-7xl space-y-6 sm:space-y-7">
    <section aria-labelledby="home-overview-title">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="home-overview-title"
            class="text-xl font-bold text-ink sm:text-2xl"
          >
            Sekilas Musi Banyuasin
          </h2>
        </div>
        <a
          class="home-link"
          href="/statistik-data"
          onclick={(event) => openRoute(event, "/statistik-data")}
          >Lihat data wilayah <ArrowRight
            class="size-3.5"
            aria-hidden="true"
          /></a
        >
      </div>
      <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {#each homeOverviewCards as card (card.id)}
          <article
            class="flex min-w-0 flex-col gap-3 rounded-xl border border-border-default/60 bg-surface p-4 sm:flex-row sm:gap-4 sm:p-5"
          >
            <div
              class="grid size-11 shrink-0 place-items-center rounded-lg bg-bps-orange-light text-bps-orange-text sm:size-12"
              aria-hidden="true"
            >
              {#if card.id === "population"}<UsersRound
                  class="size-6"
                />{:else if card.id === "villages"}<House
                  class="size-6"
                />{:else if card.id === "sls"}<Layers3
                  class="size-6"
                />{:else}<Building2 class="size-6" />{/if}
            </div>
            <div class="min-w-0">
              <h3 class="text-xs font-semibold text-ink sm:text-sm">
                {card.label}
              </h3>
              <p
                class="mt-1 text-2xl leading-tight font-bold text-ink tabular-nums sm:text-3xl"
              >
                {formatStatisticsValue(card.value)}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <div class="grid gap-5 lg:grid-cols-2">
      <section
        class="home-panel flex min-w-0 flex-col"
        aria-labelledby="home-spotlight-title"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="max-w-70">
            <h2
              id="home-spotlight-title"
              class="text-lg font-bold text-ink sm:text-xl"
            >
              Sorotan Data Muba
            </h2>
          </div>
          <div class="w-full min-w-0 sm:w-44">
            <label for="home-spotlight-metric" class="sr-only"
              >Indikator sorotan data</label
            >
            <NativeSelect
              id="home-spotlight-metric"
              bind:value={metricId}
              class="w-full bg-base [&_select]:text-xs"
            >
              {#each homeSpotlightMetrics as metric}<option value={metric.id}
                  >{metric.label}</option
                >{/each}
            </NativeSelect>
          </div>
        </div>
        {#if topDistricts.length}
          <ol
            class="my-6 space-y-4 sm:my-7"
            aria-label={`${metric.label}, tahun ${metric.periods[0]}, satuan ${metric.unit}`}
          >
            {#each topDistricts as row (row.slug)}
              <li
                class="grid grid-cols-[1.5rem_5.5rem_minmax(0,1fr)] items-center gap-2 text-xs sm:grid-cols-[1.75rem_6.25rem_minmax(0,1fr)] sm:gap-3"
              >
                <span
                  class="grid size-6 place-items-center rounded-full bg-bps-orange-light font-semibold text-bps-orange-text"
                  aria-hidden="true">{row.rank}</span
                >
                <span class="font-medium text-ink"
                  ><span class="sr-only"
                    >Peringkat {row.rank}.
                  </span>{row.name}</span
                >
                <div class="flex min-w-0 items-center gap-2">
                  <div class="min-w-0 flex-1" aria-hidden="true">
                    <div
                      class="h-4 rounded-r-sm bg-bps-orange"
                      style:width={`${maximum ? (row.value! / maximum) * 100 : 0}%`}
                    ></div>
                  </div>
                  <span
                    class="w-14 shrink-0 text-right font-semibold text-ink tabular-nums"
                    >{formatStatisticsValue(row.value)}<span class="sr-only">
                      {metric.unit}</span
                    ></span
                  >
                </div>
              </li>
            {/each}
          </ol>
          <p class="mb-4 text-xs leading-relaxed text-muted" role="status">
            {metric.source}. Satuan: {metric.unit}.{ranking.length <
            homeDistricts.length
              ? ` Data tersedia untuk ${ranking.length} dari ${homeDistricts.length} kecamatan.`
              : ""}
          </p>
        {:else}
          <p
            class="my-8 rounded-lg bg-base p-5 text-sm text-body"
            role="status"
          >
            Angka pembanding belum tersedia untuk indikator ini. Pilih indikator
            lain atau buka statistik lengkap.
          </p>
        {/if}
        <a
          class="home-link mt-auto w-full"
          href="/statistik-data"
          onclick={(event) => openRoute(event, "/statistik-data")}
          >Lihat statistik lengkap <ArrowRight
            class="size-3.5"
            aria-hidden="true"
          /></a
        >
      </section>

      <section class="home-panel min-w-0" aria-labelledby="home-district-title">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="max-w-70">
            <h2
              id="home-district-title"
              class="text-lg font-bold text-ink sm:text-xl"
            >
              Kenali Kecamatan Anda
            </h2>
          </div>
          <a
            class="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-bps-orange-text hover:underline"
            href="/statistik-data"
            onclick={(event) => openRoute(event, "/statistik-data")}
            >Semua kecamatan <ArrowRight
              class="size-3.5"
              aria-hidden="true"
            /></a
          >
        </div>
        <div class="relative mt-3">
          <MubaMap compact {navigate} bind:activeKecamatan />
          <div
            class="relative rounded-lg border border-bps-orange-border bg-surface p-4 sm:absolute sm:top-1/2 sm:right-0 sm:w-52 sm:-translate-y-1/2 sm:shadow-md"
          >
            <label for="home-district" class="sr-only"
              >Pilih kecamatan di Beranda</label
            >
            <NativeSelect
              id="home-district"
              value={district.slug}
              onchange={(event) => {
                selectedSlug = event.currentTarget.value;
                activeKecamatan =
                  homeDistricts.find(
                    (district) => district.slug === selectedSlug,
                  )?.geoName ?? null;
              }}
              class="w-full [&_select]:text-sm [&_select]:font-semibold"
            >
              {#each homeDistricts as option}<option value={option.slug}
                  >{option.name}</option
                >{/each}
            </NativeSelect>
            <dl
              class="mt-4 space-y-2.5 text-xs"
              aria-live="polite"
              aria-atomic="true"
            >
              <div class="flex items-start justify-between gap-2">
                <dt class="flex items-center gap-1.5 text-body">
                  <UsersRound
                    class="size-3.5 shrink-0"
                    aria-hidden="true"
                  />Penduduk
                  <span class="sr-only">administrasi Semester I</span>
                  {statisticsOverview.periods.population}
                </dt>
                <dd class="text-right font-semibold text-ink tabular-nums">
                  {formatStatisticsValue(district.population)}
                  <span class="font-normal">jiwa</span>
                </dd>
              </div>
              <div class="flex items-start justify-between gap-2">
                <dt class="flex items-center gap-1.5 text-body">
                  <House
                    class="size-3.5 shrink-0"
                    aria-hidden="true"
                  />Desa/kel. {statisticsOverview.periods.villages}
                </dt>
                <dd class="font-semibold text-ink tabular-nums">
                  {formatStatisticsValue(district.villages)}
                </dd>
              </div>
              <div class="flex items-start justify-between gap-2">
                <dt class="flex items-center gap-1.5 text-body">
                  <Layers3 class="size-3.5 shrink-0" aria-hidden="true" />SLS {statisticsOverview
                    .periods.sls}
                </dt>
                <dd class="font-semibold text-ink tabular-nums">
                  {formatStatisticsValue(district.sls)}
                </dd>
              </div>
            </dl>
            <a
              class="home-link mt-4 w-full px-2"
              href={district.path}
              onclick={(event) => openRoute(event, district.path)}
              >Lihat data kecamatan <ArrowRight
                class="size-3.5"
                aria-hidden="true"
              /></a
            >
          </div>
        </div>
      </section>
    </div>

    <section
      class="home-panel relative isolate overflow-hidden"
      aria-labelledby="home-services-title"
    >
      <img
        src="/gambo-pattern.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute top-0 right-0 -z-10 h-full w-72 object-cover opacity-10 mask-[linear-gradient(to_left,black,transparent)]"
      />
      <h2
        id="home-services-title"
        class="text-lg font-bold text-ink sm:text-xl"
      >
        Layanan Sesuai Kebutuhan
      </h2>

      <div class="mt-5 grid gap-3 lg:grid-cols-3 lg:gap-4">
        {#each homeServices as service (service.id)}
          <a
            href={service.href}
            target={service.external ? "_blank" : undefined}
            rel={service.external ? "noopener noreferrer" : undefined}
            onclick={(event) => {
              if (!service.external) openRoute(event, service.href);
            }}
            class={[
              "group flex min-w-0 items-start gap-3 rounded-lg border border-border-default/70 bg-surface p-4 transition-colors hover:border-bps-orange-border",
              toneClasses[service.tone],
            ]}
          >
            <span
              class="grid size-11 shrink-0 place-items-center rounded-full bg-(--tone-light) text-(--tone-text)"
              aria-hidden="true"
              >{#if service.id === "research"}<Database
                  class="size-6"
                />{:else if service.id === "consultation"}<MessageSquare
                  class="size-6"
                />{:else}<FileText class="size-6" />{/if}</span
            >
            <span class="min-w-0 flex-1"
              ><strong class="block text-sm leading-snug font-semibold text-ink"
                >{service.title}</strong
              ><span class="mt-2 block text-xs leading-relaxed text-body"
                >{service.description}</span
              ><span
                class="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-bps-orange-text"
                >{service.action}{#if service.external}<ArrowUpRight
                    class="size-3.5"
                    aria-hidden="true"
                  />{:else}<ArrowRight
                    class="size-3.5"
                    aria-hidden="true"
                  />{/if}</span
              >{#if service.external}<span class="sr-only"
                  >, membuka situs BPS di tab baru</span
                >{/if}</span
            >
          </a>
        {/each}
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section
        class="home-panel min-w-0"
        aria-labelledby="home-publications-title"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="home-publications-title"
              class="text-lg font-bold text-ink sm:text-xl"
            >
              Publikasi Pilihan
            </h2>
          </div>
          <a
            class="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-bps-orange-text hover:underline"
            href={contentSources.publications}
            target="_blank"
            rel="noopener noreferrer"
            >Semua publikasi <ArrowUpRight
              class="size-3.5"
              aria-hidden="true"
            /><span class="sr-only">, membuka situs BPS di tab baru</span></a
          >
        </div>
        <div class="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-4">
          {#each homePublications as publication (publication.id)}
            <article
              class="flex min-w-0 items-start gap-3 sm:flex-col 2xl:flex-row"
            >
              <div
                class="flex h-28 w-20 shrink-0 items-center justify-center rounded-sm bg-base"
              >
                {#if failedCovers.includes(publication.id)}<BookOpen
                    class="size-8 text-muted"
                    aria-hidden="true"
                  />{:else}<img
                    src={publication.cover}
                    alt=""
                    width="80"
                    height="112"
                    loading="lazy"
                    onerror={() =>
                      (failedCovers = [...failedCovers, publication.id])}
                    class="h-full w-full object-contain shadow-sm"
                  />{/if}
              </div>
              <div class="flex min-w-0 flex-1 flex-col items-start">
                <h3 class="text-xs leading-relaxed font-semibold text-ink">
                  {publication.title}
                </h3>
                <p class="mt-2 text-xs text-muted">
                  Terbit <time datetime={publication.releaseDate}
                    >{formatDate(publication.releaseDate)}</time
                  >
                </p>
                <a
                  class="home-link mt-3 px-3"
                  href={publication.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Baca ${publication.title} di situs BPS, membuka tab baru`}
                  >Baca publikasi <ArrowUpRight
                    class="size-3.5"
                    aria-hidden="true"
                  /></a
                >
              </div>
            </article>
          {/each}
        </div>
      </section>

      <section class="home-panel min-w-0" aria-labelledby="home-agenda-title">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="home-agenda-title"
              class="text-lg font-bold text-ink sm:text-xl"
            >
              Agenda Statistik
            </h2>
          </div>
          <a
            class="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-bps-orange-text hover:underline"
            href="/kegiatan"
            onclick={(event) => openRoute(event, "/kegiatan")}
            >Lihat kalender <ArrowRight
              class="size-3.5"
              aria-hidden="true"
            /></a
          >
        </div>

        <ul class="mt-3 divide-y divide-border-subtle">
          {#each visibleAgenda as activity (activity.id)}
            <li class="py-3">
              <a
                href={activity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-start gap-3 rounded-sm"
              >
                <CalendarDays
                  class="mt-0.5 size-4 shrink-0 text-bps-orange-text"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1"
                  ><strong
                    class="block text-xs leading-relaxed font-semibold text-ink group-hover:text-bps-orange-text"
                    >{activity.title}<span class="sr-only"
                      >, buka sumber BPS di tab baru</span
                    ></strong
                  ><span class="mt-1 block text-xs leading-relaxed text-body"
                    ><time datetime={activity.startDate}
                      >{formatDate(activity.startDate)}</time
                    >–<time datetime={activity.endDate}
                      >{formatDate(activity.endDate)}</time
                    ></span
                  ><span class="mt-1 block text-xs text-muted"
                    >{activity.scope} · {activity.endDate < currentDate
                      ? "Selesai"
                      : activity.startDate <= currentDate
                        ? "Berlangsung"
                        : "Mendatang"}</span
                  ></span
                >
                <span
                  class="shrink-0 rounded-md bg-bps-orange-light px-2 py-1 text-xs font-medium text-bps-orange-text"
                  >{activityCategories[activity.category].label}</span
                >
              </a>
            </li>
          {/each}
        </ul>
      </section>
    </div>
  </div>
</div>
