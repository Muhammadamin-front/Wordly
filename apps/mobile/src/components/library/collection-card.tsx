import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { Deck } from "@/api/client";
import { colors, fonts } from "@/theme/tokens";

export function CollectionCard({
  deck,
  labels,
  onDelete,
}: {
  deck: Deck;
  labels: { cards: string; due: string; review: string; delete: string; deleteConfirm: string; cancel: string };
  onDelete: () => void;
}) {
  const confirmDelete = () => {
    Alert.alert(deck.name, labels.deleteConfirm, [
      { text: labels.cancel, style: "cancel" },
      { text: labels.delete, style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart-outline" size={18} color={colors.brand600} />
        </View>
        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.name}>{deck.name}</Text>
          {deck.description ? <Text numberOfLines={1} style={styles.desc}>{deck.description}</Text> : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{labels.cards}</Text>
          <Text style={styles.statValue}>{deck.card_count ?? 0}</Text>
        </View>
        <View style={[styles.stat, styles.statDue]}>
          <Text style={[styles.statLabel, styles.statDueLabel]}>{labels.due}</Text>
          <Text style={styles.statValue}>{deck.due_count ?? 0}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${labels.review}: ${deck.name}`}
          onPress={() => router.push({ pathname: "/(tabs)/review", params: { deckId: deck.id } })}
          style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
        >
          <Ionicons name="play" size={13} color={colors.raised} />
          <Text style={styles.reviewText}>{labels.review}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${labels.delete}: ${deck.name}`}
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.cream,
    padding: 14,
    shadowColor: colors.brown,
    shadowOpacity: 0.17,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 5 },
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  iconWrap: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  headerText: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  desc: { marginTop: 2, fontFamily: fonts.ui, fontSize: 11, color: colors.muted },
  statsRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised, paddingHorizontal: 9, paddingVertical: 7 },
  statDue: { borderColor: "rgba(185,78,40,0.3)", backgroundColor: "rgba(185,78,40,0.08)" },
  statLabel: { fontFamily: fonts.uiBold, fontSize: 8.5, letterSpacing: 0.4, color: colors.muted, textTransform: "uppercase" },
  statDueLabel: { color: colors.brand600 },
  statValue: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink },
  actions: { marginTop: 12, flexDirection: "row", gap: 8 },
  reviewButton: { flex: 1, minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: colors.brand950, borderRadius: 9, backgroundColor: colors.brand600 },
  reviewText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.raised },
  deleteButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(220,38,38,0.35)", borderRadius: 9, backgroundColor: "rgba(220,38,38,0.10)" },
  pressed: { opacity: 0.8 },
});
