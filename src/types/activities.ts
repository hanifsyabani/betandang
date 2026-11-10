import type { Tone } from "./prototype";

export type ActivityCategory = "sensus" | "survei";

export type ActivityCategoryInfo = {
  label: string;
  tone: Tone;
};

export type ScheduledActivity = {
  id: string;
  title: string;
  shortTitle: string;
  category: ActivityCategory;
  startDate: string;
  endDate: string;
  scope: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceDate: string;
};
