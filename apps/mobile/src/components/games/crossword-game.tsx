import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui";
import type { GameQuestion } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

export type Dir = "across" | "down";

export interface Placement {
  cardId: string;
  answer: string; // UPPERCASE
  prompt: string; // definition clue, with the answer masked
  row: number;
  col: number;
  dir: Dir;
  number: number;
}

export interface Crossword {
  rows: number;
  cols: number;
  solution: (string | null)[][];
  placements: Placement[];
}

const MAX_WORDS = 10;
const MAX_ANSWER_LENGTH = 15;

interface Slot {
  word: string;
  q: GameQuestion;
  row: number;
  col: number;
  dir: Dir;
}

function canPlace(grid: Map<string, string>, word: string, row: number, col: number, dir: Dir): boolean {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  if (grid.has(`${row - dr},${col - dc}`)) return false;
  if (grid.has(`${row + dr * word.length},${col + dc * word.length}`)) return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = grid.get(`${r},${c}`);
    if (existing !== undefined) {
      if (existing !== word[i]) return false;
      continue;
    }
    if (dir === "across" && (grid.has(`${r - 1},${c}`) || grid.has(`${r + 1},${c}`))) return false;
    if (dir === "down" && (grid.has(`${r},${c - 1}`) || grid.has(`${r},${c + 1}`))) return false;
  }
  return true;
}

export function maskAnswer(prompt: string, answer: string): string {
  const escaped = answer.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return prompt.trim();
  return prompt.replace(new RegExp(escaped, "gi"), "___").trim();
}

/** Ported from apps/web/components/games/crossword-game.tsx's buildCrossword
 *  — identical placement algorithm (longest word first, then attach
 *  remaining words at shared letters, islands as a fallback). The
 *  interactive per-cell grid typing is simplified to word-level entry for
 *  mobile (see CrosswordGame below); the grid itself, numbering, and
 *  crossing-letter reveals are the same real mechanic as web. */
export function buildCrossword(questions: GameQuestion[]): Crossword {
  const usable = questions
    .map((q) => ({ q, word: q.answer.replace(/[^a-z]/gi, "").toUpperCase() }))
    .filter(({ q, word }) => word.length >= 3 && word.length <= MAX_ANSWER_LENGTH && q.prompt.trim())
    .slice(0, MAX_WORDS)
    .map(({ q, word }) => ({ q: { ...q, prompt: maskAnswer(q.prompt, q.answer) }, word }));

  if (!usable.length) return { rows: 0, cols: 0, solution: [], placements: [] };

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

  let bottom = Math.max(...slots.map((s) => s.row + (s.dir === "down" ? s.word.length : 1)));
  for (const { q, word } of leftovers) {
    const row = bottom + 1;
    if (canPlace(grid, word, row, 0, "across")) {
      write({ word, q, row, col: 0, dir: "across" });
      bottom = row + 1;
    }
  }

  const cells = [...grid.keys()].map((k) => k.split(",").map(Number));
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const rows = Math.max(...cells.map(([r]) => r)) - minR + 1;
  const cols = Math.max(...cells.map(([, c]) => c)) - minC + 1;
  const solution: (string | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid.get(`${r + minR},${c + minC}`) ?? null)
  );

  const starts = new Map<string, number>();
  let nextNumber = 1;
  const placements: Placement[] = [];
  const ordered = [...slots].sort((a, b) => a.row - minR - (b.row - minR) || a.col - minC - (b.col - minC));
  for (const slot of ordered) {
    const row = slot.row - minR;
    const col = slot.col - minC;
    const key = `${row},${col}`;
    const number = starts.get(key) ?? nextNumber;
    if (!starts.has(key)) {
      starts.set(key, number);
      nextNumber += 1;
    }
    placements.push({ cardId: slot.q.card_id, answer: slot.word, prompt: slot.q.prompt, row, col, dir: slot.dir, number });
  }

  return { rows, cols, solution, placements };
}

function cellsOf(p: Placement): Array<[number, number]> {
  return Array.from({ length: p.answer.length }, (_, i) => (p.dir === "across" ? [p.row, p.col + i] : [p.row + i, p.col]));
}

/** Mobile crossword: same grid/numbering/crossing-letter mechanic as web,
 *  with word-level answer entry (tap a clue, type the whole word) instead of
 *  per-cell keyboard navigation — letters still populate into the shared
 *  grid as each word is solved, so crossings are still visible and useful. */
export function CrosswordGame({
  crossword,
  labels,
  onAnswer,
  onComplete,
}: {
  crossword: Crossword;
  labels: { across: string; down: string; check: string; solved: string };
  onAnswer: (cardId: string, correct: boolean, durationMs: number, submitted: string) => void;
  onComplete: () => void;
}) {
  const { rows, cols, solution, placements } = crossword;
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [wrongId, setWrongId] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  const revealed: (string | null)[][] = solution.map((line) => line.map(() => null));
  for (const p of placements) {
    if (!solvedIds.has(p.cardId)) continue;
    cellsOf(p).forEach(([r, c], i) => {
      revealed[r][c] = p.answer[i];
    });
  }

  function submit(placement: Placement) {
    const attempt = input.trim();
    if (!attempt) return;
    const correct = attempt.toUpperCase().replace(/[^A-Z]/g, "") === placement.answer;
    onAnswer(placement.cardId, correct, Date.now() - startedAt.current, attempt);
    if (correct) {
      setSolvedIds((prev) => new Set(prev).add(placement.cardId));
      setActiveId(null);
      setInput("");
      startedAt.current = Date.now();
      if (solvedIds.size + 1 === placements.length) setTimeout(onComplete, 500);
    } else {
      setWrongId(placement.cardId);
      setTimeout(() => setWrongId(null), 700);
    }
  }

  const across = placements.filter((p) => p.dir === "across");
  const down = placements.filter((p) => p.dir === "down");

  return (
    <View>
      <View style={styles.gridWrap}>
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: cols }, (_, c) => {
              const letter = solution[r][c];
              const starter = placements.find((p) => p.row === r && p.col === c);
              if (!letter) return <View key={c} style={[styles.cell, styles.block, { width: `${100 / cols}%` }]} />;
              return (
                <View key={c} style={[styles.cell, { width: `${100 / cols}%` }]}>
                  {starter && <Text style={styles.cellNumber}>{starter.number}</Text>}
                  <Text style={styles.cellLetter}>{revealed[r][c] ?? ""}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <ClueList
        title={labels.across}
        items={across}
        activeId={activeId}
        wrongId={wrongId}
        solvedIds={solvedIds}
        input={input}
        checkLabel={labels.check}
        solvedLabel={labels.solved}
        onActivate={(id) => {
          setActiveId(id);
          setInput("");
        }}
        onChangeInput={setInput}
        onSubmit={submit}
      />
      <ClueList
        title={labels.down}
        items={down}
        activeId={activeId}
        wrongId={wrongId}
        solvedIds={solvedIds}
        input={input}
        checkLabel={labels.check}
        solvedLabel={labels.solved}
        onActivate={(id) => {
          setActiveId(id);
          setInput("");
        }}
        onChangeInput={setInput}
        onSubmit={submit}
      />
    </View>
  );
}

function ClueList({
  title,
  items,
  activeId,
  wrongId,
  solvedIds,
  input,
  checkLabel,
  solvedLabel,
  onActivate,
  onChangeInput,
  onSubmit,
}: {
  title: string;
  items: Placement[];
  activeId: string | null;
  wrongId: string | null;
  solvedIds: Set<string>;
  input: string;
  checkLabel: string;
  solvedLabel: string;
  onActivate: (id: string) => void;
  onChangeInput: (value: string) => void;
  onSubmit: (placement: Placement) => void;
}) {
  if (!items.length) return null;
  return (
    <View style={styles.clueSection}>
      <Text style={styles.clueSectionTitle}>{title}</Text>
      {items.map((p) => {
        const solved = solvedIds.has(p.cardId);
        const active = activeId === p.cardId;
        const wrong = wrongId === p.cardId;
        return (
          <View key={p.cardId}>
            <Pressable
              disabled={solved}
              onPress={() => onActivate(p.cardId)}
              style={[styles.clueRow, solved && styles.clueRowSolved, active && styles.clueRowActive]}
            >
              <Text style={styles.clueNumber}>{p.number}.</Text>
              <Text numberOfLines={2} style={[styles.clueText, solved && styles.clueTextSolved]}>{p.prompt}</Text>
              {solved && (
                <View style={styles.clueDone}>
                  <Ionicons name="checkmark" size={12} color={colors.raised} />
                </View>
              )}
            </Pressable>
            {active && !solved && (
              <View style={styles.answerRow}>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  onChangeText={onChangeInput}
                  onSubmitEditing={() => onSubmit(p)}
                  placeholder={`${p.answer.length} letters`}
                  placeholderTextColor={colors.muted}
                  returnKeyType="done"
                  style={[styles.answerInput, wrong && styles.answerInputWrong]}
                  value={input}
                />
                <Button onPress={() => onSubmit(p)}>{checkLabel}</Button>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrap: { alignSelf: "center", width: "100%", maxWidth: 380, borderRadius: 12, backgroundColor: colors.raised, padding: 4, marginBottom: 6 },
  row: { flexDirection: "row" },
  cell: { aspectRatio: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, borderColor: colors.line, backgroundColor: colors.cream },
  block: { backgroundColor: "transparent", borderWidth: 0 },
  cellNumber: { position: "absolute", left: 2, top: 1, fontFamily: fonts.uiBold, fontSize: 7, color: colors.muted },
  cellLetter: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  clueSection: { marginTop: 14, gap: 6 },
  clueSectionTitle: { fontFamily: fonts.uiBold, fontSize: 12, textTransform: "uppercase", color: colors.muted },
  clueRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, paddingHorizontal: 11, paddingVertical: 10 },
  clueRowSolved: { borderColor: "rgba(70,120,120,0.35)", backgroundColor: "rgba(70,120,120,0.10)" },
  clueRowActive: { borderColor: colors.brand400, backgroundColor: "rgba(200,106,59,0.10)" },
  clueNumber: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.muted, width: 20 },
  clueText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, color: colors.ink },
  clueTextSolved: { color: colors.teal, textDecorationLine: "line-through" },
  clueDone: { width: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colors.teal },
  answerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, marginLeft: 28 },
  answerInput: { flex: 1, minHeight: 42, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, fontFamily: fonts.uiBold, fontSize: 14, letterSpacing: 1, color: colors.ink, backgroundColor: colors.raised },
  answerInputWrong: { borderColor: colors.danger },
});
