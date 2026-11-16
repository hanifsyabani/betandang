import type { z } from "zod";
import type { visitorBookFormSchema, visitorBookResponseSchema } from "../schemas/visitor-book";

export type VisitorBookForm = z.infer<typeof visitorBookFormSchema>;
export type VisitorBookReceipt = z.infer<typeof visitorBookResponseSchema>["data"];
export type VisitorBookField = {
  name: Exclude<keyof VisitorBookForm, "purpose">;
  label: string;
  type: "text" | "tel" | "email";
  autocomplete: "name" | "tel" | "email" | "organization-title";
  maxLength: number;
  required: boolean;
};
