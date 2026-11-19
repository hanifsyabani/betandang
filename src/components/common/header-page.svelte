<script lang="ts">
  import { regencyName } from "../../constants/prototype";
  import type { HeaderPageProps } from "../../types/components";

  let { title, eyebrow = `BPS ${regencyName}`, desc }: HeaderPageProps = $props();
</script>

<header class="relative isolate overflow-hidden border-b border-bps-orange-border bg-bps-orange-light">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 select-none">
    <img
      src="/kantor.png"
      alt=""
      width="1491"
      height="993"
      class="absolute -bottom-4 -left-5 h-auto w-[clamp(9rem,25vw,25rem)] opacity-25 sepia mask-[linear-gradient(to_right,black_50%,transparent)] sm:-bottom-7 sm:-left-4 sm:opacity-40 lg:left-0"
    />
    <img
      src="/gambo-pattern.png"
      alt=""
      width="1536"
      height="1024"
      class="absolute top-0 right-0 h-full w-[clamp(7rem,17vw,17rem)] object-cover opacity-15 contrast-150 grayscale invert sepia mix-blend-multiply mask-[radial-gradient(ellipse_at_top_right,black,transparent_78%)]"
    />

    <div class="absolute inset-x-0 bottom-0 h-10 sm:h-14 lg:h-18">
      <div class="absolute -bottom-[108%] -left-[8%] h-[190%] w-[50%] rotate-9 rounded-[50%] bg-linear-to-r from-bps-orange/55 to-transparent"></div>
      <div class="absolute -bottom-[125%] -left-[6%] h-[195%] w-[44%] rotate-8 rounded-[50%] bg-linear-to-r from-bps-orange-border to-transparent"></div>
      <div class="absolute -right-[7%] -bottom-[95%] h-[165%] w-[55%] -rotate-9 rounded-[50%] bg-linear-to-l from-bps-orange to-transparent"></div>
    </div>
  </div>

  <div
    class="page-container relative flex min-h-40 max-w-3xl flex-col items-center justify-center gap-2 pt-7 pb-10 text-center sm:min-h-48 sm:gap-3 sm:pt-9 sm:pb-13 lg:min-h-56 lg:pt-11 lg:pb-17"
  >
    <p class="flex items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-[0.18em] text-ink uppercase sm:gap-4 sm:text-xs sm:tracking-[0.33em]">
      <span aria-hidden="true" class="h-px w-4 shrink-0 bg-bps-orange sm:w-10 lg:w-14"></span>
      <span>{eyebrow}</span>
      <span aria-hidden="true" class="h-px w-4 shrink-0 bg-bps-orange sm:w-10 lg:w-14"></span>
    </p>
    <h1 class="max-w-full text-[clamp(1.625rem,4.3vw,3.25rem)] leading-[1.14] font-extrabold tracking-[-0.035em] wrap-break-word text-balance text-ink">
      {title}
    </h1>
    {#if desc}
      <p class="max-w-[65ch] text-sm leading-relaxed wrap-break-word text-balance text-body sm:text-base">{desc}</p>
    {/if}
  </div>
</header>
