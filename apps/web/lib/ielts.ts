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

export interface WritingPieChart {
  title: string;
  slices: WritingPieSlice[];
}

export interface WritingMapFeature {
  name: string;
  kind: "water" | "road" | "building" | "green";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WritingMap {
  title: string;
  features: WritingMapFeature[];
}

export interface WritingSecondaryChart {
  title: string;
  y_label?: string;
  categories: string[];
  series: WritingChartSeries[];
}

export interface WritingTaskVisual {
  kind: "line" | "bar" | "table" | "bar-pie" | "pie-pair" | "process" | "image" | "map-pair" | "bar-line";
  title: string;
  y_label?: string;
  categories: string[];
  series: WritingChartSeries[];
  pie?: WritingPieSlice[];
  pies?: WritingPieChart[];
  maps?: WritingMap[];
  secondary?: WritingSecondaryChart;
  // "image" only: a real diagram or chart under /public, shown as-is instead of
  // being redrawn from categories/series the way the data-driven kinds are.
  image?: string;
  image_alt?: string;
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
  /** Short practice sets cannot resolve a single band — show a range instead. */
  approximate: boolean;
  answers: number[];
  /** Why each answer is right, in question order. Empty for bank items, which
   *  have hand-written passages but no explanations yet. */
  explanations: string[];
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

export type WritingFeedbackStatus = "good" | "improve" | "error";

export type WritingFeedbackCategory =
  | "grammar"
  | "vocabulary"
  | "collocation"
  | "articles"
  | "prepositions"
  | "word_form"
  | "tense"
  | "subject_verb_agreement"
  | "sentence_structure"
  | "punctuation"
  | "cohesion"
  | "logic"
  | "style"
  | "spelling";

export interface WritingSentenceFeedback {
  sentence_number: number;
  sentence: string;
  highlight: string;
  status: WritingFeedbackStatus;
  category: WritingFeedbackCategory;
  explanation: string;
  use_instead: string;
  why: string;
}

export interface WritingGoodPoint {
  title: string;
  evidence: string;
  explanation: string;
}

export interface WritingImprovementArea {
  title: string;
  evidence: string;
  action: string;
}

export interface WritingLanguageUpgrade {
  used: string;
  use_instead: string;
  why: string;
}

export interface WritingRepetition {
  word: string;
  frequency: number;
  problem: string;
  alternatives: string[];
}

export interface WritingObservation {
  quote: string;
  explanation: string;
}

export interface WritingCohesionAnalysis {
  strengths: WritingObservation[];
  issues: WritingObservation[];
  opportunities: string[];
}

export interface WritingGrammarProfile {
  strengths: WritingObservation[];
  weaknesses: WritingObservation[];
}

export interface WritingBandPlan {
  current_band: number;
  target_band: number;
  actions: string[];
}

export interface WritingAnalysis {
  sentence_feedback: WritingSentenceFeedback[];
  good_points: WritingGoodPoint[];
  areas_to_improve: WritingImprovementArea[];
  language_upgrades: WritingLanguageUpgrade[];
  repetitions: WritingRepetition[];
  cohesion: WritingCohesionAnalysis;
  grammar_profile: WritingGrammarProfile;
  band_plan: WritingBandPlan;
  next_steps: string[];
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
  analysis: WritingAnalysis;
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

  scoreWriting: (taskType: string, prompt: string, essay: string, lang = "en", mockSessionId?: string) =>
    apiFetch<WritingScore>("/ielts/writing/score", {
      method: "POST",
      body: { task_type: taskType, prompt, essay, lang, mock_session_id: mockSessionId },
      auth: true,
      // A grounded, sentence-level report is intentionally a longer model
      // call than ordinary API actions. Match the server-side AI allowance so
      // the browser does not abandon a healthy report after the global 15s.
      timeoutMs: 75_000,
    }),

  generate: (kind: ComprehensionKind, band = 6) =>
    apiFetch<GeneratedTest>(`/ielts/${kind}/generate`, {
      method: "POST",
      body: { band },
      auth: true,
    }),

  submit: (kind: ComprehensionKind, testId: string, answers: number[], mockSessionId?: string) =>
    apiFetch<GradeResult>(`/ielts/${kind}/submit`, {
      method: "POST",
      body: { test_id: testId, answers, mock_session_id: mockSessionId },
      auth: true,
    }),
};

export const BAND_COLOR = (band: number): string => {
  if (band >= 7.5) return "text-accent-text";
  if (band >= 6.5) return "text-brand-500";
  if (band >= 5.5) return "text-brand-400";
  return "text-brand-600";
};
