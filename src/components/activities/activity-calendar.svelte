<script lang="ts">
  import { tick } from "svelte";
  import { CalendarDate, endOfMonth, isSameDay, isSameMonth, parseDate, startOfMonth, startOfWeek, today } from "@internationalized/date";
  import { ArrowUpRightIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { activityCalendarLocale, activityCalendarTimeZone, activityCategories, activityScheduleCheckedAt, activityWeekdays, scheduledActivities } from "../../constants/activities";
  import { contentSources } from "../../constants/prototype";
  import { toneClasses } from "../../constants/styles";

  const initialDate = today(activityCalendarTimeZone);
  let todayDate = $state(initialDate);
  let selectedDate = $state(initialDate);
  let calendarGrid = $state<HTMLDivElement | null>(null);

  const monthFormatter = new Intl.DateTimeFormat(activityCalendarLocale, { month: "long", year: "numeric", timeZone: activityCalendarTimeZone });
  const dateFormatter = new Intl.DateTimeFormat(activityCalendarLocale, { day: "numeric", month: "long", year: "numeric", timeZone: activityCalendarTimeZone });
  const accessibleDateFormatter = new Intl.DateTimeFormat(activityCalendarLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: activityCalendarTimeZone });
  const activities = scheduledActivities.map((activity) => ({ ...activity, start: parseDate(activity.startDate), end: parseDate(activity.endDate) }));
  const latestActivity = [...activities].sort((a, b) => b.end.compare(a.end))[0];
  const visibleMonth = $derived(startOfMonth(selectedDate));
  const monthLabel = $derived(monthFormatter.format(visibleMonth.toDate(activityCalendarTimeZone)));
  const selectedDateLabel = $derived(dateFormatter.format(selectedDate.toDate(activityCalendarTimeZone)));
  const selectedActivities = $derived(activitiesOn(selectedDate));
  const monthActivities = $derived(activities.filter((activity) => activity.start.compare(endOfMonth(visibleMonth)) <= 0 && activity.end.compare(visibleMonth) >= 0));
  const weeks = $derived.by(() => {
    const firstDay = startOfWeek(visibleMonth, activityCalendarLocale, "mon");
    return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => {
      const date = firstDay.add({ days: week * 7 + day });
      return { date, activities: activitiesOn(date) };
    }));
  });

  function activitiesOn(date: CalendarDate) {
    return activities.filter((activity) => date.compare(activity.start) >= 0 && date.compare(activity.end) <= 0);
  }

  function formatDate(date: CalendarDate) {
    return dateFormatter.format(date.toDate(activityCalendarTimeZone));
  }

  async function selectDate(date: CalendarDate, focus = false) {
    selectedDate = date;
    if (focus) {
      await tick();
      calendarGrid?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus();
    }
  }

  function goToToday() {
    todayDate = today(activityCalendarTimeZone);
    selectDate(todayDate);
  }

  function handleDateKeydown(event: KeyboardEvent, date: CalendarDate) {
    let nextDate: CalendarDate;
    switch (event.key) {
      case "ArrowLeft": nextDate = date.subtract({ days: 1 }); break;
      case "ArrowRight": nextDate = date.add({ days: 1 }); break;
      case "ArrowUp": nextDate = date.subtract({ days: 7 }); break;
      case "ArrowDown": nextDate = date.add({ days: 7 }); break;
      case "Home": nextDate = startOfWeek(date, activityCalendarLocale, "mon"); break;
      case "End": nextDate = startOfWeek(date, activityCalendarLocale, "mon").add({ days: 6 }); break;
      case "PageUp": nextDate = date.subtract(event.shiftKey ? { years: 1 } : { months: 1 }); break;
      case "PageDown": nextDate = date.add(event.shiftKey ? { years: 1 } : { months: 1 }); break;
      default: return;
    }
    event.preventDefault();
    selectDate(nextDate, true);
  }
</script>

<div class="overflow-hidden rounded-xl border border-border-default bg-surface text-body">
  <div class="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div>
      <h2 id="activity-calendar-month" class="text-xl leading-tight font-bold text-ink sm:text-2xl" aria-live="polite" aria-atomic="true">{monthLabel}</h2>
      <p class="mt-1.5 text-xs text-ink">Agenda sensus dan survei</p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" class="border-bps-orange-border bg-bps-orange-light text-bps-orange-text hover:bg-bps-orange-border/50 hover:text-bps-orange-text" onclick={goToToday}>Hari ini</Button>
      <Button variant="outline" size="icon" class="border-bps-orange-border bg-bps-orange-light text-bps-orange-text hover:bg-bps-orange-border/50 hover:text-bps-orange-text" aria-label="Bulan sebelumnya" title="Bulan sebelumnya" onclick={() => selectDate(selectedDate.subtract({ months: 1 }))}>
        <ChevronLeftIcon class="size-5" aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" class="border-bps-orange-border bg-bps-orange-light text-bps-orange-text hover:bg-bps-orange-border/50 hover:text-bps-orange-text" aria-label="Bulan berikutnya" title="Bulan berikutnya" onclick={() => selectDate(selectedDate.add({ months: 1 }))}>
        <ChevronRightIcon class="size-5" aria-hidden="true" />
      </Button>
    </div>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-border-default bg-base px-4 py-3 text-xs sm:px-6">
    <ul class="flex gap-5" aria-label="Kategori kegiatan">
      {#each Object.values(activityCategories) as category}
        <li class={["flex items-center gap-2 text-ink", toneClasses[category.tone]]}>
          <span class="size-2.5 rounded-xs bg-(--tone-color) " aria-hidden="true"></span>
          {category.label}
        </li>
      {/each}
    </ul>
    <span>{monthActivities.length} kegiatan</span>
  </div>

  <div bind:this={calendarGrid} role="grid" aria-labelledby="activity-calendar-month" aria-readonly="true">
    <div role="row" class="grid grid-cols-7 border-b border-border-default">
      {#each activityWeekdays as weekday}
        <div role="columnheader" aria-label={weekday.label} class="py-2.5 text-center text-xs font-medium text-ink">{weekday.short}</div>
      {/each}
    </div>
    {#each weeks as week}
      <div role="row" class="grid grid-cols-7 border-b border-border-default last:border-b-0">
        {#each week as day (day.date.toString())}
          {@const selected = isSameDay(day.date, selectedDate)}
          {@const current = isSameDay(day.date, todayDate)}
          {@const inMonth = isSameMonth(day.date, visibleMonth)}
          <div role="gridcell" aria-selected={selected} class={["relative min-w-0 border-r border-border-default last:border-r-0", !inMonth && "bg-base", selected && "bg-bps-orange-light"]}>
            <button
              type="button"
              class={["relative flex h-20 group w-full min-w-0 flex-col items-start gap-1 overflow-hidden p-1.5 text-left transition-colors hover:bg-bps-orange-light focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bps-orange-text sm:h-25", selected && "ring-2 ring-bps-orange-text ring-inset"]}
              data-date={day.date.toString()}
              tabindex={selected ? 0 : -1}
              aria-current={current ? "date" : undefined}
              aria-label={`${accessibleDateFormatter.format(day.date.toDate(activityCalendarTimeZone))}${current ? ", hari ini" : ""}. ${day.activities.length ? day.activities.map((activity) => activity.title).join(", ") : "Jadwal belum tersedia"}`}
              onclick={() => selectDate(day.date, true)}
              onkeydown={(event) => handleDateKeydown(event, day.date)}
            >
              <span class={["flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:text-sm", current ? "bg-bps-orange-text text-inverse" : inMonth ? "text-ink group-hover:text-bps-orange-text" : "text-muted group-hover:text-bps-orange-text"]}>{day.date.day}</span>
              <span class="hidden w-full min-w-0 space-y-1 sm:block" aria-hidden="true">
                {#each day.activities.slice(0, 2) as activity}
                  <span class={["block truncate rounded-xs border-l-2 border-(--tone-color) bg-(--tone-color)/15 px-1.5 py-0.5 text-[0.65rem] leading-tight text-body lg:text-xs", toneClasses[activityCategories[activity.category].tone]]} title={activity.title}>{activity.shortTitle}</span>
                {/each}
                {#if day.activities.length > 2}
                  <span class="block px-1.5 text-[0.65rem] leading-tight text-muted">+{day.activities.length - 2} lagi</span>
                {/if}
              </span>
              {#if day.activities.length}
                <span class="flex flex-wrap items-center gap-1 px-0.5 sm:hidden" aria-hidden="true">
                  {#each day.activities.slice(0, 3) as activity}
                    <span class={["size-1.5 rounded-xs bg-(--tone-color)", toneClasses[activityCategories[activity.category].tone]]}></span>
                  {/each}
                  <span class="text-[0.6rem] font-medium text-body">{day.activities.length}</span>
                </span>
              {/if}
            </button>
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <section class="border-t border-border-default px-4 py-5 sm:px-6" aria-labelledby="activity-calendar-date" aria-live="polite">
    <h3 id="activity-calendar-date" class="text-base font-semibold text-ink">{selectedDateLabel}</h3>
    {#if selectedActivities.length}
      <ul class="mt-4 divide-y divide-border-default">
        {#each selectedActivities as activity}
          <li class={["grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6", toneClasses[activityCategories[activity.category].tone]]}>
            <div class="text-xs leading-relaxed">
              <p class="font-semibold text-ink"><time datetime={activity.startDate}>{formatDate(activity.start)}</time> - <time datetime={activity.endDate}>{formatDate(activity.end)}</time></p>
              <p class="mt-1 text-muted">Periode {activity.scope.toLowerCase()}</p>
            </div>
            <div class="min-w-0 border-l-2 border-(--tone-color) pl-3">
              <h4 class="text-sm font-semibold text-ink">{activity.title}</h4>
              <p class="mt-1 text-xs text-muted">{activityCategories[activity.category].label} / {activity.scope}</p>
              <p class="mt-2 max-w-[90ch] text-sm leading-relaxed">{activity.description}</p>
              <a class="mt-3 inline-flex min-h-11 items-center gap-2 text-xs text-bps-orange-text underline underline-offset-4 hover:text-bps-orange-hover focus-visible:outline-bps-orange-text" href={activity.sourceUrl} target="_blank" rel="noopener noreferrer">
                Sumber: {activity.sourceLabel}
                <ArrowUpRightIcon class="size-3.5 shrink-0" aria-hidden="true" />
              </a>
              <p class="text-xs text-muted">Diterbitkan {formatDate(parseDate(activity.sourceDate))}</p>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="mt-4 flex items-start gap-3">
        <CalendarDaysIcon class="mt-0.5 size-5 shrink-0 text-ink" aria-hidden="true" />
        <div>
          <p class="text-sm text-ink">{monthActivities.length ? "Jadwal untuk tanggal ini belum tersedia." : `Jadwal ${monthLabel} belum tersedia di kalender ini.`}</p>
          {#if !monthActivities.length && latestActivity}
            <button type="button" class="mt-1 inline-flex min-h-11 items-center gap-1 text-xs text-bps-orange-text underline underline-offset-4 hover:text-bps-orange-hover focus-visible:outline-bps-orange-text" onclick={() => selectDate(latestActivity.end, true)}>Lihat periode terdata</button>
          {/if}
        </div>
      </div>
    {/if}
  </section>

 
</div>
