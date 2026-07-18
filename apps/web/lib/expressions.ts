import { apiFetch } from "@/lib/api";

export interface ExpressionListItem {
  slug: string;
  expression: string;
  uzbek: string;
  cefr: string;
  ielts_band: string;
  category: string;
  formality: string;
}

export interface ExpressionDetail extends ExpressionListItem {
  usage: string;
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
}

export const expressionsApi = {
  meta: () => apiFetch<ExpressionMeta>("/expressions/meta"),

  list: (query: ExpressionQuery = {}) => {
    const params = new URLSearchParams({ page: String(query.page ?? 1), page_size: "24" });
    if (query.cefr) params.set("cefr", query.cefr);
    if (query.category) params.set("category", query.category);
    if (query.q) params.set("q", query.q);
    return apiFetch<ExpressionPage>(`/expressions?${params}`);
  },

  detail: (slug: string) => apiFetch<ExpressionDetail>(`/expressions/${slug}`),
};

export const CEFR_COLOR = (cefr: string): string => {
  switch (cefr) {
    case "A2":
      return "text-emerald-600 dark:text-emerald-400";
    case "B1":
      return "text-blue-600 dark:text-blue-400";
    case "B2":
      return "text-indigo-600 dark:text-indigo-400";
    case "C1":
      return "text-purple-600 dark:text-purple-400";
    case "C2":
      return "text-violet-600 dark:text-violet-400";
    default:
      return "text-ink-soft";
  }
};
