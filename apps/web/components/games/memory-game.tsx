"use client";

import { useState } from "react";
import { BrainCircuit, Check, Sparkles } from "lucide-react";

import type { GameProps } from "@/components/games/game-player";
import { cn } from "@/lib/utils";

export interface Tile {
  key: string;
  cardId: string;
  text: string;
}

/** Memory — flip tiles to find each word/translation pair. The shuffled tile
 *  order is prepared by the parent (pure render here). */
export function MemoryGame({
  tiles,
  pairCount,
  onAnswer,
  onComplete,
}: GameProps & { tiles: Tile[]; pairCount: number }) {
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function flip(tile: Tile) {
    if (busy || matched.has(tile.cardId) || flipped.includes(tile.key)) return;
    const next = [...flipped, tile.key];
    setFlipped(next);
    if (next.length < 2) return;

    setBusy(true);
    const [a, b] = next.map((key) => tiles.find((t) => t.key === key)!);
    if (a.cardId === b.cardId) {
      const done = new Set(matched).add(a.cardId);
      window.setTimeout(() => {
        setMatched(done);
        setFlipped([]);
        setBusy(false);
        const translation =
          tiles.find((t) => t.key === a.cardId + ":t")?.text ?? a.text;
        onAnswer(a.cardId, true, 2500, translation);
        if (done.size === pairCount) window.setTimeout(onComplete, 400);
      }, 450);
    } else {
      window.setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 900);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <BrainCircuit className="size-4 text-brand-500" aria-hidden />
          {matched.size}/{pairCount}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-ink-soft">
          <Sparkles className="size-3.5" aria-hidden />
          {pairCount - matched.size}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId);
          const isFlipped = flipped.includes(tile.key) || isMatched;
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => flip(tile)}
              disabled={isMatched}
              aria-label={isFlipped ? tile.text : "Hidden memory card"}
              className={cn("group aspect-square [perspective:900px]", isMatched && "opacity-55")}
            >
              <span
                className="relative block size-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-brand-400/25 bg-linear-to-br from-brand-700 via-brand-900 to-brand-950 text-brand-100 shadow-[3px_4px_0_rgba(84,37,15,0.3)] [backface-visibility:hidden] group-hover:-translate-y-0.5 group-hover:border-accent-400/50">
                  <BrainCircuit className="size-6 opacity-75" aria-hidden />
                </span>
                <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-brand-400/45 bg-card p-2 text-center text-xs font-bold leading-tight text-ink shadow-[3px_4px_0_rgba(84,37,15,0.16)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-sm">
                  {tile.text}
                  {isMatched && (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-success text-white">
                      <Check className="size-3" aria-hidden />
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
