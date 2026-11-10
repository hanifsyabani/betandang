<script lang="ts">
  import HeaderPage from "../components/common/header-page.svelte";
  import FormDtsen from "../components/dtsen/form-dtsen.svelte";
  import { desilProcessSteps } from "../constants/desil";
</script>

<HeaderPage
  title="Pengajuan Perbaikan Desil"
  desc="Formulir pengajuan perbaikan desil"
/>

<section class="bg-base py-12 md:py-16">
  <div
    class="page-container grid items-start gap-5 xl:grid-cols-[330px_minmax(0,1fr)]"
  >
    <aside
      class="rounded-lg border border-border-default bg-surface p-5 xl:sticky xl:top-32"
    >
      <h2 class="mb-2 text-[1rem] font-bold text-ink">
        Alur pengajuan website
      </h2>
      <ol class="my-4 list-decimal space-y-2 pl-5">
        {#each desilProcessSteps as step}
          <li>{step}</li>
        {/each}
      </ol>
    </aside>

    <FormDtsen />
  </div>
</section>
