import { apiFetch } from "@/lib/api";
import type { Reward } from "@/lib/gamification";

export const GAME_TYPES = [
  "word_match",
  "speed_quiz",
  "fill_blank",
  "audio_guess",
  "typing_race",
  "memory",
  "boss_battle",
  "hangman",
  "spelling_bee",
  "sentence_builder",
  "word_search",
] as const;

/** M11 skill drills — same session/answer API, surfaced under /skills. */
export const SKILL_DRILLS = ["listening", "speaking"] as const;

export type GameType = (typeof GAME_TYPES)[number] | (typeof SKILL_DRILLS)[number];

export interface GameQuestion {
  card_id: string;
  prompt: string;
  answer: string;
  distractors: string[];
  audio_text: string | null;
}

export interface GameSession {
  game_type: GameType;
  questions: GameQuestion[];
}

export interface GameAnswerResult {
  rating: string;
  reward: Reward;
}

export const gamesApi = {
  session: (gameType: GameType, count = 10) =>
    apiFetch<GameSession>(`/games/${gameType}?count=${count}`, { auth: true }),

  answer: (cardId: string, correct: boolean, durationMs?: number) =>
    apiFetch<GameAnswerResult>("/games/answer", {
      method: "POST",
      body: { card_id: cardId, correct, duration_ms: durationMs },
      auth: true,
    }),
};

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Options for a multiple-choice question: correct answer + up to 3 distractors. */
export function buildOptions(question: GameQuestion): string[] {
  return shuffle([question.answer, ...question.distractors.slice(0, 3)]);
}

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Speak text using the browser's built-in TTS (no server audio needed). */
export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
