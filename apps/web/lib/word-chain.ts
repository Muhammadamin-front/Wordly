import { API_URL, getAccessToken } from "@/lib/api";

export type WordChainPlayerStatus = "active" | "eliminated" | "disconnected";

export interface WordChainPlayer {
  id: string;
  username: string;
  avatar_url: string | null;
  is_bot: boolean;
  status: WordChainPlayerStatus;
  lives_remaining: number;
  streak: number;
  words_submitted: number;
  word_history: string[];
  eliminated_at_round: number | null;
  eliminated_reason: string | null;
}

export interface WordChainChallenge {
  kind: "min_length" | "minimum_vowels" | "longer_than_last";
  target: number;
}

export interface LetterStats {
  letter: string;
  available_words: number;
  used_words: number;
  remaining_words: number;
  is_restricted: boolean;
}

export interface WordChainState {
  code: string;
  status: "waiting" | "playing" | "finished";
  host_id: string;
  round: number;
  turn: number;
  current_player_id: string | null;
  current_letter: string;
  last_word: string | null;
  time_limit: number;
  turn_started_at: number | null;
  turn_ends_at: number | null;
  server_now: number;
  used_words: string[];
  players: WordChainPlayer[];
  active_players: number;
  eliminated_players: number;
  winner_id: string | null;
  started_at: number | null;
  finished_at: number | null;
  duration_seconds: number | null;
  letter_stats: Record<string, LetterStats>;
  challenge: WordChainChallenge | null;
  matchmaking_status: "searching" | "matched" | null;
  last_event: {
    kind: "game_started" | "word_accepted" | "life_lost" | "player_eliminated" | "game_finished";
    player_id?: string;
    winner_id?: string;
    word?: string;
    next_letter?: string;
    reason?: string;
    fallback_used?: boolean;
    challenge_completed?: boolean;
    streak?: number;
    lives_remaining?: number;
  } | null;
  config: {
    starting_time: number;
    minimum_time: number;
    minimum_word_length: number;
    difficult_letter_threshold: number;
    min_players: number;
    max_players: number;
    lives_per_player: number;
    streak_bonus_threshold: number;
    streak_time_bonus: number;
  };
}

export type WordRejectionReason =
  | "EMPTY_WORD"
  | "TOO_SHORT"
  | "UNSUPPORTED_CHARACTERS"
  | "INVALID_WORD"
  | "DICTIONARY_UNAVAILABLE"
  | "WRONG_LETTER"
  | "DUPLICATE_WORD"
  | "TIME_EXPIRED"
  | "NOT_YOUR_TURN"
  | "PLAYER_ELIMINATED"
  | "GAME_NOT_PLAYING";

export type WordChainError =
  | "unauthorized"
  | "rate_limited"
  | "room_not_found"
  | "already_started"
  | "room_full"
  | "forbidden"
  | "not_enough_players"
  | "dictionary_unavailable"
  | "connection_lost";

export type WordChainServerMessage =
  | { type: "authenticated" }
  | { type: "word_chain_state"; state: WordChainState }
  | { type: "word_rejected"; reason: WordRejectionReason; required_letter?: string }
  | { type: "word_chain_error"; error: WordChainError };

export type WordChainAction =
  | { action: "create" }
  | { action: "find_match" }
  | { action: "join"; code: string }
  | { action: "add_bot" }
  | { action: "start" }
  | { action: "submit_word"; word: string }
  | { action: "leave" };

const RESUME_KEY = "vocora:word-chain-room";

export function openWordChainSocket(): WebSocket {
  // Prefer the configured public API origin. This lets the production client
  // reach api.vocora.uz directly, where Nginx upgrades the socket. Keep the
  // same-origin fallback for local setups that intentionally omit it.
  const socketOrigin = API_URL
    ? API_URL.replace(/^http/, "ws")
    : window.location.origin.replace(/^http/, "ws");
  return new WebSocket(`${socketOrigin}/api/v1/ws/word-chain`);
}

export function authenticateWordChainSocket(socket: WebSocket): void {
  socket.send(JSON.stringify({ action: "authenticate", token: getAccessToken() ?? "" }));
}

export function sendWordChainAction(socket: WebSocket, action: WordChainAction): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(action));
}

export function rememberWordChainRoom(code: string | null): void {
  try {
    if (code) sessionStorage.setItem(RESUME_KEY, code);
    else sessionStorage.removeItem(RESUME_KEY);
  } catch {
    // Resuming is a convenience; storage denial must never block a game.
  }
}

export function recallWordChainRoom(): string | null {
  try {
    return sessionStorage.getItem(RESUME_KEY);
  } catch {
    return null;
  }
}
