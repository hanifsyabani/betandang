<script lang="ts">
  import ActivityCalendar from "../components/activities/activity-calendar.svelte";
  import HeaderPage from "../components/common/header-page.svelte";
</script>


<HeaderPage title="Aktivitas" />
<section class="bg-base py-6 md:py-8">
  <div class="page-container max-w-295">
    <ActivityCalendar />
  </div>
</section>
