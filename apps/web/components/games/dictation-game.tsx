"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Headphones, Volume2 } from "lucide-react";

import type { GameProps } from "@/components/games/game-player";
import { Button } from "@/components/ui/button";
import { speak, type GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Punctuation-insensitive comparison — learners shouldn't fail a dictation
 *  over a missing full stop or apostrophe. */
function looseNormalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"’‘“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Listening — hear a sentence, type what you hear. */
export function DictationGame({
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
      <DictationRound
        key={index}
        question={question}
        games={games}
        onResolved={(correct, ms, submitted) => {
          onAnswer(question.card_id, correct, ms, submitted);
          window.setTimeout(resolve, 1400);
        }}
      />
    </div>
  );
}

function DictationRound({
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
  const sentence = question.audio_text ?? question.answer;

  useEffect(() => {
    shownAt.current = Date.now();
    speak(sentence);
  }, [sentence]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (result) return;
    const correct = looseNormalize(value) === looseNormalize(question.answer);
    setResult(correct ? "correct" : "wrong");
    onResolved(correct, Date.now() - shownAt.current, value);
  }

  return (
    <div>
      <div className="surface-panel mt-6 rounded-lg p-7 text-center sm:p-8">
        <motion.button
          type="button"
          onClick={() => speak(sentence)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="mx-auto flex size-20 items-center justify-center rounded-full border border-brand-400/35 bg-brand-500/12 text-brand-600 shadow-[0_14px_38px_rgba(7,58,53,0.18)] dark:text-brand-200"
          aria-label={games.tapToHear}
        >
          <Volume2 className="size-8" aria-hidden />
        </motion.button>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft">
          <Headphones className="size-4" aria-hidden />
          {question.prompt}
        </p>
      </div>

      <form onSubmit={submit} className="mt-4">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={games.typeAnswer}
          className={cn(
            "h-14 w-full rounded-lg border-2 bg-card px-4 text-center text-lg font-semibold text-ink outline-none transition-colors",
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
          {games.check}
        </Button>
      </form>
    </div>
  );
}
