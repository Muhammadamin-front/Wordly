import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { request, type Assignment, type ClassAnalytics, type TeacherClass } from "@/api/client";
import { BackButton, Button, ErrorNote, Field, Heading, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";
import { dateInputToDeadlineIso, formatApiDate } from "@/utils/dates";

const labels = {
  uz: { back: "O‘qituvchi paneli", load: "Sinf yuklanmoqda...", error: "Sinf ma’lumotlarini yuklab bo‘lmadi.", retry: "Qayta urinish", shareCode: "O‘quvchilar uchun join code", share: "Kod ulashish", shared: "Ulashish oynasi ochildi.", students: "O‘quvchilar", noStudents: "Hali bu sinfga hech kim qo‘shilmagan.", level: "Daraja", streak: "Seriya", reviews: "Takrorlash", assignments: "Topshiriqlar", noAssignments: "Hali topshiriq yo‘q.", completed: "bajardi", due: "Muddat", newAssignment: "Yangi topshiriq", title: "Topshiriq nomi", instructions: "Yo‘riqnoma (ixtiyoriy)", target: "Takrorlash soni", dueInput: "Muddat (YYYY-MM-DD)", assign: "Topshiriq berish", invalidDate: "Muddatni YYYY-MM-DD ko‘rinishida kiriting.", created: "Topshiriq berildi.", archive: "Sinfni arxivlash", archiveTitle: "Sinfni arxivlash?", archiveBody: "Sinf va uning ma’lumotlari o‘quvchilar uchun yopiladi.", cancel: "Bekor qilish", confirmArchive: "Arxivlash", archived: "Sinf arxivlandi." },
  ru: { back: "Панель преподавателя", load: "Загружаем класс...", error: "Не удалось загрузить данные класса.", retry: "Повторить", shareCode: "Код для учеников", share: "Поделиться кодом", shared: "Окно отправки открыто.", students: "Ученики", noStudents: "К этому классу ещё никто не присоединился.", level: "Уровень", streak: "Серия", reviews: "Повторения", assignments: "Задания", noAssignments: "Заданий пока нет.", completed: "выполнили", due: "Срок", newAssignment: "Новое задание", title: "Название задания", instructions: "Инструкция (необязательно)", target: "Количество повторений", dueInput: "Срок (ГГГГ-ММ-ДД)", assign: "Выдать задание", invalidDate: "Введите дату в формате ГГГГ-ММ-ДД.", created: "Задание создано.", archive: "Архивировать класс", archiveTitle: "Архивировать класс?", archiveBody: "Класс и его данные станут недоступны ученикам.", cancel: "Отмена", confirmArchive: "Архивировать", archived: "Класс архивирован." },
  en: { back: "Teacher dashboard", load: "Loading class...", error: "We couldn't load this class.", retry: "Try again", shareCode: "Join code for students", share: "Share code", shared: "The share sheet is open.", students: "Students", noStudents: "No one has joined this class yet.", level: "Level", streak: "Streak", reviews: "Reviews", assignments: "Assignments", noAssignments: "There are no assignments yet.", completed: "completed", due: "Due", newAssignment: "New assignment", title: "Assignment title", instructions: "Instructions (optional)", target: "Number of reviews", dueInput: "Due date (YYYY-MM-DD)", assign: "Assign work", invalidDate: "Enter a date in YYYY-MM-DD format.", created: "Assignment created.", archive: "Archive class", archiveTitle: "Archive this class?", archiveBody: "The class and its data will no longer be available to students.", cancel: "Cancel", confirmArchive: "Archive", archived: "Class archived." },
} as const;

function dateForInput() {
  const date = new Date(Date.now() + 7 * 86_400_000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dueIso(value: string) {
  return dateInputToDeadlineIso(value);
}

export default function TeacherClassDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Array.isArray(id) ? id[0] : id;
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [target, setTarget] = useState("20");
  const [due, setDue] = useState(dateForInput());
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const classes = useQuery({ queryKey: ["teacher-classes"], queryFn: () => request<TeacherClass[]>("/teacher/classes", { token }), enabled: Boolean(token) && Boolean(classId) });
  const analytics = useQuery({ queryKey: ["teacher-analytics", classId], queryFn: () => request<ClassAnalytics>(`/teacher/classes/${classId}/analytics`, { token }), enabled: Boolean(token) && Boolean(classId) });
  const assignment = useMutation({
    mutationFn: (body: { title: string; instructions?: string; target_reviews: number; due_at: string }) => request<Assignment>(`/teacher/classes/${classId}/assignments`, { method: "POST", token, body }),
    onSuccess: () => { setTitle(""); setInstructions(""); setTarget("20"); setDue(dateForInput()); setNotice(t.created); void queryClient.invalidateQueries({ queryKey: ["teacher-analytics", classId] }); },
  });
  const archive = useMutation({
    mutationFn: () => request<{ message: string }>(`/teacher/classes/${classId}`, { method: "DELETE", token }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["teacher-classes"] }); router.replace("/teacher" as Href); },
  });
  const refresh = () => { void classes.refetch(); void analytics.refetch(); };
  const classroom = classes.data?.find((item) => item.id === classId);

  const createAssignment = () => {
    setFormError(null); setNotice(null); assignment.reset();
    const targetReviews = Number(target);
    const deadline = dueIso(due);
    if (!title.trim()) return;
    if (!deadline) { setFormError(t.invalidDate); return; }
    if (!Number.isInteger(targetReviews) || targetReviews < 1 || targetReviews > 1000) { setFormError(`${t.target}: 1–1000`); return; }
    assignment.mutate({ title: title.trim(), instructions: instructions.trim() || undefined, target_reviews: targetReviews, due_at: deadline });
  };
  const shareCode = async () => {
    if (!classroom) return;
    try { await Share.share({ message: `${classroom.name}\n${t.shareCode}: ${classroom.join_code}` }); setNotice(t.shared); } catch { /* User may close the system share sheet. */ }
  };
  const confirmArchive = () => Alert.alert(t.archiveTitle, t.archiveBody, [{ text: t.cancel, style: "cancel" }, { text: t.confirmArchive, style: "destructive", onPress: () => archive.mutate() }]);

  if (classes.isLoading || analytics.isLoading) return <Screen appHeader><Loader label={t.load} /></Screen>;
  if (classes.isError || analytics.isError || !classroom || !analytics.data) return <Screen appHeader><BackButton label={t.back} onPress={() => router.replace("/teacher" as Href)} /><Heading>{t.error}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;

  return <Screen appHeader refreshing={classes.isRefetching || analytics.isRefetching} onRefresh={refresh}>
    <BackButton label={t.back} onPress={() => router.replace("/teacher" as Href)} />
    <Heading sub={classroom.description ?? undefined}>{classroom.name}</Heading>
    <Paper style={styles.codePanel}><Text style={styles.codeLabel}>{t.shareCode}</Text><Text selectable style={styles.joinCode}>{classroom.join_code}</Text><Button variant="secondary" icon="share-outline" onPress={() => void shareCode()}>{t.share}</Button></Paper>
    <Section title={t.students} count={analytics.data.students.length} />
    {analytics.data.students.length === 0 ? <Paper style={styles.empty}><Ionicons name="people-outline" size={28} color={colors.teal} /><Text style={styles.emptyText}>{t.noStudents}</Text></Paper> : <View style={styles.students}>{analytics.data.students.map((student) => <Paper key={student.user_id} style={styles.student}><View style={styles.avatar}><Text style={styles.avatarText}>{student.display_name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.studentCopy}><Text style={styles.studentName}>{student.display_name}</Text><Text style={styles.studentMeta}>{t.level} {student.level} · {student.current_streak} {t.streak}</Text></View><Text style={styles.reviewTotal}>{student.total_reviews}<Text style={styles.reviewLabel}> {t.reviews}</Text></Text></Paper>)}</View>}
    <Section title={t.assignments} count={analytics.data.assignments.length} />
    {analytics.data.assignments.length === 0 ? <Text style={styles.none}>{t.noAssignments}</Text> : <View style={styles.assignments}>{analytics.data.assignments.map((item) => <Paper key={item.assignment.id} style={styles.assignment}><View style={styles.assignmentTop}><View style={styles.assignmentCopy}><Text style={styles.assignmentTitle}>{item.assignment.title}</Text>{item.assignment.instructions ? <Text style={styles.assignmentInstructions}>{item.assignment.instructions}</Text> : null}<Text style={styles.assignmentMeta}>{t.due}: {formatDate(item.assignment.due_at, locale)} · {item.assignment.target_reviews} {t.reviews}</Text></View><View style={styles.completion}><Text style={styles.completionText}>{item.completed}/{item.total}</Text><Text style={styles.completionLabel}>{t.completed}</Text></View></View></Paper>)}</View>}
    <Paper style={styles.create}><Text style={styles.createTitle}>{t.newAssignment}</Text><Field label={t.title} value={title} maxLength={160} autoCapitalize="sentences" onChangeText={(value) => { setTitle(value); setNotice(null); assignment.reset(); }} /><Field label={t.instructions} value={instructions} maxLength={2000} multiline style={styles.multiline} autoCapitalize="sentences" onChangeText={(value) => { setInstructions(value); setNotice(null); assignment.reset(); }} /><View style={styles.formRow}><View style={styles.formHalf}><Field label={t.target} value={target} keyboardType="number-pad" maxLength={4} onChangeText={(value) => { setTarget(value); setFormError(null); }} /></View><View style={styles.formHalf}><Field label={t.dueInput} value={due} maxLength={10} autoCapitalize="none" autoCorrect={false} onChangeText={(value) => { setDue(value); setFormError(null); }} /></View></View><Button icon="send-outline" loading={assignment.isPending} disabled={!title.trim()} onPress={createAssignment}>{t.assign}</Button><ErrorNote message={formError ?? (assignment.isError ? t.error : null)} />{notice ? <Text accessibilityRole="alert" style={styles.success}>{notice}</Text> : null}</Paper>
    <Button variant="danger" icon="archive-outline" loading={archive.isPending} onPress={confirmArchive}>{t.archive}</Button>
  </Screen>;
}

function Section({ title, count }: { title: string; count: number }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.count}>{count}</Text></View>; }
function formatDate(value: string, locale: Locale) { return formatApiDate(value, locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short", year: "numeric" }) ?? "—"; }

const styles = StyleSheet.create({
  codePanel: { alignItems: "center", gap: 9, paddingVertical: 20, backgroundColor: colors.brand100 }, codeLabel: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, joinCode: { fontFamily: fonts.uiBold, fontSize: 29, letterSpacing: 5, color: colors.rustDark },
  section: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, count: { minWidth: 28, height: 28, overflow: "hidden", borderRadius: 14, textAlign: "center", fontFamily: fonts.uiBold, fontSize: 12, lineHeight: 28, color: colors.rustDark, backgroundColor: colors.brand100 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 23 }, emptyText: { maxWidth: 300, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, textAlign: "center", color: colors.muted },
  students: { gap: 8 }, student: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12 }, avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand600 }, avatarText: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.onAccent }, studentCopy: { flex: 1, minWidth: 0, gap: 2 }, studentName: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, studentMeta: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, reviewTotal: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, reviewLabel: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted },
  assignments: { gap: 9 }, assignment: { padding: 13 }, assignmentTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 }, assignmentCopy: { flex: 1, minWidth: 0, gap: 4 }, assignmentTitle: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink }, assignmentInstructions: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted }, assignmentMeta: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 11, lineHeight: 16, color: colors.muted }, completion: { minWidth: 62, gap: 2, alignItems: "center", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 6, backgroundColor: "rgba(70,120,120,0.12)" }, completionText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.teal }, completionLabel: { fontFamily: fonts.uiMedium, fontSize: 9, textAlign: "center", color: colors.teal }, none: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
  create: { gap: 11, marginTop: 2 }, createTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, multiline: { minHeight: 86, paddingTop: 13, textAlignVertical: "top" }, formRow: { flexDirection: "row", gap: 10 }, formHalf: { flex: 1, minWidth: 0 }, success: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.teal },
});
