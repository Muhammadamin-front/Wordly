import { API_URL, apiFetch, getAccessToken } from "@/lib/api";
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
  "crossword",
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
  answer: (cardId: string, gameType: GameType, answer: string, durationMs?: number) =>
    apiFetch<GameAnswerResult>("/games/answer", {
      method: "POST",
      body: { card_id: cardId, game_type: gameType, answer, duration_ms: durationMs },
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
    const token = getAccessToken();
    if (!token) throw new Error("not authenticated");
    const response = await fetch(`${API_URL}/api/v1/tts?text=${encodeURIComponent(text)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      // 429 (rate limit) recovers quickly; 503 (not configured) may be a
      // deploy in progress — back off briefly either way, then retry.
      serverTtsPausedUntil = Date.now() + (response.status === 429 ? 15_000 : 120_000);
      throw new Error(`tts ${response.status}`);
    }
    url = URL.createObjectURL(await response.blob());
    ttsCache.set(text, url);
  }
  playing?.pause();
  playing = new Audio(url);
  await playing.play();
}

function speakBrowser(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/** Speak text — natural server voice when available, browser TTS otherwise. */
export function speak(text: string) {
  playServerVoice(text).catch(() => speakBrowser(text));
}
