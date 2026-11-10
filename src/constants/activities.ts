import type { ActivityCategory, ActivityCategoryInfo, ScheduledActivity } from "../types/activities";

export const activityCalendarLocale = "id-ID";
export const activityCalendarTimeZone = "Asia/Jakarta";
export const activityScheduleCheckedAt = "2026-10-14";

export const activityWeekdays = [
  { short: "Sen", label: "Senin" },
  { short: "Sel", label: "Selasa" },
  { short: "Rab", label: "Rabu" },
  { short: "Kam", label: "Kamis" },
  { short: "Jum", label: "Jumat" },
  { short: "Sab", label: "Sabtu" },
  { short: "Min", label: "Minggu" },
] as const;

export const activityCategories: Record<ActivityCategory, ActivityCategoryInfo> = {
  sensus: { label: "Sensus", tone: "sky" },
  survei: { label: "Survei", tone: "green" },
};

export const scheduledActivities: ScheduledActivity[] = [
  {
    id: "susenas-maret-2026",
    title: "Pendataan Susenas Maret 2026",
    shortTitle: "Susenas Maret",
    category: "survei",
    startDate: "2026-02-01",
    endDate: "2026-02-20",
    scope: "Nasional",
    description: "Pendataan sampel rumah tangga untuk Survei Sosial Ekonomi Nasional periode Maret 2026. Periode nasional berlangsung pada Februari 2026; jadwal kunjungan khusus Musi Banyuasin belum tersedia di sini.",
    sourceUrl: "https://okukab.bps.go.id/id/news/2026/02/18/1021/supervisi-pendataan-susenas-maret-2026-ke-kecamatan-semidang-aji.html",
    sourceLabel: "BPS Kabupaten Ogan Komering Ulu",
    sourceDate: "2026-02-18",
  },
  {
    id: "se2026-lapangan",
    title: "Pendataan lapangan Sensus Ekonomi 2026",
    shortTitle: "SE2026 Lapangan",
    category: "sensus",
    startDate: "2026-06-15",
    endDate: "2026-08-31",
    scope: "Nasional",
    description: "Periode pendataan lapangan SE2026 secara nasional yang diumumkan BPS. Tanggal kunjungan ke rumah atau tempat usaha di Musi Banyuasin mengikuti informasi petugas setempat.",
    sourceUrl: "https://yogyakarta.bps.go.id/id/news/2026/06/15/598/pendampingan-pendataan-lapangan-sensus-ekonomi-2026-kabupaten-bantul.html",
    sourceLabel: "BPS Provinsi D.I. Yogyakarta",
    sourceDate: "2026-06-15",
  },
];
