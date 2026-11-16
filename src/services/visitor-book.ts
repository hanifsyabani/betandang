import type { AxiosProgressEvent } from "axios";
import { visitorBookCreateSchema, visitorBookResponseSchema } from "../schemas/visitor-book";
import type { VisitorBookForm } from "../types/visitor-book";
import { api } from "./api";

function getVisitorBookEndpoint() {
  const value = import.meta.env.VITE_VISITOR_BOOK_CREATE_URL?.trim();
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

export function isVisitorBookConfigured() {
  return getVisitorBookEndpoint() !== null;
}

export async function createVisitorBook(id: string, input: VisitorBookForm, file?: File, onProgress?: (event: AxiosProgressEvent) => void) {
  const endpoint = getVisitorBookEndpoint();
  if (!endpoint) throw new Error("Layanan buku tamu belum tersedia.");
  const payload = visitorBookCreateSchema.parse({ ...input, id, file });
  const data = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) data.append(key, value);
  }
  const response = await api.post(endpoint, data, { onUploadProgress: onProgress });
  return visitorBookResponseSchema.refine((result) => result.data.id === id, {
    message: "ID catatan tidak sesuai dengan pengiriman."
  }).parse(response.data).data;
}
