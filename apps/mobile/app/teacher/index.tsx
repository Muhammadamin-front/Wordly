import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { request, type TeacherClass } from "@/api/client";
import { Button, ErrorNote, Field, Heading, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { title: "O‘qituvchi paneli", subtitle: "Sinflar, topshiriqlar va o‘quvchilar progressini bir joyda boshqaring.", newClass: "Yangi sinf", name: "Sinf nomi", description: "Qisqa tavsif (ixtiyoriy)", create: "Sinf yaratish", classes: "Sizning sinflaringiz", members: "a’zo", empty: "Hali sinf yaratmagansiz. Birinchi sinfingizni yarating.", load: "Sinflar yuklanmoqda...", error: "Sinf ma’lumotlarini yuklab bo‘lmadi.", retry: "Qayta urinish", created: "Sinf tayyor — endi o‘quvchilar bilan ulashing.", back: "Sinflar" },
  ru: { title: "Панель преподавателя", subtitle: "Управляйте классами, заданиями и прогрессом учеников в одном месте.", newClass: "Новый класс", name: "Название класса", description: "Короткое описание (необязательно)", create: "Создать класс", classes: "Ваши классы", members: "участников", empty: "У вас пока нет классов. Создайте первый класс.", load: "Загружаем классы...", error: "Не удалось загрузить данные классов.", retry: "Повторить", created: "Класс готов — поделитесь кодом с учениками.", back: "Классы" },
  en: { title: "Teacher dashboard", subtitle: "Manage classes, assignments, and student progress in one focused workspace.", newClass: "New class", name: "Class name", description: "Short description (optional)", create: "Create class", classes: "Your classes", members: "members", empty: "You have not created a class yet. Create your first one.", load: "Loading classes...", error: "We couldn't load your class data.", retry: "Try again", created: "Class ready — share its code with your students.", back: "Classes" },
} as const;

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const classes = useQuery({ queryKey: ["teacher-classes"], queryFn: () => request<TeacherClass[]>("/teacher/classes", { token }), enabled: Boolean(token) });
  const create = useMutation({
    mutationFn: () => request<TeacherClass>("/teacher/classes", { method: "POST", token, body: { name: name.trim(), description: description.trim() || undefined } }),
    onSuccess: (classroom) => {
      setName("");
      setDescription("");
      setNotice(t.created);
      void queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      router.push(`/teacher/${classroom.id}` as Href);
    },
  });

  const submit = () => { setNotice(null); create.reset(); if (name.trim()) create.mutate(); };
  const refresh = () => { void classes.refetch(); };
  if (classes.isLoading) return <Screen appHeader><Loader label={t.load} /></Screen>;
  if (classes.isError || !classes.data) return <Screen appHeader><Heading>{t.error}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;

  return <Screen appHeader refreshing={classes.isRefetching} onRefresh={refresh}>
    <View style={styles.hero}><Ionicons name="school-outline" size={30} color={colors.onAccent} /><Heading sub={t.subtitle}>{t.title}</Heading></View>
    <Paper style={styles.createPanel}>
      <Text style={styles.panelTitle}>{t.newClass}</Text>
      <Field label={t.name} value={name} maxLength={120} autoCapitalize="sentences" onChangeText={(value) => { setName(value); setNotice(null); create.reset(); }} returnKeyType="next" />
      <Field label={t.description} value={description} maxLength={400} autoCapitalize="sentences" onChangeText={(value) => { setDescription(value); setNotice(null); create.reset(); }} />
      <Button icon="add" loading={create.isPending} disabled={!name.trim()} onPress={submit}>{t.create}</Button>
      <ErrorNote message={create.isError ? t.error : null} />
      {notice ? <Text accessibilityRole="alert" style={styles.success}>{notice}</Text> : null}
    </Paper>
    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{t.classes}</Text><Text style={styles.count}>{classes.data.length}</Text></View>
    {classes.data.length === 0 ? <Paper style={styles.empty}><Ionicons name="people-outline" size={30} color={colors.teal} /><Text style={styles.emptyText}>{t.empty}</Text></Paper> : <View style={styles.list}>{classes.data.map((classroom) => <ClassRow key={classroom.id} classroom={classroom} locale={locale} />)}</View>}
  </Screen>;
}

function ClassRow({ classroom, locale }: { classroom: TeacherClass; locale: Locale }) {
  const t = labels[locale];
  return <Pressable accessibilityRole="button" accessibilityLabel={`${classroom.name}, ${classroom.member_count} ${t.members}`} onPress={() => router.push(`/teacher/${classroom.id}` as Href)} style={({ pressed }) => [styles.classRow, pressed && styles.pressed]}>
    <View style={styles.classTop}><View style={styles.classCopy}><Text style={styles.className}>{classroom.name}</Text>{classroom.description ? <Text numberOfLines={2} style={styles.description}>{classroom.description}</Text> : null}</View><Ionicons name="chevron-forward" size={20} color={colors.rustDark} /></View>
    <View style={styles.classMeta}><View style={styles.code}><Ionicons name="key-outline" size={13} color={colors.rustDark} /><Text style={styles.codeText}>{classroom.join_code}</Text></View><Text style={styles.members}>{classroom.member_count} {t.members}</Text></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.inkSurface, shadowColor: colors.brown, shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  createPanel: { gap: 11 }, panelTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, success: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.teal },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, count: { minWidth: 28, height: 28, borderRadius: 14, overflow: "hidden", textAlign: "center", fontFamily: fonts.uiBold, fontSize: 12, lineHeight: 28, color: colors.rustDark, backgroundColor: colors.brand100 },
  list: { gap: 11 }, classRow: { gap: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, padding: 15, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.16, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, pressed: { opacity: 0.72, transform: [{ translateY: 1 }] }, classTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 }, classCopy: { flex: 1, minWidth: 0, gap: 3 }, className: { fontFamily: fonts.uiBold, fontSize: 17, lineHeight: 23, color: colors.ink }, description: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 19, color: colors.muted }, classMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, code: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.brand100 }, codeText: { fontFamily: fonts.uiBold, letterSpacing: 1.3, fontSize: 12, color: colors.rustDark }, members: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
  empty: { alignItems: "center", gap: 11, paddingVertical: 29 }, emptyText: { maxWidth: 300, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, textAlign: "center", color: colors.muted },
});
