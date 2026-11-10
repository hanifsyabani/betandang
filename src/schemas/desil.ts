import { z } from "zod";
import { DESIL_KECAMATAN, DESIL_MAX_FILE_SIZE, DESIL_UPLOAD_TYPES } from "../constants/desil";

export const desilFormSchema = z.strictObject({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter.").max(160, "Nama maksimal 160 karakter."),
  desa: z.string().trim().min(1, "Desa/kelurahan wajib diisi.").max(160, "Nama desa/kelurahan maksimal 160 karakter."),
  kecamatan: z.enum(DESIL_KECAMATAN, { error: "Pilih kecamatan di Kabupaten Musi Banyuasin." })
});

export const desilFileSchema = z.file()
  .min(1, "File tidak boleh kosong.")
  .max(DESIL_MAX_FILE_SIZE, "Ukuran file maksimal 5 MB.")
  .mime([...DESIL_UPLOAD_TYPES], "Format file harus PDF, JPG, JPEG, atau PNG.")
  .refine((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return file.type === "application/pdf" ? extension === "pdf"
      : file.type === "image/png" ? extension === "png"
      : extension === "jpg" || extension === "jpeg";
  }, "Ekstensi file harus sesuai dengan format dokumen.");

export const desilDocumentsSchema = z.strictObject({
  surat: desilFileSchema,
  identitas: desilFileSchema,
  domisili: desilFileSchema
});

export const desilCreateSchema = z.strictObject({
  id: z.uuid(),
  ...desilFormSchema.shape,
  ...desilDocumentsSchema.shape
});
export const desilCreateResponseSchema = z.object({
  data: z.object({ id: z.uuid(), createdAt: z.iso.datetime() })
});
