import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  authApi,
  request,
  type IeltsMockSession,
  type IeltsMockSessionListItem,
  type IeltsOverview,
  type MasteryMap,
  type Statistics,
  type Stats,
  type User,
} from "@/api/client";
import { Button, ErrorNote, Field, Paper, Screen } from "@/components/ui";
import { ALL_LESSONS, loadGrammarProgress, type MobileGrammarProgress } from "@/grammar/catalog";
import { syncGrammarProgress } from "@/grammar/progress-sync";
import { copy, localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: {
    overview: "Sizning learning profilingiz",
    journey: "Bugungi natijadan uzoq muddatli maqsadgacha — hammasi bir joyda.",
    verified: "Tasdiqlangan",
    notVerified: "Tasdiqlanmagan",
    learner: "O‘quvchi",
    wordsMastered: "o‘zlashtirilgan so‘z",
    wordsStarted: "jarayonda",
    grammarPassed: "Grammar darsi",
    studyTime: "O‘qish vaqti",
    streak: "Kunlik streak",
    days: "kun",
    learningSnapshot: "Learning snapshot",
    fullStats: "To‘liq statistikani ko‘rish",
    currentPlan: "Sizning yo‘lingiz",
    cefr: "Joriy CEFR",
    dailyGoal: "Kunlik maqsad",
    minutes: "daqiqa",
    accuracy: "Aniqlik",
    reviews: "Takrorlashlar",
    level: "Vocora darajasi",
    xp: "XP",
    activity: "So‘nggi faollik",
    activityHint: "Oxirgi 7 kundagi vocabulary takrorlashlaringiz.",
    noActivity: "Hali takrorlash faoliyati yo‘q. Birinchi review sessiyasini boshlang.",
    vocabulary: "Vocabulary mastery",
    vocabularyHint: "Barcha CEFR darajalari bo‘yicha serverda saqlanadi.",
    grammar: "Grammar progress",
    grammarHint: "Web va mobile’dagi natijalar account’ingizda birga saqlanadi.",
    mastered: "mastered",
    attempted: "urinish qilingan",
    openVocabulary: "Progress xaritasini ochish",
    openGrammar: "Grammar katalogini ochish",
    ielts: "IELTS natijalari",
    latestMock: "Oxirgi tugallangan mock",
    mocks: "mock topshirilgan",
    bestMock: "eng yaxshi Overall",
    overall: "Overall",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    noMock: "Hali tugallangan full mock yo‘q.",
    noMockHint: "IELTS bo‘limidagi mashqlar va mock natijalari bu yerda avtomatik ko‘rinadi.",
    personalBest: "Skill bo‘yicha eng yaxshi bandlar",
    openIelts: "IELTS markazini ochish",
    details: "Profil ma’lumotlari",
    email: "Email",
    accountStatus: "Account holati",
    accountType: "Account turi",
    timezone: "Vaqt zonasi",
    goal: "Maqsad",
    interests: "Qiziqishlar",
    language: "Interfeys tili",
    edit: "Profilni tahrirlash",
    hideEdit: "Tahrirlashni yopish",
    bio: "O‘zingiz haqingizda",
    bioPlaceholder: "Maqsadingiz yoki o‘rganish rejangiz...",
    partialError: "Ayrim statistikalarni yuklab bo‘lmadi. Pastga tortib qayta urinishingiz mumkin.",
    loading: "Yangilanmoqda…",
    account: "Account va maxfiylik",
  },
  ru: {
    overview: "Ваш учебный профиль",
    journey: "От сегодняшнего результата до долгосрочной цели — всё в одном месте.",
    verified: "Подтверждён",
    notVerified: "Не подтверждён",
    learner: "Ученик",
    wordsMastered: "освоено слов",
    wordsStarted: "в процессе",
    grammarPassed: "Уроков grammar",
    studyTime: "Время обучения",
    streak: "Серия дней",
    days: "дн.",
    learningSnapshot: "Учебный обзор",
    fullStats: "Открыть полную статистику",
    currentPlan: "Ваш маршрут",
    cefr: "Текущий CEFR",
    dailyGoal: "Цель на день",
    minutes: "минут",
    accuracy: "Точность",
    reviews: "Повторения",
    level: "Уровень Vocora",
    xp: "XP",
    activity: "Последняя активность",
    activityHint: "Повторения слов за последние 7 дней.",
    noActivity: "Пока нет повторений. Начните первую review-сессию.",
    vocabulary: "Освоение слов",
    vocabularyHint: "Сохраняется на сервере для всех уровней CEFR.",
    grammar: "Прогресс grammar",
    grammarHint: "Результаты web и mobile сохраняются вместе в вашем аккаунте.",
    mastered: "освоено",
    attempted: "пройдено",
    openVocabulary: "Открыть карту прогресса",
    openGrammar: "Открыть каталог grammar",
    ielts: "Результаты IELTS",
    latestMock: "Последний завершённый mock",
    mocks: "mock-тестов",
    bestMock: "лучший Overall",
    overall: "Overall",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    noMock: "Завершённых full mock пока нет.",
    noMockHint: "Результаты упражнений и mock-тестов IELTS появятся здесь автоматически.",
    personalBest: "Лучшие баллы по навыкам",
    openIelts: "Открыть IELTS центр",
    details: "Данные профиля",
    email: "Email",
    accountStatus: "Статус аккаунта",
    accountType: "Тип аккаунта",
    timezone: "Часовой пояс",
    goal: "Цель",
    interests: "Интересы",
    language: "Язык интерфейса",
    edit: "Изменить профиль",
    hideEdit: "Закрыть редактирование",
    bio: "О себе",
    bioPlaceholder: "Ваша цель или учебный план...",
    partialError: "Часть статистики не загрузилась. Потяните вниз, чтобы повторить.",
    loading: "Обновление…",
    account: "Аккаунт и конфиденциальность",
  },
  en: {
    overview: "Your learning profile",
    journey: "From today’s effort to your long-term goal — everything in one place.",
    verified: "Verified",
    notVerified: "Not verified",
    learner: "Learner",
    wordsMastered: "mastered words",
    wordsStarted: "in progress",
    grammarPassed: "Grammar lessons",
    studyTime: "Study time",
    streak: "Daily streak",
    days: "days",
    learningSnapshot: "Learning snapshot",
    fullStats: "View full statistics",
    currentPlan: "Your learning path",
    cefr: "Current CEFR",
    dailyGoal: "Daily goal",
    minutes: "minutes",
    accuracy: "Accuracy",
    reviews: "Reviews",
    level: "Vocora level",
    xp: "XP",
    activity: "Recent activity",
    activityHint: "Your vocabulary reviews over the last 7 days.",
    noActivity: "No review activity yet. Start your first review session.",
    vocabulary: "Vocabulary mastery",
    vocabularyHint: "Saved to your account across every CEFR level.",
    grammar: "Grammar progress",
    grammarHint: "Your web and mobile lesson results are saved together in your account.",
    mastered: "mastered",
    attempted: "attempted",
    openVocabulary: "Open progress map",
    openGrammar: "Open grammar catalogue",
    ielts: "IELTS results",
    latestMock: "Latest completed mock",
    mocks: "mocks completed",
    bestMock: "best Overall",
    overall: "Overall",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    noMock: "No completed full mock yet.",
    noMockHint: "Your IELTS practice and mock results will appear here automatically.",
    personalBest: "Personal best by skill",
    openIelts: "Open IELTS centre",
    details: "Profile details",
    email: "Email",
    accountStatus: "Account status",
    accountType: "Account type",
    timezone: "Time zone",
    goal: "Goal",
    interests: "Interests",
    language: "Interface language",
    edit: "Edit profile",
    hideEdit: "Close editing",
    bio: "About you",
    bioPlaceholder: "Your goal or learning plan...",
    partialError: "Some statistics could not load. Pull down to try again.",
    loading: "Updating…",
    account: "Account and privacy",
  },
} as const;

const GOAL_LABELS: Record<Locale, Record<string, string>> = {
  uz: { general: "Umumiy ingliz tili", ielts: "IELTS", career: "Ish va karyera", school: "Maktab", work: "Ish", travel: "Sayohat" },
  ru: { general: "Общий английский", ielts: "IELTS", career: "Работа и карьера", school: "Школа", work: "Работа", travel: "Путешествия" },
  en: { general: "General English", ielts: "IELTS", career: "Work and career", school: "School", work: "Work", travel: "Travel" },
};

const SKILLS = ["listening", "reading", "writing", "speaking"] as const;

const ROLE_LABELS: Record<Locale, Record<string, string>> = {
  uz: { learner: "O‘quvchi", teacher: "O‘qituvchi", support: "Support", content_manager: "Kontent manager", admin: "Admin", super_admin: "Super admin" },
  ru: { learner: "Ученик", teacher: "Учитель", support: "Поддержка", content_manager: "Контент-менеджер", admin: "Администратор", super_admin: "Суперадмин" },
  en: { learner: "Learner", teacher: "Teacher", support: "Support", content_manager: "Content manager", admin: "Admin", super_admin: "Super admin" },
};

function formatStudyTime(ms: number, locale: Locale) {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return locale === "ru" ? `${hours} ч ${minutes} мин` : `${hours}h ${minutes}m`;
}

function initials(name: string) {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return letters || "V";
}

function safePercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function recentActivity(rows: Statistics["reviews_by_day"]) {
  const counts = new Map(rows.map((row) => [row.day, row.count]));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { day: key, count: counts.get(key) ?? 0 };
  });
}

export default function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const savedLocale = localeFrom(user?.profile.ui_locale);
  const [name, setName] = useState(user?.profile.display_name ?? "");
  const [bio, setBio] = useState(user?.profile.bio ?? "");
  const [locale, setLocale] = useState<Locale>(savedLocale);
  const [editing, setEditing] = useState(false);
  const [grammarProgress, setGrammarProgress] = useState<MobileGrammarProgress>({});
  const t = labels[locale];
  const common = copy[locale];
  const changed = name.trim() !== (user?.profile.display_name ?? "") || bio.trim() !== (user?.profile.bio ?? "") || locale !== savedLocale;

  const stats = useQuery({ queryKey: ["profile", "stats"], queryFn: () => request<Stats>("/me/stats", { token }), enabled: !!token });
  const statistics = useQuery({ queryKey: ["profile", "statistics"], queryFn: () => request<Statistics>("/me/statistics", { token }), enabled: !!token });
  const mastery = useQuery({ queryKey: ["profile", "mastery"], queryFn: () => request<MasteryMap>("/me/mastery-map", { token }), enabled: !!token });
  const ielts = useQuery({ queryKey: ["profile", "ielts"], queryFn: () => request<IeltsOverview>("/ielts/overview", { token }), enabled: !!token });
  const mocks = useQuery({ queryKey: ["profile", "mocks"], queryFn: () => request<IeltsMockSessionListItem[]>("/ielts/mock/sessions", { token }), enabled: !!token, retry: false });
  const latestFinishedMock = mocks.data?.find((item) => item.status === "finished");
  const latestMock = useQuery({
    queryKey: ["profile", "mock", latestFinishedMock?.id],
    queryFn: () => request<IeltsMockSession>(`/ielts/mock/sessions/${latestFinishedMock?.id}`, { token }),
    enabled: !!token && !!latestFinishedMock?.id,
    retry: false,
  });

  const loadLocalGrammar = useCallback(async () => {
    const progress = token && user
      ? await syncGrammarProgress(token, user.id).catch(() => loadGrammarProgress())
      : await loadGrammarProgress();
    setGrammarProgress(progress);
  }, [token, user]);
  useEffect(() => { void loadLocalGrammar(); }, [loadLocalGrammar]);

  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const grammarSummary = useMemo(() => {
    const knownSlugs = new Set(ALL_LESSONS.map((lesson) => lesson.slug));
    const entries = Object.entries(grammarProgress)
      .filter(([slug]) => knownSlugs.has(slug))
      .map(([, entry]) => entry);
    return {
      attempted: entries.length,
      passed: entries.filter((entry) => entry.bestScore >= 70).length,
      mastered: entries.filter((entry) => entry.bestScore >= 90).length,
    };
  }, [grammarProgress]);

  const interestLabels: Record<string, string> = {
    "daily-life": common.interestDaily,
    travel: common.interestTravel,
    work: common.interestWork,
    education: common.interestEducation,
    technology: common.interestTechnology,
    culture: common.interestCulture,
  };
  const interests = (user?.profile.learning_interests ?? []).map((interest) => interestLabels[interest] ?? interest).join(", ") || "—";
  const completedMocks = mocks.data?.filter((item) => item.status === "finished").length ?? 0;
  const bestMockBand = Math.max(0, ...(mocks.data?.flatMap((item) => item.status === "finished" && item.overall_band !== null ? [item.overall_band] : []) ?? []));
  const refreshing = stats.isRefetching || statistics.isRefetching || mastery.isRefetching || ielts.isRefetching || mocks.isRefetching || latestMock.isRefetching;
  const partialError = stats.isError || statistics.isError || mastery.isError || ielts.isError;

  const refresh = useCallback(() => {
    void stats.refetch();
    void statistics.refetch();
    void mastery.refetch();
    void ielts.refetch();
    void mocks.refetch();
    if (latestFinishedMock?.id) void latestMock.refetch();
    void loadLocalGrammar();
  }, [ielts, latestFinishedMock?.id, latestMock, loadLocalGrammar, mastery, mocks, statistics, stats]);

  async function saveProfile() {
    if (!name.trim() || !token) return;
    setSavePending(true);
    setSaveError(false);
    setSaveSuccess(false);
    try {
      const updated = await request<User>("/users/me", {
        method: "PATCH",
        token,
        body: { display_name: name.trim(), bio: bio.trim() || null, ui_locale: locale },
      });
      updateUser(updated);
      setSaveSuccess(true);
      setEditing(false);
    } catch {
      setSaveError(true);
    } finally {
      setSavePending(false);
    }
  }

  async function deleteAccount() {
    if (!token) return;
    setDeletePending(true);
    setDeleteError(false);
    try {
      await authApi.deleteAccount(token);
      await logout();
    } catch {
      setDeleteError(true);
      setDeletePending(false);
    }
  }

  function confirmDeletion() {
    setDeleteError(false);
    Alert.alert(common.deleteAccountTitle, common.deleteAccountBody, [
      { text: common.cancel, style: "cancel" },
      { text: common.deleteAccountConfirm, style: "destructive", onPress: () => void deleteAccount() },
    ]);
  }

  return (
    <Screen appHeader refreshing={refreshing} onRefresh={refresh}>
      <ProfileHero user={user} locale={locale} streak={stats.data?.current_streak ?? 0} />
      {partialError ? <View style={styles.warning}><Ionicons name="cloud-offline-outline" size={18} color={colors.rustDark} /><Text style={styles.warningText}>{t.partialError}</Text></View> : null}

      <SectionTitle title={t.learningSnapshot} />
      <Paper style={styles.snapshot}>
        <View style={styles.snapshotLead}>
          <Text style={styles.snapshotValue}>{mastery.data?.mastered_words.toLocaleString(locale) ?? "—"}</Text>
          <Text style={styles.snapshotLabel}>{t.wordsMastered}</Text>
          <Text style={styles.snapshotSupporting}>{mastery.data ? `${mastery.data.started_words.toLocaleString(locale)} ${t.wordsStarted}` : t.loading}</Text>
        </View>
        <View style={styles.snapshotRows}>
          <SnapshotRow icon="school-outline" value={grammarSummary.passed.toLocaleString(locale)} label={t.grammarPassed} />
          <SnapshotRow icon="time-outline" value={statistics.data ? formatStudyTime(statistics.data.time_spent_ms, locale) : "—"} label={t.studyTime} />
          <SnapshotRow icon="flame-outline" value={`${stats.data?.current_streak ?? 0} ${t.days}`} label={t.streak} />
        </View>
        <InlineAction label={t.fullStats} onPress={() => router.push("/statistics" as Href)} />
      </Paper>

      <SectionTitle title={t.currentPlan} />
      <View style={styles.planGrid}>
        <PlanMetric value={user?.profile.cefr_level ?? "A1"} label={t.cefr} />
        <PlanMetric value={`${user?.profile.daily_minutes ?? 0} ${t.minutes}`} label={t.dailyGoal} />
        <PlanMetric value={statistics.data ? `${statistics.data.accuracy_all}%` : "—"} label={t.accuracy} />
        <PlanMetric value={statistics.data?.total_reviews.toLocaleString(locale) ?? "—"} label={t.reviews} />
        <PlanMetric value={stats.data?.level.toLocaleString(locale) ?? "—"} label={t.level} />
        <PlanMetric value={`${stats.data?.xp.toLocaleString(locale) ?? "—"} ${t.xp}`} label={stats.data?.league_tier ?? t.learner} />
      </View>

      <ActivitySection statistics={statistics.data} locale={locale} />

      <SectionTitle title={t.vocabulary} subtitle={t.vocabularyHint} />
      <Paper style={styles.progressPanel}>
        <ProgressLine value={mastery.data?.overall_percent ?? 0} valueLabel={`${mastery.data?.overall_percent ?? 0}%`} />
        <View style={styles.progressMeta}>
          <Text style={styles.progressDetail}>{mastery.data?.mastered_words.toLocaleString(locale) ?? "—"} {t.mastered}</Text>
          <Text style={styles.progressDetail}>{mastery.data?.started_words.toLocaleString(locale) ?? "—"} {t.attempted}</Text>
        </View>
        <InlineAction label={t.openVocabulary} onPress={() => router.push("/(tabs)/progress" as Href)} />
      </Paper>

      <SectionTitle title={t.grammar} subtitle={t.grammarHint} />
      <Paper style={styles.progressPanel}>
        <ProgressLine value={(grammarSummary.passed / Math.max(1, ALL_LESSONS.length)) * 100} valueLabel={`${grammarSummary.passed}/${ALL_LESSONS.length}`} />
        <View style={styles.progressMeta}>
          <Text style={styles.progressDetail}>{grammarSummary.mastered} {t.mastered}</Text>
          <Text style={styles.progressDetail}>{grammarSummary.attempted} {t.attempted}</Text>
        </View>
        <InlineAction label={t.openGrammar} onPress={() => router.push("/grammar" as Href)} />
      </Paper>

      <IeltsSection locale={locale} mock={latestMock.data} mockCount={completedMocks} bestMockBand={bestMockBand} bestBands={ielts.data?.best_bands ?? {}} loading={mocks.isLoading || latestMock.isLoading} />

      <SectionTitle title={t.details} />
      <Paper style={styles.detailsPanel}>
        <DetailRow icon="mail-outline" label={t.email} value={user?.email ?? "—"} />
        <DetailRow icon="shield-checkmark-outline" label={t.accountStatus} value={user?.email_verified ? t.verified : t.notVerified} tone={user?.email_verified ? "teal" : "rust"} />
        <DetailRow icon="person-circle-outline" label={t.accountType} value={ROLE_LABELS[locale][user?.role ?? "learner"] ?? user?.role ?? t.learner} />
        <DetailRow icon="locate-outline" label={t.timezone} value={user?.profile.timezone ?? "—"} />
        <DetailRow icon="flag-outline" label={t.goal} value={GOAL_LABELS[locale][user?.profile.learning_goal ?? "general"] ?? user?.profile.learning_goal ?? "—"} />
        <DetailRow icon="sparkles-outline" label={t.interests} value={interests} />
        {user?.profile.bio ? <DetailRow icon="person-outline" label={t.bio} value={user.profile.bio} /> : null}
      </Paper>

      <Pressable accessibilityRole="button" onPress={() => setEditing((value) => !value)} style={({ pressed }) => [styles.editToggle, pressed && styles.pressed]}>
        <Ionicons name={editing ? "close-outline" : "create-outline"} size={19} color={colors.rustDark} />
        <Text style={styles.editToggleText}>{editing ? t.hideEdit : t.edit}</Text>
      </Pressable>

      {editing ? (
        <Paper style={styles.editPanel}>
          <Field label={common.name} value={name} maxLength={80} autoCapitalize="words" onChangeText={(value) => { setName(value); setSaveSuccess(false); setSaveError(false); }} />
          <Field label={t.bio} value={bio} maxLength={500} multiline numberOfLines={4} textAlignVertical="top" placeholder={t.bioPlaceholder} onChangeText={(value) => { setBio(value); setSaveSuccess(false); setSaveError(false); }} style={styles.bioInput} />
          <Text style={styles.fieldLabel}>{t.language}</Text>
          <View accessibilityRole="radiogroup" style={styles.languageOptions}>
            {(["uz", "ru", "en"] as Locale[]).map((option) => {
              const selected = locale === option;
              return (
                <Pressable key={option} accessibilityRole="radio" accessibilityLabel={option.toUpperCase()} accessibilityState={{ selected }} onPress={() => { setLocale(option); setSaveSuccess(false); setSaveError(false); }} style={({ pressed }) => [styles.language, selected && styles.languageSelected, pressed && styles.pressed]}>
                  <Text style={[styles.languageText, selected && styles.languageTextSelected]}>{option.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button disabled={!changed || !name.trim()} loading={savePending} onPress={() => void saveProfile()}>{saveSuccess ? common.saved : common.save}</Button>
          <ErrorNote message={saveError ? common.profileSaveError : null} />
        </Paper>
      ) : null}

      <SectionTitle title={t.account} />
      <Button variant="secondary" icon="log-out-outline" onPress={() => void logout()}>{common.logout}</Button>
      <Paper style={styles.dangerPanel}>
        <View style={styles.dangerCopy}>
          <Text style={styles.dangerTitle}>{common.accountPrivacy}</Text>
          <Text style={styles.dangerBody}>{common.deleteAccountDescription}</Text>
        </View>
        <Button variant="danger" icon="trash-outline" loading={deletePending} onPress={confirmDeletion}>{common.deleteAccount}</Button>
        <ErrorNote message={deleteError ? common.deleteAccountError : null} />
      </Paper>
    </Screen>
  );
}

function ProfileHero({ user, locale, streak }: { user: User | null; locale: Locale; streak: number }) {
  const t = labels[locale];
  const name = user?.profile.display_name || t.learner;
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        {user?.profile.avatar_url ? <Image source={{ uri: user.profile.avatar_url }} accessibilityLabel={name} style={styles.avatarImage} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>}
        <View style={styles.identity}>
          <Text style={styles.heroTitle}>{name}</Text>
          <Text numberOfLines={1} style={styles.email}>{user?.email ?? ""}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>{user?.profile.cefr_level ?? "A1"}</Text></View>
            <View style={[styles.badge, styles.badgeTeal]}><Ionicons name={user?.email_verified ? "checkmark-circle" : "alert-circle"} size={13} color={colors.teal} /><Text style={styles.badgeText}>{user?.email_verified ? t.verified : t.notVerified}</Text></View>
          </View>
        </View>
      </View>
      <Text style={styles.heroBody}>{t.journey}</Text>
      <View style={styles.heroFooter}>
        <View style={styles.heroFooterItem}><Ionicons name="flame" size={17} color={colors.rust} /><Text style={styles.heroFooterValue}>{streak}</Text><Text style={styles.heroFooterLabel}>{t.days}</Text></View>
        <View style={styles.heroDivider} />
        <View style={styles.heroFooterItem}><Ionicons name="flag" size={17} color={colors.teal} /><Text style={styles.heroFooterValue}>{user?.profile.daily_minutes ?? 0}</Text><Text style={styles.heroFooterLabel}>{t.minutes}</Text></View>
      </View>
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionTitleWrap}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>;
}

function SnapshotRow({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <View style={styles.snapshotRow}><View style={styles.snapshotIcon}><Ionicons name={icon} size={17} color={colors.teal} /></View><View style={styles.snapshotRowCopy}><Text style={styles.snapshotRowValue}>{value}</Text><Text style={styles.snapshotRowLabel}>{label}</Text></View></View>;
}

function PlanMetric({ value, label }: { value: string; label: string }) {
  return <View style={styles.planMetric}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.planValue}>{value}</Text><Text style={styles.planLabel}>{label}</Text></View>;
}

function InlineAction({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}><Text style={styles.inlineActionText}>{label}</Text><Ionicons name="arrow-forward" size={17} color={colors.rustDark} /></Pressable>;
}

function ProgressLine({ value, valueLabel }: { value: number; valueLabel: string }) {
  const percent = safePercent(value);
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} style={styles.progressTop}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View><Text style={styles.progressValue}>{valueLabel}</Text></View>;
}

function ActivitySection({ statistics, locale }: { statistics?: Statistics; locale: Locale }) {
  const t = labels[locale];
  const days = recentActivity(statistics?.reviews_by_day ?? []);
  const hasActivity = days.some((day) => day.count > 0);
  const max = Math.max(1, ...days.map((day) => day.count));
  return (
    <View style={styles.activitySection}>
      <SectionTitle title={t.activity} subtitle={t.activityHint} />
      <Paper style={styles.activityPanel}>
        {hasActivity ? <View style={styles.chart}>{days.map((day) => {
          const label = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(`${day.day}T12:00:00`));
          return <View key={day.day} style={styles.barColumn}><Text style={styles.barValue}>{day.count}</Text><View style={styles.barTrack}><View style={[styles.bar, { height: `${Math.max(8, (day.count / max) * 100)}%` }]} /></View><Text style={styles.barLabel}>{label}</Text></View>;
        })}</View> : <View style={styles.emptyState}><Ionicons name="calendar-outline" size={26} color={colors.teal} /><Text style={styles.emptyText}>{t.noActivity}</Text></View>}
      </Paper>
    </View>
  );
}

function IeltsSection({ locale, mock, mockCount, bestMockBand, bestBands, loading }: { locale: Locale; mock?: IeltsMockSession; mockCount: number; bestMockBand: number; bestBands: Record<string, number>; loading: boolean }) {
  const t = labels[locale];
  const hasBest = SKILLS.some((skill) => typeof bestBands[skill] === "number");
  return (
    <View style={styles.ieltsSection}>
      <SectionTitle title={t.ielts} />
      {mock ? (
        <View style={styles.mockPanel}>
          <View style={styles.mockHeading}><View><Text style={styles.mockLabel}>{t.latestMock}</Text><Text style={styles.mockDate}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(mock.finished_at ?? mock.started_at))} · {mockCount} {t.mocks}</Text><Text style={styles.mockBest}>{t.bestMock}: {bestMockBand.toFixed(1)}</Text></View><Ionicons name="medal-outline" size={24} color={colors.gold300} /></View>
          <View style={styles.mockBody}>
            <View style={styles.overallBand}><Text style={styles.overallBandValue}>{mock.overall_band?.toFixed(1) ?? "—"}</Text><Text style={styles.overallBandLabel}>{t.overall}</Text></View>
            <View style={styles.bandList}>{SKILLS.map((skill) => <BandRow key={skill} label={t[skill]} value={mock[`band_${skill}`]} />)}</View>
          </View>
        </View>
      ) : (
        <Paper style={styles.emptyState}>
          <Ionicons name={loading ? "hourglass-outline" : "document-text-outline"} size={27} color={colors.teal} />
          <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>{loading ? t.loading : t.noMock}</Text><Text style={styles.emptyText}>{t.noMockHint}</Text></View>
        </Paper>
      )}
      {hasBest ? <Paper style={styles.bestPanel}><Text style={styles.bestTitle}>{t.personalBest}</Text><View style={styles.bestGrid}>{SKILLS.map((skill) => <View key={skill} style={styles.bestItem}><Text style={styles.bestValue}>{bestBands[skill]?.toFixed(1) ?? "—"}</Text><Text style={styles.bestLabel}>{t[skill]}</Text></View>)}</View></Paper> : null}
      <InlineAction label={t.openIelts} onPress={() => router.push("/(tabs)/ielts" as Href)} />
    </View>
  );
}

function BandRow({ label, value }: { label: string; value: number | null }) {
  return <View style={styles.bandRow}><Text style={styles.bandLabel}>{label}</Text><Text style={styles.bandValue}>{value?.toFixed(1) ?? "—"}</Text></View>;
}

function DetailRow({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone?: "teal" | "rust" }) {
  return <View style={styles.detailRow}><Ionicons name={icon} size={18} color={tone === "teal" ? colors.teal : tone === "rust" ? colors.rust : colors.muted} /><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text selectable style={[styles.detailValue, tone === "teal" && styles.tealText, tone === "rust" && styles.rustText]}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  hero: { gap: 16, overflow: "hidden", padding: 18, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.cream, shadowColor: colors.brand950, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 68, height: 68, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: colors.brand600 },
  avatarImage: { width: 68, height: 68, borderRadius: 18, backgroundColor: colors.brand100 },
  avatarText: { fontFamily: fonts.display, fontSize: 27, color: colors.raised },
  identity: { flex: 1, minWidth: 0, gap: 4 },
  heroTitle: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33, letterSpacing: 0.4, color: colors.ink, textTransform: "uppercase" },
  email: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 3 },
  badge: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.brand300, borderRadius: 7, backgroundColor: colors.brand50 },
  badgeTeal: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,.08)" },
  badgeText: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.ink },
  heroBody: { maxWidth: 340, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  heroFooter: { minHeight: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.raised },
  heroFooterItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  heroFooterValue: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  heroFooterLabel: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted },
  heroDivider: { width: 1, height: 28, backgroundColor: colors.line },
  warning: { minHeight: 48, flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 12, borderWidth: 1, borderColor: colors.brand300, borderRadius: 12, backgroundColor: colors.brand100 },
  warningText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 19, color: colors.rustDark },
  sectionTitleWrap: { gap: 4, marginTop: 4 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.ink },
  sectionSubtitle: { maxWidth: 350, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  snapshot: { gap: 14, padding: 0, overflow: "hidden" },
  snapshotLead: { padding: 18, backgroundColor: colors.brand950 },
  snapshotValue: { fontFamily: fonts.display, fontSize: 49, lineHeight: 52, color: colors.raised },
  snapshotLabel: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.brand200 },
  snapshotSupporting: { marginTop: 5, fontFamily: fonts.uiMedium, fontSize: 11, color: colors.gold300 },
  snapshotRows: { gap: 2, paddingHorizontal: 16 },
  snapshotRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  snapshotIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "rgba(70,120,120,.09)" },
  snapshotRowCopy: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  snapshotRowValue: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink },
  snapshotRowLabel: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 11, textAlign: "right", color: colors.muted },
  inlineAction: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.line },
  inlineActionText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 12.5, color: colors.rustDark },
  planGrid: { flexDirection: "row", flexWrap: "wrap", overflow: "hidden", borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  planMetric: { width: "50%", minHeight: 92, justifyContent: "center", gap: 4, padding: 14, borderRightWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  planValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  planLabel: { fontFamily: fonts.uiMedium, fontSize: 10.5, lineHeight: 15, color: colors.muted },
  activitySection: { gap: 10 },
  activityPanel: { minHeight: 165, justifyContent: "center" },
  chart: { height: 130, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 5 },
  barColumn: { flex: 1, height: "100%", alignItems: "center", gap: 5 },
  barValue: { height: 16, fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.muted },
  barTrack: { flex: 1, width: "70%", justifyContent: "flex-end", overflow: "hidden", borderRadius: 5, backgroundColor: colors.brand100 },
  bar: { width: "100%", borderRadius: 5, backgroundColor: colors.teal },
  barLabel: { fontFamily: fonts.uiBold, fontSize: 9, color: colors.muted },
  progressPanel: { gap: 14 },
  progressTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressTrack: { flex: 1, height: 10, overflow: "hidden", borderRadius: 5, backgroundColor: colors.brand100 },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: colors.teal },
  progressValue: { minWidth: 50, fontFamily: fonts.display, fontSize: 21, textAlign: "right", color: colors.ink },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  progressDetail: { fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted },
  ieltsSection: { gap: 10 },
  mockPanel: { gap: 16, padding: 17, borderRadius: 15, backgroundColor: colors.brand950 },
  mockHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  mockLabel: { fontFamily: fonts.uiBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: colors.gold300 },
  mockDate: { marginTop: 4, fontFamily: fonts.uiMedium, fontSize: 10.5, color: colors.brand200 },
  mockBest: { marginTop: 4, fontFamily: fonts.uiBold, fontSize: 10, color: colors.gold300 },
  mockBody: { flexDirection: "row", alignItems: "stretch", gap: 15 },
  overallBand: { width: 104, minHeight: 126, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.gold400, borderRadius: 14, backgroundColor: colors.brand900 },
  overallBandValue: { fontFamily: fonts.display, fontSize: 46, lineHeight: 49, color: colors.raised },
  overallBandLabel: { fontFamily: fonts.uiBold, fontSize: 9.5, textTransform: "uppercase", color: colors.gold300 },
  bandList: { flex: 1, gap: 2 },
  bandRow: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottomWidth: 1, borderBottomColor: "rgba(232,201,154,.22)" },
  bandLabel: { fontFamily: fonts.uiMedium, fontSize: 10.5, color: colors.brand200 },
  bandValue: { fontFamily: fonts.display, fontSize: 18, color: colors.raised },
  bestPanel: { gap: 12 },
  bestTitle: { fontFamily: fonts.uiBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: colors.muted },
  bestGrid: { flexDirection: "row", gap: 6 },
  bestItem: { flex: 1, minWidth: 0, alignItems: "center", gap: 3, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.raised },
  bestValue: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  bestLabel: { fontFamily: fonts.uiBold, fontSize: 8, color: colors.muted },
  emptyState: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyCopy: { flex: 1, gap: 4 },
  emptyTitle: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  emptyText: { flex: 1, fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
  detailsPanel: { gap: 0, paddingVertical: 4 },
  detailRow: { minHeight: 58, flexDirection: "row", alignItems: "flex-start", gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailCopy: { flex: 1, minWidth: 0, gap: 3 },
  detailLabel: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted },
  detailValue: { fontFamily: fonts.uiBold, fontSize: 12.5, lineHeight: 18, color: colors.ink },
  tealText: { color: colors.teal },
  rustText: { color: colors.rustDark },
  editToggle: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.raised },
  editToggleText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rustDark },
  editPanel: { gap: 14 },
  bioInput: { minHeight: 112, paddingTop: 13 },
  fieldLabel: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  languageOptions: { flexDirection: "row", gap: 8 },
  language: { minHeight: 48, flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised },
  languageSelected: { borderColor: colors.brand600, backgroundColor: colors.brand600 },
  languageText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  languageTextSelected: { color: colors.raised },
  dangerPanel: { gap: 12, borderColor: colors.danger },
  dangerCopy: { gap: 5 },
  dangerTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.danger },
  dangerBody: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 20, color: colors.muted },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
});
