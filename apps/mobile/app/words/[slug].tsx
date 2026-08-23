import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ApiError, request, type Deck, type Word } from "@/api/client";
import { BackButton, Button, ErrorNote, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { copy, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

export default function WordDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const [deckId, setDeckId] = useState<string | undefined>();

  const word = useQuery({
    queryKey: ["word", slug],
    queryFn: () => request<Word>(`/words/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
  });
  const decks = useQuery({
    queryKey: ["decks"],
    queryFn: () => request<Deck[]>("/decks", { token }),
    enabled: Boolean(token),
  });
  const add = useMutation({
    mutationFn: () => request("/cards", {
      method: "POST",
      token,
      body: { word_id: word.data?.id, deck_id: deckId },
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["decks"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["library"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  if (word.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (word.isError) {
    const notFound = word.error instanceof ApiError && word.error.status === 404;
    return <ErrorState appHeader title={notFound ? t.wordNotFound : t.wordLoadError} body={t.networkError} retryLabel={t.retry} onRetry={() => void word.refetch()} />;
  }
  if (!word.data) return <ErrorState appHeader title={t.wordNotFound} body={t.genericError} retryLabel={t.retry} onRetry={() => void word.refetch()} />;

  const sense = word.data.senses[0];
  const translation = locale === "uz"
    ? sense?.translation_uz
    : locale === "ru"
      ? sense?.translation_ru
      : sense?.definition_en;

  return (
    <Screen appHeader>
      <BackButton label={t.back} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/library")} />
      <Stamp tone="teal">{`${word.data.cefr_level} · ${word.data.pos}`}</Stamp>
      <Heading sub={word.data.ipa ?? ""}>{word.data.headword}</Heading>

      <Paper>
        <Text style={{ fontFamily: fonts.uiBold, fontSize: 20, color: colors.rust }}>{translation ?? sense?.definition_en}</Text>
        {locale !== "en" ? <Text style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 24, color: colors.ink, marginTop: 10 }}>{sense?.definition_en}</Text> : null}
      </Paper>

      {sense?.examples.map((example) => {
        const exampleTranslation = locale === "uz" ? example.text_uz : locale === "ru" ? example.text_ru : null;
        return (
          <Paper key={example.id}>
            <Text style={{ fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink, lineHeight: 23 }}>{example.text_en}</Text>
            {exampleTranslation ? <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.muted, marginTop: 7 }}>{exampleTranslation}</Text> : null}
          </Paper>
        );
      })}

      {word.data.common_mistake ? (
        <Paper>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.ink }}>{t.note}</Text>
          <Text style={{ fontFamily: fonts.ui, color: colors.muted, marginTop: 5 }}>{word.data.common_mistake}</Text>
        </Paper>
      ) : null}

      <View accessibilityRole="radiogroup" style={{ gap: 7 }}>
        <Text style={{ fontFamily: fonts.uiBold, color: colors.ink }}>{t.chooseDeck}</Text>
        <DeckChoice label={t.generalCards} selected={!deckId} onPress={() => { setDeckId(undefined); add.reset(); }} />
        {decks.data?.map((deck) => <DeckChoice key={deck.id} label={deck.name} selected={deckId === deck.id} onPress={() => { setDeckId(deck.id); add.reset(); }} />)}
        {decks.isError ? <ErrorNote message={t.decksLoadError} /> : null}
      </View>

      <Button disabled={add.isSuccess} loading={add.isPending} onPress={() => add.mutate()}>{add.isSuccess ? t.addedWord : t.addWord}</Button>
      <ErrorNote message={add.isError ? (add.error instanceof ApiError && add.error.status === 409 ? t.duplicateWord : t.genericError) : null} />
    </Screen>
  );
}

function DeckChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: selected ? colors.rust : colors.line,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: selected ? colors.brand100 : colors.raised,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.uiMedium, color: selected ? colors.rustDark : colors.ink }}>{label}</Text>
    </Pressable>
  );
}
