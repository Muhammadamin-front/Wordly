import { API_URL, apiFetch, getAccessToken } from "@/lib/api";
import type { Reward } from "@/lib/gamification";
import type { Word } from "@/lib/vocab";

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  card_count: number;
  due_count: number;
}

export interface CardOut {
  id: string;
  deck_id: string | null;
  word: Word | null;
  front_text: string | null;
  back_text: string | null;
  is_favorite: boolean;
  memory_note: string | null;
  srs_state: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_at: string;
}

export interface Queue {
  cards: CardOut[];
  due_count: number;
  new_count: number;
  learning_count: number;
}

export type Rating = "again" | "hard" | "good" | "easy";

export interface DeckImportReport {
  created: number;
  skipped: number;
  errors: string[];
}

export const flashcardsApi = {
  decks: () => apiFetch<Deck[]>("/decks", { auth: true }),

  createDeck: (name: string, description?: string) =>
    apiFetch<Deck>("/decks", { method: "POST", body: { name, description }, auth: true }),

  deleteDeck: (id: string) =>
    apiFetch<{ message: string }>(`/decks/${id}`, { method: "DELETE", auth: true }),

  queue: (deckId?: string) =>
    apiFetch<Queue>(`/review/queue${deckId ? `?deck_id=${deckId}` : ""}`, { auth: true }),

  review: (cardId: string, rating: Rating, durationMs?: number) =>
    apiFetch<{ card: CardOut; next_due_at: string; reward: Reward }>(`/review/${cardId}`, {
      method: "POST",
      body: { rating, duration_ms: durationMs },
      auth: true,
    }),

  updateCard: (cardId: string, body: { memory_note?: string; is_favorite?: boolean }) =>
    apiFetch<CardOut>(`/cards/${cardId}`, { method: "PATCH", body, auth: true }),

  addByLevel: (opts: { level?: string; category?: string; limit?: number }) =>
    apiFetch<{ added: number; already_added: number }>("/cards/add-by-level", {
      method: "POST",
      body: { cefr_level: opts.level, category_slug: opts.category, limit: opts.limit ?? 20 },
      auth: true,
    }),

  createCard: (wordId: string) =>
    apiFetch<CardOut>("/cards", { method: "POST", body: { word_id: wordId }, auth: true }),
};

export async function importDeckCsv(deckId: string, file: File): Promise<DeckImportReport> {
  const token = getAccessToken();
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/api/v1/decks/${deckId}/import`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    credentials: "include",
  });
  if (!response.ok) throw new Error(`import failed: ${response.status}`);
  return response.json();
}

export async function exportDeckCsv(deckId: string, deckName: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}/api/v1/decks/${deckId}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) throw new Error("export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${deckName}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
