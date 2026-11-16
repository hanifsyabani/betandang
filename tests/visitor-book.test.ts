import { afterEach, expect, test } from "bun:test";
import { AxiosError } from "axios";
import { api, getApiErrorMessage } from "../src/services/api";
import { createVisitorBook, isVisitorBookConfigured } from "../src/services/visitor-book";

const originalEndpoint = process.env.VITE_VISITOR_BOOK_CREATE_URL;
const originalAdapter = api.defaults.adapter;
const id = crypto.randomUUID();
const input = { name: "Tamu Data Latihan", phone: "0000000000", email: "", job: "Pengujian", purpose: "Pengujian formulir" };
const receipt = { id, createdAt: "2026-11-16T03:00:00Z" };
const file = () => new File(["%PDF-1.7\nData latihan"], "latihan.pdf", { type: "application/pdf" });
afterEach(() => {
  if (originalEndpoint === undefined) delete process.env.VITE_VISITOR_BOOK_CREATE_URL;
  else process.env.VITE_VISITOR_BOOK_CREATE_URL = originalEndpoint;
  api.defaults.adapter = originalAdapter;
});

test("unavailable and unsafe endpoints do not send requests", async () => {
  let calls = 0;
  api.defaults.adapter = async () => { calls++; throw new Error("Unexpected request"); };
  for (const endpoint of ["", "/api/visitor", "http://example.test/create", "https://user:password@example.test/create", "https://example.test/create#fragment"]) {
    process.env.VITE_VISITOR_BOOK_CREATE_URL = endpoint;
    expect(isVisitorBookConfigured()).toBe(false);
    await expect(createVisitorBook(id, input)).rejects.toThrow("belum tersedia");
  }
  expect(calls).toBe(0);
});

test("create sends only multipart fields and optional file without admin credentials", async () => {
  process.env.VITE_VISITOR_BOOK_CREATE_URL = "https://project.example.test/functions/v1/visitor-book-create";
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    expect(config.method).toBe("post");
    expect(config.url).toBe(process.env.VITE_VISITOR_BOOK_CREATE_URL);
    expect(config.headers.has("Authorization")).toBe(false);
    expect(config.withCredentials).not.toBe(true);
    const data = config.data as FormData;
    expect(data.get("id")).toBe(id);
    expect(data.get("name")).toBe(input.name);
    expect(data.get("email")).toBe("");
    expect(data.has("file")).toBe(calls === 2);
    if (calls === 2) expect(data.get("file")).toBeInstanceOf(File);
    return { data: { data: receipt }, status: 201, statusText: "Created", headers: {}, config };
  };
  expect(isVisitorBookConfigured()).toBe(true);
  expect(await createVisitorBook(id, input)).toEqual(receipt);
  expect(await createVisitorBook(id, input, file())).toEqual(receipt);
});

test("invalid inputs and files fail before the request; receipts must match the request", async () => {
  process.env.VITE_VISITOR_BOOK_CREATE_URL = "https://project.example.test/functions/v1/visitor-book-create";
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    return { data: { data: { ...receipt, id: crypto.randomUUID() } }, status: 201, statusText: "Created", headers: {}, config };
  };
  for (const invalid of [{ name: "" }, { phone: "invalid" }, { email: "invalid" }, { job: "" }, { purpose: "" }]) {
    await expect(createVisitorBook(id, { ...input, ...invalid })).rejects.toThrow();
  }
  await expect(createVisitorBook(id, input, new File(["text"], "bad.txt", { type: "text/plain" }))).rejects.toThrow();
  expect(calls).toBe(0);
  try {
    await createVisitorBook(id, input);
    throw new Error("Mismatched receipt accepted");
  } catch (error) {
    expect(getApiErrorMessage(error)).toContain("belum mengonfirmasi penyimpanan");
  }
});

test("network errors preserve the request ID for a safe retry", async () => {
  process.env.VITE_VISITOR_BOOK_CREATE_URL = "https://project.example.test/functions/v1/visitor-book-create";
  const ids: unknown[] = [];
  api.defaults.adapter = async (config) => {
    ids.push((config.data as FormData).get("id"));
    if (ids.length === 1) throw new AxiosError("timeout", "ECONNABORTED", config);
    return { data: { data: receipt }, status: 200, statusText: "OK", headers: {}, config };
  };
  await expect(createVisitorBook(id, input)).rejects.toThrow("timeout");
  expect(await createVisitorBook(id, input)).toEqual(receipt);
  expect(ids).toEqual([id, id]);
});
