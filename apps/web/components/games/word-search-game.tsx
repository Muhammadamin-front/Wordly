"use client";

import { useState } from "react";

import type { GameProps } from "@/components/games/game-player";
import type { GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

interface Target {
  cardId: string;
  word: string;
  cells: string[]; // "r,c" keys
}
export interface WordSearch {
  size: number;
  grid: string[][];
  targets: Target[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIRECTIONS: [number, number][] = [
  [0, 1], // →
  [1, 0], // ↓
  [1, 1], // ↘
];

/** Runs in the parent's post-fetch prepare step (random is allowed there). */
export function buildWordSearch(questions: GameQuestion[]): WordSearch {
  const words = questions
    .map((q) => q.prompt.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 2 && w.length <= 9);
  const size = Math.min(12, Math.max(8, ...words.map((w) => w.length), 8));
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const targets: Target[] = [];

  for (let idx = 0; idx < questions.length && targets.length < 6; idx++) {
    const word = questions[idx].prompt.toUpperCase().replace(/[^A-Z]/g, "");
    if (word.length < 2 || word.length > size) continue;
    let placed = false;
    for (let attempt = 0; attempt < 40 && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r0 = Math.floor(Math.random() * (size - (dr ? word.length - 1 : 0)));
      const c0 = Math.floor(Math.random() * (size - (dc ? word.length - 1 : 0)));
      const cells: string[] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        if (grid[r][c] && grid[r][c] !== word[i]) {
          ok = false;
          break;
        }
        cells.push(`${r},${c}`);
      }
      if (!ok) continue;
      cells.forEach((key, i) => {
        const [r, c] = key.split(",").map(Number);
        grid[r][c] = word[i];
      });
      targets.push({ cardId: questions[idx].card_id, word, cells });
      placed = true;
    }
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = ALPHABET[Math.floor(Math.random() * 26)];

  return { size, grid, targets };
}

function lineCells(a: [number, number], b: [number, number]): string[] | null {
  const [ar, ac] = a;
  const [br, bc] = b;
  const dr = Math.sign(br - ar);
  const dc = Math.sign(bc - ac);
  const lenR = Math.abs(br - ar);
  const lenC = Math.abs(bc - ac);
  const straight = ar === br || ac === bc || lenR === lenC;
  if (!straight) return null;
  const steps = Math.max(lenR, lenC);
  const cells: string[] = [];
  for (let i = 0; i <= steps; i++) cells.push(`${ar + dr * i},${ac + dc * i}`);
  return cells;
}

export function WordSearchGame({
  search,
  onAnswer,
  onComplete,
}: GameProps & { search: WordSearch }) {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());

  const foundCells = new Set(
    search.targets.filter((t) => found.has(t.cardId)).flatMap((t) => t.cells)
  );

  function click(r: number, c: number) {
    if (!start) {
      setStart([r, c]);
      return;
    }
    const cells = lineCells(start, [r, c]);
    setStart(null);
    if (!cells) return;
    const word = cells.map((key) => {
      const [rr, cc] = key.split(",").map(Number);
      return search.grid[rr][cc];
    });
    const forward = word.join("");
    const reversed = [...word].reverse().join("");
    const match = search.targets.find(
      (t) => !found.has(t.cardId) && (t.word === forward || t.word === reversed)
    );
    if (match) {
      const next = new Set(found).add(match.cardId);
      setFound(next);
      onAnswer(match.cardId, true, 3000);
      if (next.size === search.targets.length) window.setTimeout(onComplete, 500);
    }
  }

  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold text-ink-soft">
        {found.size}/{search.targets.length}
      </p>
      <div
        className="mx-auto grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${search.size}, minmax(0, 1fr))`, maxWidth: 420 }}
      >
        {search.grid.map((row, r) =>
          row.map((ch, c) => {
            const key = `${r},${c}`;
            const isFound = foundCells.has(key);
            const isStart = start && start[0] === r && start[1] === c;
            return (
              <button
                key={key}
                type="button"
                onClick={() => click(r, c)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded text-xs font-bold transition-colors sm:text-sm",
                  isFound && "bg-success/25 text-success",
                  isStart && "bg-brand-600 text-white",
                  !isFound && !isStart && "bg-card text-ink hover:bg-brand-600/10"
                )}
              >
                {ch}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {search.targets.map((t) => (
          <span
            key={t.cardId}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              found.has(t.cardId)
                ? "bg-success/10 text-success line-through"
                : "bg-line/60 text-ink-soft"
            )}
          >
            {t.word}
          </span>
        ))}
      </div>
    </div>
  );
}
