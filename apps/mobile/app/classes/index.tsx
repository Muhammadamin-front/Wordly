import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type Href, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ApiError, request, type StudentAssignment, type StudentClass } from "@/api/client";
import { Button, ErrorNote, Field, Heading, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";
import { formatApiDate } from "@/utils/dates";

const labels = {
  uz: { title: "Mening sinflarim", subtitle: "O‘qituvchingiz bergan mashqlarni shu yerda kuzating.", teacher: "O‘qituvchi paneli", join: "Sinfga qo‘shilish", code: "Join code", joinButton: "Qo‘shilish", invalid: "Join code topilmadi. Kodni qayta tekshiring.", assignments: "Topshiriqlar", noClasses: "Hali sinfga qo‘shilmagansiz. O‘qituvchidan join code so‘rang.", due: "Muddat", of: "dan", reviews: "takrorlash", done: "Bajarildi", overdue: "Muddati o‘tgan", load: "Sinflar yuklanmoqda...", loadError: "Sinflarni yuklab bo‘lmadi.", retry: "Qayta urinish", joinSuccess: "Sinfga qo‘shildingiz." },
  ru: { title: "Мои классы", subtitle: "Следите за заданиями от преподавателя в одном месте.", teacher: "Панель преподавателя", join: "Присоединиться к классу", code: "Код класса", joinButton: "Присоединиться", invalid: "Код класса не найден. Проверьте его ещё раз.", assignments: "Задания", noClasses: "Вы пока не в классе. Попросите у преподавателя код класса.", due: "Срок", of: "из", reviews: "повторений", done: "Готово", overdue: "Срок истёк", load: "Загружаем классы...", loadError: "Не удалось загрузить классы.", retry: "Повторить", joinSuccess: "Вы присоединились к классу." },
  en: { title: "My classes", subtitle: "Keep teacher assignments and your progress in one place.", teacher: "Teacher dashboard", join: "Join a class", code: "Class code", joinButton: "Join", invalid: "We couldn't find that class code. Check it and try again.", assignments: "Assignments", noClasses: "You have not joined a class yet. Ask your teacher for a class code.", due: "Due", of: "of", reviews: "reviews", done: "Done", overdue: "Overdue", load: "Loading classes...", loadError: "We couldn't load your classes.", retry: "Try again", joinSuccess: "You joined the class." },
} as const;

export default function Classes() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => request<StudentClass[]>("/me/classes", { token }), enabled: Boolean(token) });
  const assignments = useQuery({
    queryKey: ["class-assignments", classes.data?.map((item) => item.id).join(",")],
    queryFn: async () => Object.fromEntries(await Promise.all((classes.data ?? []).map(async (item) => [item.id, await request<StudentAssignment[]>(`/classes/${item.id}/assignments`, { token })] as const))),
    enabled: Boolean(token) && Boolean(classes.data),
  });
  const join = useMutation({
    mutationFn: () => request<StudentClass>("/classes/join", { method: "POST", token, body: { code: code.trim().toUpperCase() } }),
    onSuccess: () => { setCode(""); setJoinMessage(t.joinSuccess); void queryClient.invalidateQueries({ queryKey: ["classes"] }); },
  });
  const refresh = () => { void classes.refetch(); void assignments.refetch(); };
  const submit = () => { setJoinMessage(null); join.reset(); if (code.trim()) join.mutate(); };
  const joinError = join.isError ? (join.error instanceof ApiError && join.error.status === 404 ? t.invalid : t.loadError) : null;

  if (classes.isLoading || assignments.isLoading) return <Screen appHeader><Loader label={t.load} /></Screen>;
  if (classes.isError || assignments.isError || !classes.data || !assignments.data) return <Screen appHeader><Heading>{t.loadError}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;
  return <Screen appHeader refreshing={classes.isRefetching || assignments.isRefetching} onRefresh={refresh}><View style={styles.hero}><Ionicons name="people-circle-outline" size={28} color={colors.onAccent} /><Heading sub={t.subtitle}>{t.title}</Heading><Button variant="secondary" icon="school-outline" onPress={() => router.push("/teacher" as Href)}>{t.teacher}</Button></View><Paper><View style={styles.join}><Text style={styles.joinTitle}>{t.join}</Text><Field label={t.code} value={code} maxLength={8} autoCapitalize="characters" autoCorrect={false} onChangeText={(value) => { setCode(value.toUpperCase()); setJoinMessage(null); join.reset(); }} onSubmitEditing={submit} returnKeyType="done" /><Button loading={join.isPending} disabled={!code.trim()} onPress={submit}>{t.joinButton}</Button><ErrorNote message={joinError} />{joinMessage ? <Text accessibilityRole="alert" style={styles.success}>{joinMessage}</Text> : null}</View></Paper>{classes.data.length === 0 ? <Paper style={styles.empty}><Ionicons name="school-outline" size={29} color={colors.teal} /><Text style={styles.emptyText}>{t.noClasses}</Text></Paper> : <View style={styles.classList}>{classes.data.map((classroom) => <ClassCard key={classroom.id} classroom={classroom} assignments={assignments.data[classroom.id] ?? []} locale={locale} />)}</View>}</Screen>;
}

function ClassCard({ classroom, assignments, locale }: { classroom: StudentClass; assignments: StudentAssignment[]; locale: Locale }) {
  const t = labels[locale];
  return <Paper style={styles.classCard}><Text style={styles.className}>{classroom.name}</Text>{classroom.description ? <Text style={styles.description}>{classroom.description}</Text> : null}<Text style={styles.sectionTitle}>{t.assignments}</Text>{assignments.length ? <View style={styles.assignmentList}>{assignments.map((item) => <Assignment key={item.assignment.id} item={item} locale={locale} />)}</View> : <Text style={styles.none}>—</Text>}</Paper>;
}

function Assignment({ item, locale }: { item: StudentAssignment; locale: Locale }) {
  const t = labels[locale];
  const due = formatApiDate(item.assignment.due_at, locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" }) ?? "—";
  const status = item.done ? t.done : item.overdue ? t.overdue : `${item.reviews}/${item.assignment.target_reviews}`;
  return <View style={styles.assignment}><View style={styles.assignmentCopy}><Text style={styles.assignmentTitle}>{item.assignment.title}</Text>{item.assignment.instructions ? <Text style={styles.instructions}>{item.assignment.instructions}</Text> : null}<Text style={styles.meta}>{t.due}: {due} · {item.reviews} {t.of} {item.assignment.target_reviews} {t.reviews}</Text></View><View style={[styles.status, item.done ? styles.statusDone : item.overdue ? styles.statusOverdue : styles.statusOpen]}><Text numberOfLines={2} style={[styles.statusText, item.done ? styles.statusDoneText : item.overdue ? styles.statusOverdueText : styles.statusOpenText]}>{status}</Text></View></View>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.inkSurface, shadowColor: colors.brown, shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  join: { gap: 11 },
  joinTitle: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink },
  success: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.teal },
  empty: { alignItems: "center", gap: 12, paddingVertical: 28 },
  emptyText: { maxWidth: 310, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, textAlign: "center", color: colors.muted },
  classList: { gap: 13 },
  classCard: { gap: 8 },
  className: { fontFamily: fonts.uiBold, fontSize: 18, color: colors.ink },
  description: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted },
  sectionTitle: { marginTop: 8, fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: 0.55, textTransform: "uppercase", color: colors.muted },
  assignmentList: { gap: 9 },
  assignment: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, backgroundColor: colors.paper },
  assignmentCopy: { flex: 1, minWidth: 0, gap: 4 },
  assignmentTitle: { fontFamily: fonts.uiBold, fontSize: 14, lineHeight: 20, color: colors.ink },
  instructions: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
  meta: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 11, lineHeight: 17, color: colors.muted },
  status: { maxWidth: 82, minHeight: 29, justifyContent: "center", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  statusDone: { backgroundColor: "rgba(70,120,120,0.14)" },
  statusOverdue: { backgroundColor: "rgba(220,38,38,0.10)" },
  statusOpen: { backgroundColor: colors.brand100 },
  statusText: { fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 14, textAlign: "center" },
  statusDoneText: { color: colors.teal },
  statusOverdueText: { color: colors.danger },
  statusOpenText: { color: colors.rustDark },
  none: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
});
