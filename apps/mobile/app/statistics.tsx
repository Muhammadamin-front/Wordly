import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { request, type Statistics } from "@/api/client";
import { Button, ErrorState, Heading, Loader, Paper, Screen } from "@/components/ui";
import { Protected } from "@/components/protected";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const copy = {
  uz: { title: "O'qish statistikasi", subtitle: "Har bir takrorlash natijasi bu yerda aniq ko'rinadi.", reviews: "Jami takrorlash", accuracy: "Umumiy aniqlik", mature: "Mustahkam kartalar", time: "O'qish vaqti", cards: "Kartalar holati", new: "Yangi", learning: "O'rganilmoqda", review: "Takrorlashda", mastered: "O'zlashtirilgan", weak: "Diqqat talab qiladigan mavzular", mistakes: "Xatolar daftarini ochish", load: "Statistikani yuklab bo'lmadi.", retry: "Qayta urinish" },
  ru: { title: "Статистика обучения", subtitle: "Результат каждого повторения виден здесь.", reviews: "Всего повторений", accuracy: "Общая точность", mature: "Зрелая точность", time: "Время обучения", cards: "Состояние карточек", new: "Новые", learning: "Изучаются", review: "На повторении", mastered: "Освоены", weak: "Темы, которым нужно внимание", mistakes: "Открыть тетрадь ошибок", load: "Не удалось загрузить статистику.", retry: "Попробовать снова" },
  en: { title: "Learning statistics", subtitle: "See the result of every review in one clear place.", reviews: "Total reviews", accuracy: "Overall accuracy", mature: "Mature accuracy", time: "Study time", cards: "Card states", new: "New", learning: "Learning", review: "In review", mastered: "Mastered", weak: "Topics needing attention", mistakes: "Open mistake notebook", load: "Could not load statistics.", retry: "Try again" },
} as const;

function duration(ms: number, locale: string) {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function StatisticsScreen() {
  return <Protected><StatisticsContent /></Protected>;
}

function StatisticsContent() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const stats = useQuery({ queryKey: ["statistics"], queryFn: () => request<Statistics>("/me/statistics", { token }), enabled: !!token });

  if (stats.isLoading) return <Screen appHeader><Loader label={t.title} /></Screen>;
  if (stats.isError || !stats.data) return <ErrorState appHeader title={t.load} body={t.load} retryLabel={t.retry} onRetry={() => void stats.refetch()} />;
  const data = stats.data;
  const states = [
    [t.new, data.cards.new, colors.gold500], [t.learning, data.cards.learning, colors.rust], [t.review, data.cards.review, colors.teal], [t.mastered, data.cards.mastered, colors.brand600],
  ] as const;
  const weakName = (item: Statistics["weak_categories"][number]) => locale === "uz" ? item.name_uz : locale === "ru" ? item.name_ru : item.name_en;

  return <Screen appHeader>
    <Heading sub={t.subtitle}>{t.title}</Heading>
    <View style={styles.metrics}>
      <Metric icon="repeat-outline" value={data.total_reviews.toLocaleString(locale)} label={t.reviews} />
      <Metric icon="analytics-outline" value={`${data.accuracy_all}%`} label={t.accuracy} />
      <Metric icon="shield-checkmark-outline" value={`${data.accuracy_mature}%`} label={t.mature} />
      <Metric icon="time-outline" value={duration(data.time_spent_ms, locale)} label={t.time} />
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t.cards}</Text>
      <Paper style={styles.states}>{states.map(([label, value, color]) => <View key={label} style={styles.stateRow}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.stateLabel}>{label}</Text><Text style={styles.stateValue}>{value.toLocaleString(locale)}</Text></View>)}</Paper>
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t.weak}</Text>
      <Paper style={styles.states}>
        {data.weak_categories.length ? data.weak_categories.slice(0, 5).map((item) => <View key={item.slug} style={styles.weakRow}><Text style={styles.weakName}>{item.emoji ? `${item.emoji}  ` : ""}{weakName(item)}</Text><Text style={styles.weakDetail}>{item.lapses} · {item.card_count}</Text></View>) : <Text style={styles.empty}>—</Text>}
      </Paper>
    </View>
    <Button icon="alert-circle-outline" onPress={() => router.push("/mistakes" as Href)}>{t.mistakes}</Button>
  </Screen>;
}

function Metric({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <Paper style={styles.metric}><Ionicons name={icon} size={18} color={colors.brand600} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Paper>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, metric: { width: "48%", minHeight: 122, gap: 7, justifyContent: "space-between" }, metricValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink }, metricLabel: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, section: { gap: 8 }, sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink }, states: { gap: 10 }, stateRow: { minHeight: 29, flexDirection: "row", alignItems: "center", gap: 9, borderBottomWidth: 1, borderBottomColor: colors.line }, dot: { width: 9, height: 9, borderRadius: 5 }, stateLabel: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, color: colors.muted }, stateValue: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, weakRow: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line }, weakName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, weakDetail: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, empty: { fontFamily: fonts.ui, color: colors.muted },
});
