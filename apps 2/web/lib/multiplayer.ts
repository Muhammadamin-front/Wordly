import { API_URL, getAccessToken } from "@/lib/api";

export interface RoomPlayer {
  user_id: string;
  name: string;
}

export interface ScoreRow {
  rank: number;
  user_id: string;
  name: string;
  score: number;
}

export const QUIZ_MODES = ["vocab", "grammar", "pairs", "mixed"] as const;
export type QuizMode = (typeof QUIZ_MODES)[number];

/** Messages the server pushes down the socket. */
export type ServerMessage =
  | { type: "created"; code: string; host_id: string; players: RoomPlayer[]; phase: string }
  | { type: "lobby"; code: string; host_id: string; players: RoomPlayer[]; phase: string }
  | { type: "question"; index: number; total: number; prompt: string; options: string[]; mode?: QuizMode }
  | { type: "reveal"; answer_index: number; scoreboard: ScoreRow[] }
  | { type: "finished"; scoreboard: ScoreRow[] }
  | { type: "error"; error: string };

/** Actions the client sends up the socket. */
export type ClientAction =
  | { action: "create" }
  | { action: "join"; code: string }
  | { action: "start"; level: string; mode: QuizMode }
  | { action: "answer"; index: number; option: number }
  | { action: "next" };

/** Opens the quiz WebSocket, authenticating via the in-memory access token. */
export function openQuizSocket(): WebSocket {
  const base = API_URL.replace(/^http/, "ws");
  const token = getAccessToken() ?? "";
  return new WebSocket(`${base}/api/v1/ws/quiz?token=${encodeURIComponent(token)}`);
}

export function sendAction(socket: WebSocket, action: ClientAction): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(action));
}
