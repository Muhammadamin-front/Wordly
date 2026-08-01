"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Flame,
  GraduationCap,
  Gauge,
  Layers3,
  Link2,
  MessageCircle,
  Music2,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  VolumeX,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
import { StoryGame } from "@/components/games/story-game";
import { TypingGame } from "@/components/games/typing-game";
import { useAmbientMusic } from "@/components/games/use-ambient-music";
import { WordSearchGame, buildWordSearch, type WordSearch } from "@/components/games/word-search-game";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { buildOptions, gamesApi, shuffle, type GameQuestion, type GameSource, type GameType } from "@/lib/games";
import { notifyQuestsChanged, notifyStatsChanged } from "@/lib/gamification";
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

type Phase = "choosing" | "loading" | "empty" | "error" | "playing" | "finishing" | "done";

// Games where the learner must hear spoken words clearly — no background music.
const AUDIO_GAMES: GameType[] = ["listening", "audio_guess", "speaking", "spelling_bee"];

interface SourceOption {
  key: string; // stable id
  label: string;
  source: GameSource;
  accent: string;
  icon: LucideIcon;
}

/** Word sources a player can pick before a game: their own cards, a CEFR
 *  level, or a corpus category. */
const SOURCE_OPTIONS = (games: Dictionary["games"]): SourceOption[] => [
  { key: "mine", label: games.sourceMine, source: {}, accent: "border-brand-400 bg-brand-500/10 text-ink", icon: Layers3 },
  { key: "A1", label: "A1", source: { level: "A1" }, accent: "border-green-400/50 text-green-600 dark:text-green-400", icon: BookOpen },
  { key: "A2", label: "A2", source: { level: "A2" }, accent: "border-emerald-400/50 text-emerald-600 dark:text-emerald-400", icon: BookOpen },
  { key: "B1", label: "B1", source: { level: "B1" }, accent: "border-brand-400/50 text-brand-500 dark:text-brand-300", icon: BookOpen },
  { key: "B2", label: "B2", source: { level: "B2" }, accent: "border-teal-400/50 text-teal-600 dark:text-teal-300", icon: BookOpen },
  { key: "C1", label: "C1", source: { level: "C1" }, accent: "border-accent-400/50 text-accent-600 dark:text-accent-300", icon: Sparkles },
  { key: "C2", label: "C2", source: { level: "C2" }, accent: "border-emerald-300/50 text-emerald-700 dark:text-emerald-200", icon: Sparkles },
  { key: "ielts", label: "IELTS", source: { category: "ielts" }, accent: "border-orange-400/50 text-orange-600 dark:text-orange-400", icon: GraduationCap },
  { key: "phrasal", label: games.sourcePhrasal, source: { category: "phrasal" }, accent: "border-yellow-400/50 text-yellow-600 dark:text-yellow-400", icon: Link2 },
  { key: "idioms", label: games.sourceIdioms, source: { category: "idioms" }, accent: "border-amber-500/50 text-amber-700 dark:text-amber-400", icon: MessageCircle },
];

export function GamePlayer({
  lang,
  gameType,
  games,
  gam,
  exitPath = "games",
  initialSource,
}: {
  lang: string;
  gameType: GameType;
  games: Dictionary["games"];
  gam: Dictionary["gam"];
  exitPath?: string;
  initialSource?: GameSource;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("choosing");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [source, setSource] = useState<GameSource>({});
  const [difficulty, setDifficulty] = useState<"guided" | "balanced" | "challenge">("guided");
  const [recentAccuracy, setRecentAccuracy] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionXp, setSessionXp] = useState(0);
  const [questCompletions, setQuestCompletions] = useState<string[]>([]);
  const answerQueue = useRef<Promise<void>>(Promise.resolve());
  const autoStarted = useRef(false);
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
          setSessionId(session.session_id);
          setPrepared(prepare(session.questions, gameType));
          setDifficulty(session.difficulty);
          setRecentAccuracy(session.recent_accuracy);
          setTotal(session.questions.length);
          setScore(0);
          setAttempts(0);
          setCombo(0);
          setBestCombo(0);
          setSessionXp(0);
          setQuestCompletions([]);
          answerQueue.current = Promise.resolve();
          setLastResult(null);
          setPhase("playing");
        })
        .catch((err) => {
          setPhase(err instanceof ApiError && err.status === 409 ? "empty" : "error");
        });
    },
    [gameType]
  );

  useEffect(() => {
    if (!ready || !user || !initialSource || autoStarted.current) return;
    autoStarted.current = true;
    setSource(initialSource);
    fetchSession(initialSource);
  }, [fetchSession, initialSource, ready, user]);

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
      setAttempts((value) => value + 1);
      setLastResult(correct);
      if (correct) {
        setScore((s) => s + 1);
        setCombo((value) => {
          const next = value + 1;
          setBestCombo((best) => Math.max(best, next));
          return next;
        });
      } else {
        setCombo(0);
      }
      if (!sessionId) return;
      answerQueue.current = answerQueue.current
        .then(async () => {
          const result = await gamesApi.answer(
            sessionId,
            cardId,
            gameType,
            submitted,
            durationMs
          );
          setSessionXp((value) => value + result.reward.xp_gained);
          if (result.quest_completions.length) {
            setQuestCompletions((current) => [
              ...new Set([...current, ...result.quest_completions]),
            ]);
          }
          notifyStatsChanged();
          notifyQuestsChanged();
        })
        .catch(() => {});
    },
    [gameType, sessionId]
  );

  const onComplete = useCallback(() => {
    setPhase("finishing");
    void answerQueue.current.finally(() => {
      notifyStatsChanged();
      notifyQuestsChanged();
      setPhase("done");
    });
  }, []);

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel mx-auto w-full max-w-lg rounded-lg p-5 text-center sm:p-7"
      >
        <span className="icon-tile mx-auto size-12 rounded-lg">
          <Target className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          {games.chooseSource}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {SOURCE_OPTIONS(games).map((opt, index) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.key}
                type="button"
                onClick={() => start(opt.source)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={`flex min-h-16 items-center gap-3 rounded-lg border bg-card/78 px-3 py-3 text-left text-sm font-bold shadow-sm backdrop-blur transition-shadow hover:shadow-lg ${opt.accent}`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span>{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-ink-soft">{games.sourceHint}</p>
      </motion.div>
    );
  }

  if (phase === "loading" || phase === "finishing") {
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
      <div className="mx-auto max-w-md py-12 text-center">
        <Alert tone="error">{games.loadError}</Alert>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={() => fetchSession(source)}>{games.tryAgain}</Button>
          <Button variant="secondary" onClick={changeSource}>{games.chooseSource}</Button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const resultLabel = pct === 100 ? games.perfectRound : pct >= 70 ? games.strongRound : games.keepGoing;
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel mx-auto max-w-lg overflow-hidden rounded-lg p-6 text-center sm:p-8"
      >
        <motion.div
          className="mx-auto flex size-20 items-center justify-center rounded-full border border-accent-400/40 bg-accent-400/12 text-accent-600 shadow-[0_18px_60px_rgba(184,137,47,0.24)] dark:text-accent-300"
          initial={{ scale: 0, rotate: -18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
        >
          <Trophy className="size-9" aria-hidden />
        </motion.div>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">{games.roundComplete}</h2>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{resultLabel}</p>
        <motion.p
          className="mt-5 text-5xl font-black text-brand-700 dark:text-brand-200"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
        >
          {score}/{total}
        </motion.p>
        <p className="mt-1 text-sm text-ink-soft">{games.yourScore}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-400/40 bg-accent-400/10 px-3 py-2 text-sm font-black text-ink">
            <Zap className="size-4 text-accent-600 dark:text-accent-300" aria-hidden />
            +{sessionXp} XP · {gam.sessionXp}
          </span>
          {questCompletions.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-success/35 bg-success/10 px-3 py-2 text-sm font-black text-success">
              <Check className="size-4" aria-hidden />
              {questCompletions.length} {gam.questsUnlocked}
            </span>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 divide-x divide-line border-y border-line py-4">
          <div>
            <p className="text-2xl font-black text-ink">{pct}%</p>
            <p className="mt-1 text-xs font-semibold uppercase text-ink-soft">{games.accuracy}</p>
          </div>
          <div>
            <p className="text-2xl font-black text-ink">{bestCombo}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-ink-soft">{games.bestCombo}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={playAgain}>
            <RotateCcw className="size-4" aria-hidden />
            {games.playAgain}
          </Button>
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
    <div
      className={`mx-auto w-full ${
        gameType === "crossword" ? "max-w-5xl" : gameType === "story_mode" ? "max-w-3xl" : "max-w-xl"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-ink-soft">
        <Gauge className="size-4 text-brand-600 dark:text-brand-300" aria-hidden />
        <span>{games.adaptiveLevel}: {games[difficulty]}</span>
        <span aria-hidden>·</span>
        <span>{recentAccuracy}% {games.recentAccuracy.toLowerCase()}</span>
      </div>
      <div className="mb-5 flex min-h-12 items-center gap-3 border-b border-line pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase text-ink-soft">
            <span>{games.progress}</span>
            <span>{Math.min(attempts, total)}/{total}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-brand-500 via-emerald-400 to-accent-400"
              animate={{ width: `${total ? (Math.min(attempts, total) / total) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {lastResult !== null && (
            <motion.span
              key={attempts}
              initial={{ opacity: 0, scale: 0.7, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex size-9 items-center justify-center rounded-full ${lastResult ? "bg-success/14 text-success" : "bg-danger/14 text-danger"}`}
              aria-label={lastResult ? games.correct : games.wrong}
            >
              {lastResult ? <Check className="size-5" /> : <X className="size-5" />}
            </motion.span>
          )}
        </AnimatePresence>

        <div className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-card/72 px-3 text-sm font-black text-ink shadow-sm">
          <Target className="size-4 text-brand-500" aria-hidden />
          {score}
        </div>
        <motion.div
          animate={combo > 1 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-black ${combo > 1 ? "border-accent-400/50 bg-accent-400/12 text-accent-700 dark:text-accent-300" : "border-line bg-card/72 text-ink-soft"}`}
          title={games.combo}
        >
          <Flame className="size-4" aria-hidden />
          {combo}x
        </motion.div>

        {musicEligible && (
          <button
            type="button"
            onClick={music.toggle}
            aria-label={games.music}
            title={games.music}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-card text-ink-soft transition-colors hover:text-ink"
          >
            {music.enabled ? <Music2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}
      </div>
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
      ) : gameType === "story_mode" ? (
        <StoryGame {...shared} items={prepared.choice} />
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
