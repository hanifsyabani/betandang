<script lang="ts">
  import type { HeaderPageProps } from "../../types/components";

  let { title, desc }: HeaderPageProps = $props();
</script>

<header class="relative isolate overflow-hidden border-b border-bps-orange-border bg-bps-orange-light">
  <p
    aria-hidden="true"
    class="page-header-outline pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7rem] leading-none font-extrabold whitespace-nowrap uppercase select-none sm:text-[10rem] lg:text-[12.5rem]"
  >
    Musi Banyuasin
  </p>

  <div class="page-container relative z-10 flex min-h-52 flex-col items-center justify-center gap-3 py-10 text-center sm:min-h-60 sm:py-12 lg:min-h-64 lg:py-14">
    <h1 class="max-w-full text-3xl leading-tight font-extrabold wrap-break-word text-balance text-ink sm:text-4xl lg:text-5xl xl:text-6xl">{title}</h1>
    {#if desc}
      <p class="max-w-[65ch] text-sm leading-relaxed wrap-break-word text-balance text-body sm:text-[1rem]">{desc}</p>
    {/if}
  </div>
</header>
