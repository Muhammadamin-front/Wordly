/** Local progress + server sync for Master Writing, mirroring the exact
 *  pattern in apps/web/lib/grammar/{index,progress-sync}.ts — see that
 *  module for the reasoning (offline-first, owner-tagged snapshot so an
 *  account switch on one device can't leak learner A's local scores into
 *  learner B, max/newest-wins merge). One row per unit instead of per
 *  lesson, and folded into a single file since there's far less of it. */
import { writingMasterApi, type WritingMasterProgressEntry } from "@/lib/writing-master/api";

export type WritingMasterProgress = Record<string, WritingMasterProgressEntry>;

const PROGRESS_STORAGE_KEY = "vocora:writing-master-progress:v1";
const OWNER_STORAGE_KEY = "vocora:writing-master-progress-owner:v1";
export const WRITING_MASTER_PROGRESS_EVENT = "vocora:writing-master-progress";

function notify() {
  window.dispatchEvent(new Event(WRITING_MASTER_PROGRESS_EVENT));
}

export function loadProgress(): WritingMasterProgress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WritingMasterProgress) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: WritingMasterProgress) {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  notify();
}

export function replaceProgress(progress: WritingMasterProgress) {
  saveProgress(progress);
}

/** Local write after a drill/full-practice result — always runs, before any
 *  network call, so the UI never waits on the server to reflect progress. */
export function recordLocalAttempt(unitSlug: string, score: number): WritingMasterProgressEntry {
  const progress = loadProgress();
  const existing = progress[unitSlug];
  const entry: WritingMasterProgressEntry = existing
    ? {
        unit_slug: unitSlug,
        attempts: existing.attempts + 1,
        best_score: Math.max(existing.best_score, score),
        last_score: score,
        updated_at: new Date().toISOString(),
      }
    : {
        unit_slug: unitSlug, attempts: 1, best_score: score, last_score: score,
        updated_at: new Date().toISOString(),
      };
  progress[unitSlug] = entry;
  saveProgress(progress);
  return entry;
}

function createAttemptId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Fire-and-forget server attempt, after the local write. Errors are
 *  swallowed — offline-first, the local result is retained and merged on
 *  the next successful sync. */
export async function submitAttempt(unitSlug: string, score: number): Promise<void> {
  try {
    await writingMasterApi.recordAttempt(createAttemptId(), unitSlug, score);
  } catch {
    // retried implicitly by the next syncProgress() call
  }
}

/** App-boot pull: uploads the local snapshot only if this device is the
 *  recorded owner of it (an account switch must not leak the previous
 *  learner's local scores), then replaces local with the merged server
 *  result. */
export async function syncProgress(userId: string): Promise<WritingMasterProgress> {
  let owner: string | null = null;
  try {
    owner = window.localStorage.getItem(OWNER_STORAGE_KEY);
  } catch {
    // ignore
  }
  const mayUploadLocal = owner === null || owner === userId;
  const local = loadProgress();
  try {
    const { entries } = await writingMasterApi.syncProgress(
      mayUploadLocal ? Object.values(local) : []
    );
    const merged: WritingMasterProgress = { ...local };
    for (const row of entries) {
      const existing = merged[row.unit_slug];
      merged[row.unit_slug] =
        !existing || new Date(row.updated_at) >= new Date(existing.updated_at) || row.best_score > existing.best_score
          ? { ...row, best_score: Math.max(row.best_score, existing?.best_score ?? 0) }
          : existing;
    }
    replaceProgress(merged);
    window.localStorage.setItem(OWNER_STORAGE_KEY, userId);
    return merged;
  } catch {
    return local; // offline — keep whatever is local, try again next boot
  }
}
