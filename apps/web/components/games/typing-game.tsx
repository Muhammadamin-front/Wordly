"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Keyboard, Timer } from "lucide-react";

import type { GameProps } from "@/components/games/game-player";
import { Button } from "@/components/ui/button";
import { normalize, type GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Typing Race — show the translation, type the English word. */
export function TypingGame({
  questions,
  games,
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
      <TypingQuestion
        key={index}
        question={question}
        games={games}
        onResolved={(correct, durationMs, submitted) => {
          onAnswer(question.card_id, correct, durationMs, submitted);
          window.setTimeout(resolve, 950);
        }}
      />
    </div>
  );
}

function TypingQuestion({
  question,
  games,
  onResolved,
}: {
  question: GameQuestion;
  games: GameProps["games"];
  onResolved: (correct: boolean, durationMs: number, submitted: string) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const shownAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shownAt.current = Date.now();
    inputRef.current?.focus();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (result) return;
    const correct = normalize(value) === normalize(question.answer);
    setResult(correct ? "correct" : "wrong");
    onResolved(correct, Date.now() - shownAt.current, value);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel mt-6 rounded-lg p-7 text-center sm:p-8"
      >
        <span className="mx-auto flex size-10 items-center justify-center rounded-lg border border-brand-400/30 bg-brand-500/10 text-brand-600 dark:text-brand-200">
          <Timer className="size-5" aria-hidden />
        </span>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{question.prompt}</p>
      </motion.div>

      <form onSubmit={submit} className="mt-4">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={games.typeAnswer}
          className={cn(
            "h-14 w-full rounded-lg border-2 bg-card px-4 text-center text-xl font-bold text-ink outline-none transition-colors",
            result === "correct" && "border-success bg-success/10 text-success-text",
            result === "wrong" && "border-danger bg-danger/10 text-danger-text",
            !result && "border-line focus:border-brand-400"
          )}
        />
        {result === "wrong" && (
          <p className="mt-2 text-center text-sm text-ink-soft">
            → <strong className="text-ink">{question.answer}</strong>
          </p>
        )}
        <Button type="submit" fullWidth className="mt-4" disabled={!!result || !value.trim()}>
          <Keyboard className="size-4" aria-hidden />
          {games.check}
        </Button>
      </form>
    </>
  );
}
