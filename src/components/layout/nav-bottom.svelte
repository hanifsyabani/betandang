<script lang="ts">
  import ActivitiesPage from "../../pages/ActivitiesPage.svelte";
  import DesilRepairPage from "../../pages/DesilRepairPage.svelte";
  import HomePage from "../../pages/HomePage.svelte";
  import KecamatanStatisticsPage from "../../pages/KecamatanStatisticsPage.svelte";
  import StatisticsPage from "../../pages/StatisticsPage.svelte";
  import VisitorBookPage from "../../pages/VisitorBookPage.svelte";
  import { isKecamatanStatisticsPath } from "../../constants/maps";
  import { pageFade } from "../../lib/motion.svelte";
  import type { NavBottomProps } from "../../types/components";

  let { currentPath, navigate }: NavBottomProps = $props();
</script>

<main class={["overflow-x-clip", (currentPath === "/statistik-data" || isKecamatanStatisticsPath(currentPath) || currentPath === "/perbaikan-data-desil" || currentPath === "/buku-tamu" || currentPath === "/kegiatan") && "orange-page"]}>
  {#key currentPath}
    <div in:pageFade>
      {#if currentPath === "/statistik-data"}
        <StatisticsPage {navigate} />
      {:else if isKecamatanStatisticsPath(currentPath)}
        <KecamatanStatisticsPage {currentPath} {navigate} />
      {:else if currentPath === "/perbaikan-data-desil"}
        <DesilRepairPage />
      {:else if currentPath === "/buku-tamu"}
        <VisitorBookPage />
      {:else if currentPath === "/kegiatan"}
        <ActivitiesPage />
      {:else}
        <HomePage {navigate} />
      {/if}
    </div>
  {/key}
</main>
