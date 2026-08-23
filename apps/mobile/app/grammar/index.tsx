import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GRAMMAR_LEVELS, LESSONS_BY_LEVEL, loadGrammarDone, localiseLesson, type GrammarLevel } from "@/grammar/catalog";
import { Heading, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { type Href, router } from "expo-router";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { title: "Grammar studio", subtitle: "CEFR yo‘li bo‘ylab izohlar, misollar, xatolar va mini quizlar bilan ingliz grammatikasini tizimli o‘rganing.", completed: "tugallangan", path: "CEFR yo‘li", done: "Tayyor", load: "Grammar katalogi yuklanmoqda..." },
  ru: { title: "Grammar studio", subtitle: "Изучайте английскую грамматику по пути CEFR: объяснения, примеры, частые ошибки и мини-квизы.", completed: "завершено", path: "Путь CEFR", done: "Готово", load: "Загружаем каталог грамматики..." },
  en: { title: "Grammar studio", subtitle: "Study English grammar across the CEFR path with explanations, examples, common mistakes, and focused mini-quizzes.", completed: "completed", path: "CEFR path", done: "Done", load: "Loading grammar catalogue..." },
} as const;

const levelColors: Record<GrammarLevel, { active: string; text: string }> = {
  A1: { active: "#B94E28", text: colors.raised },
  A2: { active: colors.teal, text: colors.raised },
  B1: { active: "#84522B", text: colors.raised },
  B2: { active: "#8D3D68", text: colors.raised },
  IELTS: { active: "#A36A0B", text: colors.raised },
};

export default function GrammarCatalogue() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const [level, setLevel] = useState<GrammarLevel>("A1");
  const [done, setDone] = useState<Set<string> | null>(null);
  const readProgress = useCallback(() => { void loadGrammarDone().then(setDone); }, []);
  useFocusEffect(readProgress);
  if (!done) return <Screen appHeader><Loader label={t.load} /></Screen>;
  const total = GRAMMAR_LEVELS.reduce((count, item) => count + LESSONS_BY_LEVEL[item].length, 0);
  const completed = ALL_DONE_COUNT(done);
  const lessons = LESSONS_BY_LEVEL[level].map((lesson) => localiseLesson(lesson, locale));
  return <Screen appHeader>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="library-outline" size={27} color={colors.raised} /></View><Heading sub={t.subtitle}>{t.title}</Heading><View style={styles.progressRow}><View><Text style={styles.progressValue}>{completed}/{total}</Text><Text style={styles.progressLabel}>{t.completed}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round((completed / total) * 100)}%` }]} /></View></View></View>
    <Text style={styles.path}>{t.path}</Text>
    <View style={styles.levels} accessibilityRole="tablist">{GRAMMAR_LEVELS.map((item) => { const doneAtLevel = LESSONS_BY_LEVEL[item].filter((lesson) => done.has(lesson.slug)).length; const active = item === level; return <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setLevel(item)} style={({ pressed }) => [styles.level, active && { backgroundColor: levelColors[item].active, borderColor: levelColors[item].active }, pressed && styles.pressed]}><Text style={[styles.levelText, active && { color: levelColors[item].text }]}>{item}</Text><Text style={[styles.levelCount, active && { color: levelColors[item].text }]}>{doneAtLevel}/{LESSONS_BY_LEVEL[item].length}</Text></Pressable>; })}</View>
    <View style={styles.lessonList}>{lessons.map((lesson, index) => { const isDone = done.has(lesson.slug); return <Pressable key={lesson.slug} accessibilityRole="button" accessibilityLabel={`${index + 1}. ${lesson.title}${isDone ? `, ${t.done}` : ""}`} onPress={() => router.push(`/grammar/${lesson.slug}` as Href)} style={({ pressed }) => [styles.lesson, pressed && styles.pressed]}><View style={[styles.lessonIcon, isDone && styles.lessonIconDone]}>{isDone ? <Ionicons name="checkmark" size={21} color={colors.raised} /> : <Text style={styles.lessonNumber}>{index + 1}</Text>}</View><View style={styles.lessonCopy}><Text numberOfLines={1} style={styles.lessonTitle}>{lesson.title}</Text><Text numberOfLines={1} style={styles.lessonUz}>{lesson.titleUz}</Text></View><Ionicons name="chevron-forward" size={20} color={isDone ? colors.teal : colors.muted} /></Pressable>; })}</View>
  </Screen>;
}

function ALL_DONE_COUNT(done: Set<string>) { return GRAMMAR_LEVELS.flatMap((level) => LESSONS_BY_LEVEL[level]).filter((lesson) => done.has(lesson.slug)).length; }

const styles = StyleSheet.create({
  hero: { gap: 13, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, padding: 19, backgroundColor: colors.brand950, shadowColor: colors.brown, shadowOpacity: 0.26, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 }, heroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.brand600 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 4 }, progressValue: { fontFamily: fonts.uiBold, fontSize: 23, color: colors.raised }, progressLabel: { fontFamily: fonts.uiMedium, fontSize: 10, textTransform: "uppercase", letterSpacing: .6, color: "#EBC99F" }, progressTrack: { flex: 1, height: 8, overflow: "hidden", borderRadius: 4, backgroundColor: "rgba(255,248,234,0.24)" }, progressFill: { height: "100%", minWidth: 0, borderRadius: 4, backgroundColor: colors.gold500 },
  path: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 12, letterSpacing: .7, textTransform: "uppercase", color: colors.muted }, levels: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, level: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 11, backgroundColor: colors.cream }, levelText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, levelCount: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted },
  lessonList: { gap: 9 }, lesson: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: .13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, lessonIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand300, borderRadius: 12, backgroundColor: colors.brand100 }, lessonIconDone: { borderColor: colors.teal, backgroundColor: colors.teal }, lessonNumber: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rustDark }, lessonCopy: { flex: 1, minWidth: 0, gap: 3 }, lessonTitle: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink }, lessonUz: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted }, pressed: { opacity: .72, transform: [{ translateY: 1 }] },
});
