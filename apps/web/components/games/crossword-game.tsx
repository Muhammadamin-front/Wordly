"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GameProps } from "@/components/games/game-player";
import { shuffle, type GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Fill-in crossword: answers are woven into a grid by shared letters, the
 *  translations serve as numbered clues. Some letters are pre-revealed (like
 *  the classic newspaper fill-ins); difficulty comes from the word source the
 *  player picked (A1…C2/IELTS). */

export type Dir = "across" | "down";

export interface Placement {
  cardId: string;
  answer: string; // UPPERCASE
  prompt: string; // translation clue
  row: number;
  col: number;
  dir: Dir;
  number: number;
}

export interface Crossword {
  rows: number;
  cols: number;
  /** Solution letter per cell, or null for a block. */
  solution: (string | null)[][];
  revealed: boolean[][];
  placements: Placement[];
}

const MAX_WORDS = 10;
const REVEAL_FRACTION = 0.32;

interface Slot {
  word: string;
  q: GameQuestion;
  row: number;
  col: number;
  dir: Dir;
}

function canPlace(
  grid: Map<string, string>,
  word: string,
  row: number,
  col: number,
  dir: Dir
): boolean {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  // The cells just before the start and after the end must be free.
  if (grid.has(`${row - dr},${col - dc}`)) return false;
  if (grid.has(`${row + dr * word.length},${col + dc * word.length}`)) return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = grid.get(`${r},${c}`);
    if (existing !== undefined) {
      if (existing !== word[i]) return false; // conflicting crossing letter
      continue; // a valid crossing — side-contact rules don't apply here
    }
    // A fresh cell may not touch a neighbouring word sideways.
    if (dir === "across" && (grid.has(`${r - 1},${c}`) || grid.has(`${r + 1},${c}`))) return false;
    if (dir === "down" && (grid.has(`${r},${c - 1}`) || grid.has(`${r},${c + 1}`))) return false;
  }
  return true;
}

export function buildCrossword(questions: GameQuestion[]): Crossword {
  const usable = questions
    .filter((q) => /^[a-z]{3,12}$/i.test(q.answer))
    .slice(0, MAX_WORDS)
    .map((q) => ({ q, word: q.answer.toUpperCase() }));

  const grid = new Map<string, string>();
  const slots: Slot[] = [];

  const write = (slot: Slot) => {
    for (let i = 0; i < slot.word.length; i++) {
      const r = slot.row + (slot.dir === "down" ? i : 0);
      const c = slot.col + (slot.dir === "across" ? i : 0);
      grid.set(`${r},${c}`, slot.word[i]);
    }
    slots.push(slot);
  };

  // Longest word first, laid across; the rest attach at shared letters.
  const queue = [...usable].sort((a, b) => b.word.length - a.word.length);
  const leftovers: typeof usable = [];
  queue.forEach(({ q, word }, index) => {
    if (index === 0) {
      write({ word, q, row: 0, col: 0, dir: "across" });
      return;
    }
    for (const [key, letter] of grid) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== letter) continue;
        const [r, c] = key.split(",").map(Number);
        for (const dir of ["down", "across"] as const) {
          const row = dir === "down" ? r - i : r;
          const col = dir === "across" ? c - i : c;
          if (canPlace(grid, word, row, col, dir)) {
            write({ word, q, row, col, dir });
            return;
          }
        }
      }
    }
    leftovers.push({ q, word });
  });

  // Words that found no crossing sit detached below the main cluster (the
  // classic fill-in style tolerates islands; every word stays playable).
  let bottom = Math.max(...slots.map((s) => s.row + (s.dir === "down" ? s.word.length : 1)));
  for (const { q, word } of leftovers) {
    const row = bottom + 1;
    if (canPlace(grid, word, row, 0, "across")) {
      write({ word, q, row, col: 0, dir: "across" });
      bottom = row + 1;
    }
  }

  // Normalise coordinates to a 0-based matrix.
  const cells = [...grid.keys()].map((k) => k.split(",").map(Number));
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const rows = Math.max(...cells.map(([r]) => r)) - minR + 1;
  const cols = Math.max(...cells.map(([, c]) => c)) - minC + 1;
  const solution: (string | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid.get(`${r + minR},${c + minC}`) ?? null)
  );

  // Standard numbering: scan row-major, number each cell that starts a word.
  const starts = new Map<string, number>();
  let nextNumber = 1;
  const placements: Placement[] = [];
  const ordered = [...slots].sort(
    (a, b) => a.row - minR - (b.row - minR) || a.col - minC - (b.col - minC)
  );
  for (const slot of ordered) {
    const row = slot.row - minR;
    const col = slot.col - minC;
    const key = `${row},${col}`;
    const number = starts.get(key) ?? nextNumber;
    if (!starts.has(key)) {
      starts.set(key, number);
      nextNumber += 1;
    }
    placements.push({
      cardId: slot.q.card_id,
      answer: slot.word,
      prompt: slot.q.prompt,
      row,
      col,
      dir: slot.dir,
      number,
    });
  }

  // Pre-reveal a share of letters; every word gets at least one.
  const revealed = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  const letterCells: Array<[number, number]> = [];
  solution.forEach((line, r) => line.forEach((ch, c) => ch && letterCells.push([r, c])));
  for (const [r, c] of shuffle(letterCells).slice(0, Math.ceil(letterCells.length * REVEAL_FRACTION))) {
    revealed[r][c] = true;
  }
  for (const p of placements) {
    const has = Array.from({ length: p.answer.length }).some((_, i) =>
      p.dir === "across" ? revealed[p.row][p.col + i] : revealed[p.row + i][p.col]
    );
    if (!has) revealed[p.row][p.col] = true;
  }

  return { rows, cols, solution, revealed, placements };
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type WordState = "correct" | "wrong";

export function CrosswordGame({
  games,
  onAnswer,
  onComplete,
  crossword,
}: GameProps & { crossword: Crossword }) {
  const { cols, solution, revealed, placements } = crossword;
  const startRef = useRef(0);
  const doneRef = useRef(false);
  useEffect(() => {
    startRef.current = Date.now();
  }, []);
  const [letters, setLetters] = useState<string[][]>(() =>
    solution.map((line, r) => line.map((ch, c) => (ch && revealed[r][c] ? ch : "")))
  );
  const [wordState, setWordState] = useState<Record<string, WordState>>({});
  const [active, setActive] = useState<{ r: number; c: number; dir: Dir } | null>(() => {
    const first = placements[0];
    return first ? { r: first.row, c: first.col, dir: first.dir } : null;
  });

  const activePlacement = useMemo(() => {
    if (!active) return null;
    const covering = placements.filter((p) =>
      p.dir === "across"
        ? p.row === active.r && active.c >= p.col && active.c < p.col + p.answer.length
        : p.col === active.c && active.r >= p.row && active.r < p.row + p.answer.length
    );
    return covering.find((p) => p.dir === active.dir) ?? covering[0] ?? null;
  }, [active, placements]);

  const cellsOf = useCallback(
    (p: Placement): Array<[number, number]> =>
      Array.from({ length: p.answer.length }, (_, i) =>
        p.dir === "across" ? [p.row, p.col + i] : [p.row + i, p.col]
      ),
    []
  );

  const isLocked = useCallback(
    (r: number, c: number): boolean => {
      if (revealed[r][c]) return true;
      // Cells of a correctly solved word stay fixed.
      return placements.some(
        (p) => wordState[p.cardId] === "correct" && cellsOf(p).some(([pr, pc]) => pr === r && pc === c)
      );
    },
    [revealed, placements, wordState, cellsOf]
  );

  /** Grade any newly-filled words exactly once each. */
  const maybeSubmit = useCallback(
    (next: string[][]) => {
      const state = { ...wordState };
      let changed = false;
      for (const p of placements) {
        if (state[p.cardId]) continue;
        const filled = cellsOf(p).map(([r, c]) => next[r][c]);
        if (filled.some((ch) => !ch)) continue;
        const submitted = filled.join("");
        const correct = submitted === p.answer;
        state[p.cardId] = correct ? "correct" : "wrong";
        changed = true;
        onAnswer(p.cardId, correct, Date.now() - startRef.current, submitted.toLowerCase());
      }
      if (changed) setWordState(state);
      if (!doneRef.current && placements.every((p) => state[p.cardId])) {
        doneRef.current = true;
        window.setTimeout(onComplete, 900);
      }
    },
    [wordState, placements, cellsOf, onAnswer, onComplete]
  );

  const advance = useCallback(
    (from: { r: number; c: number; dir: Dir }, step: 1 | -1) => {
      const p = activePlacement;
      if (!p) return;
      const cells = cellsOf(p);
      const index = cells.findIndex(([r, c]) => r === from.r && c === from.c);
      for (let i = index + step; i >= 0 && i < cells.length; i += step) {
        const [r, c] = cells[i];
        if (!isLocked(r, c)) {
          setActive({ r, c, dir: from.dir });
          return;
        }
      }
    },
    [activePlacement, cellsOf, isLocked]
  );

  const input = useCallback(
    (key: string) => {
      if (!active || isLocked(active.r, active.c)) {
        if (key === "Backspace" && active) advance(active, -1);
        return;
      }
      if (/^[a-z]$/i.test(key)) {
        setLetters((prev) => {
          const next = prev.map((line) => [...line]);
          next[active.r][active.c] = key.toUpperCase();
          maybeSubmit(next);
          return next;
        });
        advance(active, 1);
      } else if (key === "Backspace") {
        setLetters((prev) => {
          const next = prev.map((line) => [...line]);
          if (next[active.r][active.c]) next[active.r][active.c] = "";
          return next;
        });
        advance(active, -1);
      }
    },
    [active, isLocked, advance, maybeSubmit]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (/^[a-z]$/i.test(event.key) || event.key === "Backspace") {
        event.preventDefault();
        input(event.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [input]);

  const wordStateAt = (r: number, c: number): WordState | undefined => {
    for (const p of placements) {
      if (cellsOf(p).some(([pr, pc]) => pr === r && pc === c)) {
        const state = wordState[p.cardId];
        if (state === "correct") return "correct";
        if (state === "wrong" && !revealed[r][c]) return "wrong";
      }
    }
    return undefined;
  };

  const numberAt = (r: number, c: number): number | undefined =>
    placements.find((p) => p.row === r && p.col === c)?.number;

  const inActiveWord = (r: number, c: number): boolean =>
    !!activePlacement && cellsOf(activePlacement).some(([pr, pc]) => pr === r && pc === c);

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto grid w-fit gap-px rounded-lg border border-line bg-line p-px"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {solution.map((line, r) =>
            line.map((ch, c) => {
              if (!ch) {
                return <div key={`${r}-${c}`} className="size-8 bg-slate-800 dark:bg-slate-950 sm:size-9" />;
              }
              const state = wordStateAt(r, c);
              const isActive = active?.r === r && active?.c === c;
              const number = numberAt(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() =>
                    setActive((prev) => ({
                      r,
                      c,
                      // Clicking the same cell again flips typing direction.
                      dir: prev?.r === r && prev?.c === c ? (prev.dir === "across" ? "down" : "across") : (prev?.dir ?? "across"),
                    }))
                  }
                  className={cn(
                    "relative size-8 bg-card text-center text-sm font-extrabold uppercase text-ink sm:size-9 sm:text-base",
                    inActiveWord(r, c) && "bg-brand-600/10",
                    isActive && "ring-2 ring-inset ring-brand-500",
                    revealed[r][c] && "text-ink-soft",
                    state === "correct" && "bg-success/15 text-success",
                    state === "wrong" && "bg-danger/10 text-danger"
                  )}
                >
                  {number && (
                    <span className="absolute left-0.5 top-0 text-[8px] font-semibold leading-3 text-ink-soft">
                      {number}
                    </span>
                  )}
                  {letters[r][c]}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* On-screen letter bank (mobile has no physical keyboard). */}
      <div className="mx-auto grid w-fit grid-cols-9 gap-1.5">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => input(letter)}
            className="size-8 rounded-lg border border-line bg-card text-sm font-bold text-ink transition-colors hover:bg-brand-600/10 active:scale-95"
          >
            {letter}
          </button>
        ))}
        <button
          type="button"
          onClick={() => input("Backspace")}
          className="col-span-2 flex h-8 items-center justify-center rounded-lg border border-line bg-card text-sm font-bold text-ink transition-colors hover:bg-danger/10"
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* Clues, split the way real crosswords do. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(["across", "down"] as const).map((dir) => {
          const list = placements.filter((p) => p.dir === dir);
          if (!list.length) return null;
          return (
            <div key={dir} className="rounded-2xl border border-line bg-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                {dir === "across" ? `→ ${games.across}` : `↓ ${games.down}`}
              </h3>
              <ul className="mt-2 space-y-1">
                {list.map((p) => (
                  <li key={p.cardId}>
                    <button
                      type="button"
                      onClick={() => setActive({ r: p.row, c: p.col, dir: p.dir })}
                      className={cn(
                        "w-full rounded-lg px-2 py-1 text-left text-sm text-ink transition-colors hover:bg-line/40",
                        wordState[p.cardId] === "correct" && "text-success line-through",
                        wordState[p.cardId] === "wrong" && "text-danger",
                        activePlacement?.cardId === p.cardId && "bg-brand-600/10"
                      )}
                    >
                      <span className="font-bold">{p.number}.</span> {p.prompt}{" "}
                      <span className="text-xs text-ink-soft">({p.answer.length})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
