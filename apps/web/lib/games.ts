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

let browserVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function rankVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;
  if (lang === "en-us") score += 40;
  else if (lang.startsWith("en-")) score += 28;
  else if (lang.startsWith("en")) score += 18;
  if (/natural|neural|premium|enhanced|online/i.test(voice.name)) score += 35;
  if (/google|microsoft|apple/i.test(voice.name)) score += 18;
  if (/aria|jenny|guy|samantha|daniel|karen|moira|alex|ava|emma|brian/i.test(name)) score += 16;
  if (/compact|eloquence|robot|novelty/i.test(name)) score -= 30;
  return score;
}

function pickBrowserVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  browserVoice = [...english].sort((a, b) => rankVoice(b) - rankVoice(a))[0] ?? voices[0] ?? null;
  return browserVoice;
}

function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve([]);
  const current = window.speechSynthesis.getVoices();
  if (current.length) return Promise.resolve(current);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const timeout = window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 600);
    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
  return voicesReady;
}

async function speakBrowser(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = await loadBrowserVoices();
  const voice = browserVoice ?? pickBrowserVoice(voices);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = 0.86;
  utterance.pitch = 1.02;
  window.speechSynthesis.speak(utterance);
}

/** Speak text — natural server voice when available, polished browser TTS otherwise. */
export function speak(text: string) {
  playServerVoice(text).catch(() => void speakBrowser(text));
}
