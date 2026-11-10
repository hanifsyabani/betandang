<script lang="ts">
  import { searchItems } from "../../constants/search";
  import type { SearchDialogProps } from "../../types/components";

  let { open = $bindable(false), navigate }: SearchDialogProps = $props();
  let query = $state("");

  const results = $derived(
    searchItems.filter((item) => {
      const keyword = query.trim().toLowerCase();
      return keyword.length === 0 || item.title.toLowerCase().includes(keyword);
    })
  );

  function openResult(path: string) {
    open = false;
    query = "";
    navigate(path);
  }
</script>

{#if open}
  <div class="fixed inset-0 z-100 grid place-items-start justify-items-center overflow-auto bg-ink/65 px-4 pt-20 pb-8" role="presentation">
    <button
      type="button"
      class="fixed inset-0 cursor-default bg-transparent"
      aria-label="Tutup pencarian"
      onclick={() => (open = false)}
    ></button>
    <div
      class="relative z-10 w-full max-w-160 overflow-hidden rounded-lg border border-border-default bg-surface shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Pojok BPS Muba"
      tabindex="-1"
      onkeydown={(event) => {
        if (event.key === "Escape") open = false;
      }}
    >
      <div class="grid grid-cols-[1fr_auto] items-end gap-3 border-b border-border-subtle p-4">
        <label class="field-label">
          Cari topik
          <input class="field-input" bind:value={query} placeholder="Cari layanan, kegiatan, statistik, atau halaman" />
        </label>
        <button type="button" class="min-h-11 rounded-lg border border-border-default bg-base px-3 text-sm font-bold" onclick={() => (open = false)} aria-label="Tutup pencarian">Tutup</button>
      </div>
      <div class="grid max-h-105 gap-1 overflow-auto p-3">
        {#each results.slice(0, 9) as result}
          <button type="button" class="flex w-full items-center justify-between gap-4 rounded-lg p-3.5 text-left hover:bg-bps-sky-light" onclick={() => openResult(result.path)}>
            <span class="grid min-w-0">
              <strong class="font-bold">{result.title}</strong>
              <small class="text-muted">{result.category}</small>
            </span>
            <span class="shrink-0 text-sm text-bps-sky-text">Buka</span>
          </button>
        {:else}
          <div class="rounded-lg border border-bps-orange-border bg-bps-orange-light p-4 text-sm text-bps-orange-text">Tidak ada hasil pencarian untuk kata kunci ini.</div>
        {/each}
      </div>
    </div>
  </div>
{/if}
