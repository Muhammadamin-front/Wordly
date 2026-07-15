"use client";

import { useState } from "react";

import type { GameProps } from "@/components/games/game-player";
import type { GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Word Match — tap a word on the left, then its translation on the right.
 *  The shuffled column orders are prepared by the parent (pure render here). */
export function MatchGame({
  left,
  right,
  onAnswer,
  onComplete,
}: GameProps & { left: GameQuestion[]; right: GameQuestion[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  function pickWord(cardId: string) {
    if (matched.has(cardId)) return;
    setSelected(cardId);
    setWrong(null);
  }

  function pickTranslation(cardId: string) {
    if (matched.has(cardId) || selected === null) return;
    if (cardId === selected) {
      const next = new Set(matched).add(cardId);
      setMatched(next);
      const matchedOk = !missed.has(cardId);
      const translation = left.find((q) => q.card_id === cardId)?.answer ?? "";
      onAnswer(cardId, matchedOk, 3000, matchedOk ? translation : "");
      setSelected(null);
      if (next.size === left.length) window.setTimeout(onComplete, 500);
    } else {
      setMissed((m) => new Set(m).add(selected));
      setWrong(cardId);
      window.setTimeout(() => setWrong(null), 500);
    }
  }

  const cell = (active: boolean, done: boolean, isWrong: boolean) =>
    cn(
      "w-full rounded-xl border px-3 py-3.5 text-center font-semibold transition-colors",
      done && "border-success/40 bg-success/10 text-success opacity-50",
      isWrong && "border-danger bg-danger/10 text-danger",
      active && "border-brand-400 bg-brand-600/10 text-brand-600 dark:text-brand-300",
      !done && !isWrong && !active && "border-line bg-card text-ink hover:border-brand-400"
    );

  return (
    <div>
      <p className="mb-4 text-center text-sm font-semibold text-ink-soft">
        {matched.size}/{left.length}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((q) => (
            <button
              key={q.card_id}
              type="button"
              disabled={matched.has(q.card_id)}
              onClick={() => pickWord(q.card_id)}
              className={cell(selected === q.card_id, matched.has(q.card_id), false)}
            >
              {q.prompt}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((q) => (
            <button
              key={q.card_id}
              type="button"
              disabled={matched.has(q.card_id)}
              onClick={() => pickTranslation(q.card_id)}
              className={cell(false, matched.has(q.card_id), wrong === q.card_id)}
            >
              {q.answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
