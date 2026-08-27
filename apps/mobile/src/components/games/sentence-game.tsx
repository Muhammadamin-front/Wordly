import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui";
import type { GameQuestion } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

export interface SentenceLabels {
  buildSentence: string;
  clear: string;
  check: string;
}

/** Sentence Builder — tap the scrambled words into the correct order.
 *  Ported from apps/web/components/games/sentence-game.tsx; the reconstructed
 *  string is submitted as-is and graded server-side (games.py's
 *  _norm_sentence — case/punctuation-insensitive), so exact casing here
 *  doesn't matter, only word order. */
export function SentenceRound({
  question,
  labels,
  onResolved,
}: {
  question: GameQuestion;
  labels: SentenceLabels;
  /** The parent submits this to the same /games/answer flow every other
   *  game type uses (grading, XP, feedback panel) — this component only
   *  needs to decide *when* a round is over and what string to submit. */
  onResolved: (submitted: string) => void;
}) {
  const words = question.answer.replace(/[.!?]$/, "").split(/\s+/);
  const [scrambled] = useState(() => shuffle(words.map((w, i) => ({ w, i }))));
  const [built, setBuilt] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  // A fresh round (new question) needs a blank slate — this component is
  // remounted per question via a `key` in the parent, but guard anyway since
  // remounting isn't guaranteed by every caller.
  useEffect(() => {
    setBuilt([]);
    setResult(null);
  }, [question.card_id]);

  const used = new Set(built);

  function check() {
    if (result) return;
    const attempt = built.map((pos) => scrambled[pos].w).join(" ");
    const correct = attempt === words.join(" ");
    setResult(correct ? "correct" : "wrong");
    onResolved(attempt);
  }

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.promptRow}>
          <Ionicons name="layers-outline" size={16} color={colors.muted} />
          <Text style={styles.prompt}>{question.prompt}</Text>
        </View>

        <View style={styles.built}>
          {built.length === 0 ? (
            <Text style={styles.placeholder}>{labels.buildSentence}…</Text>
          ) : (
            built.map((pos, slot) => (
              <Pressable
                key={pos}
                disabled={!!result}
                onPress={() => setBuilt(built.filter((_, i) => i !== slot))}
                style={({ pressed }) => [styles.builtTile, pressed && styles.pressed]}
              >
                <Text style={styles.builtTileText}>{scrambled[pos].w}</Text>
              </Pressable>
            ))
          )}
        </View>

        {result === "wrong" && <Text style={styles.correctAnswer}>✓ {words.join(" ")}</Text>}
      </View>

      <View style={styles.bank}>
        {scrambled.map((tile, pos) =>
          used.has(pos) ? (
            <View key={pos} style={[styles.bankTile, styles.bankTileGhost]}>
              <Text style={[styles.bankTileText, styles.ghostText]}>{tile.w}</Text>
            </View>
          ) : (
            <Pressable
              key={pos}
              disabled={!!result}
              onPress={() => setBuilt([...built, pos])}
              style={({ pressed }) => [styles.bankTile, pressed && styles.pressed]}
            >
              <Text style={styles.bankTileText}>{tile.w}</Text>
            </Pressable>
          )
        )}
      </View>

      <View style={styles.actions}>
        <Button variant="quiet" disabled={!!result || built.length === 0} onPress={() => setBuilt([])}>
          {labels.clear}
        </Button>
        <Button disabled={!!result || built.length !== words.length} onPress={check}>
          {labels.check}
        </Button>
      </View>
    </View>
  );
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

const styles = StyleSheet.create({
  card: { alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised, padding: 18 },
  promptRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  prompt: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.muted },
  built: { minHeight: 46, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", borderRadius: 11, backgroundColor: colors.paper, paddingHorizontal: 10, paddingVertical: 8 },
  placeholder: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
  builtTile: { borderRadius: 10, borderWidth: 1, borderColor: colors.brand400, backgroundColor: "rgba(200,106,59,0.14)", paddingHorizontal: 10, paddingVertical: 6 },
  builtTileText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.brand600 },
  correctAnswer: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.teal },
  bank: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  bankTile: { borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, paddingHorizontal: 12, paddingVertical: 8 },
  bankTileGhost: { borderStyle: "dashed" },
  bankTileText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  ghostText: { color: "transparent" },
  pressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
  actions: { marginTop: 14, flexDirection: "row", justifyContent: "center", gap: 10 },
});
