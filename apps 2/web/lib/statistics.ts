import { apiFetch } from "@/lib/api";

export interface CardStateCounts {
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

export interface WordRef {
  headword: string;
  slug: string;
  lapses: number | null;
  interval_days: number | null;
}

export interface WeakCategory {
  slug: string;
  name_en: string;
  name_uz: string;
  name_ru: string;
  emoji: string | null;
  card_count: number;
  lapses: number;
}

export interface DayCount {
  day: string;
  count: number;
}

export interface Statistics {
  cards: CardStateCounts;
  total_reviews: number;
  accuracy_all: number;
  accuracy_mature: number;
  time_spent_ms: number;
  rating_breakdown: Record<string, number>;
  reviews_by_day: DayCount[];
  forgotten: WordRef[];
  mastered: WordRef[];
  weak_categories: WeakCategory[];
}

export interface HeatmapDay {
  day: string;
  reviews_count: number;
  xp_earned: number;
  goal_reached: boolean;
}

export const statisticsApi = {
  statistics: () => apiFetch<Statistics>("/me/statistics", { auth: true }),
  heatmap: (days = 120) =>
    apiFetch<{ days: HeatmapDay[] }>(`/me/heatmap?days=${days}`, { auth: true }),
};
