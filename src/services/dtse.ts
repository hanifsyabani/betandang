import type { AxiosProgressEvent } from "axios";
import { desilCreateSchema, desilCreateResponseSchema } from "../schemas/desil";
import type { DesilDocuments, DesilInput } from "../types/desil";
import { api } from "./api";

function getDesilCreateEndpoint() {
  const value = import.meta.env.VITE_DTSEN_CREATE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.hash || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function isDesilCreateConfigured() {
  return getDesilCreateEndpoint() !== null;
}

export async function createDesilSubmission(id: string, input: DesilInput, files: DesilDocuments, onProgress?: (event: AxiosProgressEvent) => void) {
  const endpoint = getDesilCreateEndpoint();
  if (!endpoint) throw new Error("Layanan pengiriman pengajuan belum tersedia.");

  const payload = desilCreateSchema.parse({ id, ...input, ...files });
  const data = new FormData();
  for (const [key, value] of Object.entries(payload)) data.append(key, value);

  const response = await api.post(endpoint, data, { onUploadProgress: onProgress });
  return desilCreateResponseSchema.refine((result) => result.data.id === id, {
    message: "ID penyimpanan tidak sesuai dengan pengiriman."
  }).parse(response.data).data;
}
