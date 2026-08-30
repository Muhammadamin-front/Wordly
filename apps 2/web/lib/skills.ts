import { apiFetch } from "@/lib/api";

export interface PassageListItem {
  id: string;
  slug: string;
  cefr_level: string;
  title_en: string;
  question_count: number;
}

export interface PassageQuestion {
  prompt_en: string;
  options: string[];
}

export interface Passage {
  id: string;
  slug: string;
  cefr_level: string;
  title_en: string;
  body_en: string;
  summary_uz: string | null;
  questions: PassageQuestion[];
}

export interface ReadingResult {
  correct: number;
  total: number;
  results: boolean[];
  xp_gained: number;
  total_xp: number;
  level: number;
  leveled_up: boolean;
}

export interface WritingPrompts {
  level: string;
  prompts: string[];
}

export interface GrammarQuestion {
  prompt: string;
  options: string[];
}

export const skillsApi = {
  passages: (level?: string) =>
    apiFetch<PassageListItem[]>(
      "/skills/reading" + (level ? `?level=${level}` : ""),
      { auth: true }
    ),

  passage: (slug: string) => apiFetch<Passage>(`/skills/reading/${slug}`, { auth: true }),

  submitReading: (slug: string, answers: number[]) =>
    apiFetch<ReadingResult>(`/skills/reading/${slug}/submit`, {
      method: "POST",
      body: { answers },
      auth: true,
    }),

  writingPrompts: (level: string) =>
    apiFetch<WritingPrompts>(`/skills/writing/prompts?level=${level}`, { auth: true }),

  grammarRound: (level: string, count = 10) =>
    apiFetch<GrammarQuestion[]>(`/skills/grammar?level=${level}&count=${count}`, { auth: true }),

  submitGrammar: (level: string, answers: { prompt: string; answer: string }[]) =>
    apiFetch<ReadingResult>("/skills/grammar/submit", {
      method: "POST",
      body: { level, answers },
      auth: true,
    }),
};
