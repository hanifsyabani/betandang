import { z } from "zod";
import { desilFileSchema } from "./desil";

export const visitorBookFormSchema = z.strictObject({
  name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(160, "Nama maksimal 160 karakter."),
  phone: z.string().trim().min(8, "Nomor telepon minimal 8 karakter.").max(25, "Nomor telepon maksimal 25 karakter.")
    .regex(/^\+?[0-9][0-9 ()-]*$/, "Gunakan nomor telepon yang valid."),
  email: z.string().trim().max(254, "Email maksimal 254 karakter.")
    .refine((value) => !value || z.email().safeParse(value).success, "Alamat email tidak valid."),
  job: z.string().trim().min(1, "Pekerjaan wajib diisi.").max(160, "Pekerjaan maksimal 160 karakter."),
  purpose: z.string().trim().min(1, "Keperluan kunjungan wajib diisi.").max(2000, "Keperluan maksimal 2000 karakter.")
});

export const visitorBookFileSchema = desilFileSchema;
export const visitorBookCreateSchema = visitorBookFormSchema.extend({
  id: z.uuid(),
  file: visitorBookFileSchema.optional()
});
export const visitorBookResponseSchema = z.object({
  data: z.object({ id: z.uuid(), createdAt: z.iso.datetime() })
});
