import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError, request, type CoachCharacter, type CoachScore, type CoachSession, type CoachTurn } from "@/api/client";
import { BackButton, Button, ErrorNote, Field, Heading, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { back: "AI Coach", load: "Suhbat yuklanmoqda...", error: "Suhbatni yuklab bo‘lmadi.", retry: "Qayta urinish", chat: "Suhbat", ielts: "IELTS Speaking", typing: "Ingliz tilida javobingizni yozing...", send: "Yuborish", speak: "Ovoz chiqarib o‘qish", score: "IELTS band olish", scoring: "Baholanmoqda...", corrections: "Tuzatishlar", xp: "XP olindi", report: "IELTS hisoboti", strengths: "Kuchli tomonlar", improve: "Yaxshilash", homework: "Uyga vazifa", voiceNote: "Coach javoblarini ovoz chiqarib eshitishingiz mumkin." },
  ru: { back: "AI Coach", load: "Загружаем диалог...", error: "Не удалось загрузить диалог.", retry: "Повторить", chat: "Диалог", ielts: "IELTS Speaking", typing: "Напишите ответ на английском...", send: "Отправить", speak: "Озвучить ответ", score: "Получить IELTS band", scoring: "Оцениваем...", corrections: "Исправления", xp: "XP получено", report: "Отчёт IELTS", strengths: "Сильные стороны", improve: "Улучшить", homework: "Домашняя работа", voiceNote: "Ответы coach можно слушать вслух." },
  en: { back: "AI Coach", load: "Loading conversation...", error: "We couldn't load this conversation.", retry: "Try again", chat: "Chat", ielts: "IELTS Speaking", typing: "Write your answer in English...", send: "Send", speak: "Read reply aloud", score: "Get IELTS band", scoring: "Scoring...", corrections: "Corrections", xp: "XP earned", report: "IELTS report", strengths: "Strengths", improve: "Improve", homework: "Homework", voiceNote: "You can listen to coach replies aloud." },
} as const;

type ChatEntry = { role: string; content: string; corrections: CoachTurn["corrections"]; created_at: string };

export default function CoachChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: ["coach-session", sessionId], queryFn: () => request<CoachSession>(`/coach/sessions/${sessionId}`, { token }), enabled: Boolean(token) && Boolean(sessionId) });
  const characters = useQuery({ queryKey: ["coach-characters"], queryFn: () => request<CoachCharacter[]>("/coach/characters", { token }), enabled: Boolean(token) });
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const messageList = useRef<FlatList<ChatEntry>>(null);
  const send = useMutation({ mutationFn: (text: string) => request<CoachTurn>(`/coach/sessions/${sessionId}/message`, { method: "POST", token, body: { text } }), onSuccess: (turn, text) => { setMessages((current) => [...current, { role: "user", content: text, corrections: [], created_at: new Date().toISOString() }, { role: "assistant", content: turn.reply, corrections: turn.corrections, created_at: new Date().toISOString() }]); setDraft(""); void queryClient.invalidateQueries({ queryKey: ["coach-session", sessionId] }); void queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] }); } });
  const score = useMutation({ mutationFn: () => request<CoachScore>(`/coach/sessions/${sessionId}/score`, { method: "POST", token }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] }) });
  useEffect(() => { if (session.data) setMessages(session.data.messages); }, [session.data]);
  const character = useMemo(() => characters.data?.find((item) => item.key === session.data?.character), [characters.data, session.data?.character]);
  const submit = () => { const text = draft.trim(); if (text) send.mutate(text); };
  const speak = useCallback((message: string) => { Speech.stop(); Speech.speak(message, { language: "en-US", pitch: character?.pitch ?? 1, rate: character?.rate ?? .95 }); }, [character?.pitch, character?.rate]);
  const renderMessage = useCallback(({ item }: { item: ChatEntry }) => <Message message={item} assistant={item.role === "assistant"} locale={locale} onSpeak={() => speak(item.content)} />, [locale, speak]);
  useEffect(() => {
    if (!messages.length && !score.data) return;
    requestAnimationFrame(() => messageList.current?.scrollToEnd({ animated: messages.length > 2 }));
  }, [messages.length, score.data]);
  const refresh = () => { void session.refetch(); void characters.refetch(); };
  if (session.isLoading || characters.isLoading) return <Screen appHeader><Loader label={t.load} /></Screen>;
  if (session.isError || characters.isError || !session.data) return <Screen appHeader><BackButton label={t.back} onPress={() => router.replace("/coach" as Href)} /><Heading>{t.error}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;
  return <Screen appHeader scroll={false}>
    <BackButton label={t.back} onPress={() => router.replace("/coach" as Href)} />
    <Paper style={styles.top}>
      <View style={styles.avatar}><Text style={styles.emoji}>{character?.emoji ?? ""}</Text></View>
      <View style={styles.topCopy}>
        <Text style={styles.name}>{character?.name ?? t.chat}</Text>
        <Text style={styles.mode}>{session.data.mode === "ielts" ? `${t.ielts}${session.data.ielts_part ? ` · Part ${session.data.ielts_part}` : ""}` : t.chat}</Text>
      </View>
    </Paper>
    <Text style={styles.voiceNote}>{t.voiceNote}</Text>
    <FlatList
      ref={messageList}
      accessibilityRole="list"
      data={messages}
      keyExtractor={(message, index) => `${message.created_at}-${index}`}
      renderItem={renderMessage}
      style={styles.messageList}
      contentContainerStyle={styles.messages}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Paper style={styles.empty}><Text style={styles.emptyText}>{session.data.topic ?? t.chat}</Text></Paper>}
      ListFooterComponent={<>
        {send.data ? <Text accessibilityRole="alert" style={styles.xp}>+{send.data.reward.xp_gained} {t.xp}</Text> : null}
        {score.data ? <ScoreReport report={score.data} locale={locale} /> : null}
      </>}
    />
    <Paper style={styles.composer}>
      <Field label="" accessibilityLabel={t.typing} placeholder={t.typing} value={draft} maxLength={2000} multiline style={styles.textarea} editable={!send.isPending} onChangeText={(value) => { setDraft(value); send.reset(); }} />
      <Button icon="send" loading={send.isPending} disabled={!draft.trim()} onPress={submit}>{t.send}</Button>
      <ErrorNote message={send.isError ? (send.error instanceof ApiError ? send.error.message : t.error) : null} />
    </Paper>
    {session.data.mode === "ielts" ? <Button icon="ribbon-outline" loading={score.isPending} onPress={() => score.mutate()}>{score.isPending ? t.scoring : t.score}</Button> : null}
    <ErrorNote message={score.isError ? (score.error instanceof ApiError ? score.error.message : t.error) : null} />
  </Screen>;
}

function Message({ message, assistant, locale, onSpeak }: { message: ChatEntry; assistant: boolean; locale: Locale; onSpeak: () => void }) { const t = labels[locale]; return <View accessibilityLiveRegion={assistant ? "polite" : "none"} style={[styles.messageWrap, assistant ? styles.assistantWrap : styles.userWrap]}><Paper style={[styles.message, assistant ? styles.assistant : styles.user]}><Text style={[styles.messageText, !assistant && styles.userText]}>{message.content}</Text>{assistant ? <Pressable accessibilityRole="button" accessibilityLabel={t.speak} onPress={onSpeak} style={styles.speak}><Ionicons name="volume-high-outline" size={18} color={colors.teal} /></Pressable> : null}</Paper>{assistant && message.corrections.length ? <View style={styles.corrections}><Text style={styles.correctionTitle}>{t.corrections}</Text>{message.corrections.map((item, index) => <Paper key={`${item.original}-${index}`} style={styles.correction}><Text style={styles.original}>{item.original}</Text><Ionicons name="arrow-forward" size={15} color={colors.muted} /><Text style={styles.corrected}>{item.correction}</Text>{item.explanation ? <Text style={styles.explanation}>{item.explanation}</Text> : null}</Paper>)}</View> : null}</View>; }
function ScoreReport({ report, locale }: { report: CoachScore; locale: Locale }) { const t = labels[locale]; return <Paper style={styles.report}><Text style={styles.reportTitle}>{t.report}</Text><View style={styles.reportTop}><View style={styles.band}><Text style={styles.bandValue}>{report.report.band_overall.toFixed(1)}</Text><Text style={styles.bandLabel}>IELTS</Text></View><View style={styles.metrics}>{[["Fluency", report.report.fluency], ["Lexical", report.report.lexical], ["Grammar", report.report.grammar], ["Pronunciation", report.report.pronunciation]].map(([label, value]) => <Text key={String(label)} style={styles.metric}>{String(label)} · {Number(value).toFixed(1)}</Text>)}</View></View><Text style={styles.reportHeading}>{t.strengths}</Text><Text style={styles.reportText}>{report.report.strengths}</Text><Text style={styles.reportHeading}>{t.improve}</Text><Text style={styles.reportText}>{report.report.improvements}</Text><Text style={styles.reportHeading}>{t.homework}</Text><Text style={styles.reportText}>{report.report.homework}</Text></Paper>; }

const styles = StyleSheet.create({ top: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }, avatar: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, backgroundColor: colors.brand100 }, emoji: { fontSize: 30 }, topCopy: { gap: 2 }, name: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, mode: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, voiceNote: { marginTop: -10, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 18, color: colors.muted }, messageList: { flex: 1, minHeight: 0 }, messages: { flexGrow: 1, gap: 12, paddingBottom: 4 }, empty: { padding: 18 }, emptyText: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted }, messageWrap: { gap: 8 }, assistantWrap: { alignItems: "flex-start" }, userWrap: { alignItems: "flex-end" }, message: { maxWidth: "90%", flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 13 }, assistant: { backgroundColor: colors.cream }, user: { backgroundColor: colors.brand600, borderColor: colors.brand600 }, messageText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.ink }, userText: { color: colors.raised }, speak: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginTop: -5, marginRight: -5 }, corrections: { width: "94%", gap: 6 }, correctionTitle: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: .55, textTransform: "uppercase", color: colors.muted }, correction: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5, padding: 10 }, original: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.danger, textDecorationLine: "line-through" }, corrected: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.teal }, explanation: { width: "100%", fontFamily: fonts.ui, fontSize: 11, lineHeight: 17, color: colors.muted }, xp: { alignSelf: "center", fontFamily: fonts.uiBold, fontSize: 12, color: colors.teal }, composer: { gap: 10 }, textarea: { minHeight: 93, paddingTop: 12, textAlignVertical: "top" }, report: { gap: 8 }, reportTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, reportTop: { flexDirection: "row", alignItems: "center", gap: 14 }, band: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderRadius: 35, backgroundColor: colors.brand600 }, bandValue: { fontFamily: fonts.display, fontSize: 27, lineHeight: 30, color: colors.raised }, bandLabel: { fontFamily: fonts.uiBold, fontSize: 9, color: colors.raised }, metrics: { gap: 3 }, metric: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, reportHeading: { marginTop: 5, fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, reportText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted } });
