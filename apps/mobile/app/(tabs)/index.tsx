import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { request, type DailyQuests, type Queue, type Stats } from "@/api/client";
import { Button, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { copy, format, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

export default function Today() {
  const { token, user } = useAuth();
  const t = copy[localeFrom(user?.profile.ui_locale)];
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => request<Stats>("/me/stats", { token }), enabled: !!token });
  const queue = useQuery({ queryKey: ["queue"], queryFn: () => request<Queue>("/review/queue", { token }), enabled: !!token });
  const quests = useQuery({ queryKey: ["daily-quests"], queryFn: () => request<DailyQuests>("/me/daily-quests", { token }), enabled: !!token });
  const refresh = () => { void stats.refetch(); void queue.refetch(); void quests.refetch(); };

  if (stats.isLoading || queue.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (stats.isError || queue.isError) return <ErrorState appHeader title={t.todayLoadError} body={t.networkError} retryLabel={t.retry} onRetry={refresh} />;

  const due = Math.max(0, (queue.data?.due_count ?? 0) + (queue.data?.new_count ?? 0));
  return (
    <Screen appHeader refreshing={stats.isRefetching || queue.isRefetching || quests.isRefetching} onRefresh={refresh}>
      <Stamp tone="teal">{format(t.streak, { level: user?.profile.cefr_level ?? "A1", count: stats.data?.current_streak ?? 0 })}</Stamp>
      <Heading sub={t.todaySubtitle}>{format(t.todayGreeting, { name: user?.profile.display_name ?? t.profile })}</Heading>
      <Paper>
        <Text accessibilityLabel={`${due} ${t.cardsWaiting}`} style={{ fontFamily: fonts.display, fontSize: 58, color: colors.rust, lineHeight: 62 }}>{due}</Text>
        <Text style={{ fontFamily: fonts.uiBold, color: colors.ink, fontSize: 15 }}>{t.cardsWaiting}</Text>
        <Text style={{ fontFamily: fonts.ui, color: colors.muted, fontSize: 13, marginTop: 6 }}>{format(t.reviewedToday, { done: stats.data?.reviews_today ?? 0, goal: stats.data?.daily_goal ?? 10 })}</Text>
      </Paper>
      <Button icon="play" onPress={() => router.push("/(tabs)/review")}>{t.startReview}</Button>
      {quests.data ? <DailyQuestsCard quests={quests.data} locale={localeFrom(user?.profile.ui_locale)} /> : null}
      <View style={{ gap: 10 }}>
        <Heading>{t.todayPlan}</Heading>
        <Paper>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.ink }}>{t.recallStep}</Text>
          <Text style={{ fontFamily: fonts.ui, color: colors.muted, marginTop: 5, lineHeight: 21 }}>{t.recallStepBody}</Text>
        </Paper>
        <Paper>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.ink }}>{t.libraryStep}</Text>
          <Text style={{ fontFamily: fonts.ui, color: colors.muted, marginTop: 5, lineHeight: 21 }}>{t.libraryStepBody}</Text>
        </Paper>
      </View>
    </Screen>
  );
}

function DailyQuestsCard({ quests, locale }: { quests: DailyQuests; locale: "uz" | "ru" | "en" }) {
  const labels = {
    uz: { title: "Bugungi questlar", complete: "bajarildi", reward: "XP", codes: { correct_5: "5 ta to'g'ri javob", combo_3: "3 ta ketma-ket javob", match_1: "1 ta Word Match", phrasal_5: "5 ta phrasal verb", memory_1: "1 ta Memory o'yini", complete_2: "2 ta o'yinni yakunlang", phrasal_blank_5: "5 ta phrasal blank", perfect_1: "1 ta mukammal raund", hangman_1: "1 ta Hangman" } },
    ru: { title: "Задания на сегодня", complete: "выполнено", reward: "XP", codes: { correct_5: "5 правильных ответов", combo_3: "3 ответа подряд", match_1: "1 Word Match", phrasal_5: "5 фразовых глаголов", memory_1: "1 игра Memory", complete_2: "Завершите 2 игры", phrasal_blank_5: "5 phrasal blank", perfect_1: "1 идеальный раунд", hangman_1: "1 Hangman" } },
    en: { title: "Today's quests", complete: "complete", reward: "XP", codes: { correct_5: "5 correct answers", combo_3: "3-answer combo", match_1: "1 Word Match", phrasal_5: "5 phrasal verbs", memory_1: "1 Memory game", complete_2: "Finish 2 games", phrasal_blank_5: "5 phrasal blanks", perfect_1: "1 perfect round", hangman_1: "1 Hangman" } },
  } as const;
  const t = labels[locale];
  return <View style={{ gap: 8 }}>
    <Heading>{t.title}</Heading>
    <Paper>
      <Text style={{ fontFamily: fonts.uiBold, color: colors.ink, fontSize: 13 }}>{quests.completed_count}/{quests.total_count} {t.complete}</Text>
      <View style={{ height: 7, overflow: "hidden", borderRadius: 4, marginTop: 8, backgroundColor: colors.brand100 }}><View style={{ height: "100%", width: `${(quests.completed_count / Math.max(1, quests.total_count)) * 100}%`, borderRadius: 4, backgroundColor: colors.brand600 }} /></View>
      <View style={{ gap: 9, marginTop: 13 }}>{quests.quests.map((quest) => {
        const percent = Math.min(100, Math.round((quest.progress / Math.max(1, quest.target)) * 100));
        return <View key={quest.code} style={{ gap: 5 }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}><Text style={{ flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.ink }}>{t.codes[quest.code as keyof typeof t.codes] ?? quest.code}</Text><Text style={{ fontFamily: fonts.uiBold, fontSize: 11, color: quest.completed ? colors.brand700 : colors.muted }}>{quest.completed ? "✓" : `${quest.progress}/${quest.target}`} · {quest.xp_reward} {t.reward}</Text></View><View style={{ height: 4, overflow: "hidden", borderRadius: 2, backgroundColor: colors.line }}><View style={{ height: "100%", width: `${percent}%`, borderRadius: 2, backgroundColor: quest.completed ? colors.brand600 : colors.gold500 }} /></View></View>;
      })}</View>
    </Paper>
  </View>;
}
