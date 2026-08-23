import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { request, type CardPage } from "@/api/client";
import { BackButton, Button, ErrorNote, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { copy, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const pageSize = 20;

export default function MyCards() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [query]);

  const cards = useQuery({
    queryKey: ["my-cards", query, page],
    queryFn: () => request<CardPage>(`/cards?${new URLSearchParams({ page: String(page), page_size: String(pageSize), ...(query ? { q: query } : {}) })}`, { token }),
    enabled: Boolean(token),
  });

  const items = cards.data?.items ?? [];
  const total = cards.data?.total ?? 0;
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const visible = items.filter((c) => !removed.has(c.id));
  const deleteCard = useMutation({
    mutationFn: (cardId: string) => request<void>(`/cards/${cardId}`, { method: "DELETE", token }),
    onMutate: (cardId) => {
      setRemoved((prev) => new Set(prev).add(cardId));
    },
    onError: (_error, cardId) => {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-cards"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["library-overview"] });
    },
  });

  const onDelete = (cardId: string, headword: string) => {
    deleteCard.reset();
    Alert.alert(headword, t.libDeleteConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.libDelete, style: "destructive", onPress: () => deleteCard.mutate(cardId) },
    ]);
  };

  if (cards.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (cards.isError) return <ErrorState appHeader title={t.libraryLoadError} body={t.networkError} retryLabel={t.retry} onRetry={() => void cards.refetch()} />;

  return (
    <Screen appHeader>
      <BackButton label={t.libBack} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/library")} />
      <Stamp>{t.libMyCards}</Stamp>
      <Heading>{t.libMyCards}</Heading>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          accessibilityLabel={t.libSearchMyCards}
          autoCapitalize="none"
          onChangeText={setSearch}
          placeholder={t.libSearchMyCards}
          placeholderTextColor="rgba(108,73,53,0.62)"
          style={styles.searchInput}
          value={search}
        />
      </View>
      <Text style={styles.count}><Text style={styles.countStrong}>{total}</Text> {t.libCards}</Text>
      <ErrorNote message={deleteCard.isError ? t.genericError : null} />

      {visible.length === 0 ? (
        <Paper><Text style={styles.emptyText}>{query ? t.libNoResults : t.libNoCards}</Text></Paper>
      ) : (
        <View style={{ gap: 10 }}>
          {visible.map((card) => (
            <View key={card.id} style={styles.row}>
              <Pressable
                accessibilityRole="link"
                onPress={() => card.word ? router.push({ pathname: "/words/[slug]", params: { slug: card.word.slug } }) : undefined}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text numberOfLines={1} style={styles.headword}>{card.word?.headword ?? card.front_text}</Text>
                <Text numberOfLines={1} style={styles.translation}>
                  {(locale === "ru" ? card.word?.senses[0]?.translation_ru : card.word?.senses[0]?.translation_uz) ?? card.back_text ?? ""}
                </Text>
                <View style={[styles.srsBadge, srsTone(card.srs_state)]}><Text style={styles.srsText}>{card.srs_state}</Text></View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t.libDelete}: ${card.word?.headword ?? ""}`}
                accessibilityState={{ disabled: deleteCard.isPending }}
                disabled={deleteCard.isPending}
                onPress={() => onDelete(card.id, card.word?.headword ?? card.front_text ?? "")}
                style={({ pressed }) => [styles.deleteButton, deleteCard.isPending && styles.deleteDisabled, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {items.length < total ? (
        <Button variant="secondary" loading={cards.isFetching} onPress={() => setPage((p) => p + 1)}>
          {`${t.loadMore} (${items.length}/${total})`}
        </Button>
      ) : null}

      <Button icon="play" onPress={() => router.push("/(tabs)/review")}>{t.startReview}</Button>
    </Screen>
  );
}

function srsTone(state: string) {
  if (state === "new") return { borderColor: colors.line, backgroundColor: colors.raised };
  if (state === "learning" || state === "relearning") return { borderColor: "rgba(185,78,40,0.35)", backgroundColor: "rgba(185,78,40,0.10)" };
  return { borderColor: "rgba(70,120,120,0.4)", backgroundColor: "rgba(70,120,120,0.10)" };
}

const styles = StyleSheet.create({
  searchRow: { position: "relative", justifyContent: "center" },
  searchIcon: { position: "absolute", left: 14, zIndex: 1 },
  searchInput: { height: 46, paddingLeft: 38, paddingRight: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream, fontFamily: fonts.ui, fontSize: 14, color: colors.ink },
  count: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  countStrong: { fontFamily: fonts.uiBold, color: colors.ink },
  emptyText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream, padding: 12 },
  headword: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink },
  translation: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12, color: colors.muted },
  srsBadge: { alignSelf: "flex-start", marginTop: 6, borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  srsText: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.3, color: colors.ink, textTransform: "uppercase" },
  deleteButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(220,38,38,0.35)", borderRadius: 9, backgroundColor: "rgba(220,38,38,0.10)" },
  pressed: { opacity: 0.7 }, deleteDisabled: { opacity: 0.48 },
});
