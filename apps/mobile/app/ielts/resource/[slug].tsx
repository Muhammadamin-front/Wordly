import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BackButton, Screen } from "@/components/ui";
import { getIeltsResource } from "@/ielts/content";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const copy = {
  uz: { back: "IELTS markazi", bank: "So'zlar banki", basic: "Oddiy variant", upgrade: "Aniqroq variantlar", example: "Misol", find: "Mos kartalarni topish", cards: "IELTS so'z kartalarini ochish", expressions: "Iboralar kutubxonasi", steps: ["Yangi iborani to'liq IELTS uslubidagi gap ichida o'rganing.", "Mos IELTS kartalarini ochib, foydali so'zlarni SRS'ga saqlang.", "Iborani writing yoki speakingda ishlating, ertaga qayta takrorlang."] },
  ru: { back: "Центр IELTS", bank: "Банк слов", basic: "Базовый вариант", upgrade: "Точные варианты", example: "Пример", find: "Найти подходящие карточки", cards: "Открыть карточки IELTS", expressions: "Библиотека выражений", steps: ["Изучите новую фразу в полном предложении IELTS.", "Откройте подходящие карточки и сохраните полезные слова в SRS.", "Используйте фразу в writing или speaking и повторите завтра."] },
  en: { back: "IELTS hub", bank: "Word bank", basic: "Basic option", upgrade: "Sharper options", example: "Example", find: "Find matching cards", cards: "Open IELTS word cards", expressions: "Expression library", steps: ["Learn the new phrase inside a complete IELTS-style sentence.", "Open matching cards and save useful words to SRS.", "Use the phrase in writing or speaking, then review it tomorrow."] },
} as const;

export default function IeltsResourceScreen() {
  const { slug = "" } = useLocalSearchParams<{ slug?: string }>();
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const resource = getIeltsResource(locale, slug);
  const t = copy[locale];

  if (!resource) {
    return <Redirect href="/(tabs)/ielts" />;
  }

  const groups = resource.groups;

  return (
    <Screen appHeader appFooter>
      <BackButton label={t.back} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      <View style={styles.hero}>
        <View style={styles.label}><Ionicons name="sparkles-outline" size={15} color={colors.teal} /><Text style={styles.labelText}>{resource.eyebrow}</Text></View>
        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.description}>{resource.description}</Text>
      </View>
      <View style={styles.steps}>{t.steps.map((step, index) => <View key={step} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><View style={styles.stepCopy}><Ionicons name="checkmark-circle-outline" size={18} color={colors.teal} /><Text style={styles.stepText}>{step}</Text></View></View>)}</View>
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupLabel}>{t.bank}</Text>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Text style={styles.groupNote}>{group.note}</Text>
          <View style={styles.items}>
            {group.items.map((item) => {
              const query = item.advanced.split(/[·/]/)[0]?.trim() || item.basic;
              return (
                <View key={`${item.basic}-${item.advanced}`} style={styles.item}>
                  <View style={styles.compare}>
                    <View style={styles.basicColumn}><Text style={styles.columnLabel}>{t.basic}</Text><Text style={styles.basic}>{item.basic}</Text></View>
                    <Ionicons name="arrow-forward" size={18} color={colors.brand600} />
                    <View style={styles.upgradeColumn}><Text style={styles.columnLabel}>{t.upgrade}</Text><Text style={styles.upgrade}>{item.advanced}</Text></View>
                  </View>
                  <View style={styles.example}><Text style={styles.exampleLabel}>{t.example}</Text><Text style={styles.exampleText}>{item.example}</Text></View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${t.find}: ${query}`} onPress={() => router.push({ pathname: "/(tabs)/library", params: { q: query, category: "ielts" } })} style={({ pressed }) => [styles.findButton, pressed && styles.pressed]}><Text style={styles.findButtonText}>{t.find}</Text><Ionicons name="arrow-forward" size={15} color={colors.brand600} /></Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ))}
      <View style={styles.footerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.cards} onPress={() => router.push({ pathname: "/library/[key]", params: { key: "ielts", name: t.cards } })} style={({ pressed }) => [styles.cardsButton, pressed && styles.pressed]}><Text style={styles.cardsButtonText}>{t.cards}</Text><Ionicons name="arrow-forward" size={17} color={colors.raised} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t.expressions} onPress={() => router.push("/expressions")} style={({ pressed }) => [styles.expressionsButton, pressed && styles.pressed]}><Text style={styles.expressionsButtonText}>{t.expressions}</Text><Ionicons name="arrow-forward" size={17} color={colors.ink} /></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 13, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.16, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  label: { alignSelf: "flex-start", minHeight: 31, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.teal, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.10)" },
  labelText: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.brand800 },
  title: { maxWidth: 310, fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: 0.45, textTransform: "uppercase", color: colors.ink },
  description: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  steps: { gap: 10 },
  step: { gap: 13, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.14, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  stepNumber: { alignSelf: "flex-start", minWidth: 34, height: 34, paddingHorizontal: 8, textAlign: "center", textAlignVertical: "center", borderRadius: 8, backgroundColor: "rgba(185,78,40,0.09)", fontFamily: fonts.uiMedium, fontSize: 13, color: colors.rust },
  stepCopy: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 22, color: colors.ink },
  group: { gap: 8, marginTop: 8 },
  groupLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.teal },
  groupTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, color: colors.ink },
  groupNote: { marginBottom: 4, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  items: { gap: 12 },
  item: { overflow: "hidden", borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  compare: { minHeight: 112, flexDirection: "row", alignItems: "center", gap: 10, padding: 15 },
  basicColumn: { flex: 0.75, gap: 7 },
  upgradeColumn: { flex: 1.25, gap: 7 },
  columnLabel: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase", color: colors.teal },
  basic: { fontFamily: fonts.uiBold, fontSize: 13, lineHeight: 19, color: colors.ink },
  upgrade: { fontFamily: fonts.uiBold, fontSize: 13, lineHeight: 20, color: colors.ink },
  example: { gap: 5, paddingHorizontal: 15, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.raised },
  exampleLabel: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase", color: colors.brand600 },
  exampleText: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
  findButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 15, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.cream },
  findButtonText: { fontFamily: fonts.uiBold, fontSize: 11.5, color: colors.brand600 },
  cardsButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.brand950, borderRadius: 11, backgroundColor: colors.brand600, shadowColor: colors.brown, shadowOpacity: 0.72, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 3 },
  cardsButtonText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.raised },
  footerActions: { gap: 10 },
  expressionsButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised },
  expressionsButtonText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
});
