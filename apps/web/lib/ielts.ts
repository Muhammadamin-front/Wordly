import { apiFetch } from "@/lib/api";

export type IeltsSkill = "reading" | "writing" | "listening" | "speaking";
export type ComprehensionKind = "reading" | "listening";

export interface IeltsReward {
  xp_gained: number;
  total_xp: number;
  level: number;
  leveled_up: boolean;
}

export interface IeltsOverview {
  best_bands: Record<string, number>;
  enabled: boolean;
}

export interface WritingTask {
  title: string;
  prompt: string;
}

export interface IeltsQuestion {
  prompt: string;
  options: string[];
}

export interface GeneratedTest {
  test_id: string;
  title: string;
  body: string; // reading passage or listening script
  questions: IeltsQuestion[];
}

export interface GradeResult {
  correct: number;
  total: number;
  band: number;
  answers: number[];
  reward: IeltsReward;
}

export interface WritingScore {
  band_overall: number;
  task: number;
  coherence: number;
  lexical: number;
  grammar: number;
  feedback: string;
  improved: string;
  reward: IeltsReward;
}

export const ieltsApi = {
  overview: () => apiFetch<IeltsOverview>("/ielts/overview", { auth: true }),

  writingTasks: () =>
    apiFetch<Record<string, WritingTask[]>>("/ielts/writing/tasks", { auth: true }),

  scoreWriting: (taskType: string, prompt: string, essay: string) =>
    apiFetch<WritingScore>("/ielts/writing/score", {
      method: "POST",
      body: { task_type: taskType, prompt, essay },
      auth: true,
    }),

  generate: (kind: ComprehensionKind, band = 6) =>
    apiFetch<GeneratedTest>(`/ielts/${kind}/generate`, {
      method: "POST",
      body: { band },
      auth: true,
    }),

  submit: (kind: ComprehensionKind, testId: string, answers: number[]) =>
    apiFetch<GradeResult>(`/ielts/${kind}/submit`, {
      method: "POST",
      body: { test_id: testId, answers },
      auth: true,
    }),
};

export const BAND_COLOR = (band: number): string => {
  if (band >= 7.5) return "text-emerald-500";
  if (band >= 6.5) return "text-brand-500";
  if (band >= 5.5) return "text-amber-500";
  return "text-orange-500";
};
