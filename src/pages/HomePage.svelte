<script lang="ts">
  import PortalNetwork from "../components/home/portal-network.svelte";
  import HomeContent from "../components/home/home-content.svelte";
  import { portalTopics } from "../constants/prototype";
  import type { NavigationProps } from "../types/components";

  let { navigate }: NavigationProps = $props();
</script>

<section class="home-hero border-b border-ink-line py-10 text-inverse sm:py-12 lg:pt-20 lg:pb-10 min-h-screen">
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div class="home-hero-pattern absolute inset-0"></div>
    <svg class="absolute inset-0 h-full w-full opacity-60 sm:opacity-100" viewBox="0 0 1440 640" preserveAspectRatio="none">
      <path class="fill-bps-sky/10 stroke-gambo-gold/70" stroke-width="2.5" d="M-30 115 C65 146 48 276 158 354 C270 433 284 512 414 558 C480 581 525 611 568 652 H-30 Z" />
      <path class="fill-bps-sky/10 stroke-gambo-gold/70" stroke-width="2.5" d="M1470 145 C1370 183 1403 326 1287 414 C1186 471 1169 464 1119 513 C1074 558 1058 602 994 652 H1470 Z" />
      <path class="fill-ink-soft/60 stroke-gambo-gold/55" stroke-width="2" d="M-30 490 C83 610 153 592 330 652 H-30 Z" />
      <path class="fill-ink-soft/60 stroke-gambo-gold/55" stroke-width="2" d="M1470 491 C1327 480 1237 559 1093 652 H1470 Z" />
      <path class="fill-none stroke-bps-sky/20" stroke-width="2" d="M-30 553 C29 612 67 643 114 652 M1470 552 C1369 543 1325 610 1270 652" />
    </svg>
  </div>
  <div class="page-container relative z-1 grid justify-items-center gap-8 lg:gap-5">
    <div class="w-full max-w-205 min-w-0 text-center">
      <h1 class="text-balance text-4xl leading-[1.12] font-bold sm:text-5xl lg:text-6xl xl:text-7xl">Betan<span class="text-gambo-gold">dang</span></h1>
      <p class="mx-auto mt-4 max-w-180 text-sm text-portal-body sm:text-base lg:text-lg">
        Beranda Terpadu Data dan Informasi Statistik
      </p>
      
    </div>

    <PortalNetwork topics={portalTopics} {navigate} />
  </div>
</section>

<style>
  .home-hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: color-mix(in srgb, var(--color-bps-sky) 9%, var(--color-ink-deep));
  }

  .home-hero-pattern {
    background-image: url("/gambo-pattern.png");
    background-position: center top;
    background-size: 82rem auto;
    filter: grayscale(1) contrast(1.6) brightness(0.65) sepia(1) saturate(1.25);
    mix-blend-mode: screen;
    opacity: 0.12;
    mask-image: linear-gradient(90deg, black, rgb(0 0 0 / 0.8) 8%, transparent 29%, transparent 71%, rgb(0 0 0 / 0.8) 92%, black);
  }

  @media (max-width: 767px) {
    .home-hero-pattern {
      background-size: 48rem auto;
      opacity: 0.25;
      mask-image: linear-gradient(90deg, black, transparent 28%, transparent 72%, black);
    }
  }
</style>


<HomeContent {navigate} />
