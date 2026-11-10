import type { AxiosProgressEvent } from "axios";
import { desilCreateSchema, desilCreateResponseSchema } from "../schemas/desil";
import type { DesilDocuments, DesilInput } from "../types/desil";
import { api } from "./api";

export function isDesilCreateConfigured() {
  return Boolean(import.meta.env.VITE_DTSEN_CREATE_URL?.trim());
}

export async function createDesilSubmission(id: string, input: DesilInput, files: DesilDocuments, onProgress?: (event: AxiosProgressEvent) => void) {
  const endpoint = import.meta.env.VITE_DTSEN_CREATE_URL?.trim();
  if (!endpoint) throw new Error("Layanan pengiriman pengajuan belum tersedia.");

  const payload = desilCreateSchema.parse({ id, ...input, ...files });
  const data = new FormData();
  for (const [key, value] of Object.entries(payload)) data.append(key, value);

  const response = await api.post(endpoint, data, { onUploadProgress: onProgress });
  return desilCreateResponseSchema.parse(response.data).data;
}
