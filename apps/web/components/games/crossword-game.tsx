"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Eraser,
  Lightbulb,
  LockKeyhole,
  Puzzle,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GameProps } from "@/components/games/game-player";
import { Button } from "@/components/ui/button";
import type { GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Definition crossword: answers are woven into a grid by shared letters and
 * every answer starts hidden. The player may reveal a limited number of hints. */

export type Dir = "across" | "down";

export interface Placement {
  cardId: string;
  answer: string; // UPPERCASE
  submission: string; // original server answer (keeps spaces in phrases)
  prompt: string; // definition clue, with the answer masked
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
const MAX_ANSWER_LENGTH = 15;
const MAX_HINTS_PER_WORD = 2;

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
    .map((q) => ({
      q,
      word: q.answer.replace(/[^a-z]/gi, "").toUpperCase(),
    }))
    .filter(({ q, word }) => word.length >= 3 && word.length <= MAX_ANSWER_LENGTH && q.prompt.trim())
    .slice(0, MAX_WORDS)
    .map(({ q, word }) => ({
      q: { ...q, prompt: maskAnswer(q.prompt, q.answer) },
      word,
    }));

  if (!usable.length) {
    return { rows: 0, cols: 0, solution: [], revealed: [], placements: [] };
  }

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
      submission: slot.q.answer,
      prompt: slot.q.prompt,
      row,
      col,
      dir: slot.dir,
      number,
    });
  }

  // Classic crossword: all letters start hidden. `revealed` is retained as a
  // board contract and becomes the initial state for player-requested hints.
  const revealed = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));

  return { rows, cols, solution, revealed, placements };
}

export function maskAnswer(prompt: string, answer: string): string {
  const escaped = answer.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return prompt.trim();
  return prompt.replace(new RegExp(escaped, "gi"), "___").trim();
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type WordState = "correct" | "wrong";
type Feedback = "incomplete" | "wrong" | "correct" | "hint";

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
  const [hinted, setHinted] = useState<boolean[][]>(() => revealed.map((line) => [...line]));
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  const [wordState, setWordState] = useState<Record<string, WordState>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
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
      if (hinted[r][c]) return true;
      // Cells of a correctly solved word stay fixed.
      return placements.some(
        (p) => wordState[p.cardId] === "correct" && cellsOf(p).some(([pr, pc]) => pr === r && pc === c)
      );
    },
    [hinted, placements, wordState, cellsOf]
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
          return next;
        });
        setWordState((current) => {
          const next = { ...current };
          placements.forEach((p) => {
            if (
              next[p.cardId] === "wrong" &&
              cellsOf(p).some(([r, c]) => r === active.r && c === active.c)
            ) {
              delete next[p.cardId];
            }
          });
          return next;
        });
        setFeedback(null);
        advance(active, 1);
      } else if (key === "Backspace") {
        setLetters((prev) => {
          const next = prev.map((line) => [...line]);
          if (next[active.r][active.c]) next[active.r][active.c] = "";
          return next;
        });
        setFeedback(null);
        advance(active, -1);
      }
    },
    [active, isLocked, advance, placements, cellsOf]
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
        if (state === "wrong" && !hinted[r][c]) return "wrong";
      }
    }
    return undefined;
  };

  const numberAt = (r: number, c: number): number | undefined =>
    placements.find((p) => p.row === r && p.col === c)?.number;

  const inActiveWord = (r: number, c: number): boolean =>
    !!activePlacement && cellsOf(activePlacement).some(([pr, pc]) => pr === r && pc === c);

  const selectPlacement = useCallback(
    (placement: Placement) => {
      const cells = cellsOf(placement);
      const target = cells.find(([r, c]) => !isLocked(r, c)) ?? cells[0];
      setActive({ r: target[0], c: target[1], dir: placement.dir });
      setFeedback(null);
    },
    [cellsOf, isLocked]
  );

  const checkActiveWord = useCallback(() => {
    if (!activePlacement || wordState[activePlacement.cardId] === "correct") return;
    const cells = cellsOf(activePlacement);
    const filled = cells.map(([r, c]) => letters[r][c]);
    if (filled.some((letter) => !letter)) {
      setFeedback("incomplete");
      return;
    }

    const submitted = filled.join("");
    const correct = submitted === activePlacement.answer;
    const nextState = {
      ...wordState,
      [activePlacement.cardId]: correct ? ("correct" as const) : ("wrong" as const),
    };
    setWordState(nextState);
    setFeedback(correct ? "correct" : "wrong");
    onAnswer(
      activePlacement.cardId,
      correct,
      Date.now() - startRef.current,
      correct ? activePlacement.submission : submitted.toLowerCase()
    );

    if (correct) {
      setLetters((current) => {
        const next = current.map((line) => [...line]);
        cells.forEach(([r, c], index) => {
          next[r][c] = activePlacement.answer[index];
        });
        return next;
      });
      if (!doneRef.current && placements.every((p) => nextState[p.cardId] === "correct")) {
        doneRef.current = true;
        window.setTimeout(onComplete, 700);
      }
    }
  }, [activePlacement, wordState, cellsOf, letters, onAnswer, placements, onComplete]);

  const revealHint = useCallback(() => {
    if (!activePlacement || wordState[activePlacement.cardId] === "correct") return;
    const used = hintsUsed[activePlacement.cardId] ?? 0;
    if (used >= MAX_HINTS_PER_WORD) return;
    const candidates = cellsOf(activePlacement).filter(([r, c], index) =>
      !isLocked(r, c) && letters[r][c] !== activePlacement.answer[index]
    );
    const target = candidates.find(([r, c]) => !letters[r][c]) ?? candidates[0];
    if (!target) return;
    const [r, c] = target;
    const answerIndex = cellsOf(activePlacement).findIndex(([cr, cc]) => cr === r && cc === c);
    setLetters((current) => {
      const next = current.map((line) => [...line]);
      next[r][c] = activePlacement.answer[answerIndex];
      return next;
    });
    setHinted((current) => {
      const next = current.map((line) => [...line]);
      next[r][c] = true;
      return next;
    });
    setHintsUsed((current) => ({ ...current, [activePlacement.cardId]: used + 1 }));
    setWordState((current) => {
      const next = { ...current };
      if (next[activePlacement.cardId] === "wrong") delete next[activePlacement.cardId];
      return next;
    });
    setFeedback("hint");
  }, [activePlacement, wordState, hintsUsed, cellsOf, isLocked, letters]);

  const clearActiveWord = useCallback(() => {
    if (!activePlacement || wordState[activePlacement.cardId] === "correct") return;
    setLetters((current) => {
      const next = current.map((line) => [...line]);
      cellsOf(activePlacement).forEach(([r, c]) => {
        if (!isLocked(r, c)) next[r][c] = "";
      });
      return next;
    });
    setWordState((current) => {
      const next = { ...current };
      delete next[activePlacement.cardId];
      return next;
    });
    setFeedback(null);
    selectPlacement(activePlacement);
  }, [activePlacement, wordState, cellsOf, isLocked, selectPlacement]);

  const solvedCount = placements.filter((p) => wordState[p.cardId] === "correct").length;
  const activeHintsUsed = activePlacement ? hintsUsed[activePlacement.cardId] ?? 0 : 0;
  const hintsLeft = MAX_HINTS_PER_WORD - activeHintsUsed;

  const feedbackText = feedback === "incomplete"
    ? games.crosswordIncomplete
    : feedback === "wrong"
      ? games.crosswordTryAgain
      : feedback === "correct"
        ? games.crosswordSolved
        : feedback === "hint"
          ? games.crosswordHintUsed.replace("{count}", String(hintsLeft))
          : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold text-brand-700 dark:text-brand-200">
            <Puzzle className="size-4" />
            {games.crossword.name}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            {games.crosswordInstruction}
          </p>
        </div>
        <div className="min-w-48">
          <p className="text-right text-xs font-bold text-ink-soft">
            {games.crosswordProgress
              .replace("{solved}", String(solvedCount))
              .replace("{total}", String(placements.length))}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-brand-600"
              animate={{ width: `${placements.length ? (solvedCount / placements.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          <div className="overflow-x-auto pb-2">
            <div
              className="mx-auto grid w-fit gap-px rounded-lg border border-line bg-line p-px shadow-[0_18px_50px_rgba(8,55,47,0.12)]"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {solution.map((line, r) =>
                line.map((ch, c) => {
                  if (!ch) {
                    return <div key={`${r}-${c}`} aria-hidden className="size-8 bg-brand-950 sm:size-9" />;
                  }
                  const state = wordStateAt(r, c);
                  const isActive = active?.r === r && active?.c === c;
                  const number = numberAt(r, c);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      aria-label={`${games.crosswordCell} ${r + 1}, ${c + 1}`}
                      onClick={() => {
                        const covering = placements.filter((p) =>
                          cellsOf(p).some(([pr, pc]) => pr === r && pc === c)
                        );
                        const nextDir = active?.r === r && active?.c === c
                          ? active.dir === "across" ? "down" : "across"
                          : active?.dir ?? covering[0]?.dir ?? "across";
                        const placement = covering.find((p) => p.dir === nextDir) ?? covering[0];
                        setActive({ r, c, dir: placement?.dir ?? nextDir });
                        setFeedback(null);
                      }}
                      className={cn(
                        "relative size-8 bg-card text-center text-sm font-extrabold uppercase text-ink transition-colors sm:size-9 sm:text-base",
                        inActiveWord(r, c) && "bg-brand-600/12",
                        isActive && "z-10 ring-2 ring-inset ring-brand-500",
                        hinted[r][c] && "bg-accent-500/12 text-accent-700 dark:text-accent-300",
                        state === "correct" && "bg-success/15 text-success",
                        state === "wrong" && "bg-danger/12 text-danger"
                      )}
                    >
                      {number && (
                        <span className="absolute left-0.5 top-0 text-[8px] font-semibold leading-3 text-ink-soft">
                          {number}
                        </span>
                      )}
                      {letters[r][c]}
                      {(hinted[r][c] || state === "correct") && (
                        <LockKeyhole className="absolute bottom-0.5 right-0.5 size-2.5 opacity-45" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mx-auto mt-5 grid w-fit grid-cols-9 gap-1.5">
            {LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => input(letter)}
                className="size-8 rounded-lg border border-line bg-card text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-brand-600/10 active:scale-95"
              >
                {letter}
              </button>
            ))}
            <button
              type="button"
              onClick={() => input("Backspace")}
              className="col-span-2 flex h-8 items-center justify-center rounded-lg border border-line bg-card text-sm font-bold text-ink transition-colors hover:bg-danger/10"
              aria-label={games.crosswordBackspace}
              title={games.crosswordBackspace}
            >
              <Eraser className="size-4" />
            </button>
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          {activePlacement && (
            <div className="rounded-lg border border-brand-300/70 bg-brand-600/8 p-5 shadow-[0_16px_40px_rgba(8,55,47,0.09)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-brand-700 dark:text-brand-200">
                  {activePlacement.number} · {activePlacement.dir === "across" ? games.across : games.down}
                </span>
                <span className="rounded-md bg-card px-2 py-1 text-xs font-bold text-ink-soft">
                  {activePlacement.answer.length} {games.crosswordLetters}
                </span>
              </div>
              <p className="mt-4 text-xs font-bold text-ink-soft">{games.crosswordDefinition}</p>
              <p className="mt-1 text-base font-extrabold leading-6 text-ink">
                {activePlacement.prompt}
              </p>

              <AnimatePresence mode="wait">
                {feedbackText && (
                  <motion.div
                    key={feedback}
                    role="status"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold leading-5",
                      feedback === "correct" && "bg-success/12 text-success",
                      feedback === "wrong" && "bg-danger/10 text-danger",
                      feedback === "incomplete" && "bg-accent-500/12 text-accent-700 dark:text-accent-300",
                      feedback === "hint" && "bg-brand-600/10 text-brand-700 dark:text-brand-200"
                    )}
                  >
                    {feedback === "correct" ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    ) : feedback === "wrong" ? (
                      <XCircle className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <Lightbulb className="mt-0.5 size-4 shrink-0" />
                    )}
                    {feedbackText}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Button
                  type="button"
                  onClick={checkActiveWord}
                  disabled={wordState[activePlacement.cardId] === "correct"}
                >
                  <CheckCircle2 className="size-4" />
                  {games.crosswordCheck}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={revealHint}
                  disabled={hintsLeft <= 0 || wordState[activePlacement.cardId] === "correct"}
                >
                  <Lightbulb className="size-4" />
                  {hintsLeft > 0 ? `${games.crosswordHint} · ${hintsLeft}` : games.crosswordNoHints}
                </Button>
              </div>
              <button
                type="button"
                onClick={clearActiveWord}
                disabled={wordState[activePlacement.cardId] === "correct"}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
              >
                <Eraser className="size-3.5" />
                {games.crosswordClear}
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {(["across", "down"] as const).map((dir) => {
              const list = placements.filter((p) => p.dir === dir);
              if (!list.length) return null;
              return (
                <section key={dir} className="rounded-lg border border-line bg-card/70 p-3">
                  <h3 className="px-2 text-xs font-extrabold text-ink-soft">
                    {dir === "across" ? `→ ${games.across}` : `↓ ${games.down}`}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {list.map((p) => (
                      <li key={p.cardId}>
                        <button
                          type="button"
                          onClick={() => selectPlacement(p)}
                          className={cn(
                            "w-full rounded-lg px-2 py-2 text-left text-sm text-ink transition-colors hover:bg-brand-600/8",
                            wordState[p.cardId] === "correct" && "text-success",
                            wordState[p.cardId] === "wrong" && "text-danger",
                            activePlacement?.cardId === p.cardId && "bg-brand-600/10"
                          )}
                        >
                          <span className="font-extrabold">{p.number}.</span> {p.prompt}{" "}
                          <span className="text-xs text-ink-soft">({p.answer.length})</span>
                          {wordState[p.cardId] === "correct" && (
                            <CheckCircle2 className="ml-1 inline size-3.5" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
