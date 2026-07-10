"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { ChoiceGame } from "@/components/games/choice-game";
import { HangmanGame } from "@/components/games/hangman-game";
import { MatchGame } from "@/components/games/match-game";
import { MemoryGame, type Tile } from "@/components/games/memory-game";
import { SentenceGame, type SentenceItem } from "@/components/games/sentence-game";
import { SpellingGame } from "@/components/games/spelling-game";
import { TypingGame } from "@/components/games/typing-game";
import { WordSearchGame, buildWordSearch, type WordSearch } from "@/components/games/word-search-game";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { buildOptions, gamesApi, shuffle, type GameQuestion, type GameType } from "@/lib/games";
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
  };
}

export interface GameProps {
  games: Dictionary["games"];
  onAnswer: (cardId: string, correct: boolean, durationMs: number) => void;
  onComplete: () => void;
}

type Phase = "loading" | "empty" | "error" | "playing" | "done";

export function GamePlayer({
  lang,
  gameType,
  games,
}: {
  lang: string;
  gameType: GameType;
  games: Dictionary["games"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  // No synchronous setState here — phase starts "loading" and only updates
  // once the fetch resolves, keeping this safe to call from an effect.
  const fetchSession = useCallback(() => {
    gamesApi
      .session(gameType)
      .then((session) => {
        setPrepared(prepare(session.questions, gameType));
        setTotal(session.questions.length);
        setScore(0);
        setPhase("playing");
      })
      .catch((err) => {
        setPhase(err instanceof ApiError && err.status === 409 ? "empty" : "error");
      });
  }, [gameType]);

  useEffect(() => {
    if (ready && user) fetchSession();
  }, [ready, user, fetchSession]);

  const playAgain = () => {
    setPhase("loading");
    fetchSession();
  };

  const onAnswer = useCallback((cardId: string, correct: boolean, durationMs: number) => {
    if (correct) setScore((s) => s + 1);
    gamesApi.answer(cardId, correct, durationMs).then(notifyStatsChanged).catch(() => {});
  }, []);

  const onComplete = useCallback(() => setPhase("done"), []);

  if (!ready || phase === "loading") {
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
        <Link href={`/${lang}/decks`} className="mt-6 inline-block">
          <Button>{games.addWords}</Button>
        </Link>
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
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-6xl" aria-hidden>
          {pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "💪"}
        </p>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">{games.roundComplete}</h2>
        <p className="mt-2 text-4xl font-extrabold text-brand-600 dark:text-brand-300">
          {score}/{total}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{games.yourScore}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={playAgain}>{games.playAgain}</Button>
          <Link href={`/${lang}/games`}>
            <Button variant="secondary">{games.exit}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!prepared) return null;
  const shared: GameProps = { games, onAnswer, onComplete };

  return (
    <div className="mx-auto w-full max-w-xl">
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
