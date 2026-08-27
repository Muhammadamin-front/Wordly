import { API_URL, getAccessToken } from "@/lib/api";

export interface RoomPlayer {
  user_id: string;
  name: string;
  connected: boolean;
}

export interface ScoreRow {
  rank: number;
  user_id: string;
  name: string;
  score: number;
}

export interface LeaderboardRow extends ScoreRow {
  previous_rank: number | null;
  delta: number;
}

export interface QuestionResultRow {
  user_id: string;
  option_index: number | null;
  correct: boolean;
  points: number;
  streak: number;
}

export interface Explanation {
  translation_uz: string;
  example_en?: string;
}

export interface PersonalSummary {
  score: number;
  rank: number | null;
  /** Already a 0-100 percentage, not a 0-1 fraction. */
  accuracy: number;
  correct_count: number;
  total: number;
  avg_response_ms: number | null;
  fastest_response_ms: number | null;
  best_streak: number;
  /** Values are 0-100 percentages, not 0-1 fractions. */
  category_accuracy: Record<string, number>;
}

export interface ReviewItem {
  index: number;
  prompt: string;
  options: string[];
  answer_index: number;
  your_answer_index: number | null;
  explanation: Explanation | null;
  category: string;
}

export const QUIZ_MODES = ["vocab", "grammar", "pairs", "mixed"] as const;
export type QuizMode = (typeof QUIZ_MODES)[number];

export const TIMER_OPTIONS = [10, 15, 20, 30] as const;
export type TimerSeconds = (typeof TIMER_OPTIONS)[number];

export const ERROR_CODES = [
  "unauthorized",
  "rate_limited",
  "room_not_found",
  "already_started",
  "room_full",
  "not_enough_words",
  "forbidden",
  "round_closed",
  // Client-only: the socket closed unexpectedly (network drop, server
  // restart, failed handshake) rather than the server ever rejecting us.
  "connection_lost",
] as const;
export type MultiplayerError = (typeof ERROR_CODES)[number];

/** Messages the server pushes down the socket. Every timed message carries
 *  `ends_at`/`server_now` (epoch ms) so the client can render a locally
 *  drift-corrected countdown without trusting its own clock as the source
 *  of truth — see lib/multiplayer-timer.ts. */
export type ServerMessage =
  | { type: "lobby"; code: string; host_id: string; players: RoomPlayer[]; phase: "lobby" }
  | { type: "countdown"; ends_at: number; server_now: number }
  | {
      type: "question";
      index: number;
      total: number;
      prompt: string;
      options: string[];
      mode: QuizMode;
      category: string;
      started_at: number;
      ends_at: number;
      server_now: number;
    }
  | {
      type: "question_result";
      index: number;
      answer_index: number;
      explanation: Explanation | null;
      results: QuestionResultRow[];
      ends_at: number;
      server_now: number;
    }
  | {
      type: "leaderboard";
      index: number;
      total: number;
      board: LeaderboardRow[];
      ends_at: number;
      server_now: number;
    }
  | {
      type: "finished";
      board: ScoreRow[];
      summaries: Record<string, PersonalSummary>;
      review: Record<string, ReviewItem[]>;
    }
  | { type: "host_changed"; host_id: string; reason: "disconnected" | "left" }
  | { type: "player_status"; user_id: string; connected: boolean }
  | { type: "error"; error: MultiplayerError };

/** Actions the client sends up the socket. */
export type ClientAction =
  | { action: "create" }
  | { action: "join"; code: string }
  | { action: "leave" }
  | { action: "start"; level: string; mode: QuizMode; timer_seconds: TimerSeconds }
  | { action: "answer"; index: number; option: number }
  | { action: "skip" };

const RESUME_CODE_KEY = "vocora:mp-resume-code";

/** Non-secret — a room code is already visible to every player in the
 *  roster. Remembering it across a page reload is what lets "join" (already
 *  idempotent per user_id server-side) resume a live game instead of
 *  dropping the player back to a blank menu. */
export function rememberRoomCode(code: string | null): void {
  try {
    if (code) window.sessionStorage.setItem(RESUME_CODE_KEY, code);
    else window.sessionStorage.removeItem(RESUME_CODE_KEY);
  } catch {
    // Not remembering the code just means no auto-resume offer — not fatal.
  }
}

export function recallRoomCode(): string | null {
  try {
    return window.sessionStorage.getItem(RESUME_CODE_KEY);
  } catch {
    return null;
  }
}

/** Opens the quiz WebSocket, authenticating via the in-memory access token. */
export function openQuizSocket(): WebSocket {
  const base = API_URL.replace(/^http/, "ws");
  const token = getAccessToken() ?? "";
  return new WebSocket(`${base}/api/v1/ws/quiz?token=${encodeURIComponent(token)}`);
}

export function sendAction(socket: WebSocket, action: ClientAction): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(action));
}
