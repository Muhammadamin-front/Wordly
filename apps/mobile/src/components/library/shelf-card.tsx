import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Locale } from "@/i18n";
import { colors, fonts } from "@/theme/tokens";
import type { ShelfMeta } from "@/theme/shelves";

export function ShelfCard({
  meta,
  locale,
  total,
  learned,
  wordsLabel,
  learnedLabel,
  startLabel,
  continueLabel,
}: {
  meta: ShelfMeta;
  locale: Locale;
  total: number;
  learned: number;
  wordsLabel: string;
  learnedLabel: string;
  startLabel: string;
  continueLabel: string;
}) {
  const strings = meta.strings[locale];
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${strings.name}. ${learned}/${total} ${learnedLabel}`}
      onPress={() => router.push({ pathname: "/library/[key]", params: { key: meta.slug, name: strings.name } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: meta.color }]}>
          <Text style={styles.badgeText}>{meta.key}</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name={meta.icon} size={16} color="#ead9bd" />
        </View>
      </View>

      <View style={styles.bottom}>
        <Text numberOfLines={2} style={styles.name}>{strings.name}</Text>
        <Text numberOfLines={2} style={styles.desc}>{strings.desc}</Text>

        {total > 0 ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <Text style={styles.count}>
                {learned}
                <Text style={styles.countTotal}>/{total}</Text>
              </Text>
              <View style={styles.pctPill}><Text style={styles.pctText}>{pct}%</Text></View>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: meta.color }]} />
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.wordsLabel}>{wordsLabel}</Text>
              <Text style={styles.action}>{learned > 0 ? continueLabel : startLabel} →</Text>
            </View>
          </View>
        ) : (
          <View style={styles.footerRow}>
            <Text style={styles.wordsLabel}>{total} {wordsLabel}</Text>
            <Text style={styles.action}>{startLabel} →</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 172,
    borderWidth: 2,
    borderColor: colors.brand950,
    borderRadius: 16,
    backgroundColor: colors.brand950,
    padding: 12,
    shadowColor: "rgba(84,37,15,0.55)",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 5 },
    elevation: 5,
  },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], opacity: 0.94 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  badge: { minWidth: 30, minHeight: 30, alignItems: "center", justifyContent: "center", borderRadius: 15, paddingHorizontal: 6 },
  badgeText: { fontFamily: fonts.uiBold, fontSize: 10, color: "#f7ecd7" },
  iconWrap: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.12)" },
  bottom: { marginTop: "auto", paddingTop: 16 },
  name: { fontFamily: fonts.display, fontSize: 19, lineHeight: 21, letterSpacing: 0.3, color: "#fff" },
  desc: { marginTop: 4, fontFamily: fonts.ui, fontSize: 10, lineHeight: 14, color: "rgba(217,202,178,0.82)" },
  progressBlock: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.16)", gap: 6 },
  progressRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  count: { fontFamily: fonts.uiBold, fontSize: 16, color: "#fff" },
  countTotal: { fontFamily: fonts.uiMedium, fontSize: 12, color: "rgba(217,202,178,0.48)" },
  pctPill: { borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "rgba(255,255,255,0.12)" },
  pctText: { fontFamily: fonts.uiBold, fontSize: 10, color: "#fff" },
  track: { height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.16)" },
  fill: { height: "100%", borderRadius: 3 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  wordsLabel: { fontFamily: fonts.uiMedium, fontSize: 10, color: "rgba(217,202,178,0.8)" },
  action: { fontFamily: fonts.uiBold, fontSize: 10, color: "#f3d4a4" },
});
