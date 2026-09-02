"use client";

import { motion } from "framer-motion";
import { Heart, HeartCrack, Sparkles, Skull } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";

import type { GameProps } from "@/components/games/game-player";
import type { GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

export function HangmanGame({
  questions,
  onAnswer,
  onComplete,
}: GameProps & { questions: GameQuestion[] }) {
  const [index, setIndex] = useState(0);
  const question = questions[index];

  function resolve() {
    if (index + 1 < questions.length) setIndex(index + 1);
    else onComplete();
  }

  return (
    <div>
      <HangmanRound
        key={index}
        question={question}
        onResolved={(correct, ms, submitted) => {
          onAnswer(question.card_id, correct, ms, submitted);
          window.setTimeout(resolve, 1100);
        }}
      />
    </div>
  );
}

function HangmanRound({
  question,
  onResolved,
}: {
  question: GameQuestion;
  onResolved: (correct: boolean, durationMs: number, submitted: string) => void;
}) {
  const answer = question.answer.toUpperCase();
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const done = useRef(false);

  const letters = answer.split("");
  const solved = letters.every((ch) => ch === " " || guessed.has(ch));
  const lost = wrong >= MAX_WRONG;

  function guess(event: MouseEvent<HTMLButtonElement>) {
    const letter = event.currentTarget.dataset.letter ?? "";
    if (done.current || guessed.has(letter) || solved || lost) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    const nowSolved = letters.every((ch) => ch === " " || next.has(ch));
    let nowWrong = wrong;
    if (!answer.includes(letter)) {
      nowWrong = wrong + 1;
      setWrong(nowWrong);
    }
    if (nowSolved || nowWrong >= MAX_WRONG) {
      done.current = true;
      // Difficulty-based duration (more wrong guesses = slower) keeps this pure —
      // no Date.now() during a mapped click handler.
      onResolved(nowSolved, 1500 + nowWrong * 800, nowSolved ? answer : "");
    }
  }

  return (
    <div>
      <div className="surface-panel mt-6 rounded-lg p-5 text-center sm:p-6">
        <motion.div
          animate={solved ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : lost ? { y: [0, -3, 0] } : { y: [0, -4, 0] }}
          transition={solved || lost ? { duration: 0.45 } : { repeat: Infinity, duration: 2.4 }}
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-full border",
            solved && "border-success/35 bg-success/10 text-success-text",
            lost && "border-danger/35 bg-danger/10 text-danger-text",
            !solved && !lost && "border-brand-400/35 bg-brand-500/10 text-brand-600 dark:text-brand-200"
          )}
        >
          {lost ? <Skull className="size-7" /> : <Sparkles className="size-7" />}
        </motion.div>
        <div className="mt-4 flex justify-center gap-1.5" aria-label={`${MAX_WRONG - wrong} lives`}>
          {Array.from({ length: MAX_WRONG }, (_, index) =>
            index < MAX_WRONG - wrong ? (
              <Heart key={index} className="size-4 fill-danger text-danger-text" aria-hidden />
            ) : (
              <HeartCrack key={index} className="size-4 text-ink-soft/35" aria-hidden />
            )
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-ink-soft">{question.prompt}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {letters.map((ch, i) =>
            ch === " " ? (
              <span key={i} className="w-3" />
            ) : (
              <span
                key={i}
                className="flex size-8 items-center justify-center border-b-2 border-ink text-xl font-extrabold text-ink"
              >
                {(guessed.has(ch) || lost) && (
                  <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    {ch}
                  </motion.span>
                )}
              </span>
            )
          )}
        </div>
        {lost && (
          <p className="mt-3 text-sm font-semibold text-danger-text">
            → {answer}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
        {LETTERS.map((letter) => {
          const used = guessed.has(letter);
          const hit = used && answer.includes(letter);
          return (
            <motion.button
              key={letter}
              type="button"
              data-letter={letter}
              disabled={used || solved || lost}
              onClick={guess}
              className={cn(
                "aspect-square rounded-lg border text-sm font-bold transition-colors",
                !used && "border-line bg-card text-ink hover:border-brand-400 hover:bg-brand-600/10",
                hit && "border-success/40 bg-success/20 text-success-text",
                used && !hit && "border-danger/30 bg-danger/15 text-danger-text"
              )}
              whileTap={!used ? { scale: 0.88 } : undefined}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
