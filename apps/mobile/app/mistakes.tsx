import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { request, type MistakeNotebook } from "@/api/client";
import { Button, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const copy = {
  uz: { title: "Xatolar daftari", subtitle: "Ko'proq chalkashgan so'zlaringizni qayta mustahkamlang.", lapses: "xato", review: "Takrorlashni boshlash", emptyTitle: "Daftar hozircha toza", empty: "Takrorlashlarda so'zlar qiyinlashsa, ular shu yerda paydo bo'ladi.", load: "Xatolar daftarini yuklab bo'lmadi.", retry: "Qayta urinish" },
  ru: { title: "Тетрадь ошибок", subtitle: "Закрепите слова, которые чаще всего вызывают затруднения.", lapses: "ошибок", review: "Начать повторение", emptyTitle: "Тетрадь пока чистая", empty: "Сложные слова появятся здесь после повторений.", load: "Не удалось загрузить тетрадь ошибок.", retry: "Попробовать снова" },
  en: { title: "Mistake notebook", subtitle: "Reinforce the words that have been hardest to recall.", lapses: "lapses", review: "Start a review", emptyTitle: "Your notebook is clear", empty: "Words that need another look will appear here after reviews.", load: "Could not load the mistake notebook.", retry: "Try again" },
} as const;

export default function MistakesScreen() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const notebook = useQuery({ queryKey: ["mistakes"], queryFn: () => request<MistakeNotebook>("/me/mistakes", { token }), enabled: !!token });
  if (notebook.isLoading) return <Screen appHeader><Loader /></Screen>;
  if (notebook.isError || !notebook.data) return <ErrorState appHeader title={t.load} body={t.load} retryLabel={t.retry} onRetry={() => void notebook.refetch()} />;
  return <Screen appHeader>
    <Heading sub={t.subtitle}>{t.title}</Heading>
    {notebook.data.items.length ? <View style={styles.list}>{notebook.data.items.map((word) => {
      const translation = locale === "uz" ? word.translation_uz : locale === "ru" ? word.translation_ru : word.definition_en;
      return <Paper key={word.card_id} style={styles.word}><View style={styles.wordTop}><View><Text style={styles.headword}>{word.headword}</Text><Text style={styles.translation}>{translation}</Text></View><Stamp tone="ink">{`${word.lapses} ${t.lapses}`}</Stamp></View>{word.example_en ? <Text style={styles.example}>{word.example_en}</Text> : null}</Paper>;
    })}</View> : <Paper style={styles.empty}><Text style={styles.emptyTitle}>{t.emptyTitle}</Text><Text style={styles.emptyText}>{t.empty}</Text></Paper>}
    <Button icon="play" onPress={() => router.push("/(tabs)/review")}>{t.review}</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  list: { gap: 10 }, word: { gap: 11 }, wordTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }, headword: { fontFamily: fonts.display, fontSize: 23, color: colors.ink }, translation: { marginTop: 3, maxWidth: 230, fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 19, color: colors.muted }, example: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.ink }, empty: { gap: 8 }, emptyTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink }, emptyText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
});
