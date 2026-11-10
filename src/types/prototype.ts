export type Tone = "sky" | "green" | "orange";

export type PageRoute = {
  path: string;
  label: string;
  shortLabel?: string;
};

export type StatisticCard = {
  label: string;
  value: string;
  helper: string;
  tone: Tone;
  sourceUrl?: string;
};

export type TrendPoint = {
  year: string;
  value: number;
};

export type FeaturedIndicator = {
  name: string;
  value: string;
  unit: string;
  note: string;
  trend: TrendPoint[];
  tone: Tone;
  sourceUrl: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  requirements: string[];
  procedure: string;
  tone: Tone;
  sourceUrl: string;
};

export type ActivityItem = {
  title: string;
  date: string;
  location: string;
  category: string;
  description: string;
  sourceUrl: string;
};

export type SubmissionStatus = "Menunggu" | "Disetujui" | "Perlu Perbaikan" | "Ditolak";
export type SubmissionFilter = SubmissionStatus | "Semua";

export type DesilSubmission = {
  id: string;
  name: string;
  kecamatan: string;
  desa: string;
  status: SubmissionStatus;
  date: string;
};

export type PortalTopic = {
  label: string;
  icon: "users-round" | "hand-coins" | "chart-no-axes-combined" | "book-open" | "file-text" | "database" | "calendar-days" | "monitor";
  helper: string;
  tone: Tone;
  x: number;
  y: number;
  path: string;
};

export type ProfileHighlight = {
  title: string;
  body: string;
};

export type OfficeInformation = {
  label: string;
  value: string;
};

export type DatasetExample = {
  title: string;
  domain: string;
  period: string;
  status: string;
  sourceUrl: string;
};

export type SearchItem = {
  title: string;
  category: string;
  path: string;
};
