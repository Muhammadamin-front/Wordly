"use client";

import { useState } from "react";

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
      <p className="mb-4 text-center text-sm font-semibold text-ink-soft">
        {matched.size}/{pairCount}
      </p>
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
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border p-2 text-center text-sm font-semibold transition-all",
                isMatched && "border-success/40 bg-success/10 text-success opacity-40",
                isFlipped && !isMatched && "border-brand-400 bg-brand-600/10 text-ink",
                !isFlipped &&
                  "border-line bg-linear-to-br from-brand-600/20 to-accent-500/10 text-transparent hover:from-brand-600/30"
              )}
            >
              {isFlipped ? tile.text : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
