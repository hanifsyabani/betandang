import type { PageRoute } from "../types/prototype";
import { contentSources } from "./prototype";

export const loginRoute: PageRoute = { path: "/login", label: "Login admin" };

export const navItems: PageRoute[] = [
  { path: "/", label: "Beranda" },
  { path: "/statistik-data", label: "Statistik & Data", shortLabel: "Statistik" },
  { path: "/perbaikan-data-desil", label: "Perbaikan DTSEN", shortLabel: "DTSEN" },
  { path: "/kegiatan", label: "Kegiatan" },
];

export const footerServiceLinks: PageRoute[] = [
  { path: "/perbaikan-data-desil", label: "Perbaikan Data Desil DTSEN" },
];

export const footerExternalLinks: PageRoute[] = [
  { path: contentSources.pst, label: "Pelayanan Statistik Terpadu" },
  { path: contentSources.publications, label: "Publikasi BPS" },
  { path: contentSources.complaints, label: "Pengaduan layanan" },
];
