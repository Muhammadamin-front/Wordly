import { apiFetch } from "@/lib/api";
import {
  loadGrammarProgress,
  mergeGrammarProgressEntry,
  replaceGrammarProgress,
  type GrammarProgress,
  type GrammarProgressEntry,
} from "@/lib/grammar";

const OWNER_STORAGE_KEY = "vocora:grammar-progress-owner:v1";

interface ServerGrammarProgressEntry {
  lesson_slug: string;
  attempts: number;
  best_score: number;
  last_score: number;
  updated_at: string;
}

interface ServerGrammarProgress {
  entries: ServerGrammarProgressEntry[];
}

function fromServer(entry: ServerGrammarProgressEntry): GrammarProgressEntry {
  return {
    attempts: entry.attempts,
    bestScore: entry.best_score,
    lastScore: entry.last_score,
    updatedAt: entry.updated_at,
  };
}

function snapshotFromServer(payload: ServerGrammarProgress): GrammarProgress {
  return Object.fromEntries(
    payload.entries.map((entry) => [entry.lesson_slug, fromServer(entry)])
  );
}

function entriesForSync(progress: GrammarProgress) {
  return Object.entries(progress).map(([lesson_slug, entry]) => ({
    lesson_slug,
    attempts: entry.attempts,
    best_score: entry.bestScore,
    last_score: entry.lastScore,
    updated_at: entry.updatedAt,
  }));
}

function mergeSnapshots(local: GrammarProgress, server: GrammarProgress): GrammarProgress {
  const merged = { ...server };
  for (const [slug, localEntry] of Object.entries(local)) {
    const serverEntry = merged[slug];
    if (!serverEntry) {
      merged[slug] = localEntry;
      continue;
    }
    const localIsNewer = Date.parse(localEntry.updatedAt) > Date.parse(serverEntry.updatedAt);
    merged[slug] = {
      attempts: Math.max(localEntry.attempts, serverEntry.attempts),
      bestScore: Math.max(localEntry.bestScore, serverEntry.bestScore),
      lastScore: localIsNewer ? localEntry.lastScore : serverEntry.lastScore,
      updatedAt: localIsNewer ? localEntry.updatedAt : serverEntry.updatedAt,
    };
  }
  return merged;
}

/**
 * Claims old unscoped local progress for the first signed-in account. When a
 * different account signs in, it downloads that account instead of leaking
 * the previous learner's results into it.
 */
export async function syncGrammarProgress(userId: string): Promise<GrammarProgress> {
  const existingOwner = window.localStorage.getItem(OWNER_STORAGE_KEY);
  if (existingOwner === null) window.localStorage.setItem(OWNER_STORAGE_KEY, userId);
  const owner = existingOwner ?? userId;
  const mayUploadLocal = owner === userId;
  const payload = await apiFetch<ServerGrammarProgress>("/me/grammar-progress/sync", {
    method: "POST",
    auth: true,
    body: { entries: mayUploadLocal ? entriesForSync(loadGrammarProgress()) : [] },
  });
  const currentOwner = window.localStorage.getItem(OWNER_STORAGE_KEY);
  if (currentOwner !== owner && currentOwner !== userId) return snapshotFromServer(payload);
  const serverProgress = snapshotFromServer(payload);
  const progress = mayUploadLocal
    ? mergeSnapshots(loadGrammarProgress(), serverProgress)
    : serverProgress;
  replaceGrammarProgress(progress);
  window.localStorage.setItem(OWNER_STORAGE_KEY, userId);
  return progress;
}

function createAttemptId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function submitGrammarAttempt(
  userId: string,
  lessonSlug: string,
  score: number
): Promise<GrammarProgressEntry> {
  const owner = window.localStorage.getItem(OWNER_STORAGE_KEY);
  if (owner !== userId) await syncGrammarProgress(userId);
  const row = await apiFetch<ServerGrammarProgressEntry>("/me/grammar-progress/attempt", {
    method: "POST",
    auth: true,
    body: { attempt_id: createAttemptId(), lesson_slug: lessonSlug, score },
  });
  window.localStorage.setItem(OWNER_STORAGE_KEY, userId);
  return mergeGrammarProgressEntry(row.lesson_slug, fromServer(row));
}
