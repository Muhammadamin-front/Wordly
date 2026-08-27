import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GameQuestion } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

export interface Tile {
  key: string;
  cardId: string;
  text: string;
}

export function buildMemoryTiles(questions: GameQuestion[]): Tile[] {
  const tiles = questions.flatMap((q) => [
    { key: q.card_id + ":w", cardId: q.card_id, text: q.prompt },
    { key: q.card_id + ":t", cardId: q.card_id, text: q.answer },
  ]);
  return shuffle(tiles);
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/** Memory — flip tiles to find each word/translation pair.
 *  Ported from apps/web/components/games/memory-game.tsx. */
export function MemoryGame({
  tiles,
  pairCount,
  matchedLabel,
  onAnswer,
  onComplete,
}: {
  tiles: Tile[];
  pairCount: number;
  matchedLabel: string;
  onAnswer: (cardId: string, correct: boolean, durationMs: number, submitted: string) => void;
  onComplete: () => void;
}) {
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
      setTimeout(() => {
        const done = new Set(matched).add(a.cardId);
        setMatched(done);
        setFlipped([]);
        setBusy(false);
        const translation = tiles.find((t) => t.key === a.cardId + ":t")?.text ?? a.text;
        onAnswer(a.cardId, true, 2500, translation);
        if (done.size === pairCount) setTimeout(onComplete, 400);
      }, 450);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 900);
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid-outline" size={16} color={colors.brand500} />
          <Text style={styles.headerText}>{matched.size}/{pairCount} {matchedLabel}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId);
          const isFlipped = flipped.includes(tile.key) || isMatched;
          return (
            <Pressable
              key={tile.key}
              disabled={isMatched || busy}
              onPress={() => flip(tile)}
              style={[styles.tile, isMatched && styles.tileMatched]}
            >
              {isFlipped ? (
                <View style={styles.tileFace}>
                  <Text numberOfLines={3} style={styles.tileText}>{tile.text}</Text>
                  {isMatched && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={11} color={colors.raised} />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.tileBack}>
                  <Ionicons name="help-outline" size={20} color={colors.brand200} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10, marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  tile: { width: "30%", aspectRatio: 1, borderRadius: 12 },
  tileMatched: { opacity: 0.55 },
  tileFace: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "rgba(200,106,59,0.4)", backgroundColor: colors.raised, padding: 6 },
  tileText: { fontFamily: fonts.uiBold, fontSize: 12, textAlign: "center", color: colors.ink },
  checkBadge: { position: "absolute", right: 5, top: 5, width: 16, height: 16, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.teal },
  tileBack: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.brand800 },
});
