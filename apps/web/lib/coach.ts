import { apiFetch } from "@/lib/api";

export type CharacterKey = "gordon" | "mochi" | "alex" | "examiner" | "raj";
/** "ielts_full" is the continuous Part 1 -> 2 -> 3 test, advancing in
 *  place as the examiner speaks each transition; "ielts" is one part. */
export type CoachMode = "chat" | "ielts" | "ielts_full";

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

export type ExaminerAudioType = "static" | "dynamic";

export interface TurnResponse {
  reply: string;
  corrections: Correction[];
  reward: Reward;
  /** "static": `reply` is one of the examiner's scripted lines and its audio
   *  is already rendered — play it by id instead of synthesizing. */
  audio_type: ExaminerAudioType;
  static_audio_id: string | null;
  /** Set only on the turn that moves a continuous test into a new part. */
  ielts_part: number | null;
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

export interface VoiceQuota {
  premium: boolean;
  allowance_seconds: number;
  used_seconds: number;
  remaining_seconds: number;
}

export const coachApi = {
  characters: () => apiFetch<Character[]>("/coach/characters", { auth: true }),

  dashboard: () => apiFetch<CoachDashboard>("/coach/dashboard", { auth: true }),

  /** The weekly speaking allowance, so it can be shown before a session
   *  rather than discovered when the minutes run out mid-conversation. */
  voiceQuota: () => apiFetch<VoiceQuota>("/coach/voice-quota", { auth: true }),

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
