import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GameQuestion } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

/** Classic Hangman — guess the headword one letter at a time.
 *  Ported from apps/web/components/games/hangman-game.tsx. question.answer
 *  is the headword (games.py: GameQuestion(card.id, translation, headword)),
 *  question.prompt is the Uzbek/Russian translation shown as a hint. */
export function HangmanRound({
  question,
  livesLabel,
  onResolved,
}: {
  question: GameQuestion;
  livesLabel: string;
  /** The parent submits this to the same /games/answer flow every other
   *  game type uses (grading, XP, feedback panel) — this component only
   *  needs to decide *when* a round is over and what string to submit. */
  onResolved: (submitted: string) => void;
}) {
  const answer = question.answer.toUpperCase();
  const letters = answer.split("");
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
    setGuessed(new Set());
    setWrong(0);
  }, [question.card_id]);

  const solved = letters.every((ch) => ch === " " || guessed.has(ch));
  const lost = wrong >= MAX_WRONG;

  function guess(letter: string) {
    if (done.current || guessed.has(letter) || solved || lost) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    const nowSolved = letters.every((ch) => ch === " " || next.has(ch));
    let nowWrong = wrong;
    if (!answer.includes(letter)) {
      nowWrong = wrong + 1;
      setWrong(nowWrong);
    }
    if (nowSolved || nowWrong >= MAX_WRONG) {
      done.current = true;
      // A loss submits the empty string — the same "leaving it blank" the
      // real exam would score as wrong, same convention as web's version.
      onResolved(nowSolved ? answer : "");
    }
  }

  return (
    <View>
      <View style={styles.card}>
        <View style={[styles.badge, solved && styles.badgeSolved, lost && styles.badgeLost]}>
          <Ionicons
            name={lost ? "skull-outline" : "sparkles-outline"}
            size={26}
            color={lost ? colors.danger : solved ? colors.teal : colors.brand500}
          />
        </View>
        <View accessibilityLabel={`${MAX_WRONG - wrong} ${livesLabel}`} style={styles.lives}>
          {Array.from({ length: MAX_WRONG }, (_, i) => (
            <Ionicons
              key={i}
              name={i < MAX_WRONG - wrong ? "heart" : "heart-dislike-outline"}
              size={16}
              color={i < MAX_WRONG - wrong ? colors.danger : "rgba(84,37,15,0.3)"}
            />
          ))}
        </View>
        <Text style={styles.hint}>{question.prompt}</Text>
        <View style={styles.blanks}>
          {letters.map((ch, i) =>
            ch === " " ? (
              <View key={i} style={styles.space} />
            ) : (
              <View key={i} style={styles.blank}>
                <Text style={styles.blankLetter}>{guessed.has(ch) || lost ? ch : ""}</Text>
              </View>
            )
          )}
        </View>
        {lost && <Text style={styles.reveal}>→ {answer}</Text>}
      </View>

      <View style={styles.keyboard}>
        {LETTERS.map((letter) => {
          const used = guessed.has(letter);
          const hit = used && answer.includes(letter);
          return (
            <Pressable
              key={letter}
              disabled={used || solved || lost}
              onPress={() => guess(letter)}
              style={({ pressed }) => [
                styles.key,
                hit && styles.keyHit,
                used && !hit && styles.keyMiss,
                pressed && !used && styles.pressed,
              ]}
            >
              <Text style={[styles.keyText, used && !hit && styles.keyTextMiss, hit && styles.keyTextHit]}>
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised, padding: 18 },
  badge: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 28, borderWidth: 1, borderColor: "rgba(200,106,59,0.35)", backgroundColor: "rgba(200,106,59,0.10)" },
  badgeSolved: { borderColor: "rgba(70,120,120,0.4)", backgroundColor: "rgba(70,120,120,0.12)" },
  badgeLost: { borderColor: "rgba(220,38,38,0.4)", backgroundColor: "rgba(220,38,38,0.10)" },
  lives: { flexDirection: "row", gap: 5 },
  hint: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.muted, textAlign: "center" },
  blanks: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 5 },
  space: { width: 10 },
  blank: { width: 26, height: 32, alignItems: "center", justifyContent: "flex-end", borderBottomWidth: 2, borderBottomColor: colors.ink },
  blankLetter: { fontFamily: fonts.uiBold, fontSize: 19, color: colors.ink },
  reveal: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.danger },
  keyboard: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  key: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream },
  keyHit: { borderColor: "rgba(70,120,120,0.4)", backgroundColor: "rgba(70,120,120,0.18)" },
  keyMiss: { borderColor: "rgba(220,38,38,0.35)", backgroundColor: "rgba(220,38,38,0.13)" },
  keyText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  keyTextHit: { color: colors.teal },
  keyTextMiss: { color: colors.danger },
  pressed: { opacity: 0.7 },
});
