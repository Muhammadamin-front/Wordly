import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError, request, type ShelfOverview, type WordPage } from "@/api/client";
import { BackButton, Button, ErrorState, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { VocabularyCard } from "@/components/vocabulary-card";
import { copy, format, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";
import { shelfBySlug } from "@/theme/shelves";

const levels = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const pageSize = 30;

export default function Shelf() {
  const { key, name } = useLocalSearchParams<{ key: string; name?: string }>();
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const meta = shelfBySlug(key);
  const overviewKey = meta?.key ?? key.toUpperCase();
  const isLevel = levels.has(overviewKey);
  const filter = isLevel ? `level=${encodeURIComponent(overviewKey)}` : `category=${encodeURIComponent(meta?.category ?? key)}`;

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const overview = useQuery({ queryKey: ["library-overview"], queryFn: () => request<ShelfOverview>("/library/overview", { token }), enabled: Boolean(token) });
  const words = useInfiniteQuery({
    queryKey: ["words", key, query],
    queryFn: ({ pageParam }) => request<WordPage>(`/words?${filter}&page_size=${pageSize}&page=${pageParam}${query ? `&q=${encodeURIComponent(query)}` : ""}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page * lastPage.page_size < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: Boolean(key),
  });

  const addCard = useMutation({
    mutationFn: (wordId: string) => request<{ id: string }>("/cards", { method: "POST", token, body: { word_id: wordId } }),
    onSuccess: (_res, wordId) => setAdded((prev) => new Set(prev).add(wordId)),
    onError: (err: unknown, wordId) => {
      if (err instanceof ApiError && err.status === 409) setAdded((prev) => new Set(prev).add(wordId));
    },
  });

  const study = useMutation({
    mutationFn: () => request<{ added: number }>("/cards/add-by-level", {
      method: "POST",
      token,
      body: isLevel ? { cefr_level: overviewKey, limit: 20 } : { category_slug: meta?.category ?? key, limit: 20 },
    }),
    onSuccess: () => router.push("/(tabs)/review"),
  });

  if (words.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (words.isError) return <ErrorState appHeader title={t.libraryLoadError} body={t.networkError} retryLabel={t.retry} onRetry={() => void words.refetch()} />;

  const items = words.data?.pages.flatMap((page) => page.items) ?? [];
  const total = words.data?.pages[0]?.total ?? 0;
  const displayName = name ?? key.toUpperCase();
  const shelf = overview.data?.shelves.find((s) => s.key === overviewKey);
  const pct = shelf && shelf.total > 0 ? Math.round((shelf.learned / shelf.total) * 100) : 0;

  return (
    <Screen appHeader>
      <BackButton label={t.libBack} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/library")} />
      <Stamp>{key}</Stamp>
      <Heading sub={format(t.publishedWords, { count: total })}>{format(t.shelfWords, { name: displayName })}</Heading>

      {shelf ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {shelf.learned}/{shelf.total} <Text style={styles.progressMuted}>{t.libLearnedStat}</Text>
            </Text>
            <Text style={[styles.progressPct, meta ? { color: meta.color } : null]}>{pct}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: meta?.color ?? colors.brand600 }]} />
          </View>
        </View>
      ) : null}

      <Button icon="school-outline" loading={study.isPending} onPress={() => study.mutate()}>{t.libStudy}</Button>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          accessibilityLabel={t.libSearchPlaceholder}
          autoCapitalize="none"
          onChangeText={setSearch}
          placeholder={t.libSearchPlaceholder}
          placeholderTextColor="rgba(108,73,53,0.62)"
          style={styles.searchInput}
          value={search}
        />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
        {items.map((word) => (
          <VocabularyCard
            key={word.id}
            word={word}
            locale={locale}
            onAdd={() => addCard.mutate(word.id)}
            added={added.has(word.id)}
          />
        ))}
        {!items.length ? <Paper><Text style={{ fontFamily: fonts.ui, color: colors.muted }}>{t.noWords}</Text></Paper> : null}
      </View>
      {words.hasNextPage ? <Button variant="secondary" loading={words.isFetchingNextPage} onPress={() => void words.fetchNextPage()}>{t.loadMore}</Button> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBlock: { gap: 6 },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  progressMuted: { fontFamily: fonts.uiMedium, fontWeight: "400", color: colors.muted },
  progressPct: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.brand600 },
  track: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(84,37,15,0.12)" },
  fill: { height: "100%", borderRadius: 3 },
  searchRow: { position: "relative", justifyContent: "center" },
  searchIcon: { position: "absolute", left: 14, zIndex: 1 },
  searchInput: { height: 46, paddingLeft: 38, paddingRight: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream, fontFamily: fonts.ui, fontSize: 14, color: colors.ink },
});
