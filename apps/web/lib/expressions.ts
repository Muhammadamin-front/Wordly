import { apiFetch } from "@/lib/api";

export interface ExpressionListItem {
  slug: string;
  expression: string;
  uzbek: string;
  /** Translation for the active locale, or null when none exists — always null
   *  for English, and for Russian rows with no translation yet. Show `usage`
   *  instead when it is null. */
  translation: string | null;
  /** Always a genuine translation, safe to save on a flashcard. */
  flashcard_back: string;
  usage: string;
  cefr: string;
  ielts_band: string;
  category: string;
  formality: string;
}

export interface ExpressionDetail extends ExpressionListItem {
  grammar_pattern: string;
  native_notes: string;
  common_mistakes: string[];
  alternatives: string[];
  example_sentences: string[];
  collocations: string[];
  synonyms: string[];
  opposites: string[];
}

export interface ExpressionPage {
  items: ExpressionListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExpressionMeta {
  total: number;
  categories: { category: string; count: number }[];
}

export interface ExpressionQuery {
  page?: number;
  cefr?: string;
  category?: string;
  q?: string;
  locale?: string;
}

export const expressionsApi = {
  meta: () => apiFetch<ExpressionMeta>("/expressions/meta"),

  list: (query: ExpressionQuery = {}) => {
    const params = new URLSearchParams({ page: String(query.page ?? 1), page_size: "24" });
    if (query.cefr) params.set("cefr", query.cefr);
    if (query.category) params.set("category", query.category);
    if (query.q) params.set("q", query.q);
    if (query.locale) params.set("locale", query.locale);
    return apiFetch<ExpressionPage>(`/expressions?${params}`);
  },

  detail: (slug: string, locale = "uz") =>
    apiFetch<ExpressionDetail>(`/expressions/${slug}?locale=${encodeURIComponent(locale)}`),
};

export const CEFR_COLOR = (cefr: string): string => {
  switch (cefr) {
    case "A2":
      return "text-emerald-600 dark:text-emerald-400";
    case "B1":
      return "text-brand-500 dark:text-brand-300";
    case "B2":
      return "text-teal-600 dark:text-teal-300";
    case "C1":
      return "text-accent-500 dark:text-accent-300";
    case "C2":
      return "text-emerald-700 dark:text-emerald-200";
    default:
      return "text-ink-soft";
  }
};
