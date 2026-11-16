import type { VisitorBookField, VisitorBookForm } from "../types/visitor-book";

export const emptyVisitorBookForm: Readonly<VisitorBookForm> = {
  name: "", phone: "", email: "", job: "", purpose: ""
};

export const visitorBookFields: VisitorBookField[] = [
  { name: "name", label: "Nama lengkap", type: "text", autocomplete: "name", maxLength: 160, required: true },
  { name: "phone", label: "Nomor telepon", type: "tel", autocomplete: "tel", maxLength: 25, required: true },
  { name: "email", label: "Email", type: "email", autocomplete: "email", maxLength: 254, required: false },
  { name: "job", label: "Pekerjaan", type: "text", autocomplete: "organization-title", maxLength: 160, required: true }
];
