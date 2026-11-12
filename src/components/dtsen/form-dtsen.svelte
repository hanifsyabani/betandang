<script lang="ts">
  import { tick } from "svelte";
  import { z } from "zod";
  import {
    desilFileSchema,
    desilFormSchema,
  } from "../../schemas/desil";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as NativeSelect from "$lib/components/ui/native-select/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { cn } from "$lib/utils";
  import {
    emptyDesilForm,
    emptyUploadState,
    kecamatanOptions,
    uploadDocuments,
  } from "../../constants/desil";
  import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
  import { createDesilSubmission, isDesilCreateConfigured } from "../../services/dtse";
  import type { DesilCreateReceipt, DesilDocuments, DesilForm, UploadId, UploadItem } from "../../types/desil";
  import { LoaderCircleIcon, SendIcon, Trash2Icon } from "lucide-svelte";

  const serviceConfigured = isDesilCreateConfigured();
  let desilForm = $state<DesilForm>({ ...emptyDesilForm });
  let uploads = $state<UploadItem[]>(
    uploadDocuments.map((document) => ({ ...document, ...emptyUploadState })),
  );
  let submitAttempted = $state(false);
  let confirmOpen = $state(false);
  let formSubmitting = $state(false);
  let formSubmitError = $state("");
  let serverFieldErrors = $state<Record<string, string[]>>({});
  let uploadProgress = $state(0);
  let successSubmission = $state<DesilCreateReceipt | null>(null);
  let successPanel = $state<HTMLElement | null>(null);
  let submitButton = $state<HTMLElement | null>(null);
  let requestId: string | null = null;

  const validation = $derived(desilFormSchema.safeParse(desilForm));
  const filesReady = $derived(
    uploads.every(
      (item) => item.status === "done" && item.file,
    ),
  );
  const formFieldErrors = $derived(
    validation.success ? {} : z.flattenError(validation.error).fieldErrors,
  );
  const errors = $derived(
    Object.fromEntries(
      Object.keys(emptyDesilForm).map((key) => [
        key,
        submitAttempted
          ? (serverFieldErrors[key]?.[0] ??
            formFieldErrors[key as keyof DesilForm]?.[0] ??
            "")
          : "",
      ]),
    ) as Record<keyof DesilForm, string>,
  );
  const fileError = $derived(
    submitAttempted && !filesReady
      ? "Lengkapi dokumen."
      : "",
  );

  function markDirty() {
    formSubmitError = "";
    serverFieldErrors = {};
    confirmOpen = false;
    requestId = null;
  }

  function handleFileSelected(id: UploadId, event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    const target = uploads.find((item) => item.id === id);
    if (!file || !target) return;

    const result = desilFileSchema.safeParse(file);
    markDirty();
    input.value = "";
    target.file = result.success ? file : null;
    target.status = result.success ? "done" : "invalid";
    target.message = result.success
      ? "Format dan ukuran sesuai, siap dikirim"
      : result.error.issues[0].message;
  }

  function removeFile(id: UploadId) {
    const target = uploads.find((item) => item.id === id);
    if (!target) return;
    target.file = null;
    target.status = "empty";
    target.message = "Belum ada file";
    markDirty();
  }

  async function requestSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (formSubmitting || successSubmission || !serviceConfigured) return;
    const form = event.currentTarget as HTMLFormElement;
    submitAttempted = true;

    if (!validation.success || !filesReady) {
      await tick();
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    confirmOpen = true;
  }

  async function submitConfirmed() {
    if (formSubmitting || successSubmission || !serviceConfigured || !validation.success || !filesReady) return;
    confirmOpen = false;
    formSubmitting = true;
    formSubmitError = "";
    uploadProgress = 0;

    const files = Object.fromEntries(
      uploads.filter((item) => item.file).map((item) => [item.id, item.file]),
    ) as DesilDocuments;
    const onProgress = (event: { progress?: number }) => {
      uploadProgress = Math.min(99, Math.round((event.progress ?? 0) * 100));
    };

    try {
      requestId ??= crypto.randomUUID();
      const saved = await createDesilSubmission(requestId, validation.data, files, onProgress);
      uploadProgress = 100;
      successSubmission = saved;
      desilForm = { ...emptyDesilForm };
      uploads = uploadDocuments.map((document) => ({ ...document, ...emptyUploadState }));
    } catch (error) {
      formSubmitError = getApiErrorMessage(error);
      serverFieldErrors = getApiFieldErrors(error);
      for (const item of uploads) {
        if (serverFieldErrors[item.id]?.[0]) {
          item.status = "invalid";
          item.message = serverFieldErrors[item.id][0];
        }
      }
    } finally {
      formSubmitting = false;
    }
    if (successSubmission) {
      await tick();
      successPanel?.focus({ preventScroll: true });
      successPanel?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }

  function resetForm() {
    desilForm = { ...emptyDesilForm };
    uploads = uploadDocuments.map((document) => ({
      ...document,
      ...emptyUploadState,
    }));
    successSubmission = null;
    submitAttempted = false;
    uploadProgress = 0;
    markDirty();
  }

  function restoreSubmitFocus(event: Event) {
    event.preventDefault();
    if (!formSubmitting) submitButton?.focus();
  }
</script>

<form
  id="desil-form"
  class="grid min-w-0 gap-6 rounded-lg border border-border-default bg-surface p-5 md:p-6"
  onsubmit={requestSubmit}
  aria-busy={formSubmitting}
  novalidate
>
  {#if successSubmission}
    <div class="grid scroll-mt-36 gap-3" role="status" tabindex="-1" bind:this={successPanel}>
      <h2 class="text-lg font-bold text-ink">Pengajuan berhasil disimpan</h2>
      <p class="text-sm text-body">Data pemohon dan dokumen pendukung berhasil disimpan pada layanan website.</p>
      <Button type="button" variant="outline" class="justify-self-start" onclick={resetForm}>Pengajuan baru</Button>
    </div>
  {:else}
  {#if !serviceConfigured}
    <p id="desil-service-unavailable" class="rounded-md bg-surface-strong p-3 text-sm text-body" role="status">
      Pengiriman pengajuan belum tersedia. Formulir belum terhubung ke layanan penyimpanan.
    </p>
  {/if}
  <fieldset class="contents" disabled={formSubmitting}>
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4"
    >
      <h2 class="text-[1rem] font-bold text-ink">
        Informasi pemohon
      </h2>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <div class="grid min-w-0 gap-2 md:col-span-2">
        <Label for="desil-nama" class="font-semibold text-ink"
          >Nama Lengkap *</Label
        >
        <Input
          id="desil-nama"
          name="nama"
          bind:value={desilForm.nama}
          oninput={markDirty}
          autocomplete="name"
          maxlength={160}
          required
          aria-invalid={Boolean(errors.nama)}
          aria-describedby={errors.nama ? "desil-nama-error" : undefined}
          placeholder="Nama sesuai dokumen"
        />
        {#if errors.nama}
          <p
            id="desil-nama-error"
            class="text-xs font-semibold text-danger-text"
          >
            {errors.nama}
          </p>
        {/if}
      </div>

      <div class="grid min-w-0 gap-2">
        <Label for="desil-desa" class="font-semibold text-ink"
          >Desa/Kelurahan *</Label
        >
        <Input
          id="desil-desa"
          name="desa"
          bind:value={desilForm.desa}
          oninput={markDirty}
          maxlength={160}
          required
          aria-invalid={Boolean(errors.desa)}
          aria-describedby={errors.desa ? "desil-desa-error" : undefined}
          placeholder="Contoh: Balai Agung"
        />
        {#if errors.desa}
          <p
            id="desil-desa-error"
            class="text-xs font-semibold text-danger-text"
          >
            {errors.desa}
          </p>
        {/if}
      </div>

      <div class="grid min-w-0 gap-2">
        <Label for="desil-kecamatan" class="font-semibold text-ink"
          >Kecamatan *</Label
        >
        <NativeSelect.Root
          id="desil-kecamatan"
          name="kecamatan"
          class="w-full"
          bind:value={desilForm.kecamatan}
          onchange={markDirty}
          required
          aria-invalid={Boolean(errors.kecamatan)}
          aria-describedby={errors.kecamatan
            ? "desil-kecamatan-error"
            : undefined}
        >
          <NativeSelect.Option value="">Pilih kecamatan</NativeSelect.Option>
          {#each kecamatanOptions as kecamatan}
            <NativeSelect.Option value={kecamatan}
              >{kecamatan}</NativeSelect.Option
            >
          {/each}
        </NativeSelect.Root>
        {#if errors.kecamatan}
          <p
            id="desil-kecamatan-error"
            class="text-xs font-semibold text-danger-text"
          >
            {errors.kecamatan}
          </p>
        {/if}
      </div>
    </div>

    <div class="grid gap-1 border-b border-border-subtle pb-4">
      <h2 class="text-[1rem] font-bold text-ink">Dokumen pendukung</h2>
      <p class="text-sm text-muted">
        PDF, JPG/JPEG, atau PNG; maksimal 5 MB per file.
      </p>
    </div>

    <div class="grid gap-3" aria-live="polite">
      {#each uploads as item (item.id)}
        <div
          class="grid min-w-0 gap-3 rounded-lg border border-dashed border-border-strong bg-surface-strong p-4 data-[status=done]:border-success data-[status=done]:bg-success-light data-[status=invalid]:border-bps-orange data-[status=invalid]:bg-bps-orange-light"
          data-status={item.status}
        >
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-ink">{item.label}</h3>
            <p class="mt-1 text-xs text-body">{item.hint}</p>
            {#if item.file}
              <p class="mt-2 text-sm wrap-anywhere text-body">
                {item.file.name}
                - {(item.file.size / 1024).toFixed(1)} KB
              </p>
            {/if}
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Input
              id={"desil-file-" + item.id}
              class="peer sr-only size-px! border-0! p-0!"
              type="file"
              aria-label={"Pilih file " + item.label}
              aria-invalid={submitAttempted &&
                (item.status === "invalid" ||
                  !item.file)}
              aria-describedby={"desil-file-" + item.id + "-status"}
              accept=".pdf,.jpg,.jpeg,.png"
              onchange={(event) => handleFileSelected(item.id, event)}
            />
            <Label
              for={"desil-file-" + item.id}
              class={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 cursor-pointer gap-2 px-3 text-bps-sky-text peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bps-sky peer-disabled:pointer-events-none peer-disabled:opacity-50",
              )}
            >
              Pilih file
            </Label>
            {#if item.file}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                title={"Hapus file " + item.label}
                aria-label={"Hapus file " + item.label}
                onclick={() => removeFile(item.id)}
              >
                <Trash2Icon class="size-4" aria-hidden="true" />
              </Button>
            {/if}
          </div>

          <p
            id={"desil-file-" + item.id + "-status"}
            class={cn(
              "text-xs",
              item.status === "invalid"
                ? "font-semibold text-danger-text"
                : item.status === "done"
                  ? "text-success-text"
                  : "text-muted",
            )}
          >
            {item.message}
          </p>
        </div>
      {/each}
      {#if fileError}
        <p class="text-sm font-semibold text-danger-text">{fileError}</p>
      {/if}
    </div>

    {#if formSubmitError}
      <p
        class="rounded-md bg-danger-light p-3 text-sm font-semibold text-danger-text"
        role="alert"
      >
        {formSubmitError}
      </p>
    {/if}
    {#if formSubmitting}
      <p class="text-sm text-bps-sky-text" role="status">
        {uploadProgress < 99
          ? "Mengirim data dan dokumen... " + uploadProgress + "%"
          : "Menyimpan pengajuan dan dokumen..."}
      </p>
    {/if}

    <div
      class="flex flex-col-reverse gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end"
    >
      <Button type="submit" bind:ref={submitButton} disabled={formSubmitting || !serviceConfigured} aria-describedby={!serviceConfigured ? "desil-service-unavailable" : undefined}>
        {#if formSubmitting}
          <LoaderCircleIcon
            class="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Menyimpan...
        {:else}
          <SendIcon class="size-4" aria-hidden="true" />
          Kirim pengajuan
        {/if}
      </Button>
    </div>
  </fieldset>
  {/if}
</form>

<AlertDialog.Root bind:open={confirmOpen}>
  <AlertDialog.Content class="orange-page" onCloseAutoFocus={restoreSubmitFocus}>
    <AlertDialog.Header>
      <AlertDialog.Title class="text-lg font-semibold text-ink">
        Kirim pengajuan?
      </AlertDialog.Title>
      <AlertDialog.Description class="leading-relaxed">
        Data pemohon dan tiga dokumen pendukung akan dikirim untuk disimpan pada layanan website.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Batal</AlertDialog.Cancel>
      <AlertDialog.Action onclick={submitConfirmed} disabled={formSubmitting}>
        Ya, kirim pengajuan
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
