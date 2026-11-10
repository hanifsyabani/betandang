<script lang="ts">
  import { submissionStatusOptions } from "../constants/desil";
  import { adminKpis, submissions } from "../constants/prototype";
  import { submissionStatusClasses, toneClasses } from "../constants/styles";
  import type { ToastProps } from "../types/components";
  import type { SubmissionFilter } from "../types/prototype";

  let { showToast }: ToastProps = $props();

  let submissionSearch = $state("");
  let selectedStatus = $state<SubmissionFilter>("Semua");

  const filteredSubmissions = $derived(
    submissions.filter((item) => {
      const byStatus = selectedStatus === "Semua" || item.status === selectedStatus;
      const keyword = submissionSearch.trim().toLowerCase();
      const byKeyword =
        keyword.length === 0 ||
        item.id.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.kecamatan.toLowerCase().includes(keyword) ||
        item.desa.toLowerCase().includes(keyword);

      return byStatus && byKeyword;
    })
  );

</script>

<section class="border-b border-border-subtle bg-surface-strong py-12 md:pt-16 md:pb-14">
  <div class="page-container grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div>
      <div class="section-kicker">Dashboard Admin</div>
      <h1 class="page-heading">Pemantauan pengajuan DTSEN</h1>
      <p class="mt-4 max-w-[70ch]">
        Ringkasan status dan daftar pengajuan perbaikan data desil berdasarkan
        nama pemohon, wilayah, dan tahap pemeriksaan.
      </p>
    </div>
    <div class="page-note">
      <strong class="font-bold">Data contoh</strong>
      <span class="text-sm">Daftar ini belum terhubung ke pengajuan warga. Semua nama dan status merupakan data contoh.</span>
    </div>
  </div>
</section>

<section class="bg-surface py-12 md:py-16">
  <div class="page-container">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {#each adminKpis as stat}
        <article class={["rounded-lg border border-border-default border-t-4 border-t-(--tone-color) bg-surface p-5 shadow-sm", toneClasses[stat.tone]]}>
          <span class="text-xs font-extrabold text-muted">{stat.helper}</span>
          <strong class="mt-2 block text-3xl leading-none font-bold text-ink">{stat.value}</strong>
          <p class="mt-2 font-bold">{stat.label}</p>
        </article>
      {/each}
    </div>

    <div class="mt-4 overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
      <div class="grid gap-3 border-b border-border-subtle p-4 md:grid-cols-[1fr_220px]">
        <label class="field-label">
          Cari pengajuan
          <input class="field-input" bind:value={submissionSearch} placeholder="Cari ID, nama, desa, kecamatan" />
        </label>
        <label class="field-label">
          Status
          <select class="field-input" bind:value={selectedStatus}>
            {#each submissionStatusOptions as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-190 border-collapse text-left text-sm [&_th]:sticky [&_th]:top-0 [&_th]:border-b [&_th]:border-border-subtle [&_th]:bg-surface-strong [&_th]:px-4 [&_th]:py-3.5 [&_th]:font-extrabold [&_th]:text-ink [&_td]:border-b [&_td]:border-border-subtle [&_td]:px-4 [&_td]:py-3.5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Desa/Kecamatan</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSubmissions as row}
              <tr>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.desa}, {row.kecamatan}</td>
                <td><span class={["inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-extrabold", submissionStatusClasses[row.status]]}>{row.status}</span></td>
                <td>{row.date}</td>
                <td>
                  <button type="button" class="w-fit rounded-lg border border-bps-sky-border bg-bps-sky-light px-3.5 py-2 text-sm font-extrabold text-bps-sky-text hover:bg-bps-sky-border" onclick={() => showToast(`${row.id}: ${row.name}, ${row.desa}, ${row.kecamatan}. Status: ${row.status}. Data contoh.`)}>
                    Detail
                  </button>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="text-center text-muted">Belum ada pengajuan yang sesuai filter.</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 p-4 text-sm text-muted md:flex-row md:items-center md:justify-end">
        <span>Menampilkan {filteredSubmissions.length} dari {submissions.length} data contoh</span>
        <button type="button" class="rounded-lg border border-border-default bg-surface px-3 py-2 font-extrabold text-body" disabled>Sebelumnya</button>
        <span>Halaman 1 dari 1</span>
        <button type="button" class="rounded-lg border border-border-default bg-surface px-3 py-2 font-extrabold text-body" disabled>Berikutnya</button>
      </div>
    </div>
  </div>
</section>
