<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { interactive } from "../../lib/motion.svelte";
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

<Dialog.Root bind:open>
    <Dialog.Content
      class="top-20 max-h-[calc(100dvh_-_7rem)] -translate-y-0 gap-0 overflow-hidden border border-border-default bg-surface p-0 shadow-lg sm:max-w-160"
      showCloseButton={false}
    >
      <Dialog.Title class="sr-only">Pencarian Pojok BPS Muba</Dialog.Title>
      <Dialog.Description class="sr-only">Cari topik statistik, kegiatan, atau layanan.</Dialog.Description>
      <div class="grid grid-cols-[1fr_auto] items-end gap-3 border-b border-border-subtle p-4">
        <label class="field-label">
          Cari topik
          <input class="field-input" bind:value={query} placeholder="Cari layanan, kegiatan, statistik, atau halaman" />
        </label>
        <Button variant="outline" class="min-h-11 bg-base px-3 font-bold" onclick={() => (open = false)} aria-label="Tutup pencarian">Tutup</Button>
      </div>
      <div class="grid max-h-105 gap-1 overflow-auto p-3">
        {#each results.slice(0, 9) as result}
          <button {@attach interactive()} type="button" class="flex w-full items-center justify-between gap-4 rounded-lg p-3.5 text-left transition-colors hover:bg-bps-sky-light" onclick={() => openResult(result.path)}>
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
    </Dialog.Content>
</Dialog.Root>
