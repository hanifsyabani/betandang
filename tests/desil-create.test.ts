import { afterEach, describe, expect, test } from "bun:test";
import { AxiosError, type AxiosAdapter } from "axios";
import { DESIL_MAX_FILE_SIZE } from "../src/constants/desil";
import type { DesilDocuments } from "../src/types/desil";
import { api, getApiErrorMessage, getApiFieldErrors } from "../src/services/api";
import { createDesilSubmission, isDesilCreateConfigured } from "../src/services/dtse";

const originalEndpoint = process.env.VITE_DTSEN_CREATE_URL;
const originalAdapter = api.defaults.adapter;
const id = crypto.randomUUID();
const input = { nama: "Pemohon Data Latihan", desa: "Desa Latihan", kecamatan: "Sekayu" } as const;
const receipt = { id, createdAt: "2026-10-27T00:00:00.000Z" };
const file = () => new File(["%PDF-1.7\nData latihan"], "latihan.pdf", { type: "application/pdf" });
const documents = (): DesilDocuments => ({ surat: file(), identitas: file(), domisili: file() });

afterEach(() => {
  if (originalEndpoint === undefined) delete process.env.VITE_DTSEN_CREATE_URL;
  else process.env.VITE_DTSEN_CREATE_URL = originalEndpoint;
  api.defaults.adapter = originalAdapter;
});

describe("DTSEN create Satu Portal, data latihan tanpa jaringan", () => {
  test("endpoint kosong menolak pengiriman tanpa fallback ke API lama", async () => {
    process.env.VITE_DTSEN_CREATE_URL = "  ";
    let calls = 0;
    api.defaults.adapter = async () => { calls++; throw new Error("Tidak boleh mengirim"); };
    expect(isDesilCreateConfigured()).toBe(false);
    await expect(createDesilSubmission(id, input, documents())).rejects.toThrow("belum tersedia");
    expect(calls).toBe(0);
  });

  test("hanya POST multipart ke URL lengkap tanpa credential admin/sesi", async () => {
    const endpoint = "https://satu-portal.example.test/api/desil";
    process.env.VITE_DTSEN_CREATE_URL = ` ${endpoint} `;
    let calls = 0;
    const adapter: AxiosAdapter = async (config) => {
      calls++;
      expect(config.method).toBe("post");
      expect(config.url).toBe(endpoint);
      expect(config.headers.has("Authorization")).toBe(false);
      expect(config.withCredentials).not.toBe(true);
      expect(config.data).toBeInstanceOf(FormData);
      const data = config.data as FormData;
      expect([...data.keys()].sort()).toEqual(["id", "nama", "desa", "kecamatan", "surat", "identitas", "domisili"].sort());
      expect(data.get("id")).toBe(id);
      expect(data.get("nama")).toBe(input.nama);
      for (const kind of ["surat", "identitas", "domisili"]) {
        expect(data.get(kind)).toBeInstanceOf(File);
      }
      return { data: { data: receipt }, status: 201, statusText: "Created", headers: {}, config };
    };
    api.defaults.adapter = adapter;
    expect(isDesilCreateConfigured()).toBe(true);
    expect(await createDesilSubmission(id, input, documents())).toEqual(receipt);
    expect(calls).toBe(1);
  });

  test("validasi isian, file kosong/besar, dan format tidak sesuai sebelum request", async () => {
    process.env.VITE_DTSEN_CREATE_URL = "https://satu-portal.example.test/api/desil";
    let calls = 0;
    api.defaults.adapter = async () => { calls++; throw new Error("Tidak boleh mengirim"); };
    await expect(createDesilSubmission(id, { ...input, nama: "" }, documents())).rejects.toThrow();
    for (const invalid of [
      new File([], "kosong.pdf", { type: "application/pdf" }),
      new File([new Uint8Array(DESIL_MAX_FILE_SIZE + 1)], "besar.pdf", { type: "application/pdf" }),
      new File(["data latihan"], "salah.exe", { type: "application/pdf" }),
      new File(["data latihan"], "salah.txt", { type: "text/plain" })
    ]) {
      await expect(createDesilSubmission(id, input, { ...documents(), surat: invalid })).rejects.toThrow();
    }
    expect(calls).toBe(0);
  });

  test("respons tanpa bukti penyimpanan tidak dianggap berhasil", async () => {
    process.env.VITE_DTSEN_CREATE_URL = "https://satu-portal.example.test/api/desil";
    api.defaults.adapter = async (config) => ({ data: { message: "OK" }, status: 200, statusText: "OK", headers: {}, config });
    try {
      await createDesilSubmission(id, input, documents());
      throw new Error("Respons tidak valid harus ditolak");
    } catch (error) {
      expect(getApiErrorMessage(error)).toContain("belum mengonfirmasi penyimpanan");
    }
  });

  test("error diteruskan dan retry menggunakan ID serta file yang sama", async () => {
    process.env.VITE_DTSEN_CREATE_URL = "https://satu-portal.example.test/api/desil";
    const files = documents();
    const ids: string[] = [];
    api.defaults.adapter = async (config) => {
      ids.push((config.data as FormData).get("id") as string);
      if (ids.length === 1) {
        throw new AxiosError("timeout", "ECONNABORTED", config);
      }
      return { data: { data: receipt }, status: 200, statusText: "OK", headers: {}, config };
    };
    await expect(createDesilSubmission(id, input, files)).rejects.toThrow("timeout");
    expect(await createDesilSubmission(id, input, files)).toEqual(receipt);
    expect(ids).toEqual([id, id]);
    expect(await files.surat.text()).toContain("Data latihan");
  });

  test("pesan dan validasi kolom dari server tetap tersedia", async () => {
    process.env.VITE_DTSEN_CREATE_URL = "https://satu-portal.example.test/api/desil";
    const errorData = { message: "Periksa dokumen.", fieldErrors: { surat: ["File tidak valid."] } };
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Unprocessable", "ERR_BAD_REQUEST", config, undefined, {
        data: errorData, status: 422, statusText: "Unprocessable Entity", headers: {}, config
      });
    };
    try {
      await createDesilSubmission(id, input, documents());
      throw new Error("Validasi server harus ditolak");
    } catch (error) {
      expect(getApiErrorMessage(error)).toBe(errorData.message);
      expect(getApiFieldErrors(error)).toEqual(errorData.fieldErrors);
    }
  });
});
