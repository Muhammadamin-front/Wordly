import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ALL_LESSONS, completeGrammarLesson, localiseLesson, type GrammarLesson } from "@/grammar/catalog";
import { BackButton, Button, Heading, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { back: "Grammar studio", formula: "Formula", explanation: "Tushuntirish", examples: "Misollar", mistakes: "Ko‘p uchraydigan xatolar", quiz: "Mini quiz", check: "Javoblarni tekshirish", passed: "Dars tugallandi", retryHint: "60% kerak. Izohlarga qayting va yana urinib ko‘ring.", retry: "Qayta urinish", next: "Keyingi dars", list: "Katalogga qaytish", correct: "to‘g‘ri", notFound: "Dars topilmadi", noLesson: "Bu dars katalogda mavjud emas." },
  ru: { back: "Grammar studio", formula: "Формула", explanation: "Объяснение", examples: "Примеры", mistakes: "Частые ошибки", quiz: "Мини-квиз", check: "Проверить ответы", passed: "Урок завершён", retryHint: "Нужно 60%. Вернитесь к объяснениям и попробуйте снова.", retry: "Попробовать ещё", next: "Следующий урок", list: "К каталогу", correct: "правильных", notFound: "Урок не найден", noLesson: "Этого урока нет в каталоге." },
  en: { back: "Grammar studio", formula: "Formula", explanation: "Explanation", examples: "Examples", mistakes: "Common mistakes", quiz: "Mini quiz", check: "Check answers", passed: "Lesson complete", retryHint: "You need 60%. Revisit the explanation and try again.", retry: "Try again", next: "Next lesson", list: "Back to catalogue", correct: "correct", notFound: "Lesson not found", noLesson: "This lesson is not in the catalogue." },
} as const;

export default function GrammarLessonScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const lessonSlug = Array.isArray(slug) ? slug[0] : slug;
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const base = ALL_LESSONS.find((item) => item.slug === lessonSlug);
  const lesson = useMemo(() => base ? localiseLesson(base, locale) : undefined, [base, locale]);
  if (!lesson) return <Screen appHeader><BackButton label={t.back} onPress={() => router.replace("/grammar" as Href)} /><Heading sub={t.noLesson}>{t.notFound}</Heading><Button onPress={() => router.replace("/grammar" as Href)}>{t.list}</Button></Screen>;
  return <LessonContent key={`${lesson.slug}-${locale}`} lesson={lesson} locale={locale} />;
}

function LessonContent({ lesson, locale }: { lesson: GrammarLesson; locale: Locale }) {
  const t = labels[locale];
  const [answers, setAnswers] = useState(() => Array(lesson.quiz.length).fill(-1));
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const index = ALL_LESSONS.findIndex((item) => item.slug === lesson.slug);
  const next = ALL_LESSONS[index + 1];
  const correct = lesson.quiz.filter((item, questionIndex) => answers[questionIndex] === item.answer).length;
  const passed = checked && correct >= Math.ceil(lesson.quiz.length * .6);
  const check = async () => { setChecked(true); if (correct >= Math.ceil(lesson.quiz.length * .6)) { setSaving(true); try { await completeGrammarLesson(lesson.slug); } finally { setSaving(false); } } };
  const retry = () => { setChecked(false); setAnswers(Array(lesson.quiz.length).fill(-1)); };
  return <Screen appHeader>
    <BackButton label={t.back} onPress={() => router.replace("/grammar" as Href)} />
    <Stamp tone="teal">{lesson.level}</Stamp>
    <Heading sub={lesson.titleUz}>{lesson.title}</Heading>
    {lesson.formula ? <Paper style={styles.formula}><View style={styles.sectionHead}><Ionicons name="flash-outline" size={18} color={colors.rust} /><Text style={styles.sectionLabel}>{t.formula}</Text></View><Text selectable style={styles.formulaText}>{lesson.formula}</Text></Paper> : null}
    <Section icon="reader-outline" title={t.explanation}>{lesson.explanation.map((paragraph, index) => <Paper key={index} style={styles.paragraph}><Text style={styles.paragraphText}>{paragraph}</Text></Paper>)}</Section>
    <Section icon="chatbubbles-outline" title={t.examples}><View style={styles.stack}>{lesson.examples.map((example, index) => <Paper key={`${example.en}-${index}`} style={styles.example}><Text selectable style={styles.exampleEn}>{example.en}</Text>{example.uz ? <Text style={styles.exampleTranslation}>{example.uz}</Text> : null}</Paper>)}</View></Section>
    <Section icon="alert-circle-outline" title={t.mistakes}><View style={styles.stack}>{lesson.mistakes.map((mistake, index) => <Paper key={`${mistake.wrong}-${index}`} style={styles.mistake}><View style={styles.mistakeLine}><Ionicons name="close-circle" size={17} color={colors.danger} /><Text selectable style={styles.wrong}>{mistake.wrong}</Text></View><View style={styles.mistakeLine}><Ionicons name="checkmark-circle" size={17} color={colors.teal} /><Text selectable style={styles.right}>{mistake.right}</Text></View><Text style={styles.mistakeNote}>{mistake.note}</Text></Paper>)}</View></Section>
    <Section icon="help-circle-outline" title={t.quiz}><View style={styles.stack}>{lesson.quiz.map((item, questionIndex) => <QuizItem key={`${item.q}-${questionIndex}`} number={questionIndex + 1} question={item} selected={answers[questionIndex]} checked={checked} onPick={(answer) => setAnswers((current) => current.map((value, answerIndex) => answerIndex === questionIndex ? answer : value))} />)}</View></Section>
    {!checked ? <Button loading={saving} disabled={answers.some((answer) => answer === -1)} onPress={() => void check()}>{t.check}</Button> : <Paper style={styles.result}><Ionicons name={passed ? "ribbon-outline" : "refresh-circle-outline"} size={35} color={passed ? colors.teal : colors.rust} /><Text style={styles.resultScore}>{correct}/{lesson.quiz.length}</Text><Text style={styles.resultBody}>{passed ? t.passed : t.retryHint}</Text>{passed && next ? <Button icon="arrow-forward" onPress={() => router.replace(`/grammar/${next.slug}` as Href)}>{`${t.next}: ${next.title}`}</Button> : null}{!passed ? <Button variant="secondary" icon="refresh" onPress={retry}>{t.retry}</Button> : <Button variant="secondary" onPress={() => router.replace("/grammar" as Href)}>{t.list}</Button>}</Paper>}
  </Screen>;
}

function Section({ icon, title, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; children: React.ReactNode }) { return <View style={styles.section}><View style={styles.sectionHead}><Ionicons name={icon} size={19} color={colors.rust} /><Text style={styles.sectionTitle}>{title}</Text></View>{children}</View>; }
function QuizItem({ number, question, selected, checked, onPick }: { number: number; question: GrammarLesson["quiz"][number]; selected: number; checked: boolean; onPick: (value: number) => void }) { return <Paper style={[styles.quiz, checked && selected === question.answer && styles.quizCorrect, checked && selected !== question.answer && styles.quizWrong]}><View style={styles.quizTop}><Text style={styles.questionNumber}>{number}</Text><Text style={styles.quizQuestion}>{question.q}</Text></View><View style={styles.options}>{question.options.map((option, optionIndex) => { const isSelected = selected === optionIndex; const isCorrect = checked && optionIndex === question.answer; return <Pressable key={`${option}-${optionIndex}`} accessibilityRole="radio" accessibilityState={{ selected: isSelected, disabled: checked }} disabled={checked} onPress={() => onPick(optionIndex)} style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, isCorrect && styles.optionCorrect, checked && isSelected && !isCorrect && styles.optionIncorrect, pressed && !checked && styles.pressed]}><Text style={styles.optionText}>{option}</Text>{checked && (isCorrect || isSelected) ? <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={18} color={isCorrect ? colors.teal : colors.danger} /> : null}</Pressable>; })}</View></Paper>; }

const styles = StyleSheet.create({
  formula: { gap: 9, backgroundColor: colors.brand100 }, section: { gap: 10 }, sectionHead: { flexDirection: "row", alignItems: "center", gap: 7 }, sectionLabel: { fontFamily: fonts.uiBold, fontSize: 12, letterSpacing: .7, textTransform: "uppercase", color: colors.rustDark }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 18, color: colors.ink }, formulaText: { fontFamily: fonts.uiBold, fontSize: 16, lineHeight: 25, color: colors.rustDark },
  paragraph: { padding: 14, backgroundColor: colors.raised }, paragraphText: { fontFamily: fonts.ui, fontSize: 15, lineHeight: 25, color: colors.ink }, stack: { gap: 9 }, example: { gap: 5, padding: 13 }, exampleEn: { fontFamily: fonts.uiBold, fontSize: 14, lineHeight: 21, color: colors.ink }, exampleTranslation: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted },
  mistake: { gap: 7, padding: 13 }, mistakeLine: { flexDirection: "row", alignItems: "flex-start", gap: 7 }, wrong: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 19, color: colors.danger, textDecorationLine: "line-through" }, right: { flex: 1, fontFamily: fonts.uiBold, fontSize: 13, lineHeight: 19, color: colors.teal }, mistakeNote: { marginTop: 1, fontFamily: fonts.ui, fontSize: 12, lineHeight: 19, color: colors.muted },
  quiz: { gap: 12 }, quizCorrect: { borderColor: "rgba(70,120,120,.46)", backgroundColor: "rgba(70,120,120,.06)" }, quizWrong: { borderColor: "rgba(220,38,38,.36)", backgroundColor: "rgba(220,38,38,.05)" }, quizTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, questionNumber: { width: 25, height: 25, overflow: "hidden", borderRadius: 13, textAlign: "center", fontFamily: fonts.uiBold, fontSize: 11, lineHeight: 25, color: colors.raised, backgroundColor: colors.brand600 }, quizQuestion: { flex: 1, fontFamily: fonts.uiBold, fontSize: 15, lineHeight: 23, color: colors.ink }, options: { gap: 7 }, option: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, backgroundColor: colors.raised }, optionSelected: { borderColor: colors.brand600, backgroundColor: "rgba(185,78,40,.10)" }, optionCorrect: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,.12)" }, optionIncorrect: { borderColor: colors.danger, backgroundColor: "rgba(220,38,38,.09)" }, optionText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 20, color: colors.ink },
  result: { alignItems: "center", gap: 8, paddingVertical: 25 }, resultScore: { fontFamily: fonts.display, fontSize: 47, lineHeight: 52, color: colors.ink }, resultBody: { fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 20, textAlign: "center", color: colors.muted }, pressed: { opacity: .72, transform: [{ translateY: 1 }] },
});
