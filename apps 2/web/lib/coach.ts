import { apiFetch } from "@/lib/api";

export type CharacterKey = "gordon" | "mochi" | "alex" | "examiner";
export type CoachMode = "chat" | "ielts";

export interface Character {
  key: CharacterKey;
  name: string;
  emoji: string;
  tagline: string;
  accent: string;
  pitch: number;
  rate: number;
}

export interface Correction {
  original: string;
  correction: string;
  explanation: string;
  category: string;
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
  corrections: Correction[];
  created_at: string;
}

export interface Reward {
  xp_gained: number;
  total_xp: number;
  level: number;
  leveled_up: boolean;
}

export interface CoachSession {
  id: string;
  character: CharacterKey;
  mode: CoachMode;
  ielts_part: number | null;
  topic: string | null;
  status: "active" | "done";
  turns: number;
  started_at: string;
  completed_at: string | null;
  messages: CoachMessage[];
}

export interface SessionListItem {
  id: string;
  character: CharacterKey;
  mode: CoachMode;
  ielts_part: number | null;
  topic: string | null;
  status: "active" | "done";
  turns: number;
  started_at: string;
}

export interface TurnResponse {
  reply: string;
  corrections: Correction[];
  reward: Reward;
}

export interface IeltsReport {
  band_overall: number;
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  strengths: string;
  improvements: string;
  homework: string;
  created_at: string;
}

export interface ScoreResponse {
  report: IeltsReport;
  reward: Reward;
}

export interface CharacterProgress {
  character: CharacterKey;
  sessions_count: number;
  messages_count: number;
  friendship_xp: number;
  friendship_level: number;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string | null;
  category: string;
  created_at: string;
}

export interface CoachDashboard {
  total_sessions: number;
  total_turns: number;
  total_errors: number;
  progress: CharacterProgress[];
  recent_errors: GrammarError[];
  latest_report: IeltsReport | null;
  enabled: boolean;
}

export interface CreateSessionBody {
  character: CharacterKey;
  mode: CoachMode;
  ielts_part?: number;
  topic?: string;
}

export const coachApi = {
  characters: () => apiFetch<Character[]>("/coach/characters", { auth: true }),

  dashboard: () => apiFetch<CoachDashboard>("/coach/dashboard", { auth: true }),

  sessions: () => apiFetch<SessionListItem[]>("/coach/sessions", { auth: true }),

  createSession: (body: CreateSessionBody) =>
    apiFetch<CoachSession>("/coach/sessions", { method: "POST", body, auth: true }),

  getSession: (id: string) =>
    apiFetch<CoachSession>(`/coach/sessions/${id}`, { auth: true }),

  sendMessage: (id: string, text: string) =>
    apiFetch<TurnResponse>(`/coach/sessions/${id}/message`, {
      method: "POST",
      body: { text },
      auth: true,
    }),

  score: (id: string) =>
    apiFetch<ScoreResponse>(`/coach/sessions/${id}/score`, { method: "POST", auth: true }),
};
