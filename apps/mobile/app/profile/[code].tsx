import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { Share, StyleSheet, Text, View } from "react-native";

import { request, type PublicProfile } from "@/api/client";
import { BackButton, Button, ErrorState, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const copy = {
  uz: { back: "Hamjamiyat", level: "Daraja", streak: "kunlik seriya", achievements: "yutuq", share: "Profilni ulashish", loadError: "Profil topilmadi.", retry: "Qayta urinish" },
  ru: { back: "Сообщество", level: "Уровень", streak: "дней подряд", achievements: "достижений", share: "Поделиться профилем", loadError: "Профиль не найден.", retry: "Попробовать снова" },
  en: { back: "Community", level: "Level", streak: "day streak", achievements: "achievements", share: "Share profile", loadError: "Profile not found.", retry: "Try again" },
} as const;

export default function PublicProfileScreen() {
  const { code: rawCode } = useLocalSearchParams<{ code?: string }>();
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode ?? "";
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const profile = useQuery({ queryKey: ["public-profile", code], queryFn: () => request<PublicProfile>(`/profile/${encodeURIComponent(code)}`, { token }), enabled: Boolean(code && token) });
  const back = () => router.canGoBack() ? router.back() : router.replace("/community" as Href);
  if (profile.isLoading) return <Screen appHeader><Loader /></Screen>;
  if (profile.isError || !profile.data) return <ErrorState appHeader title={t.loadError} body={t.loadError} retryLabel={t.retry} onRetry={() => void profile.refetch()} />;
  const person = profile.data;
  const initials = person.display_name.trim().slice(0, 1).toUpperCase() || "V";
  const shareUrl = `https://vocora.uz/${locale}/profile/${person.code}`;
  return <Screen appHeader>
    <BackButton label={t.back} onPress={back} />
    <Paper style={styles.card}>
      <View style={styles.avatar}><Text style={styles.initial}>{initials}</Text></View>
      <Text style={styles.name}>{person.display_name}</Text><Text selectable style={styles.code}>{person.code}</Text>
      <View style={styles.stats}><Stat icon="school-outline" value={person.level} label={t.level} /><Stat icon="sparkles-outline" value={person.xp.toLocaleString(locale)} label="XP" /><Stat icon="flame-outline" value={person.current_streak} label={t.streak} /></View>
      {person.achievements.length ? <View style={styles.achievementWrap}><Text style={styles.achievementLabel}>{person.achievements.length} {t.achievements}</Text><View style={styles.achievements}>{person.achievements.map((item) => <View key={item} accessibilityLabel={item} style={styles.achievement}><Ionicons name="medal-outline" size={19} color={colors.brand700} /></View>)}</View></View> : null}
      <Button variant="secondary" icon="share-outline" onPress={() => void Share.share({ message: shareUrl })}>{t.share}</Button>
    </Paper>
  </Screen>;
}

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string | number; label: string }) {
  return <View style={styles.stat}><Ionicons name={icon} size={16} color={colors.rust} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({ card: { alignItems: "center", gap: 9, paddingTop: 26, paddingBottom: 20 }, avatar: { width: 78, height: 78, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.brand950, borderRadius: 20, backgroundColor: colors.brand600, shadowColor: colors.brown, shadowOpacity: .6, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 4 }, initial: { fontFamily: fonts.display, fontSize: 42, color: colors.raised }, name: { marginTop: 4, fontFamily: fonts.display, fontSize: 33, color: colors.ink, textAlign: "center", textTransform: "uppercase" }, code: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 1.2, color: colors.muted }, stats: { alignSelf: "stretch", flexDirection: "row", gap: 8, marginTop: 12 }, stat: { flex: 1, minHeight: 83, alignItems: "center", justifyContent: "center", gap: 3, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 7, backgroundColor: colors.raised }, statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink }, statLabel: { fontFamily: fonts.uiBold, fontSize: 8.5, textAlign: "center", textTransform: "uppercase", color: colors.muted }, achievementWrap: { alignSelf: "stretch", alignItems: "center", gap: 9, marginTop: 11, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.line }, achievementLabel: { fontFamily: fonts.uiBold, fontSize: 10, textTransform: "uppercase", color: colors.muted }, achievements: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7 }, achievement: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand300, borderRadius: 9, backgroundColor: colors.brand50 },
});
