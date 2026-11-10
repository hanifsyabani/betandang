import type { SubmissionStatus, Tone } from "../types/prototype";

// Literal classes keep data-driven colors discoverable by Tailwind's scanner.
export const toneClasses: Record<Tone, string> = {
  sky: "[--tone-color:var(--color-bps-sky)] [--tone-light:var(--color-bps-sky-light)] [--tone-border:var(--color-bps-sky-border)] [--tone-text:var(--color-bps-sky-text)]",
  green: "[--tone-color:var(--color-bps-green)] [--tone-light:var(--color-bps-green-light)] [--tone-border:var(--color-bps-green-border)] [--tone-text:var(--color-bps-green-text)]",
  orange: "[--tone-color:var(--color-bps-orange)] [--tone-light:var(--color-bps-orange-light)] [--tone-border:var(--color-bps-orange-border)] [--tone-text:var(--color-bps-orange-text)]"
};

export const submissionStatusClasses: Record<SubmissionStatus, string> = {
  Menunggu: "bg-bps-sky-light text-bps-sky-text",
  Disetujui: "bg-bps-green-light text-bps-green-text",
  "Perlu Perbaikan": "bg-bps-orange-light text-bps-orange-text",
  Ditolak: "bg-danger-light text-danger-text"
};
