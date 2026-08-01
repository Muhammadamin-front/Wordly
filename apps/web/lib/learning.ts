import { apiFetch } from "@/lib/api";

export type AdaptiveDifficulty = "guided" | "balanced" | "challenge";

export interface LearningPlan {
  due_count: number;
  new_count: number;
  reviewed_today: number;
  mistake_count: number;
  recent_accuracy: number;
  recent_reviews: number;
  difficulty: AdaptiveDifficulty;
  recommended_game: string;
  daily_target: number;
}

export interface MistakeWord {
  card_id: string;
  headword: string;
  slug: string;
  pos: string;
  cefr_level: string;
  translation_uz: string;
  translation_ru: string;
  definition_en: string;
  example_en: string | null;
  example_uz: string | null;
  example_ru: string | null;
  lapses: number;
  wrong_count: number;
  last_missed_at: string;
  last_rating: string;
  status: "needs_practice" | "improving";
}

export interface MistakeNotebook {
  items: MistakeWord[];
  total: number;
}

export const learningApi = {
  plan: () => apiFetch<LearningPlan>("/me/learning-plan", { auth: true }),
  mistakes: (limit = 24) =>
    apiFetch<MistakeNotebook>(`/me/mistakes?limit=${limit}`, { auth: true }),
};
