<script lang="ts">
  import type { StatisticsWorkbook } from "../../types/statistics";
  import { statisticsTopics } from "../../constants/statistics";

  interface Props {
    workbook: StatisticsWorkbook;
    selectedTopic: string;
    onTopicChange: (topic: string) => void;
  }

  let { workbook, selectedTopic, onTopicChange }: Props = $props();
</script>

<aside class="min-w-0 shrink-0 xl:w-44">
  <div
    class="xl:sticky xl:top-36 xl:max-h-[calc(100dvh-9rem)] xl:overflow-y-auto"
  >
    <nav
      class="flex gap-1.5 overflow-x-auto pb-2 xl:flex-col xl:overflow-visible"
      aria-label="Topik statistik"
    >
      {#each statisticsTopics as topic (topic.id)}
        {@const count =
          topic.id === "semua"
            ? workbook.sheets.length
            : workbook.sheets.filter((sheet) => sheet.topic === topic.id)
                .length}

        <button
          type="button"
          aria-pressed={selectedTopic === topic.id}
          onclick={() => onTopicChange(topic.id)}
          class={[
            "flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors xl:w-full",
            selectedTopic === topic.id
              ? "bg-bps-sky-light text-bps-sky-text"
              : "text-body hover:bg-surface hover:text-bps-sky-text",
          ]}
        >
          <span>{topic.label}</span>

          <span
            class={[
              "text-[10px] tabular-nums",
              selectedTopic === topic.id ? "font-bold" : "text-muted",
            ]}
          >
            {count}
          </span>
        </button>
      {/each}
    </nav>
  </div>
</aside>
