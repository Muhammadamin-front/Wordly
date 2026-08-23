import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { request, type Friend, type Leaderboard, type LeaderboardEntry, type PendingFriend } from "@/api/client";
import { Button, ErrorNote, Field, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const copy = {
  uz: { title: "Hamjamiyat", subtitle: "Do'stlaringiz bilan o'rganing va haftalik reytingda o'sing.", league: "Haftalik liga", rank: "Sizning o'rningiz", add: "Do'st qo'shish", code: "Do'st kodi", send: "So'rov yuborish", friends: "Do'stlaringiz", requests: "Kutilayotgan so'rovlar", accept: "Qabul qilish", decline: "Rad etish", remove: "O'chirish", level: "Daraja", streak: "kunlik seriya", noFriends: "Hali do'stlar yo'q. Kod orqali taklif yuboring.", noRequests: "Kutilayotgan so'rovlar yo'q.", load: "Hamjamiyat ma'lumotlarini yuklab bo'lmadi.", retry: "Qayta urinish", sent: "Do'stlik so'rovi yuborildi.", sendError: "So'rovni yuborib bo'lmadi." },
  ru: { title: "Сообщество", subtitle: "Учитесь с друзьями и растите в еженедельном рейтинге.", league: "Недельная лига", rank: "Ваше место", add: "Добавить друга", code: "Код друга", send: "Отправить запрос", friends: "Ваши друзья", requests: "Входящие запросы", accept: "Принять", decline: "Отклонить", remove: "Удалить", level: "Уровень", streak: "дней подряд", noFriends: "Друзей пока нет. Отправьте приглашение по коду.", noRequests: "Нет ожидающих запросов.", load: "Не удалось загрузить сообщество.", retry: "Попробовать снова", sent: "Запрос в друзья отправлен.", sendError: "Не удалось отправить запрос." },
  en: { title: "Community", subtitle: "Learn with friends and climb the weekly leaderboard.", league: "Weekly league", rank: "Your rank", add: "Add a friend", code: "Friend code", send: "Send request", friends: "Your friends", requests: "Incoming requests", accept: "Accept", decline: "Decline", remove: "Remove", level: "Level", streak: "day streak", noFriends: "No friends yet. Send an invitation using their code.", noRequests: "No incoming requests.", load: "Could not load the community.", retry: "Try again", sent: "Friend request sent.", sendError: "Could not send the request." },
} as const;

type Message = { message: string };

export default function CommunityScreen() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const leaderboard = useQuery({ queryKey: ["leaderboard"], queryFn: () => request<Leaderboard>("/leaderboard", { token }), enabled: !!token });
  const friends = useQuery({ queryKey: ["friends"], queryFn: () => request<Friend[]>("/friends", { token }), enabled: !!token });
  const pending = useQuery({ queryKey: ["friend-requests"], queryFn: () => request<PendingFriend[]>("/friends/pending", { token }), enabled: !!token });
  const friendBoard = useQuery({ queryKey: ["friend-leaderboard"], queryFn: () => request<LeaderboardEntry[]>("/friends/leaderboard", { token }), enabled: !!token });
  const refresh = () => void Promise.all([leaderboard.refetch(), friends.refetch(), pending.refetch(), friendBoard.refetch()]);
  const invalidate = () => void Promise.all([client.invalidateQueries({ queryKey: ["friends"] }), client.invalidateQueries({ queryKey: ["friend-requests"] }), client.invalidateQueries({ queryKey: ["friend-leaderboard"] })]);
  const send = useMutation({ mutationFn: () => request<Message>("/friends/request", { method: "POST", token, body: { code: code.trim() } }), onSuccess: () => { setCode(""); setSendError(null); Alert.alert("Vocora", t.sent); }, onError: () => setSendError(t.sendError) });
  const decide = useMutation({ mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" }) => request<Message>(`/friends/${id}/${action}`, { method: "POST", token }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => request<Message>(`/friends/${id}`, { method: "DELETE", token }), onSuccess: invalidate });

  if (leaderboard.isLoading || friends.isLoading || pending.isLoading || friendBoard.isLoading) return <Screen appHeader><Loader /></Screen>;
  if (leaderboard.isError || friends.isError || pending.isError || friendBoard.isError || !leaderboard.data || !friends.data || !pending.data || !friendBoard.data) return <Screen appHeader><Heading>{t.load}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;

  return <Screen appHeader>
    <Heading sub={t.subtitle}>{t.title}</Heading>
    <Paper style={styles.league}>
      <View><Text style={styles.leagueTier}>{leaderboard.data.tier}</Text><Text style={styles.leagueLabel}>{t.league}</Text></View>
      <View style={styles.rank}><Text style={styles.rankNumber}>#{leaderboard.data.my_rank}</Text><Text style={styles.rankLabel}>{t.rank}</Text></View>
    </Paper>
    <View style={styles.section}><Text style={styles.sectionTitle}>{t.add}</Text><Paper style={styles.add}><Field label={t.code} value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} /><ErrorNote message={sendError} /><Button icon="person-add-outline" disabled={!code.trim()} loading={send.isPending} onPress={() => send.mutate()}>{t.send}</Button></Paper></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>{t.requests}</Text>{pending.data.length ? pending.data.map((item) => <Paper key={item.friendship_id} style={styles.person}><Person name={item.display_name} level={item.level} /><View style={styles.actions}><Button variant="secondary" loading={decide.isPending} onPress={() => decide.mutate({ id: item.friendship_id, action: "accept" })}>{t.accept}</Button><Button variant="quiet" disabled={decide.isPending} onPress={() => decide.mutate({ id: item.friendship_id, action: "decline" })}>{t.decline}</Button></View></Paper>) : <Paper><Text style={styles.empty}>{t.noRequests}</Text></Paper>}</View>
    <View style={styles.section}><Text style={styles.sectionTitle}>{t.friends}</Text>{friends.data.length ? friends.data.map((item) => <Paper key={item.user_id} style={styles.person}><Person name={item.display_name} level={item.level} detail={`${item.current_streak} ${t.streak}`} /><Button variant="quiet" disabled={remove.isPending} onPress={() => remove.mutate(item.user_id)}>{t.remove}</Button></Paper>) : <Paper><Text style={styles.empty}>{t.noFriends}</Text></Paper>}</View>
    <View style={styles.section}><Text style={styles.sectionTitle}>{t.league}</Text><Paper style={styles.board}>{friendBoard.data.length ? friendBoard.data.slice(0, 10).map((item) => <View key={item.user_id} style={styles.boardRow}><Text style={styles.boardRank}>#{item.rank}</Text><Text numberOfLines={1} style={styles.boardName}>{item.display_name}{item.is_me ? " · You" : ""}</Text><Text style={styles.boardXp}>{item.xp} XP</Text></View>) : leaderboard.data.members.slice(0, 10).map((item) => <View key={item.user_id} style={styles.boardRow}><Text style={styles.boardRank}>#{item.rank}</Text><Text numberOfLines={1} style={styles.boardName}>{item.display_name}{item.is_me ? " · You" : ""}</Text><Text style={styles.boardXp}>{item.xp} XP</Text></View>)}</Paper></View>
  </Screen>;
}

function Person({ name, level, detail }: { name: string; level: number; detail?: string }) { return <View style={styles.personName}><View style={styles.avatar}><Ionicons name="person" size={17} color={colors.brand700} /></View><View><Text style={styles.name}>{name}</Text><Text style={styles.detail}>{detail ?? `${level} ${"•"} ${"XP"}`}</Text></View></View>; }

const styles = StyleSheet.create({
  league: { minHeight: 108, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.brand50 }, leagueTier: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textTransform: "uppercase" }, leagueLabel: { marginTop: 3, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, rank: { alignItems: "flex-end" }, rankNumber: { fontFamily: fonts.display, fontSize: 32, color: colors.rust }, rankLabel: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted, textTransform: "uppercase" }, section: { gap: 8 }, sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink }, add: { gap: 12 }, person: { gap: 10 }, personName: { flexDirection: "row", alignItems: "center", gap: 10 }, avatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: colors.brand100 }, name: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, detail: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, actions: { flexDirection: "row", alignItems: "center", gap: 4 }, empty: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted }, board: { gap: 0 }, boardRow: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line }, boardRank: { width: 34, fontFamily: fonts.display, fontSize: 16, color: colors.rust }, boardName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, boardXp: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.brand700 },
});
