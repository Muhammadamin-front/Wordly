import { apiFetch } from "@/lib/api";
import type { WritingTaskVisual } from "@/lib/ielts";

export type DrillQuality = "needs_work" | "good" | "excellent";

export interface DrillFeedback {
  quality: DrillQuality;
  feedback: string;
  model_example: string;
  score: number;
  xp_gained: number;
  leveled_up: boolean;
}

export interface WritingMasterProgressEntry {
  unit_slug: string;
  attempts: number;
  best_score: number;
  last_score: number;
  updated_at: string;
}

export const writingMasterApi = {
  // A real model call, not a CRUD request — the generic 15s default
  // (lib/api.ts DEFAULT_API_TIMEOUT_MS) aborts these before Gemini/Bedrock
  // replies, which surfaces as a client-side "something went wrong" with no
  // HTTP status at all. Shorter than scoreWriting's 75s since these grade a
  // sentence, not a full essay, but still a real generation call.
  checkParaphrase: (unitSlug: string, originalTitle: string, paraphrase: string, lang = "en") =>
    apiFetch<DrillFeedback>("/ielts/writing/master/paraphrase-check", {
      method: "POST",
      body: { unit_slug: unitSlug, original_title: originalTitle, paraphrase, lang },
      auth: true,
      timeoutMs: 30_000,
    }),

  checkOverview: (unitSlug: string, visual: WritingTaskVisual, overview: string, lang = "en") =>
    apiFetch<DrillFeedback>("/ielts/writing/master/overview-check", {
      method: "POST",
      body: { unit_slug: unitSlug, visual, overview, lang },
      auth: true,
      timeoutMs: 30_000,
    }),

  progress: () =>
    apiFetch<{ entries: WritingMasterProgressEntry[] }>("/me/writing-master-progress", { auth: true }),

  syncProgress: (entries: WritingMasterProgressEntry[]) =>
    apiFetch<{ entries: WritingMasterProgressEntry[] }>("/me/writing-master-progress/sync", {
      method: "POST",
      body: { entries },
      auth: true,
    }),

  recordAttempt: (attemptId: string, unitSlug: string, score: number) =>
    apiFetch<WritingMasterProgressEntry>("/me/writing-master-progress/attempt", {
      method: "POST",
      body: { attempt_id: attemptId, unit_slug: unitSlug, score },
      auth: true,
    }),
};
