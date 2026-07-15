"use client";

import { useRef, useState, type MouseEvent } from "react";

import { Progress } from "@/components/games/choice-game";
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
      <Progress index={index} total={questions.length} />
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
      <div className="mt-6 rounded-xl2 border border-line bg-card p-6 text-center">
        <p className="text-6xl" aria-hidden>
          {lost ? "💀" : solved ? "🎉" : "🪢"}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {"❤️".repeat(MAX_WRONG - wrong)}
          <span className="opacity-30">{"🖤".repeat(wrong)}</span>
        </p>
        <p className="mt-3 text-sm text-ink-soft">🇺🇿 {question.prompt}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {letters.map((ch, i) =>
            ch === " " ? (
              <span key={i} className="w-3" />
            ) : (
              <span
                key={i}
                className="flex size-8 items-center justify-center border-b-2 border-ink text-xl font-extrabold text-ink"
              >
                {guessed.has(ch) || lost ? ch : ""}
              </span>
            )
          )}
        </div>
        {lost && (
          <p className="mt-3 text-sm font-semibold text-danger">
            → {answer}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
        {LETTERS.map((letter) => {
          const used = guessed.has(letter);
          const hit = used && answer.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              data-letter={letter}
              disabled={used || solved || lost}
              onClick={guess}
              className={cn(
                "aspect-square rounded-lg text-sm font-bold transition-colors",
                !used && "bg-card text-ink hover:bg-brand-600/10",
                hit && "bg-success/20 text-success",
                used && !hit && "bg-danger/15 text-danger"
              )}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
