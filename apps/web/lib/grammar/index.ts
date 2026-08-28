import { A1_LESSONS } from "./a1";
import { A2_LESSONS } from "./a2";
import { B1_LESSONS } from "./b1";
import { B2_LESSONS } from "./b2";
import { buildCurriculum, lessonSummary, masteryStatus } from "./curriculum";
import { IELTS_LESSONS } from "./ielts";
import { IELTS_ADVANCED_LESSONS } from "./ielts-advanced";
import { IELTS_EXPERT_LESSONS } from "./ielts-expert";
import type { CefrGrammarLevel, GrammarLesson } from "./types";

export type {
  CefrGrammarLevel,
  GrammarCategory,
  GrammarComparison,
  GrammarExercise,
  GrammarExerciseType,
  GrammarLesson,
  GrammarLessonSummary,
  GrammarLevel,
} from "./types";
export { MASTERY_THRESHOLDS, masteryStatus, type GrammarMasteryStatus } from "./curriculum";

export const GRAMMAR_LEVELS: CefrGrammarLevel[] = ["A1", "A2", "B1", "B2", "C1"];

/** Levels a free learner can study. Mirrors FREE_GRAMMAR_LEVELS in
 *  apps/api/app/services/plans.py, which is what actually enforces this on
 *  /skills/grammar — this copy only drives the lock UI, and the two must be
 *  kept in step. Lesson text ships inside the client bundle, so treat the
 *  lock as signposting, not as protection for the content itself. */
export const FREE_GRAMMAR_LEVELS: CefrGrammarLevel[] = ["A1"];

export const LESSONS_BY_LEVEL = buildCurriculum({
  A1: A1_LESSONS,
  A2: A2_LESSONS,
  B1: B1_LESSONS,
  B2: B2_LESSONS,
  C1: [...IELTS_LESSONS, ...IELTS_ADVANCED_LESSONS, ...IELTS_EXPERT_LESSONS],
});

export const ALL_LESSONS: GrammarLesson[] = GRAMMAR_LEVELS.flatMap((level) => LESSONS_BY_LEVEL[level]);
export const LESSON_SUMMARIES = ALL_LESSONS.map(lessonSummary);

export function lessonBySlug(slug: string): GrammarLesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.slug === slug);
}

const STORAGE_KEY = "vocora:grammar-done";
const LEGACY_STORAGE_KEY = "wordly:grammar-done";
export const PROGRESS_STORAGE_KEY = "vocora:grammar-progress:v2";
export const GRAMMAR_PROGRESS_EVENT = "vocora:grammar-progress";

export interface GrammarProgressEntry {
  attempts: number;
  bestScore: number;
  lastScore: number;
  updatedAt: string;
}

export type GrammarProgress = Record<string, GrammarProgressEntry>;

function readMigrated(key: string, legacyKey: string): string | null {
  if (typeof window === "undefined") return null;
  const current = window.localStorage.getItem(key);
  if (current !== null) return current;
  const legacy = window.localStorage.getItem(legacyKey);
  if (legacy === null) return null;
  window.localStorage.setItem(key, legacy);
  window.localStorage.removeItem(legacyKey);
  return legacy;
}

export function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const parsed: unknown = JSON.parse(readMigrated(STORAGE_KEY, LEGACY_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

export function loadGrammarProgress(): GrammarProgress {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}");
    const progress = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as GrammarProgress : {};
    for (const slug of loadCompleted()) {
      progress[slug] ??= { attempts: 1, bestScore: 100, lastScore: 100, updatedAt: new Date(0).toISOString() };
    }
    return progress;
  } catch {
    return {};
  }
}

function persistProgress(progress: GrammarProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(GRAMMAR_PROGRESS_EVENT));
}

/** Replaces the device cache with the account snapshot returned by the API. */
export function replaceGrammarProgress(progress: GrammarProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  const completed = Object.entries(progress)
    .filter(([, entry]) => masteryStatus(entry.bestScore) === "mastered")
    .map(([slug]) => slug);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  window.dispatchEvent(new Event(GRAMMAR_PROGRESS_EVENT));
}

/** Merge one authoritative server row without discarding a newer offline result. */
export function mergeGrammarProgressEntry(
  slug: string,
  incoming: GrammarProgressEntry
): GrammarProgressEntry {
  const progress = loadGrammarProgress();
  const current = progress[slug];
  const incomingIsNewer = !current || Date.parse(incoming.updatedAt) >= Date.parse(current.updatedAt);
  const merged: GrammarProgressEntry = {
    attempts: Math.max(current?.attempts ?? 0, incoming.attempts),
    bestScore: Math.max(current?.bestScore ?? 0, incoming.bestScore),
    lastScore: incomingIsNewer ? incoming.lastScore : current.lastScore,
    updatedAt: incomingIsNewer ? incoming.updatedAt : current.updatedAt,
  };
  progress[slug] = merged;
  persistProgress(progress);
  if (masteryStatus(merged.bestScore) === "mastered") markCompleted(slug);
  return merged;
}

export function recordGrammarAttempt(slug: string, correct: number, total: number): GrammarProgressEntry {
  const progress = loadGrammarProgress();
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const previous = progress[slug];
  const entry: GrammarProgressEntry = {
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    lastScore: score,
    updatedAt: new Date().toISOString(),
  };
  progress[slug] = entry;
  persistProgress(progress);
  if (masteryStatus(entry.bestScore) === "mastered") markCompleted(slug);
  return entry;
}

/** Keeps the original completion key alive so existing URLs and progress survive. */
export function markCompleted(slug: string): Set<string> {
  const done = loadCompleted();
  done.add(slug);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    window.dispatchEvent(new Event(GRAMMAR_PROGRESS_EVENT));
  }
  return done;
}
