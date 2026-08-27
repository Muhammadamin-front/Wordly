import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GameQuestion } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/** Word Match — tap a word on the left, then its translation on the right.
 *  Ported from apps/web/components/games/match-game.tsx. */
export function MatchGame({
  questions,
  onAnswer,
  onComplete,
}: {
  questions: GameQuestion[];
  onAnswer: (cardId: string, correct: boolean, durationMs: number, submitted: string) => void;
  onComplete: () => void;
}) {
  const [left] = useState(() => shuffle(questions));
  const [right] = useState(() => shuffle(questions));
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
      if (next.size === left.length) setTimeout(onComplete, 500);
    } else {
      setMissed((m) => new Set(m).add(selected));
      setWrong(cardId);
      setTimeout(() => setWrong(null), 500);
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <Ionicons name="link-outline" size={16} color={colors.brand500} />
        <Text style={styles.headerText}>{matched.size}/{left.length}</Text>
      </View>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((q) => {
            const done = matched.has(q.card_id);
            const active = selected === q.card_id;
            return (
              <Pressable
                key={q.card_id}
                disabled={done}
                onPress={() => pickWord(q.card_id)}
                style={[styles.cell, done && styles.cellDone, active && styles.cellActive]}
              >
                <Text numberOfLines={2} style={[styles.cellText, done && styles.cellTextDone, active && styles.cellTextActive]}>
                  {q.prompt}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.column}>
          {right.map((q) => {
            const done = matched.has(q.card_id);
            const isWrong = wrong === q.card_id;
            return (
              <Pressable
                key={q.card_id}
                disabled={done}
                onPress={() => pickTranslation(q.card_id)}
                style={[styles.cell, done && styles.cellDone, isWrong && styles.cellWrong]}
              >
                <Text numberOfLines={2} style={[styles.cellText, done && styles.cellTextDone, isWrong && styles.cellTextWrong]}>
                  {q.answer}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10, marginBottom: 12 },
  headerText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  columns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, gap: 8 },
  cell: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, paddingHorizontal: 10, paddingVertical: 8 },
  cellDone: { borderColor: "rgba(70,120,120,0.4)", backgroundColor: "rgba(70,120,120,0.10)", opacity: 0.55 },
  cellActive: { borderColor: colors.brand400, backgroundColor: "rgba(200,106,59,0.14)" },
  cellWrong: { borderColor: colors.danger, backgroundColor: "rgba(220,38,38,0.10)" },
  cellText: { fontFamily: fonts.uiMedium, fontSize: 13, textAlign: "center", color: colors.ink },
  cellTextDone: { color: colors.teal },
  cellTextActive: { color: colors.brand600, fontFamily: fonts.uiBold },
  cellTextWrong: { color: colors.danger },
});
