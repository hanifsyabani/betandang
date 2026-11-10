import type { SearchItem } from "../types/prototype";
import { mubaKecamatanRoutes } from "./maps";
import { navItems } from "./navigation";
import { featuredIndicators, services } from "./prototype";

export const searchItems: SearchItem[] = [
  ...navItems.map((item) => ({ title: item.label, category: "Halaman", path: item.path })),
  ...services.map((item) => ({ title: item.title, category: "Layanan", path: "/layanan" })),
  { title: "Kalender sensus dan survei", category: "Kegiatan", path: "/kegiatan" },
  ...featuredIndicators.map((item) => ({ title: item.name, category: "Statistik", path: "/statistik-data" })),
  ...mubaKecamatanRoutes.map((item) => ({ title: `Kecamatan ${item.name}`, category: "Statistik Kecamatan", path: item.path }))
];
