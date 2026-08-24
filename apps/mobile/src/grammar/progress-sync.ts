import AsyncStorage from "@react-native-async-storage/async-storage";

import { request } from "@/api/client";
import {
  loadGrammarProgress,
  mergeGrammarProgressEntry,
  replaceGrammarProgress,
  type MobileGrammarProgress,
  type MobileGrammarProgressEntry,
} from "@/grammar/catalog";

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

function fromServer(entry: ServerGrammarProgressEntry): MobileGrammarProgressEntry {
  return {
    attempts: entry.attempts,
    bestScore: entry.best_score,
    lastScore: entry.last_score,
    updatedAt: entry.updated_at,
  };
}

function snapshotFromServer(payload: ServerGrammarProgress): MobileGrammarProgress {
  return Object.fromEntries(
    payload.entries.map((entry) => [entry.lesson_slug, fromServer(entry)]),
  );
}

function entriesForSync(progress: MobileGrammarProgress) {
  return Object.entries(progress).map(([lesson_slug, entry]) => ({
    lesson_slug,
    attempts: entry.attempts,
    best_score: entry.bestScore,
    last_score: entry.lastScore,
    updated_at: entry.updatedAt,
  }));
}

function mergeSnapshots(
  local: MobileGrammarProgress,
  server: MobileGrammarProgress,
): MobileGrammarProgress {
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

export async function syncGrammarProgress(token: string, userId: string) {
  const existingOwner = await AsyncStorage.getItem(OWNER_STORAGE_KEY);
  if (existingOwner === null) await AsyncStorage.setItem(OWNER_STORAGE_KEY, userId);
  const owner = existingOwner ?? userId;
  const mayUploadLocal = owner === userId;
  const payload = await request<ServerGrammarProgress>("/me/grammar-progress/sync", {
    method: "POST",
    token,
    body: { entries: mayUploadLocal ? entriesForSync(await loadGrammarProgress()) : [] },
  });
  const currentOwner = await AsyncStorage.getItem(OWNER_STORAGE_KEY);
  if (currentOwner !== owner && currentOwner !== userId) return snapshotFromServer(payload);
  const serverProgress = snapshotFromServer(payload);
  const progress = mayUploadLocal
    ? mergeSnapshots(await loadGrammarProgress(), serverProgress)
    : serverProgress;
  await replaceGrammarProgress(progress);
  await AsyncStorage.setItem(OWNER_STORAGE_KEY, userId);
  return progress;
}

function createAttemptId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function submitGrammarAttempt(
  token: string,
  userId: string,
  lessonSlug: string,
  score: number,
) {
  const owner = await AsyncStorage.getItem(OWNER_STORAGE_KEY);
  if (owner !== userId) await syncGrammarProgress(token, userId);
  const row = await request<ServerGrammarProgressEntry>("/me/grammar-progress/attempt", {
    method: "POST",
    token,
    body: { attempt_id: createAttemptId(), lesson_slug: lessonSlug, score },
  });
  await AsyncStorage.setItem(OWNER_STORAGE_KEY, userId);
  return mergeGrammarProgressEntry(row.lesson_slug, fromServer(row));
}
