"use client";

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
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-2xl" aria-hidden>
              {hits >= items.length ? "💥" : "🐉"}
            </span>
            <span className="text-xs font-bold text-danger">{games.bossHp}</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-linear-to-r from-red-500 to-red-700 transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - (hits / items.length) * 100)}%` }}
            />
          </div>
        </div>
      )}
      <Progress index={index} total={items.length} />
      <ChoiceQuestion
        key={index}
        item={item}
        games={games}
        isAudio={isAudio}
        fill={fill}
        onResolved={(correct, durationMs) => {
          if (correct && boss) setHits((h) => h + 1);
          onAnswer(item.question.card_id, correct, durationMs);
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
  onResolved: (correct: boolean, durationMs: number) => void;
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
    onResolved(option === question.answer, Date.now() - shownAt.current);
  }

  return (
    <>
      <div className="mt-6 rounded-xl2 border border-line bg-card p-8 text-center">
        {isAudio ? (
          <button
            type="button"
            onClick={() => speak(question.audio_text ?? question.answer)}
            className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-600/10 text-4xl transition-transform hover:scale-105"
            aria-label={games.tapToHear}
          >
            🔊
          </button>
        ) : fill ? (
          <p className="text-xl font-semibold leading-relaxed text-ink">{question.prompt}</p>
        ) : (
          <p className="text-4xl font-extrabold tracking-tight text-ink">{question.prompt}</p>
        )}
        {isAudio && <p className="mt-3 text-sm text-ink-soft">{games.tapToHear}</p>}
      </div>

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
            <button
              key={option}
              type="button"
              data-option={option}
              disabled={!!picked}
              onClick={choose}
              className={cn(
                "rounded-xl border px-4 py-3.5 text-left font-semibold transition-colors",
                state === "idle" && "border-line bg-card text-ink hover:border-brand-400",
                state === "correct" && "border-success bg-success/10 text-success",
                state === "wrong" && "border-danger bg-danger/10 text-danger"
              )}
            >
              {option}
            </button>
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
