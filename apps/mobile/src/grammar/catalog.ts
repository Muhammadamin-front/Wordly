import AsyncStorage from "@react-native-async-storage/async-storage";

import { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL, masteryStatus, type CefrGrammarLevel, type GrammarExercise, type GrammarLesson, type GrammarLessonSummary, type GrammarMasteryStatus } from "../../../web/lib/grammar";
import { localiseLesson } from "../../../web/lib/grammar/localise";

export { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL, localiseLesson, masteryStatus, type CefrGrammarLevel, type GrammarExercise, type GrammarLesson, type GrammarLessonSummary, type GrammarMasteryStatus };

const STORAGE_KEY = "vocora:grammar-done";
const LEGACY_STORAGE_KEY = "wordly:grammar-done";
export const PROGRESS_STORAGE_KEY = "vocora:grammar-progress:v2";

export interface MobileGrammarProgressEntry { attempts: number; bestScore: number; lastScore: number; updatedAt: string }
export type MobileGrammarProgress = Record<string, MobileGrammarProgressEntry>;

function decode(value: string | null) {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

export async function loadGrammarDone() {
  const current = await AsyncStorage.getItem(STORAGE_KEY);
  if (current !== null) return decode(current);
  const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === null) return new Set<string>();
  await AsyncStorage.multiSet([[STORAGE_KEY, legacy]]);
  await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  return decode(legacy);
}

export async function completeGrammarLesson(slug: string) {
  const done = await loadGrammarDone();
  done.add(slug);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  return done;
}

export async function loadGrammarProgress(): Promise<MobileGrammarProgress> {
  const [saved, done] = await Promise.all([AsyncStorage.getItem(PROGRESS_STORAGE_KEY), loadGrammarDone()]);
  let progress: MobileGrammarProgress = {};
  try {
    const parsed: unknown = JSON.parse(saved ?? "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) progress = parsed as MobileGrammarProgress;
  } catch { /* Corrupt local progress should not block the course. */ }
  for (const slug of done) progress[slug] ??= { attempts: 1, bestScore: 100, lastScore: 100, updatedAt: new Date(0).toISOString() };
  return progress;
}

/** Replace the device cache with the current account's server snapshot. */
export async function replaceGrammarProgress(progress: MobileGrammarProgress) {
  const completed = Object.entries(progress)
    .filter(([, entry]) => masteryStatus(entry.bestScore) === "mastered")
    .map(([slug]) => slug);
  await AsyncStorage.multiSet([
    [PROGRESS_STORAGE_KEY, JSON.stringify(progress)],
    [STORAGE_KEY, JSON.stringify(completed)],
  ]);
  return progress;
}

/** Merge a server response without losing a newer result made while offline. */
export async function mergeGrammarProgressEntry(
  slug: string,
  incoming: MobileGrammarProgressEntry,
) {
  const progress = await loadGrammarProgress();
  const current = progress[slug];
  const incomingIsNewer = !current || Date.parse(incoming.updatedAt) >= Date.parse(current.updatedAt);
  const merged: MobileGrammarProgressEntry = {
    attempts: Math.max(current?.attempts ?? 0, incoming.attempts),
    bestScore: Math.max(current?.bestScore ?? 0, incoming.bestScore),
    lastScore: incomingIsNewer ? incoming.lastScore : current.lastScore,
    updatedAt: incomingIsNewer ? incoming.updatedAt : current.updatedAt,
  };
  progress[slug] = merged;
  await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  if (masteryStatus(merged.bestScore) === "mastered") await completeGrammarLesson(slug);
  return merged;
}

export async function recordGrammarAttempt(slug: string, correct: number, total: number) {
  const progress = await loadGrammarProgress();
  const score = total ? Math.round((correct / total) * 100) : 0;
  const previous = progress[slug];
  const entry = { attempts: (previous?.attempts ?? 0) + 1, bestScore: Math.max(previous?.bestScore ?? 0, score), lastScore: score, updatedAt: new Date().toISOString() };
  progress[slug] = entry;
  await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  if (masteryStatus(entry.bestScore) === "mastered") await completeGrammarLesson(slug);
  return entry;
}
