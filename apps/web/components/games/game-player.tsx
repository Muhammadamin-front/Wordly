"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { ChoiceGame } from "@/components/games/choice-game";
import { buildCrossword, CrosswordGame, type Crossword } from "@/components/games/crossword-game";
import { DictationGame } from "@/components/games/dictation-game";
import { HangmanGame } from "@/components/games/hangman-game";
import { MatchGame } from "@/components/games/match-game";
import { MemoryGame, type Tile } from "@/components/games/memory-game";
import { SentenceGame, type SentenceItem } from "@/components/games/sentence-game";
import { SpeakingGame } from "@/components/games/speaking-game";
import { SpellingGame } from "@/components/games/spelling-game";
import { TypingGame } from "@/components/games/typing-game";
import { useAmbientMusic } from "@/components/games/use-ambient-music";
import { WordSearchGame, buildWordSearch, type WordSearch } from "@/components/games/word-search-game";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { buildOptions, gamesApi, shuffle, type GameQuestion, type GameSource, type GameType } from "@/lib/games";
import { notifyStatsChanged } from "@/lib/gamification";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export interface ChoiceItem {
  question: GameQuestion;
  options: string[];
}

/** All randomness happens here (post-fetch, never during render) so the game
 *  components stay pure. */
interface Prepared {
  questions: GameQuestion[];
  choice: ChoiceItem[];
  matchLeft: GameQuestion[];
  matchRight: GameQuestion[];
  tiles: Tile[];
  sentences: SentenceItem[];
  wordSearch: WordSearch;
  crossword: Crossword | null;
}

function prepare(questions: GameQuestion[], gameType: GameType): Prepared {
  const tiles: Tile[] = shuffle(
    questions.flatMap((q) => [
      { key: q.card_id + ":w", cardId: q.card_id, text: q.prompt },
      { key: q.card_id + ":t", cardId: q.card_id, text: q.answer },
    ])
  );
  const sentences: SentenceItem[] = questions.map((q) => {
    const words = q.answer.replace(/[.!?]$/, "").split(/\s+/);
    return { cardId: q.card_id, prompt: q.prompt, words, scrambled: shuffle(words.map((w, i) => ({ w, i }))) };
  });
  return {
    questions,
    choice: questions.map((question) => ({ question, options: buildOptions(question) })),
    matchLeft: shuffle(questions),
    matchRight: shuffle(questions),
    tiles,
    sentences,
    wordSearch: gameType === "word_search" ? buildWordSearch(questions) : { size: 0, grid: [], targets: [] },
    crossword: gameType === "crossword" ? buildCrossword(questions) : null,
  };
}

export interface GameProps {
  games: Dictionary["games"];
  // `submitted` is the learner's raw answer text — the server grades it.
  onAnswer: (cardId: string, correct: boolean, durationMs: number, submitted: string) => void;
  onComplete: () => void;
}

type Phase = "choosing" | "loading" | "empty" | "error" | "playing" | "done";

// Games where the learner must hear spoken words clearly — no background music.
const AUDIO_GAMES: GameType[] = ["listening", "audio_guess", "speaking", "spelling_bee"];

interface SourceOption {
  key: string; // stable id
  label: string;
  source: GameSource;
  accent: string;
}

/** Word sources a player can pick before a game: their own cards, a CEFR
 *  level, or a corpus category. */
const SOURCE_OPTIONS = (games: Dictionary["games"]): SourceOption[] => [
  { key: "mine", label: games.sourceMine, source: {}, accent: "border-brand-400 bg-brand-500/10 text-ink" },
  { key: "A1", label: "A1", source: { level: "A1" }, accent: "border-green-400/50 text-green-600 dark:text-green-400" },
  { key: "A2", label: "A2", source: { level: "A2" }, accent: "border-emerald-400/50 text-emerald-600 dark:text-emerald-400" },
  { key: "B1", label: "B1", source: { level: "B1" }, accent: "border-blue-400/50 text-blue-600 dark:text-blue-400" },
  { key: "B2", label: "B2", source: { level: "B2" }, accent: "border-indigo-400/50 text-indigo-600 dark:text-indigo-400" },
  { key: "C1", label: "C1", source: { level: "C1" }, accent: "border-purple-400/50 text-purple-600 dark:text-purple-400" },
  { key: "C2", label: "C2", source: { level: "C2" }, accent: "border-violet-400/50 text-violet-600 dark:text-violet-400" },
  { key: "ielts", label: "🎓 IELTS", source: { category: "ielts" }, accent: "border-orange-400/50 text-orange-600 dark:text-orange-400" },
  { key: "phrasal", label: `🔗 ${games.sourcePhrasal}`, source: { category: "phrasal" }, accent: "border-yellow-400/50 text-yellow-600 dark:text-yellow-400" },
  { key: "idioms", label: `💬 ${games.sourceIdioms}`, source: { category: "idioms" }, accent: "border-amber-500/50 text-amber-700 dark:text-amber-400" },
];

export function GamePlayer({
  lang,
  gameType,
  games,
  exitPath = "games",
}: {
  lang: string;
  gameType: GameType;
  games: Dictionary["games"];
  exitPath?: string;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("choosing");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<GameSource>({});
  const musicEligible = !AUDIO_GAMES.includes(gameType);
  const music = useAmbientMusic(musicEligible && phase === "playing");

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  // No synchronous setState here — phase transitions happen only once the
  // fetch resolves, keeping this safe to call from an effect/handler.
  const fetchSession = useCallback(
    (chosen: GameSource) => {
      setPhase("loading");
      gamesApi
        .session(gameType, 10, chosen)
        .then((session) => {
          setPrepared(prepare(session.questions, gameType));
          setTotal(session.questions.length);
          setScore(0);
          setPhase("playing");
        })
        .catch((err) => {
          setPhase(err instanceof ApiError && err.status === 409 ? "empty" : "error");
        });
    },
    [gameType]
  );

  const start = (chosen: GameSource) => {
    music.arm(); // inside the click gesture, so the browser allows audio
    setSource(chosen);
    fetchSession(chosen);
  };

  const playAgain = () => fetchSession(source);
  const changeSource = () => setPhase("choosing");

  const onAnswer = useCallback(
    (cardId: string, correct: boolean, durationMs: number, submitted: string) => {
      // `correct` drives only the cosmetic on-screen score; the server grades
      // `submitted` for XP/streak/league so those can't be farmed.
      if (correct) setScore((s) => s + 1);
      gamesApi.answer(cardId, gameType, submitted, durationMs).then(notifyStatsChanged).catch(() => {});
    },
    [gameType]
  );

  const onComplete = useCallback(() => setPhase("done"), []);

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span
          aria-label={games.loading}
          className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
        />
      </div>
    );
  }

  if (phase === "choosing") {
    return (
      <div className="mx-auto w-full max-w-md py-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          {games.chooseSource}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {SOURCE_OPTIONS(games).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => start(opt.source)}
              className={`rounded-xl border-2 bg-card px-2 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${opt.accent}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft">{games.sourceHint}</p>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span
          aria-label={games.loading}
          className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
        />
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-5xl" aria-hidden>
          🃏
        </p>
        <p className="mt-4 text-ink-soft">{games.needWords}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={changeSource}>{games.chooseSource}</Button>
          <Link href={`/${lang}/decks`}>
            <Button variant="secondary">{games.addWords}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md py-16">
        <Alert tone="error">{games.loading}</Alert>
      </div>
    );
  }

  if (phase === "done") {
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-md py-16 text-center"
      >
        <motion.p
          className="text-6xl"
          aria-hidden
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
        >
          {pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "💪"}
        </motion.p>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">{games.roundComplete}</h2>
        <motion.p
          className="mt-2 text-4xl font-extrabold text-brand-600 dark:text-brand-300"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
        >
          {score}/{total}
        </motion.p>
        <p className="mt-1 text-sm text-ink-soft">{games.yourScore}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={playAgain}>{games.playAgain}</Button>
          <Button variant="secondary" onClick={changeSource}>
            {games.chooseSource}
          </Button>
          <Link href={`/${lang}/${exitPath}`}>
            <Button variant="ghost">{games.exit}</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!prepared) return null;
  const shared: GameProps = { games, onAnswer, onComplete };

  return (
    <div className="mx-auto w-full max-w-xl">
      {musicEligible && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={music.toggle}
            aria-label={games.music}
            title={games.music}
            className="rounded-full border border-line bg-card px-2.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            {music.enabled ? "🎵" : "🔇"}
          </button>
        </div>
      )}
      {gameType === "typing_race" ? (
        <TypingGame {...shared} questions={prepared.questions} />
      ) : gameType === "word_match" ? (
        <MatchGame {...shared} left={prepared.matchLeft} right={prepared.matchRight} />
      ) : gameType === "memory" ? (
        <MemoryGame {...shared} tiles={prepared.tiles} pairCount={prepared.questions.length} />
      ) : gameType === "hangman" ? (
        <HangmanGame {...shared} questions={prepared.questions} />
      ) : gameType === "spelling_bee" ? (
        <SpellingGame {...shared} questions={prepared.questions} />
      ) : gameType === "sentence_builder" ? (
        <SentenceGame {...shared} items={prepared.sentences} />
      ) : gameType === "word_search" ? (
        <WordSearchGame {...shared} search={prepared.wordSearch} />
      ) : gameType === "crossword" && prepared.crossword ? (
        <CrosswordGame {...shared} crossword={prepared.crossword} />
      ) : gameType === "listening" ? (
        <DictationGame {...shared} questions={prepared.questions} />
      ) : gameType === "speaking" ? (
        <SpeakingGame {...shared} questions={prepared.questions} />
      ) : (
        <ChoiceGame
          {...shared}
          items={prepared.choice}
          isAudio={gameType === "audio_guess"}
          fill={gameType === "fill_blank"}
          boss={gameType === "boss_battle"}
        />
      )}
    </div>
  );
}
