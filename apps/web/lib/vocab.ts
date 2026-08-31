// Vocabulary types + fetchers. Public fetchers run on the server (RSC);
// admin fetchers run in the browser with the in-memory access token.
import { API_URL, apiFetch } from "@/lib/api";

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_uz: string;
  name_ru: string;
  emoji: string | null;
}

export interface WordListItem {
  id: string;
  headword: string;
  slug: string;
  pos: string;
  ipa: string | null;
  cefr_level: string;
  frequency_rank: number | null;
  status: string;
  ai_generated?: boolean;
  category: Category | null;
  primary_translation_uz: string | null;
  primary_translation_ru: string | null;
  primary_example_en?: string | null;
  image_url?: string | null;
}

export interface WordPage {
  items: WordListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CatalogMeta {
  word_total: number;
  expression_total: number;
  learning_item_total: number;
  levels: Record<string, number>;
}

export interface Example {
  id?: string;
  text_en: string;
  text_uz: string | null;
  text_ru: string | null;
}

export interface Sense {
  id?: string;
  sense_order?: number;
  definition_en: string;
  translation_uz: string;
  translation_ru: string;
  definition_uz?: string | null;
  definition_ru?: string | null;
  usage_note?: string | null;
  examples: Example[];
}

export interface Relation {
  id?: string;
  relation_type: string;
  related_text: string;
  related_word_id?: string | null;
}

export interface Word {
  id: string;
  headword: string;
  slug: string;
  pos: string;
  ipa: string | null;
  audio_url: string | null;
  image_url: string | null;
  cefr_level: string;
  frequency_rank: number | null;
  word_family: string | null;
  common_mistake: string | null;
  status: string;
  ai_generated?: boolean;
  category: Category | null;
  senses: Sense[];
  relations: Relation[];
}

export interface WordInput {
  headword: string;
  pos: string;
  cefr_level: string;
  ipa?: string | null;
  frequency_rank?: number | null;
  common_mistake?: string | null;
  category_slug?: string | null;
  status: string;
  senses: Omit<Sense, "id" | "sense_order">[];
  relations?: Omit<Relation, "id" | "related_word_id">[];
}

export interface ImportReport {
  created: number;
  updated: number;
  errors: string[];
}

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const WORD_STATUSES = ["draft", "review", "published"] as const;

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

// --- public (server-side) ---------------------------------------------------

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/v1/categories`, { cache: "no-store" });
  if (!response.ok) throw new Error("categories fetch failed");
  return response.json();
}

export async function fetchWords(params: {
  page?: number;
  pageSize?: number;
  level?: string;
  category?: string;
  q?: string;
}): Promise<WordPage> {
  const { pageSize, ...query } = params;
  const response = await fetch(`${API_URL}/api/v1/words${buildQuery({
    ...query,
    page_size: pageSize,
  })}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("words fetch failed");
  return response.json();
}

export async function fetchCatalogMeta(): Promise<CatalogMeta> {
  const response = await fetch(`${API_URL}/api/v1/catalog/meta`, { cache: "no-store" });
  if (!response.ok) throw new Error("catalog metadata fetch failed");
  return response.json();
}

export interface WordLookupEntry {
  headword: string;
  pos: string;
  slug: string;
  translation_uz: string | null;
  translation_ru: string | null;
  definition_en: string | null;
}

/**
 * Tap-to-translate while reading: one call per passage, not per tap.
 * Best-effort — a network failure just means that passage's taps show no
 * translation yet, not a crash, so failures resolve to {} rather than throw.
 */
export async function lookupWords(headwords: string[]): Promise<Record<string, WordLookupEntry>> {
  const unique = Array.from(new Set(headwords.map((word) => word.toLowerCase()))).slice(0, 300);
  if (unique.length === 0) return {};
  try {
    const response = await fetch(`${API_URL}/api/v1/words/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headwords: unique }),
    });
    if (!response.ok) return {};
    const data = (await response.json()) as { entries: Record<string, WordLookupEntry> };
    return data.entries;
  } catch {
    return {};
  }
}

export async function fetchWord(slug: string): Promise<Word | null> {
  const response = await fetch(`${API_URL}/api/v1/words/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("word fetch failed");
  return response.json();
}

/** Fallback for a search that came back empty: ask the AI to define the term
 *  and add it to the corpus (status "review" — it stays out of the public
 *  catalogue until a curator promotes it, but this same call already
 *  returns the full detail so the searcher sees it immediately). Throws
 *  ApiError(404) when the AI judged the term isn't a real word, 429 when
 *  the learner's daily AI quota is used up, 503 when AI isn't configured. */
export async function defineWordViaAi(word: string): Promise<Word> {
  return apiFetch<Word>("/ai/define-word", { method: "POST", body: { word }, auth: true });
}

/** First-line fallback for the same empty search, tried before defineWordViaAi:
 *  a free external dictionary lookup, no AI quota spent. English definition
 *  only (no Uzbek/Russian translation — see the route's own docstring), but
 *  still added to the corpus and shown immediately, same as the AI path.
 *  Throws ApiError(404) when the term isn't in that dictionary either —
 *  callers should fall through to defineWordViaAi on that specific status. */
export async function defineWordExternally(word: string): Promise<Word> {
  return apiFetch<Word>("/words/define-external", { method: "POST", body: { word }, auth: true });
}

// --- admin (browser, Bearer-authenticated) ----------------------------------

export const adminVocabApi = {
  list: (params: { page?: number; status?: string; level?: string; q?: string }) =>
    apiFetch<WordPage>(`/admin/words${buildQuery(params)}`, { auth: true }),

  get: (id: string) => apiFetch<Word>(`/admin/words/${id}`, { auth: true }),

  create: (body: WordInput) =>
    apiFetch<Word>("/admin/words", { method: "POST", body, auth: true }),

  update: (id: string, body: Partial<WordInput>) =>
    apiFetch<Word>(`/admin/words/${id}`, { method: "PATCH", body, auth: true }),

  remove: (id: string) =>
    apiFetch<{ message: string }>(`/admin/words/${id}`, { method: "DELETE", auth: true }),
};

// CSV upload needs multipart, so it bypasses the JSON apiFetch helper.
export async function adminImportCsv(file: File, accessToken: string): Promise<ImportReport> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/api/v1/admin/words/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
    credentials: "include",
  });
  if (!response.ok) throw new Error(`import failed: ${response.status}`);
  return response.json();
}
