<script lang="ts">
  import ActivitiesPage from "../../pages/ActivitiesPage.svelte";
  import AdminDashboardPage from "../../pages/AdminDashboardPage.svelte";
  import DesilRepairPage from "../../pages/DesilRepairPage.svelte";
  import HomePage from "../../pages/HomePage.svelte";
  import KecamatanStatisticsPage from "../../pages/KecamatanStatisticsPage.svelte";
  import StatisticsPage from "../../pages/StatisticsPage.svelte";
  import { isKecamatanStatisticsPath } from "../../constants/maps";
  import type { NavBottomProps } from "../../types/components";

  let { currentPath, navigate, showToast }: NavBottomProps = $props();
</script>

<main class={["overflow-x-clip", (currentPath === "/statistik-data" || isKecamatanStatisticsPath(currentPath) || currentPath === "/perbaikan-data-desil" || currentPath === "/kegiatan") && "orange-page"]}>
  {#key currentPath}

    {#if currentPath === "/statistik-data"}
      <StatisticsPage {navigate} />
    {:else if isKecamatanStatisticsPath(currentPath)}
      <KecamatanStatisticsPage {currentPath} {navigate} />
    {:else if currentPath === "/perbaikan-data-desil"}
      <DesilRepairPage />
    {:else if currentPath === "/kegiatan"}
      <ActivitiesPage />
    {:else if currentPath === "/admin-dashboard"}
      <AdminDashboardPage {showToast} />
    {:else}
      <HomePage {navigate} />
    {/if}
  {/key}
</main>
