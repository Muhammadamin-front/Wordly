import { A1_LESSONS } from "./a1";
import { A2_LESSONS } from "./a2";
import { B1_LESSONS } from "./b1";
import { B2_LESSONS } from "./b2";
import { IELTS_LESSONS } from "./ielts";
import { IELTS_ADVANCED_LESSONS } from "./ielts-advanced";
import { IELTS_EXPERT_LESSONS } from "./ielts-expert";
import type { GrammarLesson, GrammarLevel } from "./types";

export type { GrammarLesson, GrammarLevel } from "./types";

export const GRAMMAR_LEVELS: GrammarLevel[] = ["A1", "A2", "B1", "B2", "IELTS"];

export const LESSONS_BY_LEVEL: Record<GrammarLevel, GrammarLesson[]> = {
  A1: A1_LESSONS,
  A2: A2_LESSONS,
  B1: B1_LESSONS,
  B2: B2_LESSONS,
  IELTS: [...IELTS_LESSONS, ...IELTS_ADVANCED_LESSONS, ...IELTS_EXPERT_LESSONS],
};

export const ALL_LESSONS: GrammarLesson[] = GRAMMAR_LEVELS.flatMap(
  (level) => LESSONS_BY_LEVEL[level]
);

export function lessonBySlug(slug: string): GrammarLesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.slug === slug);
}

/** Completed lessons live in localStorage — the course works offline and
 *  needs no account state. */
const STORAGE_KEY = "vocora:grammar-done";
const LEGACY_STORAGE_KEY = "wordly:grammar-done";

/** Reads the current key, falling back to the pre-rename one and moving the
 *  value across. Vocora was called Wordly; the old keys are still in browsers. */
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
    return new Set(JSON.parse(readMigrated(STORAGE_KEY, LEGACY_STORAGE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markCompleted(slug: string): Set<string> {
  const done = loadCompleted();
  done.add(slug);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  return done;
}
