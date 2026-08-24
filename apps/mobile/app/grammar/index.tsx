import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  ALL_LESSONS,
  GRAMMAR_LEVELS,
  LESSONS_BY_LEVEL,
  loadGrammarProgress,
  localiseLesson,
  masteryStatus,
  type CefrGrammarLevel,
  type MobileGrammarProgress,
} from "@/grammar/catalog";
import { Heading, Loader, Screen } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { title: "Grammar studio", subtitle: "A1 dan C1 gacha 200 ta tartibli dars, amaliy mashqlar va mastery kuzatuvi.", completed: "o‘zlashtirilgan", path: "CEFR yo‘li", load: "Grammar katalogi yuklanmoqda...", search: "Grammar mavzusini qidiring...", all: "Barchasi", weak: "Zaif grammatikangiz", noWeak: "Birinchi darsni ishlang — tavsiyalar shu yerda chiqadi.", empty: "Bu filtr bo‘yicha dars topilmadi.", min: "daq" },
  ru: { title: "Grammar studio", subtitle: "200 последовательных уроков от A1 до C1, практика и отслеживание уровня.", completed: "освоено", path: "Путь CEFR", load: "Загружаем каталог грамматики...", search: "Найти тему грамматики...", all: "Все", weak: "Слабые темы", noWeak: "Пройдите первый урок — здесь появятся рекомендации.", empty: "По этому фильтру уроки не найдены.", min: "мин" },
  en: { title: "Grammar studio", subtitle: "200 structured lessons from A1 to C1, varied practice, and mastery tracking.", completed: "mastered", path: "CEFR path", load: "Loading grammar catalogue...", search: "Search grammar topics...", all: "All", weak: "Your weak grammar", noWeak: "Complete your first lesson to unlock recommendations.", empty: "No lessons match this filter.", min: "min" },
} as const;

const levelColors: Record<CefrGrammarLevel, string> = { A1: "#B94E28", A2: colors.teal, B1: "#84522B", B2: "#8D3D68", C1: "#A36A0B" };
const statusColors = { "not-started": colors.muted, weak: colors.danger, "needs-review": colors.rust, good: colors.brand600, mastered: colors.teal } as const;

export default function GrammarCatalogue() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const [level, setLevel] = useState<CefrGrammarLevel>("A1");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [progress, setProgress] = useState<MobileGrammarProgress | null>(null);
  const readProgress = useCallback(() => { void loadGrammarProgress().then(setProgress); }, []);
  useFocusEffect(readProgress);
  const levelLessons = useMemo(() => LESSONS_BY_LEVEL[level].map((lesson) => localiseLesson(lesson, locale)), [level, locale]);
  const categories = useMemo(() => [...new Set(levelLessons.map((lesson) => lesson.category ?? "Foundations"))], [levelLessons]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return levelLessons.filter((lesson) => (!needle || `${lesson.title} ${lesson.titleUz} ${lesson.category}`.toLocaleLowerCase().includes(needle)) && (category === "all" || lesson.category === category));
  }, [category, levelLessons, query]);
  const grouped = useMemo(() => visible.reduce<Record<string, typeof visible>>((result, lesson) => { const key = lesson.category ?? "Foundations"; (result[key] ??= []).push(lesson); return result; }, {}), [visible]);
  if (!progress) return <Screen appHeader><Loader label={t.load} /></Screen>;
  const mastered = ALL_LESSONS.filter((lesson) => masteryStatus(progress[lesson.slug]?.bestScore) === "mastered").length;
  const weak = ALL_LESSONS.map((lesson) => ({ lesson, score: progress[lesson.slug]?.bestScore })).filter((item): item is { lesson: (typeof ALL_LESSONS)[number]; score: number } => typeof item.score === "number" && item.score < 70).sort((a, b) => a.score - b.score).slice(0, 3);

  return <Screen appHeader>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="library-outline" size={27} color={colors.raised} /></View><Heading sub={t.subtitle}>{t.title}</Heading><View style={styles.progressRow}><View><Text style={styles.progressValue}>{mastered}/{ALL_LESSONS.length}</Text><Text style={styles.progressLabel}>{t.completed}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round((mastered / ALL_LESSONS.length) * 100)}%` }]} /></View></View></View>
    <View style={styles.searchWrap}><Ionicons name="search" size={19} color={colors.muted} /><TextInput accessibilityLabel={t.search} value={query} onChangeText={setQuery} placeholder={t.search} placeholderTextColor={colors.muted} autoCorrect={false} style={styles.search} /></View>
    <View style={styles.weakBox}><View style={styles.weakTitle}><Ionicons name="pulse-outline" size={19} color={colors.rust} /><Text style={styles.weakHeading}>{t.weak}</Text></View>{weak.length ? weak.map(({ lesson, score }) => <Pressable key={lesson.slug} onPress={() => router.push(`/grammar/${lesson.slug}` as Href)} style={styles.weakRow}><Text numberOfLines={1} style={styles.weakName}>{lesson.title}</Text><Text style={styles.weakScore}>{score}%</Text></Pressable>) : <Text style={styles.weakEmpty}>{t.noWeak}</Text>}</View>
    <Text style={styles.path}>{t.path}</Text>
    <View style={styles.levels} accessibilityRole="tablist">{GRAMMAR_LEVELS.map((item) => { const active = item === level; const levelMastered = LESSONS_BY_LEVEL[item].filter((lesson) => masteryStatus(progress[lesson.slug]?.bestScore) === "mastered").length; return <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { setLevel(item); setCategory("all"); }} style={({ pressed }) => [styles.level, active && { backgroundColor: levelColors[item], borderColor: levelColors[item] }, pressed && styles.pressed]}><Text style={[styles.levelText, active && styles.levelTextActive]}>{item}</Text><Text style={[styles.levelCount, active && styles.levelTextActive]}>{levelMastered}/{LESSONS_BY_LEVEL[item].length}</Text></Pressable>; })}</View>
    <View style={styles.categories}><Pressable onPress={() => setCategory("all")} style={[styles.category, category === "all" && styles.categoryActive]}><Text style={[styles.categoryText, category === "all" && styles.categoryTextActive]}>{t.all}</Text></Pressable>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</View>
    {Object.keys(grouped).length ? Object.entries(grouped).map(([group, lessons]) => <View key={group} style={styles.group}><View style={styles.groupHead}><Text style={styles.groupTitle}>{group}</Text><Text style={styles.groupCount}>{lessons.length}</Text></View><View style={styles.lessonList}>{lessons.map((lesson) => { const entry = progress[lesson.slug]; const status = masteryStatus(entry?.bestScore); return <Pressable key={lesson.slug} accessibilityRole="button" accessibilityLabel={lesson.title} onPress={() => router.push(`/grammar/${lesson.slug}` as Href)} style={({ pressed }) => [styles.lesson, pressed && styles.pressed]}><View style={[styles.lessonIcon, { borderColor: statusColors[status] }]}><Ionicons name={status === "mastered" ? "checkmark" : "book-outline"} size={20} color={statusColors[status]} /></View><View style={styles.lessonCopy}><Text numberOfLines={2} style={styles.lessonTitle}>{lesson.title}</Text><Text numberOfLines={1} style={styles.lessonUz}>{lesson.titleUz}</Text><View style={styles.meta}><Text style={[styles.status, { color: statusColors[status] }]}>{status.replaceAll("-", " ")}{entry ? ` · ${entry.bestScore}%` : ""}</Text><Text style={styles.minutes}>{lesson.estimatedMinutes ?? 15} {t.min}</Text></View></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>; })}</View></View>) : <Text style={styles.empty}>{t.empty}</Text>}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { gap: 13, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, padding: 19, backgroundColor: colors.brand950, shadowColor: colors.brown, shadowOpacity: .26, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 }, heroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.brand600 }, progressRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 4 }, progressValue: { fontFamily: fonts.uiBold, fontSize: 23, color: colors.raised }, progressLabel: { fontFamily: fonts.uiMedium, fontSize: 10, textTransform: "uppercase", letterSpacing: .6, color: "#EBC99F" }, progressTrack: { flex: 1, height: 8, overflow: "hidden", borderRadius: 4, backgroundColor: "rgba(255,248,234,0.24)" }, progressFill: { height: "100%", borderRadius: 4, backgroundColor: colors.gold500 },
  searchWrap: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, backgroundColor: colors.raised }, search: { flex: 1, minHeight: 48, fontFamily: fonts.ui, fontSize: 16, color: colors.ink },
  weakBox: { gap: 8, borderWidth: 1, borderColor: "rgba(185,78,40,.25)", borderRadius: 14, padding: 14, backgroundColor: "rgba(185,78,40,.05)" }, weakTitle: { flexDirection: "row", alignItems: "center", gap: 7 }, weakHeading: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, weakRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 10, paddingHorizontal: 11, backgroundColor: colors.raised }, weakName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, weakScore: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rust }, weakEmpty: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted },
  path: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 12, letterSpacing: .7, textTransform: "uppercase", color: colors.muted }, levels: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, level: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 11, backgroundColor: colors.cream }, levelText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, levelCount: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted }, levelTextActive: { color: colors.raised }, categories: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, category: { minHeight: 40, justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 12, backgroundColor: colors.cream }, categoryActive: { borderColor: colors.brand600, backgroundColor: colors.brand600 }, categoryText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink }, categoryTextActive: { color: colors.raised },
  group: { gap: 9 }, groupHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, groupTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 18, color: colors.ink }, groupCount: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.muted }, lessonList: { gap: 9 }, lesson: { minHeight: 92, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: .13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, lessonIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 12, backgroundColor: colors.brand100 }, lessonCopy: { flex: 1, minWidth: 0, gap: 3 }, lessonTitle: { fontFamily: fonts.uiBold, fontSize: 15, lineHeight: 20, color: colors.ink }, lessonUz: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted }, meta: { marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 8 }, status: { fontFamily: fonts.uiBold, fontSize: 11, textTransform: "capitalize" }, minutes: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, empty: { paddingVertical: 30, textAlign: "center", fontFamily: fonts.uiMedium, fontSize: 14, color: colors.muted }, pressed: { opacity: .72, transform: [{ translateY: 1 }] },
});
