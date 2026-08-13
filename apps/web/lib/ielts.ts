import { apiFetch } from "@/lib/api";

export type IeltsSkill = "reading" | "writing" | "listening" | "speaking";
export type ComprehensionKind = "reading" | "listening";

export interface IeltsReward {
  xp_gained: number;
  total_xp: number;
  level: number;
  leveled_up: boolean;
}

export interface IeltsHistoryItem {
  skill: string;
  band: number;
  correct: number | null; // Reading/Listening only
  total: number | null;
  created_at: string;
}

export interface IeltsOverview {
  best_bands: Record<string, number>;
  recent: IeltsHistoryItem[]; // newest first
  enabled: boolean;
}

export interface WritingChartSeries {
  name: string;
  values: number[];
}

export interface WritingPieSlice {
  name: string;
  value: number;
}

export interface WritingTaskVisual {
  kind: "line" | "bar" | "table" | "bar-pie";
  title: string;
  y_label?: string;
  categories: string[];
  series: WritingChartSeries[];
  pie?: WritingPieSlice[];
}

export interface WritingTask {
  title: string;
  prompt: string;
  visual?: WritingTaskVisual | null;
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

export interface WritingCriterion {
  band: number;
  comment: string;
}

export interface WritingError {
  quote: string; // exact fragment from the essay
  fix: string; // corrected fragment
  note: string; // one-sentence explanation
  type: "grammar" | "vocabulary" | "spelling" | "punctuation" | "style";
}

export interface WritingScore {
  band_overall: number;
  task: WritingCriterion;
  coherence: WritingCriterion;
  lexical: WritingCriterion;
  grammar: WritingCriterion;
  errors: WritingError[];
  strengths: string[];
  feedback: string;
  improved: string; // full band-8 model rewrite
  reward: IeltsReward;
}

export interface BankItem {
  id: string;
  title: string;
  band: number;
  question_count: number;
  word_count: number;
  done: boolean;
}

export const ieltsApi = {
  overview: () => apiFetch<IeltsOverview>("/ielts/overview", { auth: true }),

  bank: (kind: ComprehensionKind) =>
    apiFetch<BankItem[]>(`/ielts/${kind}/bank`, { auth: true }),

  bankStart: (kind: ComprehensionKind, itemId: string) =>
    apiFetch<GeneratedTest>(`/ielts/${kind}/bank/${itemId}/start`, {
      method: "POST",
      auth: true,
    }),

  writingTasks: () =>
    apiFetch<Record<string, WritingTask[]>>("/ielts/writing/tasks", { auth: true }),

  scoreWriting: (taskType: string, prompt: string, essay: string, lang = "en") =>
    apiFetch<WritingScore>("/ielts/writing/score", {
      method: "POST",
      body: { task_type: taskType, prompt, essay, lang },
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
