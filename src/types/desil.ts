import type { z } from "zod";
import type { DESIL_DOCUMENT_IDS } from "../constants/desil";
import type { desilCreateResponseSchema, desilDocumentsSchema, desilFormSchema } from "../schemas/desil";

export type DesilInput = z.infer<typeof desilFormSchema>;
export type DesilDocumentId = typeof DESIL_DOCUMENT_IDS[number];
export type DesilDocuments = z.infer<typeof desilDocumentsSchema>;
export type DesilCreateReceipt = z.infer<typeof desilCreateResponseSchema>["data"];
export type ApiErrorResponse = { message: string; fieldErrors?: Record<string, string[]> };

export type UploadState = "empty" | "done" | "invalid";
export type UploadId = DesilDocumentId;

export type DesilForm = Omit<DesilInput, "kecamatan"> & { kecamatan: DesilInput["kecamatan"] | "" };

export type UploadDocument = {
  id: UploadId;
  label: string;
  hint: string;
};

export type UploadItem = UploadDocument & {
  file: File | null;
  status: UploadState;
  message: string;
};
