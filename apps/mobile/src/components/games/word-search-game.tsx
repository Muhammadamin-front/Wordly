import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GameQuestion } from "@/api/client";
import { useTimeoutRegistry } from "@/hooks/use-timeout-registry";
import { colors, fonts } from "@/theme/tokens";

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

/** Ported from apps/web/components/games/word-search-game.tsx. The target
 *  word is the headword itself (games.py: word_search's `answer` field is
 *  the translation, but grade_answer's _expected_answer checks the headword
 *  — so, like the web version, the word to find/submit is question.prompt,
 *  never the shown "answer" field). */
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
}: {
  search: WordSearch;
  onAnswer: (cardId: string, correct: boolean, durationMs: number, submitted: string) => void;
  onComplete: () => void;
}) {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const timeouts = useTimeoutRegistry();

  const foundCells = new Set(search.targets.filter((t) => found.has(t.cardId)).flatMap((t) => t.cells));

  function tap(r: number, c: number) {
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
    const match = search.targets.find((t) => !found.has(t.cardId) && (t.word === forward || t.word === reversed));
    if (match) {
      const next = new Set(found).add(match.cardId);
      setFound(next);
      onAnswer(match.cardId, true, 3000, match.word);
      if (next.size === search.targets.length) timeouts.schedule(onComplete, 500);
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <Ionicons name="search-outline" size={16} color={colors.brand500} />
        <Text style={styles.headerText}>{found.size}/{search.targets.length}</Text>
      </View>
      <View style={styles.gridWrap}>
        {search.grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((ch, c) => {
              const key = `${r},${c}`;
              const isFound = foundCells.has(key);
              const isStart = start !== null && start[0] === r && start[1] === c;
              return (
                <Pressable
                  key={key}
                  onPress={() => tap(r, c)}
                  style={[
                    styles.cell,
                    { width: `${100 / search.size}%` },
                    isFound && styles.cellFound,
                    isStart && styles.cellStart,
                  ]}
                >
                  <Text style={[styles.cellText, isFound && styles.cellTextFound, isStart && styles.cellTextStart]}>
                    {ch}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.targets}>
        {search.targets.map((t) => (
          <View key={t.cardId} style={[styles.targetPill, found.has(t.cardId) && styles.targetPillFound]}>
            {found.has(t.cardId) && <Ionicons name="checkmark" size={11} color={colors.teal} />}
            <Text style={[styles.targetText, found.has(t.cardId) && styles.targetTextFound]}>{t.word}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10, marginBottom: 12 },
  headerText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  gridWrap: { alignSelf: "center", width: "100%", maxWidth: 380, borderRadius: 12, backgroundColor: colors.raised, padding: 6 },
  row: { flexDirection: "row" },
  cell: { aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 4, margin: 1, backgroundColor: colors.cream },
  cellFound: { backgroundColor: "rgba(70,120,120,0.28)" },
  cellStart: { backgroundColor: colors.brand600 },
  cellText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  cellTextFound: { color: colors.teal },
  cellTextStart: { color: colors.onAccent },
  targets: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  targetPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: colors.line, paddingHorizontal: 10, paddingVertical: 5 },
  targetPillFound: { backgroundColor: "rgba(70,120,120,0.14)" },
  targetText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  targetTextFound: { color: colors.teal, textDecorationLine: "line-through" },
});
