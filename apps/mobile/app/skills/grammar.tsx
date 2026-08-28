import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { request, type GrammarQuestion, type GrammarResult } from "@/api/client";
import { BackButton, Button, ErrorNote, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const levels = ["A1", "A2", "B1", "B2"] as const;
const labels = {
  uz: { title: "Grammatika", subtitle: "10 ta savol bilan qoidalarni so‘zlar kontekstida mustahkamlang.", chooseLevel: "Darajani tanlang", submit: "Javoblarni tekshirish", again: "Yana mashq qilish", result: "Natija", score: "to‘g‘ri javob", xp: "XP olindi", load: "Savollar yuklanmoqda...", error: "Grammatika mashqini yuklab bo‘lmadi.", retry: "Qayta urinish", complete: "Barcha savolga javob bering" },
  ru: { title: "Грамматика", subtitle: "Закрепляйте правила в контексте словаря через 10 вопросов.", chooseLevel: "Выберите уровень", submit: "Проверить ответы", again: "Попробовать ещё", result: "Результат", score: "правильных ответов", xp: "XP получено", load: "Загружаем вопросы...", error: "Не удалось загрузить упражнение по грамматике.", retry: "Повторить", complete: "Ответьте на все вопросы" },
  en: { title: "Grammar", subtitle: "Strengthen grammar in vocabulary context with a focused set of 10 questions.", chooseLevel: "Choose a level", submit: "Check answers", again: "Try another round", result: "Result", score: "correct answers", xp: "XP earned", load: "Loading questions...", error: "We couldn't load the grammar practice.", retry: "Try again", complete: "Answer every question" },
} as const;

export default function GrammarPractice() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const suggested = user?.profile.cefr_level && levels.includes(user.profile.cefr_level as (typeof levels)[number]) ? user.profile.cefr_level as (typeof levels)[number] : "A1";
  const [level, setLevel] = useState<(typeof levels)[number]>(suggested);
  const [answers, setAnswers] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const grammar = useQuery({ queryKey: ["grammar", level], queryFn: () => request<GrammarQuestion[]>(`/skills/grammar?level=${level}&count=10`, { token }), enabled: Boolean(token) });
  const submit = useMutation({
    mutationFn: () => request<GrammarResult>("/skills/grammar/submit", { method: "POST", token, body: { level, answers: (grammar.data ?? []).map((question, index) => ({ prompt: question.prompt, answer: answers[index] ?? "" })) } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["stats"] }); void queryClient.invalidateQueries({ queryKey: ["daily-quests"] }); void queryClient.invalidateQueries({ queryKey: ["statistics"] }); },
  });
  useEffect(() => { if (grammar.data) { setAnswers(Array(grammar.data.length).fill("")); submit.reset(); } }, [grammar.data]);

  const chooseLevel = (next: (typeof levels)[number]) => { if (next !== level) { setAnswers([]); submit.reset(); setLevel(next); } };
  const retry = () => { setAnswers([]); submit.reset(); void grammar.refetch(); };
  if (grammar.isLoading) return <Screen appHeader><Loader label={t.load} /></Screen>;
  if (grammar.isError || !grammar.data) return <Screen appHeader><BackButton label={locale === "uz" ? "Ko‘nikmalar" : locale === "ru" ? "Навыки" : "Skills"} onPress={() => router.back()} /><Heading>{t.error}</Heading><Button icon="refresh" onPress={retry}>{t.retry}</Button></Screen>;

  const result = submit.data;
  const complete = answers.length === grammar.data.length && answers.every(Boolean);
  return <Screen appHeader><BackButton label={locale === "uz" ? "Ko‘nikmalar" : locale === "ru" ? "Навыки" : "Skills"} onPress={() => router.back()} /><Stamp tone="teal">{level}</Stamp><Heading sub={t.subtitle}>{t.title}</Heading><View style={styles.levels} accessibilityRole="radiogroup">{levels.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: level === item }} disabled={submit.isPending} onPress={() => chooseLevel(item)} style={({ pressed }) => [styles.level, level === item && styles.levelActive, pressed && styles.pressed]}><Text style={[styles.levelText, level === item && styles.levelTextActive]}>{item}</Text></Pressable>)}</View><Text style={styles.choose}>{t.chooseLevel}</Text><View style={styles.questions}>{grammar.data.map((question, index) => <Question key={`${level}-${question.prompt}`} index={index} question={question} answer={answers[index] ?? ""} result={result?.results[index]} disabled={Boolean(result) || submit.isPending} onPick={(answer) => setAnswers((current) => current.map((value, answerIndex) => answerIndex === index ? answer : value))} />)}</View>{result ? <Result locale={locale} result={result} onAgain={retry} /> : <><Button disabled={!complete} loading={submit.isPending} onPress={() => submit.mutate()}>{t.submit}</Button>{!complete ? <Text style={styles.hint}>{t.complete}</Text> : null}<ErrorNote message={submit.isError ? t.error : null} /></>}</Screen>;
}

function Question({ index, question, answer, result, disabled, onPick }: { index: number; question: GrammarQuestion; answer: string; result?: boolean; disabled: boolean; onPick: (answer: string) => void }) {
  return <Paper style={[styles.question, result === true && styles.questionCorrect, result === false && styles.questionWrong]}><View style={styles.questionTop}><Text style={styles.number}>{index + 1}</Text><Text style={styles.prompt}>{question.prompt}</Text>{result !== undefined ? <Ionicons name={result ? "checkmark-circle" : "close-circle"} size={20} color={result ? colors.teal : colors.danger} /> : null}</View><View style={styles.options}>{question.options.map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected: answer === option, disabled }} disabled={disabled} onPress={() => onPick(option)} style={({ pressed }) => [styles.option, answer === option && styles.optionSelected, result === false && answer === option && styles.optionIncorrect, pressed && !disabled && styles.pressed]}><Text style={styles.optionText}>{option}</Text></Pressable>)}</View></Paper>;
}

function Result({ locale, result, onAgain }: { locale: Locale; result: GrammarResult; onAgain: () => void }) {
  const t = labels[locale];
  return <Paper style={styles.result}><Ionicons name="trophy-outline" size={33} color={colors.rust} /><Text style={styles.resultTitle}>{t.result}</Text><Text style={styles.resultScore}>{result.correct}/{result.total}</Text><Text style={styles.resultBody}>{t.score} · +{result.xp_gained} {t.xp}</Text><Button icon="refresh" onPress={onAgain}>{t.again}</Button></Paper>;
}

const styles = StyleSheet.create({
  levels: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  level: { minWidth: 50, minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 11, backgroundColor: colors.cream },
  levelActive: { borderColor: colors.brand600, backgroundColor: colors.brand600 },
  levelText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  levelTextActive: { color: colors.onAccent },
  choose: { marginTop: -10, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
  questions: { gap: 12 },
  question: { gap: 13 },
  questionCorrect: { borderColor: "rgba(70,120,120,0.48)", backgroundColor: "rgba(70,120,120,0.07)" },
  questionWrong: { borderColor: "rgba(220,38,38,0.40)", backgroundColor: "rgba(220,38,38,0.05)" },
  questionTop: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  number: { width: 25, height: 25, overflow: "hidden", borderRadius: 13, textAlign: "center", fontFamily: fonts.uiBold, fontSize: 11, lineHeight: 25, color: colors.onAccent, backgroundColor: colors.brand600 },
  prompt: { flex: 1, fontFamily: fonts.uiBold, fontSize: 15, lineHeight: 23, color: colors.ink },
  options: { gap: 8 },
  option: { minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, backgroundColor: colors.raised },
  optionSelected: { borderColor: colors.brand600, backgroundColor: "rgba(185,78,40,0.10)" },
  optionIncorrect: { borderColor: colors.danger, backgroundColor: "rgba(220,38,38,0.10)" },
  optionText: { fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 21, color: colors.ink },
  hint: { marginTop: -8, fontFamily: fonts.uiMedium, fontSize: 12, textAlign: "center", color: colors.muted },
  result: { alignItems: "center", gap: 7, paddingVertical: 25 },
  resultTitle: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink },
  resultScore: { fontFamily: fonts.display, fontSize: 46, lineHeight: 51, color: colors.ink },
  resultBody: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.muted },
  pressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
});
