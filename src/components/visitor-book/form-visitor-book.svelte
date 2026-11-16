<script lang="ts">
  import { tick } from "svelte";
  import { z } from "zod";
  import { LoaderCircleIcon, SendIcon, Trash2Icon } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { emptyVisitorBookForm, visitorBookFields } from "../../constants/visitor-book";
  import { visitorBookFileSchema, visitorBookFormSchema } from "../../schemas/visitor-book";
  import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
  import { createVisitorBook, isVisitorBookConfigured } from "../../services/visitor-book";
  import type { VisitorBookForm, VisitorBookReceipt } from "../../types/visitor-book";

  const configured = isVisitorBookConfigured();
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
  let form = $state<VisitorBookForm>({ ...emptyVisitorBookForm });
  let file = $state<File | undefined>();
  let fileInput = $state<HTMLInputElement | null>(null);
  let fileError = $state("");
  let attempted = $state(false);
  let confirmOpen = $state(false);
  let submitting = $state(false);
  let submitError = $state("");
  let serverErrors = $state<Record<string, string[]>>({});
  let receipt = $state<VisitorBookReceipt | null>(null);
  let successPanel = $state<HTMLElement | null>(null);
  let submitButton = $state<HTMLElement | null>(null);
  let requestId: string | null = null;
  const validation = $derived(visitorBookFormSchema.safeParse(form));
  const fieldErrors = $derived(validation.success ? {} : z.flattenError(validation.error).fieldErrors);
  const errors = $derived(Object.fromEntries(Object.keys(emptyVisitorBookForm).map((key) => [
    key, attempted ? serverErrors[key]?.[0] ?? fieldErrors[key as keyof VisitorBookForm]?.[0] ?? "" : ""
  ])) as Record<keyof VisitorBookForm, string>);

  function markDirty() {
    requestId = null;
    confirmOpen = false;
    submitError = "";
    serverErrors = {};
  }

  function selectFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const selected = input.files?.[0];
    if (!selected) return;
    const result = visitorBookFileSchema.safeParse(selected);
    markDirty();
    if (!result.success) input.value = "";
    file = result.success ? selected : undefined;
    fileError = result.success ? "" : result.error.issues[0].message;
  }

  function removeFile() {
    if (fileInput) fileInput.value = "";
    file = undefined;
    fileError = "";
    markDirty();
  }

  async function requestSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (submitting || receipt || !configured) return;
    const element = event.currentTarget as HTMLFormElement;
    attempted = true;
    if (!validation.success || fileError) {
      await tick();
      element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    confirmOpen = true;
  }

  async function submitConfirmed() {
    if (submitting || receipt || !configured || !validation.success || fileError) return;
    confirmOpen = false;
    submitting = true;
    submitError = "";
    serverErrors = {};
    try {
      requestId ??= crypto.randomUUID();
      receipt = await createVisitorBook(requestId, validation.data, file);
      form = { ...emptyVisitorBookForm };
      file = undefined;
    } catch (error) {
      submitError = getApiErrorMessage(error);
      serverErrors = getApiFieldErrors(error);
    } finally {
      submitting = false;
    }
    if (receipt) {
      await tick();
      successPanel?.focus({ preventScroll: true });
      successPanel?.scrollIntoView({ block: "start", behavior: "instant" });

    }
  }

  function resetForm() {
    form = { ...emptyVisitorBookForm };
    receipt = null;
    attempted = false;
    removeFile();
  }
</script>

<form class="grid min-w-0 gap-6 rounded-lg border border-border-default bg-surface p-5 md:p-6" onsubmit={requestSubmit} aria-busy={submitting} novalidate>
  {#if receipt}
    <div class="grid scroll-mt-36 gap-3" role="status" tabindex="-1" bind:this={successPanel}>
      <h2 class="text-lg font-bold text-ink">Kunjungan berhasil disimpan</h2>
      <Button type="button" variant="outline" class="justify-self-start" onclick={resetForm}>Kembali</Button>
    </div>
  {:else}
    {#if !configured}
      <p id="visitor-service-unavailable" class="rounded-md bg-surface-strong p-3 text-sm text-body" role="status">Pengiriman buku tamu belum tersedia. Formulir belum terhubung ke layanan penyimpanan.</p>
    {/if}
    <fieldset class="contents" disabled={submitting}>
      <div class="grid gap-2 border-b border-border-subtle pb-4">
        <h2 class="text-lg font-bold text-ink">Informasi</h2>
      </div>
      <div class="grid gap-5 md:grid-cols-2">
        {#each visitorBookFields as field (field.name)}
          <div class="grid min-w-0 gap-2">
            <Label for={`visitor-${field.name}`} class="font-semibold text-ink">{field.label}{field.required ? " *" : " (opsional)"}</Label>
            <Input id={`visitor-${field.name}`} name={field.name} type={field.type} bind:value={form[field.name]} oninput={markDirty} autocomplete={field.autocomplete} maxlength={field.maxLength} required={field.required} aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `visitor-${field.name}-error` : undefined} />
            {#if errors[field.name]}<p id={`visitor-${field.name}-error`} class="text-sm font-semibold text-danger-text">{errors[field.name]}</p>{/if}
          </div>
        {/each}
      </div>
      <div class="grid min-w-0 gap-2">
        <Label for="visitor-purpose" class="font-semibold text-ink">Keperluan kunjungan *</Label>
        <textarea id="visitor-purpose" name="purpose" bind:value={form.purpose} oninput={markDirty} required maxlength={2000} rows={4} class="w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2.5  outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive" aria-invalid={Boolean(errors.purpose)} aria-describedby={errors.purpose ? "visitor-purpose-error" : undefined}></textarea>
        {#if errors.purpose}<p id="visitor-purpose-error" class="text-sm font-semibold text-danger-text">{errors.purpose}</p>{/if}
      </div>
      <div class="grid min-w-0 gap-3 rounded-lg border border-dashed border-border-strong bg-surface-strong p-4">
        <Label for="visitor-file" class="font-semibold text-ink">Lampiran (opsional)</Label>
        <p id="visitor-file-hint" class="text-sm text-body">PDF, JPG/JPEG, atau PNG; maksimal 5 MB.</p>
        <Input id="visitor-file" name="file" type="file" bind:ref={fileInput} accept=".pdf,.jpg,.jpeg,.png" class="h-auto min-h-11" onchange={selectFile} aria-invalid={Boolean(fileError || serverErrors.file?.[0])} aria-describedby={fileError || serverErrors.file?.[0] ? "visitor-file-hint visitor-file-error" : "visitor-file-hint"} />
        {#if file || fileError || serverErrors.file?.[0]}
          <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
            {#if file}<p class="min-w-0 text-sm text-body wrap-anywhere">{file.name} ({(file.size / 1024).toFixed(1)} KB), siap dikirim</p>{/if}
            <Button type="button" variant="outline" onclick={removeFile}><Trash2Icon aria-hidden="true" />Hapus lampiran</Button>
          </div>
        {/if}
        {#if fileError || serverErrors.file?.[0]}<p id="visitor-file-error" class="text-sm font-semibold text-danger-text">{fileError || serverErrors.file?.[0]}</p>{/if}
      </div>
      {#if submitError}<p class="rounded-md bg-danger-light p-3 text-sm text-danger-text" role="alert">{submitError}</p>{/if}
      <div class="flex justify-end border-t border-border-subtle pt-4">
        <Button type="submit" bind:ref={submitButton} disabled={submitting || !configured} aria-describedby={!configured ? "visitor-service-unavailable" : undefined}>
          {#if submitting}<LoaderCircleIcon class="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Menyimpan...{:else}<SendIcon class="size-4" aria-hidden="true" />Kirim{/if}
        </Button>
      </div>
    </fieldset>
  {/if}
</form>

<AlertDialog.Root bind:open={confirmOpen}>
  <AlertDialog.Content class="orange-page" onCloseAutoFocus={(event) => { event.preventDefault(); if (!submitting) submitButton?.focus(); }}>
    <AlertDialog.Header>
      <AlertDialog.Title>Simpan riwayat kunjungan?</AlertDialog.Title>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Batal</AlertDialog.Cancel>
      <AlertDialog.Action onclick={submitConfirmed} disabled={submitting}>Ya</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
