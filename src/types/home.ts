import type { Tone } from "./prototype";
import type { StatisticsComparisonMetric } from "./statistics";

export type HomeSpotlightMetric = StatisticsComparisonMetric & { source: string };

export type HomeService = {
  id: "research" | "consultation" | "desil";
  title: string;
  description: string;
  action: string;
  href: string;
  external: boolean;
  tone: Tone;
};

export type HomePublication = {
  id: string;
  title: string;
  year: string;
  releaseDate: string;
  cover: string;
  sourceUrl: string;
};
