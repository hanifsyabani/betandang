<script lang="ts">
  import { portalNetworkCenter as center } from "../../constants/prototype";
  import { toneClasses } from "../../constants/styles";
  import type { PortalNetworkProps } from "../../types/components";
  import type { PortalTopic } from "../../types/prototype";

  let { topics, navigate }: PortalNetworkProps = $props();

  function linkEnd(topic: PortalTopic) {
    return topic.y > 260
      ? { x: topic.x, y: topic.y - 44 }
      : { x: topic.x + (topic.x < center.x ? 96 : -96), y: topic.y };
  }

  function linkPath(topic: PortalTopic) {
    const end = linkEnd(topic);
    const midX = center.x + (end.x - center.x) * 0.42;
    return `M ${center.x} ${center.y} C ${midX} ${center.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  }
</script>

<div class="relative grid mt-10 w-full max-w-205 grid-cols-1 gap-3 pt-2 min-[360px]:grid-cols-2 lg:block lg:aspect-900/340" aria-label="Peta topik Pojok BPS Muba">
  <svg class="absolute inset-0 hidden size-full overflow-visible lg:block" viewBox="0 0 900 340" aria-hidden="true">
    {#each topics as topic}
      {@const end = linkEnd(topic)}
      <path class={["fill-none stroke-(--tone-color)/60 stroke-[1.2]", toneClasses[topic.tone]]} stroke-dasharray="3 5" stroke-linecap="round" d={linkPath(topic)} />
      <circle class={["fill-(--tone-color)", toneClasses[topic.tone]]} cx={end.x} cy={end.y} r="3.5" />
    {/each}
  </svg>

  <button type="button" class="relative col-span-full flex min-h-16 items-center justify-center gap-3 rounded-lg border border-bps-sky/60 bg-ink-soft px-4 py-2 text-inverse shadow-md hover:border-bps-sky hover:bg-ink-line lg:absolute lg:top-[49.4%] lg:left-1/2 lg:w-56 lg:-translate-x-1/2 lg:-translate-y-1/2" onclick={() => navigate("/statistik-data")}>
    <strong class="text-base font-bold">Tandang Peh</strong>
  </button>

  {#each topics as topic}
    <button
      type="button"
      class={["relative grid min-h-16 min-w-0 grid-cols-[32px_1fr] items-center gap-x-2.5 rounded-lg border border-transparent bg-ink-soft p-2.5 text-left text-inverse shadow-md hover:border-(--tone-color)/60 hover:bg-ink-line lg:absolute lg:top-(--node-y) lg:left-(--node-x) lg:min-h-14.5 lg:w-40.5 lg:-translate-x-1/2 lg:-translate-y-1/2", toneClasses[topic.tone]]}
      style={`--node-x: ${(topic.x / 900) * 100}%; --node-y: ${(topic.y / 340) * 100}%`}
      onclick={() => navigate(topic.path)}
    >
      <span class="row-span-2 grid size-8 place-items-center rounded-full bg-(--tone-color)" aria-hidden="true">
        <img src={`/icons/${topic.icon}.svg`} class="size-4.5" alt="" />
      </span>
      <strong class="text-xs leading-tight font-bold text-portal-text">{topic.label}</strong>
      <small class="text-[0.66rem] leading-tight text-portal-muted">{topic.helper}</small>
    </button>
  {/each}
</div>
