import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { request, type MasteryMap } from "@/api/client";
import { ErrorState, Loader, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: {
    eyebrow: "Sizning lug'at yo'lingiz",
    title: "Har bir so'z qanday sizniki bo'layotganini ko'ring",
    subtitle: "Har bir CEFR darajasida so'zlarni ilk tanishuvdan mustahkam xotiragacha kuzating.",
    overall: "Umumiy o'zlashtirish",
    current: "Joriy daraja",
    started: "Jarayondagi so'zlar",
    mastered: "O'zlashtirilgan so'zlar",
    mapTitle: "CEFR o'zlashtirish yo'li",
    mapSubtitle: "SRS takrorlashlari xaritani avtomatik yangilaydi.",
    words: "so'z",
    active: "Sizning darajangiz",
    stages: ["Yangi", "O'rganilmoqda", "Mustahkam", "O'zlashtirilgan"],
    loadError: "O'zlashtirish xaritasini yuklab bo'lmadi.",
    retry: "Qayta urinish",
  },
  ru: {
    eyebrow: "Ваш словарный маршрут",
    title: "Следите, как каждое слово становится вашим",
    subtitle: "Наблюдайте путь слов от первого знакомства до прочного запоминания на всех уровнях CEFR.",
    overall: "Общее освоение",
    current: "Текущий уровень",
    started: "Слов в процессе",
    mastered: "Освоено слов",
    mapTitle: "Путь освоения CEFR",
    mapSubtitle: "Повторения SRS обновляют карту автоматически.",
    words: "слов",
    active: "Ваш уровень",
    stages: ["Новые", "Изучаются", "Закреплены", "Освоены"],
    loadError: "Не удалось загрузить карту освоения.",
    retry: "Попробовать снова",
  },
  en: {
    eyebrow: "Your vocabulary journey",
    title: "See every word becoming yours",
    subtitle: "Follow your vocabulary from first contact to lasting recall across every CEFR level.",
    overall: "Overall mastery",
    current: "Current level",
    started: "Words in progress",
    mastered: "Mastered words",
    mapTitle: "CEFR mastery path",
    mapSubtitle: "Your SRS reviews update this map automatically.",
    words: "words",
    active: "Your level",
    stages: ["New", "Learning", "Strong", "Mastered"],
    loadError: "Your mastery map could not be loaded.",
    retry: "Try again",
  },
} as const;

const stageColors = [colors.line, colors.gold400, colors.brand400, colors.brand700];

export default function Progress() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const mastery = useQuery({
    queryKey: ["mastery-map"],
    queryFn: () => request<MasteryMap>("/me/mastery-map", { token }),
    enabled: !!token,
  });

  if (mastery.isLoading) return <Screen appHeader><Loader /></Screen>;
  if (mastery.isError || !mastery.data) {
    return <ErrorState appHeader title={t.loadError} body={t.loadError} retryLabel={t.retry} onRetry={() => void mastery.refetch()} />;
  }

  const data = mastery.data;
  return (
    <Screen appHeader refreshing={mastery.isRefetching} onRefresh={() => void mastery.refetch()}>
      <View style={styles.hero}>
        <View style={styles.eyebrow}>
          <Ionicons name="map-outline" size={15} color={colors.gold500} />
          <Text style={styles.eyebrowText}>{t.eyebrow}</Text>
        </View>
        <Text style={styles.heroTitle}>{t.title}</Text>
        <Text style={styles.heroBody}>{t.subtitle}</Text>

        <View style={styles.overallCard} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: data.overall_percent }}>
          <View style={styles.overallIcon}><Ionicons name="sparkles" size={20} color={colors.gold500} /></View>
          <View style={styles.overallCopy}>
            <Text style={styles.overallValue}>{data.overall_percent}%</Text>
            <Text style={styles.overallLabel}>{t.overall}</Text>
          </View>
          <View style={styles.overallTrack}><View style={[styles.overallFill, { width: `${data.overall_percent}%` }]} /></View>
        </View>

        <View style={styles.summaryRow}>
          <Summary value={data.current_level} label={t.current} />
          <Summary value={data.started_words} label={t.started} />
          <Summary value={data.mastered_words} label={t.mastered} />
        </View>
      </View>

      <View style={styles.sectionIntro}>
        <Text style={styles.sectionTitle}>{t.mapTitle}</Text>
        <Text style={styles.sectionBody}>{t.mapSubtitle}</Text>
      </View>

      <View style={styles.levelList}>
        {data.levels.map((level) => (
          <LevelCard key={level.level} level={level} current={level.level === data.current_level} locale={locale} labels={t} />
        ))}
      </View>
    </Screen>
  );
}

function Summary({ value, label }: { value: string | number; label: string }) {
  return <View style={styles.summary}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function LevelCard({ level, current, locale, labels: t }: {
  level: MasteryMap["levels"][number];
  current: boolean;
  locale: Locale;
  labels: (typeof labels)[Locale];
}) {
  const stages = [level.new, level.learning, level.strong, level.mastered];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${level.level}, ${level.progress_percent}%`}
      onPress={() => router.push({ pathname: "/library/[key]", params: { key: level.level, name: level.level } })}
      style={({ pressed }) => [styles.levelCard, current && styles.levelCardCurrent, pressed && styles.levelCardPressed]}
    >
      <View style={styles.levelTop}>
        <View style={styles.levelIdentity}>
          <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>{level.level}</Text></View>
          <View>
            <Text style={styles.levelWords}>{level.total.toLocaleString(locale)} {t.words}</Text>
            {current ? <Text style={styles.activeLabel}><Ionicons name="sparkles" size={11} /> {t.active}</Text> : null}
          </View>
        </View>
        <Text style={styles.levelPercent}>{level.progress_percent}%</Text>
      </View>

      <View style={styles.segmentTrack}>
        {stages.map((value, index) => value > 0 ? (
          <View key={t.stages[index]} style={{ width: `${(value / Math.max(1, level.total)) * 100}%`, backgroundColor: stageColors[index] }} />
        ) : null)}
      </View>

      <View style={styles.stageGrid}>
        {stages.map((value, index) => (
          <View key={t.stages[index]} style={styles.stageRow}>
            <View style={[styles.stageDot, { backgroundColor: stageColors[index] }]} />
            <Text style={styles.stageLabel}>{t.stages[index]}</Text>
            <Text style={styles.stageValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.levelAction}><Text style={styles.levelActionText}>{level.started > 0 ? (locale === "uz" ? "Davom ettirish" : locale === "ru" ? "Продолжить" : "Continue") : (locale === "uz" ? "Boshlash" : locale === "ru" ? "Начать" : "Start")}</Text><Ionicons name="arrow-forward" size={16} color={colors.brand600} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 16, padding: 19, overflow: "hidden", borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.cream, shadowColor: colors.brand950, shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  eyebrow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrowText: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase", color: colors.brand700 },
  heroTitle: { maxWidth: 330, fontFamily: fonts.display, fontSize: 31, lineHeight: 36, letterSpacing: 0.5, color: colors.ink, textTransform: "uppercase" },
  heroBody: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  overallCard: { gap: 8, padding: 14, borderRadius: 14, backgroundColor: colors.brand50 },
  overallIcon: { position: "absolute", right: 14, top: 14 },
  overallCopy: { gap: 2 },
  overallValue: { fontFamily: fonts.display, fontSize: 33, color: colors.ink },
  overallLabel: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  overallTrack: { height: 7, overflow: "hidden", borderRadius: 4, backgroundColor: colors.brand100 },
  overallFill: { height: "100%", borderRadius: 4, backgroundColor: colors.brand600 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summary: { flex: 1, gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  summaryValue: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  summaryLabel: { fontFamily: fonts.uiMedium, fontSize: 9.5, lineHeight: 14, color: colors.muted },
  sectionIntro: { gap: 5, marginTop: 6 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  sectionBody: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted },
  levelList: { gap: 12 },
  levelCard: { gap: 15, padding: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream, shadowColor: colors.brand950, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  levelCardCurrent: { borderColor: colors.brand400 },
  levelCardPressed: { opacity: 0.76, transform: [{ translateY: 1 }] },
  levelTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  levelIdentity: { flexDirection: "row", alignItems: "center", gap: 11 },
  levelBadge: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.brand100 },
  levelBadgeText: { fontFamily: fonts.display, fontSize: 17, color: colors.brand700 },
  levelWords: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  activeLabel: { marginTop: 5, fontFamily: fonts.uiBold, fontSize: 9, textTransform: "uppercase", color: colors.brand600 },
  levelPercent: { fontFamily: fonts.display, fontSize: 23, color: colors.ink },
  segmentTrack: { height: 9, flexDirection: "row", overflow: "hidden", borderRadius: 5, backgroundColor: colors.brand50 },
  stageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stageRow: { width: "48%", minHeight: 32, flexDirection: "row", alignItems: "center", gap: 7, borderBottomWidth: 1, borderBottomColor: colors.line },
  stageDot: { width: 8, height: 8, borderRadius: 4 },
  stageLabel: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted },
  stageValue: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.ink },
  levelAction: { paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line },
  levelActionText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.brand700 },
});
