import type { DesilForm, UploadDocument, UploadItem } from "../types/desil";
import type { SubmissionFilter } from "../types/prototype";

export const DESIL_KECAMATAN = [
  "Sanga Desa", "Babat Toman", "Batanghari Leko", "Plakat Tinggi", "Lawang Wetan",
  "Sungai Keruh", "Jirak Jaya", "Sekayu", "Lais", "Sungai Lilin", "Keluang",
  "Babat Supat", "Bayung Lencir", "Lalan", "Tungkal Jaya"
] as const;
export const DESIL_DOCUMENT_IDS = ["surat", "identitas", "domisili"] as const;
export const DESIL_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const DESIL_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const allowedUploadTypes = DESIL_UPLOAD_TYPES;

export const emptyDesilForm: Readonly<DesilForm> = {
  nama: "",
  desa: "",
  kecamatan: ""
};

export const uploadDocuments: UploadDocument[] = [
  { id: "surat", label: "Surat keterangan desa/kelurahan", hint: "PDF, JPG, JPEG, atau PNG maks 5 MB" },
  { id: "identitas", label: "KTP atau Kartu Keluarga", hint: "PDF, JPG, JPEG, atau PNG maks 5 MB" },
  { id: "domisili", label: "Foto rumah atau bukti domisili", hint: "PDF, JPG, JPEG, atau PNG maks 5 MB" }
];

export const emptyUploadState: Readonly<Pick<UploadItem, "file" | "status" | "message">> = {
  file: null,
  status: "empty",
  message: "Belum ada file"
};

export const desilProcessSteps: string[] = [
  "Isi nama lengkap, desa/kelurahan, dan kecamatan.",
  "Pilih dokumen pendukung untuk pengajuan.",
  "Konfirmasikan pengiriman pengajuan.",
  "Setelah pengiriman berhasil, simpan ID penyimpanan yang ditampilkan."
];

export const kecamatanOptions = DESIL_KECAMATAN;

export const submissionStatusOptions: SubmissionFilter[] = [
  "Semua",
  "Menunggu",
  "Disetujui",
  "Perlu Perbaikan",
  "Ditolak"
];
