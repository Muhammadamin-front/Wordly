import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError, request, type Category, type Deck, type ExpressionListItem, type ExpressionMeta, type ExpressionPage, type Queue, type ShelfOverview, type WordPage } from "@/api/client";
import { CircularProgress } from "@/components/library/circular-progress";
import { CollectionCard } from "@/components/library/collection-card";
import { ShelfCard } from "@/components/library/shelf-card";
import { Button, ErrorState, Field, Loader, Screen } from "@/components/ui";
import { VocabularyCard } from "@/components/vocabulary-card";
import { copy, localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { SHELVES } from "@/theme/shelves";
import { colors, fonts } from "@/theme/tokens";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const pageSize = 30;

const labels = {
  uz: { title: "So'z boyligi", subtitle: "CEFR darajalari bo'yicha inglizcha so'zlar — o'zbekcha va ruscha tarjimalari bilan", placeholder: "So'z yoki tarjima qidiring...", search: "Qidirish", allLevels: "Barcha darajalar", allTopics: "Barcha mavzular", found: "ta so'z topildi", empty: "Hech narsa topilmadi. Filtrlarni tozalab qayta urinib ko'ring.", clear: "Filtrlarni tozalash", more: "Yana yuklash", loadError: "So'zlarni yuklay olmadik", retry: "Qayta urinish", expressionsTitle: "Expressions", expressionsSubtitle: "IELTS Speaking va Writing uchun native iboralar, tarjima va misollar bilan.", expressionsOpen: "Iboralarni ochish", expressionsCount: "ibora", expressionsError: "Iboralar preview’ini yuklab bo'lmadi." },
  ru: { title: "Словарный запас", subtitle: "Английские слова по уровням CEFR — с узбекским и русским переводом", placeholder: "Найти слово или перевод...", search: "Поиск", allLevels: "Все уровни", allTopics: "Все темы", found: "слов найдено", empty: "Ничего не найдено. Очистите фильтры и попробуйте снова.", clear: "Очистить фильтры", more: "Загрузить ещё", loadError: "Не удалось загрузить слова", retry: "Повторить", expressionsTitle: "Expressions", expressionsSubtitle: "Фразы для IELTS Speaking и Writing с переводами и примерами.", expressionsOpen: "Открыть фразы", expressionsCount: "выражений", expressionsError: "Не удалось загрузить превью выражений." },
  en: { title: "Vocabulary", subtitle: "English words by CEFR level — with Uzbek and Russian translations", placeholder: "Search a word or translation...", search: "Search", allLevels: "All levels", allTopics: "All topics", found: "words found", empty: "Nothing found. Clear the filters and try again.", clear: "Clear filters", more: "Load more", loadError: "We couldn't load the words", retry: "Try again", expressionsTitle: "Expressions", expressionsSubtitle: "Native IELTS Speaking and Writing phrases with translations and examples.", expressionsOpen: "Open expressions", expressionsCount: "expressions", expressionsError: "Expression preview could not be loaded." },
} as const;

export default function Library() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const g = copy[locale];
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(params.q ?? "");
  const [query, setQuery] = useState(params.q ?? "");
  const [level, setLevel] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckAttempted, setDeckAttempted] = useState(false);

  useEffect(() => {
    const nextQuery = params.q ?? "";
    setSearch(nextQuery);
    setQuery(nextQuery);
    setLevel(null);
    setCategory(params.category ?? null);
  }, [params.category, params.q]);

  const categories = useQuery({ queryKey: ["categories"], queryFn: () => request<Category[]>("/categories") });
  const words = useInfiniteQuery({
    queryKey: ["vocabulary", query, level, category],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), page_size: String(pageSize) });
      if (query) params.set("q", query);
      if (level) params.set("level", level);
      if (category) params.set("category", category);
      return request<WordPage>(`/words?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (page) => page.page * page.page_size < page.total ? page.page + 1 : undefined,
  });

  const overview = useQuery({ queryKey: ["library-overview"], queryFn: () => request<ShelfOverview>("/library/overview", { token }), enabled: Boolean(token) });
  const deckList = useQuery({ queryKey: ["decks"], queryFn: () => request<Deck[]>("/decks", { token }), enabled: Boolean(token) });
  const queue = useQuery({ queryKey: ["queue"], queryFn: () => request<Queue>("/review/queue", { token }), enabled: Boolean(token) });
  const expressionMeta = useQuery({ queryKey: ["expressions-meta"], queryFn: () => request<ExpressionMeta>("/expressions/meta") });
  const expressionsPreview = useQuery({
    queryKey: ["library-expressions-preview", locale],
    queryFn: () => request<ExpressionPage>(`/expressions?${new URLSearchParams({ page: "1", page_size: "6", locale }).toString()}`),
  });

  const addCard = useMutation({
    mutationFn: (wordId: string) => request<{ id: string }>("/cards", { method: "POST", token, body: { word_id: wordId } }),
    onSuccess: (_res, wordId) => {
      setAdded((prev) => new Set(prev).add(wordId));
      void queryClient.invalidateQueries({ queryKey: ["library-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (err: unknown, wordId) => {
      if (err instanceof ApiError && err.status === 409) {
        setAdded((prev) => new Set(prev).add(wordId));
        void queryClient.invalidateQueries({ queryKey: ["library-overview"] });
      }
    },
  });

  const createDeck = useMutation({
    mutationFn: () => request<Deck>("/decks", { method: "POST", token, body: { name: deckName.trim() } }),
    onSuccess: () => {
      setDeckName("");
      setDeckAttempted(false);
      setCreating(false);
      void queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const deleteDeck = useMutation({
    mutationFn: (id: string) => request<void>(`/decks/${id}`, { method: "DELETE", token }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });

  const loading = categories.isLoading || words.isLoading || overview.isLoading || deckList.isLoading || queue.isLoading;
  const errored = categories.isError || words.isError || overview.isError || deckList.isError || queue.isError;

  if (loading) return <Screen appHeader><Loader /></Screen>;
  if (errored) {
    return (
      <ErrorState
        appHeader
        title={t.loadError}
        body={t.loadError}
        retryLabel={t.retry}
        onRetry={() => {
          void categories.refetch(); void words.refetch();
          void overview.refetch(); void deckList.refetch(); void queue.refetch();
        }}
      />
    );
  }

  const items = words.data?.pages.flatMap((page) => page.items) ?? [];
  const total = words.data?.pages[0]?.total ?? 0;
  const categoryName = (item: Category) => locale === "ru" ? item.name_ru : locale === "en" ? item.name_en : item.name_uz;
  const submitSearch = () => setQuery(search.trim());
  const clear = () => { setSearch(""); setQuery(""); setLevel(null); setCategory(null); };

  const shelfByKey = Object.fromEntries((overview.data?.shelves ?? []).map((s) => [s.key, s]));
  const totalAdded = levels.reduce((sum, key) => sum + (shelfByKey[key]?.added ?? 0), 0);
  const totalLearned = levels.reduce((sum, key) => sum + (shelfByKey[key]?.learned ?? 0), 0);
  const progressPercent = totalAdded > 0 ? Math.round((totalLearned / totalAdded) * 100) : 0;
  const dueTotal = (queue.data?.due_count ?? 0) + (queue.data?.new_count ?? 0);
  const expressionTotal = expressionMeta.data?.total ?? expressionsPreview.data?.total;
  const submitDeck = () => {
    setDeckAttempted(true);
    createDeck.reset();
    if (deckName.trim()) createDeck.mutate();
  };
  const refresh = () => {
    void categories.refetch(); void words.refetch();
    void overview.refetch(); void deckList.refetch(); void queue.refetch();
    void expressionMeta.refetch(); void expressionsPreview.refetch();
  };

  return (
    <Screen appHeader refreshing={categories.isRefetching || words.isRefetching || overview.isRefetching || deckList.isRefetching || queue.isRefetching || expressionMeta.isRefetching || expressionsPreview.isRefetching} onRefresh={refresh}>
      {/* Hero */}
      <View style={styles.hero}>
        <View aria-hidden style={styles.heroRingA} />
        <View aria-hidden style={styles.heroRingB} />
        <View style={styles.heroBadge}>
          <Ionicons name="library-outline" size={12} color={colors.raised} />
          <Text style={styles.heroBadgeText}>VOCORA LIBRARY</Text>
        </View>
        <Text style={styles.heroTitle}>{g.libTitle}</Text>
        <Text style={styles.heroSubtitle}>{g.libSubtitle}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Ionicons name="book-outline" size={16} color={colors.brand200} />
            <Text style={styles.statValue}>{totalAdded}</Text>
            <Text style={styles.statLabel}>{g.libWords}</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.gold300} />
            <Text style={styles.statValue}>{totalLearned}</Text>
            <Text style={styles.statLabel}>{g.libLearnedStat}</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="layers-outline" size={16} color={colors.brand200} />
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>{g.libLevelsStat}</Text>
          </View>
        </View>

        <View style={styles.ringCard}>
          <CircularProgress percent={progressPercent} size={64} color={colors.gold500} track="rgba(84,37,15,0.16)" />
          <View style={styles.ringText}>
            <Text style={styles.ringPercent}>{progressPercent}%</Text>
            <Text style={styles.ringLabel}>{g.continue}</Text>
          </View>
        </View>
      </View>

      {/* My cards */}
      {dueTotal > 0 || totalAdded > 0 ? (
        <Pressable onPress={() => router.push("/library/my-cards")} style={({ pressed }) => [styles.myCards, pressed && styles.pressed]}>
          <View style={styles.myCardsIcon}><Ionicons name="albums-outline" size={20} color={colors.brand300} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.myCardsTitle}>{g.libMyCards}</Text>
            <View style={styles.myCardsTrack}>
              <View style={[styles.myCardsFill, { width: `${totalAdded > 0 ? Math.min((dueTotal / (totalAdded * 0.3)) * 100, 100) : 0}%` }]} />
            </View>
            <Text style={styles.myCardsSub}>
              <Text style={styles.myCardsStrong}>{dueTotal}</Text> {g.due} · <Text style={styles.myCardsStrong}>{totalAdded}</Text> {g.libWords}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {/* Expressions */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.sectionTitle}>{t.expressionsTitle}</Text>
            <Text style={styles.sectionSub}>{t.expressionsSubtitle}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t.expressionsOpen} onPress={() => router.push("/expressions")} style={({ pressed }) => [styles.openAllButton, pressed && styles.pressed]}>
            <Text style={styles.openAllText}>{t.expressionsOpen}</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.brand600} />
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel={t.expressionsOpen} onPress={() => router.push("/expressions")} style={({ pressed }) => [styles.expressionHero, pressed && styles.pressed]}>
          <View style={styles.expressionIcon}><Ionicons name="chatbubbles-outline" size={22} color={colors.raised} /></View>
          <View style={styles.expressionHeroCopy}>
            <Text style={styles.expressionHeroTitle}>{t.expressionsTitle}</Text>
            <Text style={styles.expressionHeroSub}>{t.expressionsSubtitle}</Text>
          </View>
          <View style={styles.expressionCount}>
            <Text style={styles.expressionCountValue}>{expressionTotal === undefined ? "…" : expressionTotal.toLocaleString(locale)}</Text>
            <Text style={styles.expressionCountLabel}>{t.expressionsCount}</Text>
          </View>
        </Pressable>

        {expressionsPreview.isError ? (
          <View style={styles.expressionError}>
            <Ionicons name="warning-outline" size={17} color={colors.rust} />
            <Text style={styles.expressionErrorText}>{t.expressionsError}</Text>
          </View>
        ) : null}

        {expressionsPreview.data?.items.length ? (
          <View style={styles.expressionGrid}>
            {expressionsPreview.data.items.map((item) => (
              <ExpressionPreviewCard key={item.slug} item={item} onPress={() => router.push({ pathname: "/expressions", params: { slug: item.slug } })} />
            ))}
          </View>
        ) : null}
      </View>

      {/* Level shelves */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{g.libTitle}</Text>
        <View style={styles.shelfGrid}>
          {SHELVES.map((meta) => (
            <ShelfCard
              key={meta.slug}
              meta={meta}
              locale={locale}
              total={shelfByKey[meta.key]?.total ?? 0}
              learned={shelfByKey[meta.key]?.learned ?? 0}
              wordsLabel={g.libWords}
              learnedLabel={g.libLearnedStat}
              startLabel={g.libStudy}
              continueLabel={g.continue}
            />
          ))}
        </View>
      </View>

      {/* Collections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{g.libCollections}</Text>
        <Text style={styles.sectionSub}>{g.libCollectionsDesc}</Text>

        {creating ? (
          <View style={styles.createCard}>
            <Field label={g.deckName} value={deckName} maxLength={80} autoFocus returnKeyType="done" onSubmitEditing={submitDeck} onChangeText={(value) => { setDeckName(value); setDeckAttempted(false); createDeck.reset(); }} />
            {deckAttempted && !deckName.trim() ? <Text style={styles.errorNote}>{g.deckNameRequired}</Text> : null}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button loading={createDeck.isPending} onPress={submitDeck}>{g.libCreate}</Button>
              <Button variant="quiet" onPress={() => { setCreating(false); setDeckName(""); setDeckAttempted(false); }}>{g.back}</Button>
            </View>
          </View>
        ) : (
          <Button variant="secondary" icon="add" onPress={() => setCreating(true)}>{g.libNewCollection}</Button>
        )}

        <View style={styles.shelfGrid}>
          {deckList.data?.map((deck) => (
            <CollectionCard
              key={deck.id}
              deck={deck}
              labels={{ cards: g.libCards, due: g.due, review: g.review, delete: g.libDelete, deleteConfirm: g.libDeleteConfirm, cancel: g.cancel }}
              onDelete={() => deleteDeck.mutate(deck.id)}
            />
          ))}
        </View>
      </View>

      {/* Browse & search the full corpus */}
      <View style={styles.intro}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel={t.placeholder}
          autoCapitalize="none"
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          placeholder={t.placeholder}
          placeholderTextColor="rgba(108,73,53,0.62)"
          returnKeyType="search"
          style={styles.searchInput}
          value={search}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={t.search} onPress={submitSearch} style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
          <Ionicons name="search" size={18} color={colors.raised} />
          <Text style={styles.searchButtonText}>{t.search}</Text>
        </Pressable>
      </View>

      <View style={styles.filterGroup}>
        <FilterChip active={!level} label={t.allLevels} onPress={() => setLevel(null)} />
        {levels.map((item) => <FilterChip key={item} active={level === item} label={item} onPress={() => setLevel(item)} />)}
      </View>

      <View style={styles.filterGroup}>
        <FilterChip active={!category} label={t.allTopics} onPress={() => setCategory(null)} quiet />
        {categories.data?.map((item) => (
          <FilterChip key={item.id} active={category === item.slug} label={`${item.emoji ? `${item.emoji} ` : ""}${categoryName(item)}`} onPress={() => setCategory(item.slug)} quiet />
        ))}
      </View>

      <Text style={styles.resultCount}><Text style={styles.resultNumber}>{total.toLocaleString(locale)}</Text> {t.found}</Text>

      {items.length ? (
        <View style={styles.grid}>
          {items.map((word) => (
            <VocabularyCard
              key={word.id}
              word={word}
              locale={locale as Locale}
              onAdd={() => addCard.mutate(word.id)}
              added={added.has(word.id)}
              adding={addCard.isPending && addCard.variables === word.id}
              addError={addCard.isError && addCard.variables === word.id}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t.empty}</Text>
          <Button variant="secondary" onPress={clear}>{t.clear}</Button>
        </View>
      )}

      {words.hasNextPage ? <Button variant="secondary" loading={words.isFetchingNextPage} onPress={() => void words.fetchNextPage()}>{t.more}</Button> : null}
    </Screen>
  );
}

function FilterChip({ label, active, onPress, quiet = false }: { label: string; active: boolean; onPress: () => void; quiet?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, quiet && styles.chipQuiet, active && styles.chipActive, pressed && styles.chipPressed]}
    >
      <Text style={[styles.chipText, quiet && styles.chipQuietText, active && styles.chipActiveText]}>{label}</Text>
    </Pressable>
  );
}

function ExpressionPreviewCard({ item, onPress }: { item: ExpressionListItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={item.expression} onPress={onPress} style={({ pressed }) => [styles.expressionCard, pressed && styles.pressed]}>
      <View style={styles.expressionCardTop}>
        <Text numberOfLines={2} style={styles.expressionText}>{item.expression}</Text>
        <Text style={styles.expressionLevel}>{item.cefr}</Text>
      </View>
      <Text numberOfLines={2} style={styles.expressionTranslation}>{item.translation ?? item.uzbek ?? item.usage}</Text>
      <View style={styles.expressionTags}>
        <Text style={styles.expressionTag}>{item.category}</Text>
        <Text style={styles.expressionTag}>IELTS {item.ielts_band}</Text>
        <Text style={styles.expressionTag}>{item.formality}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { position: "relative", overflow: "hidden", borderWidth: 2, borderColor: colors.brand950, borderRadius: 20, backgroundColor: colors.brand950, padding: 18 },
  heroRingA: { position: "absolute", left: -60, top: -60, width: 180, height: 180, borderRadius: 90, borderWidth: 24, borderColor: "rgba(70,120,120,0.35)" },
  heroRingB: { position: "absolute", right: -40, bottom: -30, width: 140, height: 140, borderRadius: 8, backgroundColor: "rgba(185,78,40,0.5)", transform: [{ rotate: "12deg" }] },
  heroBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(255,248,234,0.4)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(255,248,234,0.1)" },
  heroBadgeText: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, color: colors.raised },
  heroTitle: { marginTop: 14, fontFamily: fonts.display, fontSize: 28, lineHeight: 30, letterSpacing: 0.4, color: colors.raised, textTransform: "uppercase" },
  heroSubtitle: { marginTop: 8, fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: "rgba(255,248,234,0.82)" },
  statsRow: { marginTop: 16, flexDirection: "row", gap: 8 },
  statTile: { flex: 1, borderWidth: 1, borderColor: "rgba(255,248,234,0.25)", borderRadius: 12, backgroundColor: colors.brand900, paddingHorizontal: 10, paddingVertical: 10 },
  statValue: { marginTop: 6, fontFamily: fonts.display, fontSize: 22, letterSpacing: 0.3, color: colors.raised },
  statLabel: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.3, color: "rgba(255,248,234,0.66)", textTransform: "uppercase" },
  ringCard: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "flex-start", borderWidth: 2, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.raised, paddingVertical: 10, paddingHorizontal: 14 },
  ringText: {},
  ringPercent: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  ringLabel: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  myCards: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 2, borderColor: colors.brand800, borderRadius: 16, backgroundColor: colors.brand950, padding: 14 },
  myCardsIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "rgba(255,248,234,0.12)" },
  myCardsTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.raised },
  myCardsTrack: { marginTop: 8, height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.14)" },
  myCardsFill: { height: "100%", borderRadius: 3, backgroundColor: colors.raised },
  myCardsSub: { marginTop: 6, fontFamily: fonts.ui, fontSize: 11, color: "rgba(255,248,234,0.8)" },
  myCardsStrong: { fontFamily: fonts.uiBold, color: colors.raised },
  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  sectionHeaderCopy: { flex: 1, minWidth: 0, gap: 6 },
  sectionTitle: { fontFamily: fonts.uiBold, fontSize: 19, color: colors.ink },
  sectionSub: { marginTop: -6, fontFamily: fonts.ui, fontSize: 12, color: colors.muted },
  openAllButton: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 999, backgroundColor: colors.raised },
  openAllText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.brand600 },
  expressionHero: { minHeight: 88, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderWidth: 2, borderColor: colors.brand950, borderRadius: 17, backgroundColor: colors.brand950 },
  expressionIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.brand600 },
  expressionHeroCopy: { flex: 1, minWidth: 0 },
  expressionHeroTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 24, color: colors.raised, textTransform: "uppercase" },
  expressionHeroSub: { marginTop: 5, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 17, color: "rgba(255,248,234,0.78)" },
  expressionCount: { minWidth: 76, alignItems: "center", padding: 8, borderWidth: 1, borderColor: "rgba(255,248,234,0.28)", borderRadius: 12, backgroundColor: "rgba(255,248,234,0.1)" },
  expressionCountValue: { fontFamily: fonts.display, fontSize: 24, color: colors.gold300 },
  expressionCountLabel: { fontFamily: fonts.uiBold, fontSize: 8.5, color: "rgba(255,248,234,0.72)", textTransform: "uppercase" },
  expressionError: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: "rgba(185,78,40,0.22)", borderRadius: 11, backgroundColor: "rgba(185,78,40,0.08)" },
  expressionErrorText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.rustDark },
  expressionGrid: { gap: 10 },
  expressionCard: { width: "100%", minHeight: 132, gap: 10, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  expressionCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  expressionText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 16, lineHeight: 21, color: colors.ink },
  expressionLevel: { minWidth: 38, overflow: "hidden", borderWidth: 1, borderColor: colors.teal, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5, textAlign: "center", fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.teal, backgroundColor: "rgba(70,120,120,0.10)" },
  expressionTranslation: { fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 20, color: colors.brown },
  expressionTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: "auto" },
  expressionTag: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: "rgba(84,37,15,0.07)", fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.rustDark },
  shelfGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  createCard: { gap: 10, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, borderStyle: "dashed", padding: 14 },
  errorNote: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.danger },
  intro: { gap: 7, marginTop: 5 },
  title: { fontFamily: fonts.display, fontSize: 31, lineHeight: 34, letterSpacing: 0.5, color: colors.ink, textTransform: "uppercase" },
  subtitle: { maxWidth: 345, fontFamily: fonts.ui, fontSize: 14, lineHeight: 23, color: colors.muted },
  searchRow: { flexDirection: "row", gap: 9 },
  searchInput: { minWidth: 0, flex: 1, height: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream, fontFamily: fonts.ui, fontSize: 15, color: colors.ink },
  searchButton: { minWidth: 94, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 13, borderRadius: 12, backgroundColor: colors.brand600 },
  searchButtonText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.raised },
  filterGroup: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  chip: { minHeight: 34, justifyContent: "center", paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 17, backgroundColor: "transparent" },
  chipQuiet: { minHeight: 31, paddingHorizontal: 10, borderColor: "transparent" },
  chipActive: { borderColor: colors.brand600, backgroundColor: colors.brand600 },
  chipText: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted },
  chipQuietText: { fontSize: 10.5 },
  chipActiveText: { color: colors.raised },
  chipPressed: { opacity: 0.65 },
  resultCount: { marginTop: 5, fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  resultNumber: { color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  empty: { gap: 15, paddingVertical: 20 },
  emptyText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
});
