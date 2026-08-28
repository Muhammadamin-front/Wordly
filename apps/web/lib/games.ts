import { API_URL, apiFetch, getAccessToken, waitForAccessToken } from "@/lib/api";
import type { Reward } from "@/lib/gamification";

export const GAME_TYPES = [
  "word_match",
  "speed_quiz",
  "fill_blank",
  "audio_guess",
  "typing_race",
  "memory",
  "hangman",
  "spelling_bee",
  "sentence_builder",
  "word_search",
  "crossword",
] as const;

/** M11 skill drills — same session/answer API, surfaced under /skills. */
export const SKILL_DRILLS = ["listening", "speaking"] as const;

export type GameType = (typeof GAME_TYPES)[number] | (typeof SKILL_DRILLS)[number];

/** Free tier reaches these game types directly; the rest need Basic/
 * Speaking Pro (402 from the API otherwise) — must match
 * app.services.plans.FREE_GAME_TYPES on the backend exactly. Purely a UI
 * hint for which tiles to render locked; the backend is the real gate. */
export const FREE_GAME_TYPES: readonly GameType[] = ["word_match", "speed_quiz", "fill_blank"];

export interface GameQuestion {
  card_id: string;
  prompt: string;
  answer: string;
  distractors: string[];
  audio_text: string | null;
}

export interface GameSession {
  session_id: string;
  game_type: GameType;
  difficulty: "guided" | "balanced" | "challenge";
  recent_accuracy: number;
  questions: GameQuestion[];
}

export interface GameAnswerResult {
  rating: string;
  reward: Reward;
  run: {
    answered_count: number;
    correct_count: number;
    total_questions: number;
    best_combo: number;
    completed: boolean;
    xp_earned: number;
    completion_bonus: number;
  } | null;
  quest_completions: string[];
}

/** Where a game pulls its words from: the learner's own due cards, a CEFR
 *  level, or a corpus category (ielts/phrasal/idioms). */
export interface GameSource {
  level?: string;
  category?: string;
}

export const gamesApi = {
  session: (gameType: GameType, count = 10, source: GameSource = {}) => {
    const params = new URLSearchParams({ count: String(count) });
    if (source.level) params.set("level", source.level);
    if (source.category) params.set("category", source.category);
    return apiFetch<GameSession>(`/games/${gameType}?${params}`, { auth: true });
  },

  // The server grades `answer` against the card — never trusts a client flag.
  answer: (
    sessionId: string,
    cardId: string,
    gameType: GameType,
    answer: string,
    durationMs?: number
  ) =>
    apiFetch<GameAnswerResult>("/games/answer", {
      method: "POST",
      body: {
        session_id: sessionId,
        card_id: cardId,
        game_type: gameType,
        answer,
        duration_ms: durationMs,
      },
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

/** Options for a multiple-choice question. The adaptive backend sends fewer
 * distractors for guided sessions and more for challenge sessions. */
export function buildOptions(question: GameQuestion): string[] {
  return shuffle([question.answer, ...question.distractors]);
}

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// Natural voice via the API's ElevenLabs proxy (server-side cached). Audio for
// a given text never changes, so blob URLs are memoized per session. A 503
// (TTS not configured) or 429 (rate limit) only pauses server audio for a
// short cooldown — never a permanent per-session latch — so a transient blip
// or redeploy self-heals instead of dropping everyone to the robotic browser
// voice for the rest of their visit.
const ttsCache = new Map<string, string>();
let serverTtsPausedUntil = 0;
let playing: HTMLAudioElement | null = null;

async function playServerVoice(text: string): Promise<void> {
  let url = ttsCache.get(text);
  if (!url) {
    if (Date.now() < serverTtsPausedUntil) throw new Error("server tts cooling down");
    const token = getAccessToken() ?? (await waitForAccessToken());
    if (!token) throw new Error("not authenticated");
    const response = await fetch(`${API_URL}/api/v1/tts?text=${encodeURIComponent(text)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      // Authentication can settle just after a click, so never turn a 401
      // into a provider cooldown. Only actual rate/provider failures back off.
      if (response.status === 429) serverTtsPausedUntil = Date.now() + 15_000;
      if (response.status === 502 || response.status === 503) {
        serverTtsPausedUntil = Date.now() + 30_000;
      }
      throw new Error(`tts ${response.status}`);
    }
    url = URL.createObjectURL(await response.blob());
    ttsCache.set(text, url);
  }
  playing?.pause();
  playing = new Audio(url);
  await playing.play();
}

/** Speak text via the server's natural ElevenLabs voice. No browser-TTS
 *  fallback: a robotic voice reads as broken, not as a degraded feature, so
 *  a transient failure here just means this one word stays silent — the
 *  cooldown logic in playServerVoice already self-heals for the next word. */
export function speak(text: string) {
  playServerVoice(text).catch(() => {});
}
