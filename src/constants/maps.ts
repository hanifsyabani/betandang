export const mubaMapName = "muba-kecamatan";
export const mubaMapGeoJsonPath = "/maps/muba_kecamatan.geojson";
export const kecamatanStatisticsBasePath = "/statistik-data/kecamatan";

export const mubaKecamatanNames = [
  "Sanga Desa",
  "Babat Toman",
  "Batanghari Leko",
  "Plakat Tinggi",
  "Lawang Wetan",
  "Sungai Keruh",
  "Jirak Jaya",
  "Sekayu",
  "Lais",
  "Sungai Lilin",
  "Keluang",
  "Babat Supat",
  "Bayung Lencir",
  "Lalan",
  "Tungkal Jaya"
] as const;

export function toKecamatanSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const mubaKecamatanRoutes = mubaKecamatanNames.map((name) => ({
  name,
  geoName: name.toUpperCase(),
  slug: toKecamatanSlug(name),
  colorToken: `--map-${toKecamatanSlug(name)}`,
  path: `${kecamatanStatisticsBasePath}/${toKecamatanSlug(name)}`
}));

export function getKecamatanRouteByGeoName(name: string) {
  const geoName = name.trim().toUpperCase();
  return mubaKecamatanRoutes.find((route) => route.geoName === geoName);
}

export function getKecamatanRouteBySlug(slug: string) {
  return mubaKecamatanRoutes.find((route) => route.slug === slug.trim().toLowerCase());
}

export function isKecamatanStatisticsPath(path: string) {
  const prefix = `${kecamatanStatisticsBasePath}/`;
  const slug = path.startsWith(prefix) ? path.slice(prefix.length) : "";
  return slug.length > 0 && !slug.includes("/");
}

export function getKecamatanRouteFromPath(path: string) {
  if (!isKecamatanStatisticsPath(path)) return undefined;
  return getKecamatanRouteBySlug(path.slice(`${kecamatanStatisticsBasePath}/`.length));
}

export function formatKecamatanName(name: string) {
  return getKecamatanRouteByGeoName(name)?.name ?? name;
}
