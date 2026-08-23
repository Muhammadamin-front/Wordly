import { apiFetch } from "@/lib/api";

export type MockTrack = "academic" | "general";
export type MockSkill = "listening" | "reading" | "writing" | "speaking";
export type MockLegStatus = "pending" | "in_progress" | "done";
export type MockSessionStatus = "in_progress" | "finished" | "abandoned";

export const MOCK_SKILLS: readonly MockSkill[] = ["listening", "reading", "writing", "speaking"];

export interface MockLeg {
  skill: MockSkill;
  status: MockLegStatus;
  band: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface MockSession {
  id: string;
  track: MockTrack;
  status: MockSessionStatus;
  current_leg: MockSkill | null;
  started_at: string;
  finished_at: string | null;
  overall_band: number | null;
  band_listening: number | null;
  band_reading: number | null;
  band_writing: number | null;
  band_speaking: number | null;
  legs: MockLeg[];
}

export interface MockSessionListItem {
  id: string;
  track: MockTrack;
  status: MockSessionStatus;
  started_at: string;
  finished_at: string | null;
  overall_band: number | null;
}

export const ieltsMockApi = {
  listSessions: () => apiFetch<MockSessionListItem[]>("/ielts/mock/sessions", { auth: true }),

  createSession: (track: MockTrack) =>
    apiFetch<MockSession>("/ielts/mock/sessions", {
      method: "POST",
      body: { track },
      auth: true,
    }),

  getSession: (id: string) =>
    apiFetch<MockSession>(`/ielts/mock/sessions/${id}`, { auth: true }),

  abandonSession: (id: string) =>
    apiFetch<MockSession>(`/ielts/mock/sessions/${id}/abandon`, {
      method: "POST",
      auth: true,
    }),

  completeLeg: (id: string, skill: MockSkill, band: number, detail?: Record<string, unknown>) =>
    apiFetch<MockSession>(`/ielts/mock/sessions/${id}/legs/${skill}/complete`, {
      method: "POST",
      body: { band, detail },
      auth: true,
    }),
};

/** Mirrors `app/services/ielts_scoring.py::_round_half_up_to_half` — IELTS
 *  rounds a mean ending in .25/.75 UP to the next half band, unlike
 *  JavaScript's (and Python's default) round-half-to-even. */
export function halfBand(value: number): number {
  const band = Math.floor(value * 2 + 0.5) / 2;
  return Math.max(0, Math.min(9, band));
}

/** Mirrors `combine_writing_band`: Task 2 counts double toward the Writing band. */
export function combineWritingBand(task1: number, task2: number): number {
  return halfBand((task1 + 2 * task2) / 3);
}

/** Mirrors `overall_band`: the four skill bands, unweighted. */
export function overallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  return halfBand((listening + reading + writing + speaking) / 4);
}

export const MOCK_SKILL_LABEL: Record<MockSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

/** Honest per-leg time budgets given the content actually available today —
 *  Reading and Writing match the real exam; Listening is one short passage
 *  rather than the real exam's four sections, so it is timed accordingly
 *  rather than padded to 30 minutes to match a claim the content can't back. */
export const MOCK_SKILL_MINUTES: Record<MockSkill, number> = {
  listening: 6,
  reading: 60,
  writing: 60,
  speaking: 15,
};
