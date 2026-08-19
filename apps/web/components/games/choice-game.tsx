"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldAlert, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ChoiceItem, GameProps } from "@/components/games/game-player";
import { speak } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Speed Quiz, Fill the Blank, Listen & Guess, and Boss Battle — multiple-choice. */
export function ChoiceGame({
  items,
  games,
  isAudio,
  fill,
  boss = false,
  onAnswer,
  onComplete,
}: GameProps & { items: ChoiceItem[]; isAudio: boolean; fill: boolean; boss?: boolean }) {
  const [index, setIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const item = items[index];

  function resolve() {
    if (index + 1 < items.length) setIndex(index + 1);
    else onComplete();
  }

  return (
    <div>
      {boss && (
        <div className="mb-5 rounded-lg border border-danger/25 bg-danger/5 p-3">
          <div className="flex items-center justify-between text-sm">
            <motion.span
              animate={hits ? { rotate: [0, -8, 8, 0], scale: [1, 0.9, 1] } : undefined}
              className="flex size-9 items-center justify-center rounded-lg bg-danger/10 text-danger"
            >
              <ShieldAlert className="size-5" aria-hidden />
            </motion.span>
            <span className="text-xs font-bold text-danger">{games.bossHp}</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-linear-to-r from-danger to-danger/70 transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - (hits / items.length) * 100)}%` }}
            />
          </div>
        </div>
      )}
      <ChoiceQuestion
        key={index}
        item={item}
        games={games}
        isAudio={isAudio}
        fill={fill}
        onResolved={(correct, durationMs, submitted) => {
          if (correct && boss) setHits((h) => h + 1);
          onAnswer(item.question.card_id, correct, durationMs, submitted);
          window.setTimeout(resolve, 850);
        }}
      />
    </div>
  );
}

function ChoiceQuestion({
  item,
  games,
  isAudio,
  fill,
  onResolved,
}: {
  item: ChoiceItem;
  games: GameProps["games"];
  isAudio: boolean;
  fill: boolean;
  onResolved: (correct: boolean, durationMs: number, submitted: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(0);
  const { question, options } = item;

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (isAudio) speak(question.audio_text ?? question.answer);
  }, [isAudio, question]);

  // Assigned directly as the click handler (not wrapped in an arrow) so the
  // React compiler recognizes it as an event handler and permits Date.now().
  function choose(event: React.MouseEvent<HTMLButtonElement>) {
    if (picked) return;
    const option = event.currentTarget.dataset.option ?? "";
    setPicked(option);
    onResolved(option === question.answer, Date.now() - shownAt.current, option);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface-panel mt-6 rounded-lg p-7 text-center sm:p-8"
      >
        {isAudio ? (
          <button
            type="button"
            onClick={() => speak(question.audio_text ?? question.answer)}
            className="mx-auto flex size-20 items-center justify-center rounded-full border border-brand-400/30 bg-brand-600/10 text-brand-600 shadow-[0_14px_38px_rgba(7,58,53,0.16)] transition-transform hover:scale-105 dark:text-brand-200"
            aria-label={games.tapToHear}
          >
            <Volume2 className="size-8" aria-hidden />
          </button>
        ) : fill ? (
          <p className="text-xl font-semibold leading-relaxed text-ink">{question.prompt}</p>
        ) : (
          <p className="text-4xl font-extrabold tracking-tight text-ink">{question.prompt}</p>
        )}
        {isAudio && <p className="mt-3 text-sm text-ink-soft">{games.tapToHear}</p>}
      </motion.div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isAnswer = option === question.answer;
          const state = picked
            ? isAnswer
              ? "correct"
              : option === picked
                ? "wrong"
                : "idle"
            : "idle";
          return (
            <motion.button
              key={option}
              type="button"
              data-option={option}
              disabled={!!picked}
              onClick={choose}
              whileHover={!picked ? { y: -2 } : undefined}
              whileTap={!picked ? { scale: 0.98 } : undefined}
              animate={state === "wrong" ? { x: [0, -5, 5, 0] } : undefined}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-lg border px-4 py-3.5 text-left font-semibold shadow-sm transition-colors",
                state === "idle" && "border-line bg-card text-ink hover:border-brand-400",
                state === "correct" && "border-success bg-success/10 text-success",
                state === "wrong" && "border-danger bg-danger/10 text-danger"
              )}
            >
              <span>{option}</span>
              <AnimatePresence>
                {state === "correct" && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="size-5" aria-hidden />
                  </motion.span>
                )}
                {state === "wrong" && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <X className="size-5" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

export function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 to-accent-500 transition-all duration-300"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-ink-soft">
        {index + 1}/{total}
      </span>
    </div>
  );
}
