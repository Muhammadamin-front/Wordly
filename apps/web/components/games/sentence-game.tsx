"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Blocks, CheckCircle2 } from "lucide-react";

import type { GameProps } from "@/components/games/game-player";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SentenceItem {
  cardId: string;
  prompt: string;
  words: string[]; // correct order
  scrambled: { w: string; i: number }[]; // shuffled with original index
}

/** Sentence Builder — tap the scrambled words into the correct order. */
export function SentenceGame({
  items,
  games,
  onAnswer,
  onComplete,
}: GameProps & { items: SentenceItem[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];

  function resolve() {
    if (index + 1 < items.length) setIndex(index + 1);
    else onComplete();
  }

  return (
    <div>
      <SentenceRound
        key={index}
        item={item}
        games={games}
        onResolved={(correct, ms, submitted) => {
          onAnswer(item.cardId, correct, ms, submitted);
          window.setTimeout(resolve, 1100);
        }}
      />
    </div>
  );
}

function SentenceRound({
  item,
  games,
  onResolved,
}: {
  item: SentenceItem;
  games: GameProps["games"];
  onResolved: (correct: boolean, durationMs: number, submitted: string) => void;
}) {
  const [built, setBuilt] = useState<number[]>([]); // positions in `scrambled`
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const used = new Set(built);

  function check() {
    if (result) return;
    const attempt = built.map((pos) => item.scrambled[pos].w).join(" ");
    const correct = attempt === item.words.join(" ");
    setResult(correct ? "correct" : "wrong");
    onResolved(correct, Date.now() - shownAt.current, attempt);
  }

  return (
    <div>
      <div className="surface-panel mt-6 rounded-lg p-5 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft">
          <Blocks className="size-4" aria-hidden />
          {item.prompt}
        </p>
        {/* Built sentence */}
        <div className="mt-3 flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-lg bg-page px-3 py-2">
          {built.length === 0 ? (
            <span className="text-sm text-ink-soft/60">{games.buildSentence}…</span>
          ) : (
            <AnimatePresence mode="popLayout">
            {built.map((pos, slot) => (
              <motion.button
                key={pos}
                type="button"
                disabled={!!result}
                onClick={() => setBuilt(built.filter((_, i) => i !== slot))}
                layout
                initial={{ opacity: 0, scale: 0.75, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.75 }}
                className="rounded-lg border border-brand-400/30 bg-brand-600/10 px-2.5 py-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
              >
                {item.scrambled[pos].w}
              </motion.button>
            ))
            }</AnimatePresence>
          )}
        </div>
        {result === "wrong" && (
          <p className="mt-2 text-sm text-success-text">✓ {item.words.join(" ")}</p>
        )}
      </div>

      {/* Word bank */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {item.scrambled.map((tile, pos) =>
          used.has(pos) ? (
            <span key={pos} className="rounded-lg border border-dashed border-line px-3 py-1.5 text-sm text-transparent">
              {tile.w}
            </span>
          ) : (
            <motion.button
              key={pos}
              type="button"
              disabled={!!result}
              onClick={() => setBuilt([...built, pos])}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-brand-400"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
            >
              {tile.w}
            </motion.button>
          )
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="ghost" size="sm" disabled={!!result || built.length === 0} onClick={() => setBuilt([])}>
          {games.clear}
        </Button>
        <Button
          size="sm"
          disabled={!!result || built.length !== item.words.length}
          onClick={check}
          className={cn(result === "correct" && "bg-success", result === "wrong" && "bg-danger")}
        >
          <CheckCircle2 className="size-4" aria-hidden />
          {games.check}
        </Button>
      </div>
    </div>
  );
}
