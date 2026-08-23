import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Speech from "expo-speech";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { request, type Queue } from "@/api/client";
import { Button, ErrorNote, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { copy, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

type Rating = "again" | "hard" | "good" | "easy";
const makeIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;

export default function Review() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [submittedCardId, setSubmittedCardId] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(makeIdempotencyKey);
  const startedAt = useRef(Date.now());
  const t = copy[localeFrom(user?.profile.ui_locale)];
  const queuePath = `/review/queue?limit=30&new_limit=10${deckId ? `&deck_id=${encodeURIComponent(deckId)}` : ""}`;

  const queue = useQuery({
    queryKey: ["queue", deckId],
    queryFn: () => request<Queue>(queuePath, { token }),
    enabled: Boolean(token),
  });
  const card = queue.data?.cards[0];
  const submit = useMutation({
    mutationFn: (rating: Rating) => request(`/review/${card?.id}`, {
      method: "POST",
      token,
      body: {
        rating,
        duration_ms: Math.min(120_000, Math.max(0, Date.now() - startedAt.current)),
      },
      headers: { "Idempotency-Key": idempotencyKey },
    }),
    onSuccess: () => {
      setRevealed(false);
      setSubmittedCardId(card?.id ?? null);
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-quests"] });
      void queryClient.invalidateQueries({ queryKey: ["mastery-map"] });
      void queryClient.invalidateQueries({ queryKey: ["statistics"] });
      void queryClient.invalidateQueries({ queryKey: ["mistakes"] });
    },
  });

  useEffect(() => {
    Speech.stop();
    setRevealed(false);
    setSubmittedCardId(null);
    setIdempotencyKey(makeIdempotencyKey());
    startedAt.current = Date.now();
    submit.reset();
  // The current card ID is the session boundary; mutation identity is intentionally excluded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]);

  if (queue.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (queue.isError) return <ErrorState appHeader title={t.reviewLoadError} body={t.networkError} retryLabel={t.retry} onRetry={() => void queue.refetch()} />;

  if (!card) {
    return (
      <Screen appHeader refreshing={queue.isRefetching} onRefresh={() => void queue.refetch()}>
        <Stamp tone="teal">{t.done}</Stamp>
        <Heading sub={t.reviewDoneBody}>{t.reviewDone}</Heading>
        <Button icon="refresh" onPress={() => void queryClient.invalidateQueries({ queryKey: ["queue"] })}>{t.refresh}</Button>
      </Screen>
    );
  }

  if (submittedCardId === card.id) return <Screen appHeader><Loader label={t.loading} /></Screen>;

  const word = card.word;
  const sense = word?.senses[0];
  const locale = localeFrom(user?.profile.ui_locale);
  const answer = locale === "uz"
    ? sense?.translation_uz
    : locale === "ru"
      ? sense?.translation_ru
      : sense?.definition_en;
  const listenLabel = locale === "uz" ? "Talaffuzni eshitish" : locale === "ru" ? "Прослушать произношение" : "Hear pronunciation";
  const listenWord = word?.headword ?? card.front_text ?? "";

  return (
    <Screen appHeader refreshing={queue.isRefetching} onRefresh={() => void queue.refetch()}>
      <Stamp>{`${(queue.data?.due_count ?? 0) + (queue.data?.new_count ?? 0)} · ${t.due}`}</Stamp>
      <Heading sub={revealed ? t.rateAnswer : t.rememberFirst}>{t.remember}</Heading>
      <Paper style={{ minHeight: 260, justifyContent: "center", gap: 12 }}>
        <Text selectable style={{ fontFamily: fonts.display, fontSize: 47, lineHeight: 50, color: colors.ink, textAlign: "center" }}>{word?.headword ?? card.front_text}</Text>
        <Text style={{ fontFamily: fonts.ui, color: colors.muted, textAlign: "center" }}>{word?.ipa ?? ""}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${listenLabel}: ${listenWord}`}
          onPress={() => { Speech.stop(); Speech.speak(listenWord, { language: "en-US", rate: 0.9 }); }}
          style={({ pressed }) => [styles.listenButton, pressed && styles.listenPressed]}
        ><Ionicons name="volume-high-outline" size={17} color={colors.teal} /><Text style={styles.listenText}>{listenLabel}</Text></Pressable>
        {revealed ? (
          <>
            <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 10 }} />
            <Text selectable style={{ fontFamily: fonts.uiBold, fontSize: 20, color: colors.rust, textAlign: "center" }}>{answer ?? card.back_text}</Text>
          </>
        ) : null}
      </Paper>

      {revealed ? (
        <View style={{ gap: 9 }}>
          <Button loading={submit.isPending} variant="secondary" onPress={() => submit.mutate("again")}>{t.again}</Button>
          <Button loading={submit.isPending} variant="secondary" onPress={() => submit.mutate("hard")}>{t.hard}</Button>
          <Button loading={submit.isPending} onPress={() => submit.mutate("good")}>{t.good}</Button>
          <Button loading={submit.isPending} variant="secondary" onPress={() => submit.mutate("easy")}>{t.easy}</Button>
          <ErrorNote message={submit.isError ? t.genericError : null} />
        </View>
      ) : <Button icon="eye-outline" onPress={() => setRevealed(true)}>{t.reveal}</Button>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listenButton: { alignSelf: "center", minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.teal, borderRadius: 10, backgroundColor: "rgba(70,120,120,0.10)" },
  listenText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.teal },
  listenPressed: { opacity: 0.68, transform: [{ translateY: 1 }] },
});
