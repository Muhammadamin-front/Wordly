import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import { request, type Achievement, type Stats } from "@/api/client";
import { ErrorState, Loader, Screen } from "@/components/ui";
import { Protected } from "@/components/protected";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

type AchievementCopy = { title: string; description: string; icon: keyof typeof Ionicons.glyphMap };

const labels: Record<Locale, {
  title: string;
  subtitle: string;
  level: string;
  streak: string;
  unlocked: string;
  locked: string;
  next: string;
  retry: string;
  loadError: string;
  categories: Record<string, string>;
  achievements: Record<string, AchievementCopy>;
}> = {
  uz: {
    title: "Yutuqlar", subtitle: "Mashq qiling va nishonlarni oching", level: "Daraja", streak: "kunlik seriya", unlocked: "ochildi", locked: "yopiq", next: "Keyingi darajaga", retry: "Qayta urinish", loadError: "Yutuqlarni yuklab bo'lmadi.",
    categories: { volume: "Faollik", streak: "Seriya", mastery: "Mahorat", level: "Daraja", goal: "Maqsad" },
    achievements: {
      first_steps: { title: "Birinchi qadamlar", description: "Birinchi kartani takrorladingiz", icon: "walk-outline" },
      getting_serious: { title: "Jiddiy kirishdingiz", description: "100 ta karta takrorladingiz", icon: "trending-up-outline" },
      word_machine: { title: "So'z mashinasi", description: "1000 ta karta takrorladingiz", icon: "rocket-outline" },
      committed: { title: "Sadoqatli", description: "7 kunlik seriya", icon: "flame-outline" },
      unstoppable: { title: "To'xtovsiz", description: "30 kunlik seriya", icon: "flash-outline" },
      legendary: { title: "Afsonaviy", description: "100 kunlik seriya", icon: "ribbon-outline" },
      collector: { title: "Kollektsioner", description: "50 ta so'zni mukammal o'zlashtirdingiz", icon: "diamond-outline" },
      curator: { title: "Bilimdon", description: "250 ta so'zni mukammal o'zlashtirdingiz", icon: "trophy-outline" },
      rising_star: { title: "Yulduzcha", description: "5-darajaga yetdingiz", icon: "star-outline" },
      scholar: { title: "Olim", description: "10-darajaga yetdingiz", icon: "school-outline" },
      goal_getter: { title: "Maqsadli", description: "Kunlik maqsadni bajardingiz", icon: "locate-outline" },
    },
  },
  ru: {
    title: "Достижения", subtitle: "Тренируйтесь и открывайте награды", level: "Уровень", streak: "дней подряд", unlocked: "открыто", locked: "закрыто", next: "До следующего уровня", retry: "Попробовать снова", loadError: "Не удалось загрузить достижения.",
    categories: { volume: "Активность", streak: "Серия", mastery: "Мастерство", level: "Уровень", goal: "Цель" },
    achievements: {
      first_steps: { title: "Первые шаги", description: "Повторили первую карточку", icon: "walk-outline" },
      getting_serious: { title: "Всё серьёзно", description: "Повторили 100 карточек", icon: "trending-up-outline" },
      word_machine: { title: "Машина слов", description: "Повторили 1000 карточек", icon: "rocket-outline" },
      committed: { title: "Преданный", description: "Серия 7 дней", icon: "flame-outline" },
      unstoppable: { title: "Неудержимый", description: "Серия 30 дней", icon: "flash-outline" },
      legendary: { title: "Легендарный", description: "Серия 100 дней", icon: "ribbon-outline" },
      collector: { title: "Коллекционер", description: "Освоили 50 слов", icon: "diamond-outline" },
      curator: { title: "Эрудит", description: "Освоили 250 слов", icon: "trophy-outline" },
      rising_star: { title: "Восходящая звезда", description: "Достигли 5 уровня", icon: "star-outline" },
      scholar: { title: "Учёный", description: "Достигли 10 уровня", icon: "school-outline" },
      goal_getter: { title: "Целеустремлённый", description: "Выполнили дневную цель", icon: "locate-outline" },
    },
  },
  en: {
    title: "Achievements", subtitle: "Practice and unlock badges", level: "Level", streak: "day streak", unlocked: "unlocked", locked: "locked", next: "To the next level", retry: "Try again", loadError: "We couldn't load achievements.",
    categories: { volume: "Activity", streak: "Streak", mastery: "Mastery", level: "Level", goal: "Goal" },
    achievements: {
      first_steps: { title: "First steps", description: "Reviewed your first card", icon: "walk-outline" },
      getting_serious: { title: "Getting serious", description: "Reviewed 100 cards", icon: "trending-up-outline" },
      word_machine: { title: "Word machine", description: "Reviewed 1000 cards", icon: "rocket-outline" },
      committed: { title: "Committed", description: "7-day streak", icon: "flame-outline" },
      unstoppable: { title: "Unstoppable", description: "30-day streak", icon: "flash-outline" },
      legendary: { title: "Legendary", description: "100-day streak", icon: "ribbon-outline" },
      collector: { title: "Collector", description: "Mastered 50 words", icon: "diamond-outline" },
      curator: { title: "Curator", description: "Mastered 250 words", icon: "trophy-outline" },
      rising_star: { title: "Rising star", description: "Reached level 5", icon: "star-outline" },
      scholar: { title: "Scholar", description: "Reached level 10", icon: "school-outline" },
      goal_getter: { title: "Goal getter", description: "Reached your daily goal", icon: "locate-outline" },
    },
  },
};

const fallbackAchievement: AchievementCopy = { title: "Achievement", description: "Keep learning to unlock this badge.", icon: "medal-outline" };

export default function AchievementsScreen() {
  return <Protected><AchievementsContent /></Protected>;
}

function AchievementsContent() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const achievements = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => Promise.all([
      request<Achievement[]>("/me/achievements", { token }),
      request<Stats>("/me/stats", { token }),
    ]),
    enabled: Boolean(token),
  });

  if (achievements.isLoading) return <Screen appHeader><Loader label={t.title} /></Screen>;
  if (achievements.isError || !achievements.data) return <ErrorState appHeader title={t.loadError} body={t.loadError} retryLabel={t.retry} onRetry={() => void achievements.refetch()} />;

  const [items, stats] = achievements.data;
  const unlockedCount = items.filter((item) => item.unlocked).length;
  const levelProgress = Math.min(100, Math.round((stats.xp_into_level / Math.max(1, stats.xp_for_next_level)) * 100));

  return (
    <Screen appHeader refreshing={achievements.isRefetching} onRefresh={() => void achievements.refetch()}>
      <View style={styles.hero}>
        <View style={styles.heroHeading}><View style={styles.heroIcon}><Ionicons name="medal-outline" size={22} color={colors.gold500} /></View><View><Text style={styles.title}>{t.title}</Text><Text style={styles.subtitle}>{t.subtitle}</Text></View></View>
        <View style={styles.xpRow}><View><Text style={styles.levelLabel}>{t.level} {stats.level}</Text><Text style={styles.xp}>{stats.xp.toLocaleString(locale)} <Text style={styles.xpUnit}>XP</Text></Text></View><View style={styles.streak}><Ionicons name="flame" size={18} color={colors.rust} /><Text style={styles.streakValue}>{stats.current_streak}</Text><Text style={styles.streakLabel}>{t.streak}</Text></View></View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: levelProgress }} style={styles.track}><View style={[styles.fill, { width: `${levelProgress}%` }]} /></View>
        <Text style={styles.next}>{stats.xp_into_level}/{stats.xp_for_next_level} XP · {t.next}</Text>
      </View>

      <View style={styles.count}><Text style={styles.countValue}>{unlockedCount}/{items.length}</Text><Text style={styles.countLabel}>{t.unlocked}</Text></View>
      <View style={styles.list}>{items.map((item) => <AchievementCard key={item.code} item={item} locale={locale} />)}</View>
    </Screen>
  );
}

function AchievementCard({ item, locale }: { item: Achievement; locale: Locale }) {
  const t = labels[locale];
  const fallback = fallbackAchievement;
  const meta = t.achievements[item.code] ?? { ...fallback, title: item.code.replaceAll("_", " ") };
  const category = t.categories[item.category] ?? item.category;
  return <View style={[styles.card, !item.unlocked && styles.cardLocked]} accessibilityLabel={`${meta.title}. ${meta.description}. ${item.unlocked ? t.unlocked : t.locked}`}>
    <View style={[styles.badge, item.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}><Ionicons name={meta.icon} size={25} color={item.unlocked ? colors.brand700 : colors.muted} /></View>
    <View style={styles.cardCopy}><View style={styles.cardTitleRow}><Text style={styles.cardTitle}>{meta.title}</Text><Text style={[styles.status, item.unlocked ? styles.statusUnlocked : styles.statusLocked]}>{item.unlocked ? t.unlocked : t.locked}</Text></View><Text style={styles.cardDescription}>{meta.description}</Text><Text style={styles.reward}>{category} · +{item.xp_reward} XP · +{item.coin_reward}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  hero: { gap: 15, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 17, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.16, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  heroHeading: { flexDirection: "row", alignItems: "center", gap: 12 }, heroIcon: { width: 45, height: 45, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.raised }, title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textTransform: "uppercase" }, subtitle: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12.5, color: colors.muted }, xpRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16, paddingTop: 4 }, levelLabel: { fontFamily: fonts.uiBold, fontSize: 11, textTransform: "uppercase", color: colors.muted }, xp: { marginTop: 3, fontFamily: fonts.display, fontSize: 35, color: colors.ink }, xpUnit: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.muted }, streak: { alignItems: "flex-end" }, streakValue: { marginTop: 3, fontFamily: fonts.display, fontSize: 25, color: colors.rust }, streakLabel: { maxWidth: 74, fontFamily: fonts.uiMedium, fontSize: 9.5, textAlign: "right", color: colors.muted }, track: { height: 8, overflow: "hidden", borderRadius: 4, backgroundColor: colors.brand100 }, fill: { height: "100%", borderRadius: 4, backgroundColor: colors.brand600 }, next: { marginTop: -8, fontFamily: fonts.uiMedium, fontSize: 10.5, textAlign: "right", color: colors.muted }, count: { flexDirection: "row", alignItems: "baseline", gap: 7 }, countValue: { fontFamily: fonts.display, fontSize: 27, color: colors.ink }, countLabel: { fontFamily: fonts.uiBold, fontSize: 10, textTransform: "uppercase", color: colors.muted }, list: { gap: 11 }, card: { minHeight: 102, flexDirection: "row", alignItems: "center", gap: 13, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, cardLocked: { opacity: 0.58 }, badge: { width: 51, height: 51, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 13 }, badgeUnlocked: { borderColor: colors.brand300, backgroundColor: colors.brand50 }, badgeLocked: { borderColor: colors.line, backgroundColor: colors.raised }, cardCopy: { flex: 1, minWidth: 0, gap: 4 }, cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, cardTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink }, status: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, fontFamily: fonts.uiBold, fontSize: 8.5, textTransform: "uppercase" }, statusUnlocked: { backgroundColor: "rgba(70,120,120,0.13)", color: colors.teal }, statusLocked: { backgroundColor: colors.raised, color: colors.muted }, cardDescription: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted }, reward: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.brand700 },
});
