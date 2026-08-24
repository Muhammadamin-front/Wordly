import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Speech from "expo-speech";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { request, type ExpressionDetail, type ExpressionMeta, type ExpressionPage } from "@/api/client";
import { BackButton, Button, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const CEFR = ["A2", "B1", "B2", "C1", "C2"];
const copy = {
  uz: { back: "IELTS markazi", title: "Iboralar", subtitle: "Sizni ravon qiladigan native iboralar — IELTS Band 7–9 uchun", total: "ibora", search: "Ibora yoki ma'no qidiring...", allLevels: "Barcha darajalar", allCategories: "Barcha turkumlar", empty: "Hech narsa topilmadi. Boshqa filtr sinang.", prev: "Oldingi", next: "Keyingi", close: "Yopish", listen: "Tinglash", usage: "Qachon ishlatiladi", grammar: "Grammatik qolip", examples: "Misollar", collocations: "Birikmalar", alternatives: "Muqobil variantlar", synonyms: "Sinonimlar", opposites: "Antonimlar", mistakes: "Ko'p uchraydigan xatolar", nativeNotes: "Native so'zlovchi izohlari", add: "Kartalarga qo'shish", added: "Kartalarga qo'shildi", error: "Iboralarni yuklab bo'lmadi." },
  ru: { back: "Центр IELTS", title: "Выражения", subtitle: "Фразы носителей для IELTS Band 7–9", total: "выражений", search: "Найти выражение или значение...", allLevels: "Все уровни", allCategories: "Все категории", empty: "Ничего не найдено.", prev: "Назад", next: "Вперёд", close: "Закрыть", listen: "Слушать", usage: "Когда использовать", grammar: "Грамматический шаблон", examples: "Примеры", collocations: "Словосочетания", alternatives: "Альтернативы", synonyms: "Синонимы", opposites: "Противоположности", mistakes: "Частые ошибки", nativeNotes: "Заметки носителя", add: "Добавить в карточки", added: "Добавлено в карточки", error: "Не удалось загрузить выражения." },
  en: { back: "IELTS hub", title: "Expressions", subtitle: "Native phrases that make you sound fluent — for IELTS Band 7–9", total: "expressions", search: "Search an expression or meaning...", allLevels: "All levels", allCategories: "All categories", empty: "Nothing found. Try another filter.", prev: "Prev", next: "Next", close: "Close", listen: "Listen", usage: "When to use", grammar: "Grammar pattern", examples: "Examples", collocations: "Collocations", alternatives: "Alternatives", synonyms: "Synonyms", opposites: "Opposites", mistakes: "Common mistakes", nativeNotes: "Native speaker notes", add: "Add to cards", added: "Added to cards", error: "Expressions could not be loaded." },
} as const;

export default function ExpressionsScreen() {
  const routeParams = useLocalSearchParams<{ slug?: string | string[] }>();
  const { user, token } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const routeSlug = Array.isArray(routeParams.slug) ? routeParams.slug[0] : routeParams.slug;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cefr, setCefr] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setQuery(search.trim()); }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (routeSlug) setOpenSlug(routeSlug);
  }, [routeSlug]);

  const meta = useQuery({ queryKey: ["expressions-meta"], queryFn: () => request<ExpressionMeta>("/expressions/meta") });
  const list = useQuery({
    queryKey: ["expressions", locale, page, cefr, category, query],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), page_size: "24", locale });
      if (cefr) params.set("cefr", cefr);
      if (category) params.set("category", category);
      if (query) params.set("q", query);
      return request<ExpressionPage>(`/expressions?${params}`);
    },
  });
  const detail = useQuery({ queryKey: ["expression", openSlug, locale], queryFn: () => request<ExpressionDetail>(`/expressions/${openSlug}?locale=${locale}`), enabled: Boolean(openSlug) });
  const addCard = useMutation({
    mutationFn: (expression: ExpressionDetail) => request("/cards", { method: "POST", token, body: { front_text: expression.expression, back_text: expression.flashcard_back } }),
    onSuccess: (_value, expression) => setAdded((previous) => new Set(previous).add(expression.slug)),
  });
  const pageCount = Math.max(1, Math.ceil((list.data?.total ?? 0) / 24));

  function selectFilter(setter: (value: string | null) => void, value: string | null) { setPage(1); setter(value); }

  return (
    <Screen appHeader appFooter>
      <BackButton label={t.back} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      <View style={styles.hero}>
        <View style={styles.heroTop}><View style={styles.iconTile}><Ionicons name="chatbubbles-outline" size={26} color={colors.teal} /></View>{meta.data ? <View style={styles.totalCard}><Text style={styles.totalValue}>{meta.data.total}</Text><Text style={styles.totalLabel}>{t.total}</Text></View> : null}</View>
        <Text style={styles.title}>{t.title}</Text><Text style={styles.subtitle}>{t.subtitle}</Text>
        <View style={styles.searchBox}><Ionicons name="search" size={18} color={colors.muted} /><TextInput accessibilityLabel={t.search} value={search} onChangeText={setSearch} placeholder={t.search} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}><FilterChip label={t.allLevels} selected={!cefr} onPress={() => selectFilter(setCefr, null)} />{CEFR.map((level) => <FilterChip key={level} label={level} selected={cefr === level} onPress={() => selectFilter(setCefr, level)} />)}</ScrollView>
      </View>
      {meta.data?.categories.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}><FilterChip label={t.allCategories} selected={!category} onPress={() => selectFilter(setCategory, null)} />{meta.data.categories.map((item) => <FilterChip key={item.category} label={`${item.category} ${item.count}`} selected={category === item.category} onPress={() => selectFilter(setCategory, item.category)} />)}</ScrollView> : null}
      {list.isPending ? <View style={styles.loader}><ActivityIndicator color={colors.rust} /><Text style={styles.loaderText}>{t.title}…</Text></View> : null}
      {list.isError ? <View style={styles.errorCard}><Text style={styles.errorText}>{t.error}</Text><Button variant="secondary" onPress={() => void list.refetch()}>{t.next}</Button></View> : null}
      <View style={styles.cardList}>{list.data?.items.map((item) => <Pressable key={item.slug} accessibilityRole="button" onPress={() => setOpenSlug(item.slug)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.cardTop}><Text style={styles.expression}>{item.expression}</Text><Text style={styles.cefr}>{item.cefr}</Text></View><Text style={styles.translation}>{item.translation ?? item.usage}</Text><View style={styles.tags}><Tag>{item.category}</Tag><Tag>IELTS {item.ielts_band}</Tag><Tag>{item.formality}</Tag></View></Pressable>)}</View>
      {list.data && list.data.items.length === 0 ? <Text style={styles.empty}>{t.empty}</Text> : null}
      {pageCount > 1 ? <View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => setPage((value) => value - 1)} style={[styles.pageButton, page <= 1 && styles.disabled]}><Ionicons name="chevron-back" size={17} color={colors.ink} /><Text style={styles.pageText}>{t.prev}</Text></Pressable><Text style={styles.pageCount}>{page} / {pageCount}</Text><Pressable disabled={page >= pageCount} onPress={() => setPage((value) => value + 1)} style={[styles.pageButton, page >= pageCount && styles.disabled]}><Text style={styles.pageText}>{t.next}</Text><Ionicons name="chevron-forward" size={17} color={colors.ink} /></Pressable></View> : null}
      <Modal visible={Boolean(openSlug)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpenSlug(null)}><SafeAreaView style={styles.modalSafe}>{detail.data ? <ExpressionModal locale={locale} expression={detail.data} added={added.has(detail.data.slug)} adding={addCard.isPending} canAdd={Boolean(token)} onAdd={() => addCard.mutate(detail.data)} onClose={() => setOpenSlug(null)} /> : <View style={styles.loader}><ActivityIndicator color={colors.rust} /><Text style={styles.loaderText}>{t.title}…</Text></View>}</SafeAreaView></Modal>
    </Screen>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.filterChip, selected && styles.filterChipActive]}><Text style={[styles.filterText, selected && styles.filterTextActive]}>{label}</Text></Pressable>; }
function Tag({ children }: { children: ReactNode }) { return <Text style={styles.tag}>{children}</Text>; }

function ExpressionModal({ locale, expression, added, adding, canAdd, onAdd, onClose }: { locale: Locale; expression: ExpressionDetail; added: boolean; adding: boolean; canAdd: boolean; onAdd: () => void; onClose: () => void }) {
  const t = copy[locale];
  return <View style={styles.modal}><View style={styles.modalHeader}><View style={styles.flexOne}><View style={styles.expressionHeading}><Text style={styles.modalTitle}>{expression.expression}</Text><Pressable accessibilityRole="button" accessibilityLabel={t.listen} onPress={() => Speech.speak(expression.expression, { language: "en-US", rate: 0.92 })} style={styles.listenButton}><Ionicons name="volume-high-outline" size={18} color={colors.teal} /></Pressable></View><Text style={styles.modalTranslation}>{expression.translation ?? expression.usage}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={21} color={colors.ink} /></Pressable></View><View style={styles.tags}><Tag>{expression.category}</Tag><Tag>{expression.cefr}</Tag><Tag>IELTS {expression.ielts_band}</Tag><Tag>{expression.formality}</Tag></View>{canAdd ? <Button loading={adding} disabled={added} icon={added ? "checkmark" : "add"} onPress={onAdd}>{added ? t.added : t.add}</Button> : null}<ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}><Section title={t.usage}><Text style={styles.sectionBody}>{expression.usage}</Text></Section><Section title={t.grammar}><Text selectable style={styles.grammar}>{expression.grammar_pattern}</Text></Section>{expression.example_sentences.length ? <Section title={t.examples}>{expression.example_sentences.map((sentence) => <Text key={sentence} style={styles.example}>“{sentence}”</Text>)}</Section> : null}<LineSection title={t.collocations} items={expression.collocations} /><LineSection title={t.alternatives} items={expression.alternatives} /><LineSection title={t.synonyms} items={expression.synonyms} /><LineSection title={t.opposites} items={expression.opposites} />{expression.common_mistakes.length ? <Section title={t.mistakes}>{expression.common_mistakes.map((mistake) => <View key={mistake} style={styles.mistakeRow}><Ionicons name="warning-outline" size={17} color={colors.danger} /><Text style={styles.mistake}>{mistake}</Text></View>)}</Section> : null}{expression.native_notes ? <View style={styles.noteCard}><Ionicons name="bulb-outline" size={20} color={colors.teal} /><Section title={t.nativeNotes}><Text style={styles.sectionBody}>{expression.native_notes}</Text></Section></View> : null}</ScrollView></View>;
}
function Section({ title, children }: { title: string; children: ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function LineSection({ title, items }: { title: string; items: string[] }) { return items.length ? <Section title={title}><Text style={styles.sectionBody}>{items.join(" · ")}</Text></Section> : null; }

const styles = StyleSheet.create({
  flexOne: { flex: 1, minWidth: 0 }, pressed: { opacity: 0.72, transform: [{ translateY: 1 }] }, disabled: { opacity: 0.4 },
  hero: { gap: 14, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.16, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, iconTile: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.raised },
  totalCard: { minWidth: 76, alignItems: "center", padding: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised }, totalValue: { fontFamily: fonts.display, fontSize: 28, color: colors.rust }, totalLabel: { fontFamily: fonts.uiBold, fontSize: 8.5, textTransform: "uppercase", color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 42, textTransform: "uppercase", color: colors.ink }, subtitle: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 21, color: colors.muted },
  searchBox: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 13, borderWidth: 1.5, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised }, searchInput: { flex: 1, fontFamily: fonts.ui, fontSize: 13, color: colors.ink },
  filterRow: { gap: 7, paddingVertical: 2 }, filterChip: { justifyContent: "center", paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.cream }, filterChipActive: { borderColor: colors.rust, backgroundColor: "rgba(185,78,40,0.10)" }, filterText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted }, filterTextActive: { color: colors.rustDark },
  loader: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 9 }, loaderText: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, errorCard: { gap: 10, padding: 15, borderWidth: 1, borderColor: "rgba(220,38,38,0.3)", borderRadius: 12 }, errorText: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.danger },
  cardList: { gap: 10 }, card: { minHeight: 154, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 }, expression: { flex: 1, fontFamily: fonts.uiBold, fontSize: 17, lineHeight: 22, color: colors.ink }, cefr: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.teal }, translation: { marginTop: 8, fontFamily: fonts.ui, fontSize: 12, lineHeight: 19, color: colors.muted }, tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 13 }, tag: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, backgroundColor: "rgba(84,37,15,0.06)", fontFamily: fonts.uiBold, fontSize: 8.5, color: colors.muted }, empty: { padding: 25, fontFamily: fonts.uiMedium, fontSize: 13, textAlign: "center", color: colors.muted },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, pageButton: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised }, pageText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.ink }, pageCount: { paddingHorizontal: 10, fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  modalSafe: { flex: 1, backgroundColor: colors.paper }, modal: { flex: 1, paddingTop: 12 }, modalHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 18 }, expressionHeading: { flexDirection: "row", alignItems: "center", gap: 8 }, modalTitle: { flexShrink: 1, fontFamily: fonts.display, fontSize: 31, lineHeight: 34, color: colors.ink }, modalTranslation: { marginTop: 5, fontFamily: fonts.uiBold, fontSize: 12, lineHeight: 18, color: colors.rustDark }, listenButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised }, closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised }, modalScroll: { gap: 17, padding: 18, paddingBottom: 50 }, section: { gap: 7 }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 9.5, letterSpacing: 0.65, textTransform: "uppercase", color: colors.muted }, sectionBody: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 21, color: colors.ink }, grammar: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 7, backgroundColor: "rgba(84,37,15,0.06)", fontFamily: fonts.uiMedium, fontSize: 12, color: colors.ink }, example: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.line, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 20, fontStyle: "italic", color: colors.muted }, mistakeRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 }, mistake: { flex: 1, fontFamily: fonts.ui, fontSize: 12, lineHeight: 19, color: colors.danger }, noteCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderWidth: 1, borderColor: "rgba(70,120,120,0.3)", borderRadius: 10, backgroundColor: "rgba(70,120,120,0.07)" },
});
