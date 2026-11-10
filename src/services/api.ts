import axios from "axios";
import type { ApiErrorResponse } from "../types/desil";
import { ZodError } from "zod";

export const api = axios.create({
  timeout: 60000,
  headers: { Accept: "application/json" }
});

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ZodError) return "Layanan belum mengonfirmasi penyimpanan. Coba kirim kembali tanpa mengubah isian.";
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    if (error.code === "ECONNABORTED") return "Permintaan melewati batas waktu. Coba kembali untuk memeriksa hasil pengiriman.";
    if (error.response) return "Permintaan belum dapat diproses oleh layanan. Silakan coba kembali.";
    return "Layanan belum dapat dihubungi. Data belum berhasil dikonfirmasi tersimpan.";
  }
  return "Permintaan belum dapat diproses. Silakan coba kembali.";
}

export function getApiFieldErrors(error: unknown) {
  return axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.fieldErrors ?? {} : {};
}
