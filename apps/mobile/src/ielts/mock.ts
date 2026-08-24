import {
  request,
  type IeltsMockSession,
  type IeltsMockSessionListItem,
} from "@/api/client";

export type MockTrack = "academic" | "general";
export type MockSkill = "listening" | "reading" | "writing" | "speaking";

export const MOCK_SKILLS: readonly MockSkill[] = ["listening", "reading", "writing", "speaking"];

export const MOCK_SKILL_MINUTES: Record<MockSkill, number> = {
  listening: 6,
  reading: 60,
  writing: 60,
  speaking: 15,
};

export function halfBand(value: number) {
  return Math.max(0, Math.min(9, Math.floor(value * 2 + 0.5) / 2));
}

export function combineWritingBand(task1: number, task2: number) {
  return halfBand((task1 + 2 * task2) / 3);
}

export const mockApi = {
  list: (token: string | null) => request<IeltsMockSessionListItem[]>("/ielts/mock/sessions", { token }),
  get: (token: string | null, id: string) => request<IeltsMockSession>(`/ielts/mock/sessions/${id}`, { token }),
  create: (token: string | null, track: MockTrack) => request<IeltsMockSession>("/ielts/mock/sessions", {
    method: "POST",
    token,
    body: { track },
  }),
  abandon: (token: string | null, id: string) => request<IeltsMockSession>(`/ielts/mock/sessions/${id}/abandon`, {
    method: "POST",
    token,
  }),
  complete: (token: string | null, id: string, skill: MockSkill, band: number, detail?: Record<string, unknown>) => request<IeltsMockSession>(`/ielts/mock/sessions/${id}/legs/${skill}/complete`, {
    method: "POST",
    token,
    body: { band, detail },
  }),
};

export function randomAcademicReadingTest() {
  const ids = [
    "academic-full-volcano-hazards",
    "academic-full-coral-reefs",
    "academic-full-space-weather",
    "academic-full-groundwater",
    "academic-full-el-nino",
  ];
  return ids[Math.floor(Math.random() * ids.length)];
}
