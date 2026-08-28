import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Speech from "expo-speech";
import { type Href, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  API_URL,
  ApiError,
  request,
  type CoachCharacter,
  type CoachScore,
  type CoachSession,
  type CoachTurn,
  type IeltsBankItem,
  type IeltsGeneratedTest,
  type IeltsGrade,
  type IeltsMockSession,
  type IeltsMockSessionListItem,
  type IeltsWritingScore,
  type IeltsWritingTask,
} from "@/api/client";
import { ReadingPracticeNative } from "@/components/ielts/reading-practice-native";
import { isWritingVisual, WritingTaskVisual } from "@/components/ielts/writing-practice-native";
import { BackButton, Button, ErrorNote, Loader, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import {
  combineWritingBand,
  MOCK_SKILL_MINUTES,
  MOCK_SKILLS,
  mockApi,
  randomAcademicReadingTest,
  type MockSkill,
} from "@/ielts/mock";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: {
    back: "IELTS markazi", eyebrow: "To‘liq IELTS sinovi", title: "4 ko‘nikma. Bitta uzluksiz imtihon.",
    subtitle: "Listening, Reading, Writing va Speaking ketma-ket bajariladi. Progress serverda saqlanadi va profil natijalarida ko‘rinadi.",
    total: "Taxminan 2 soat 21 daqiqa", academic: "Academic IELTS", academicBody: "To‘liq Academic Reading banki va barcha 4 section.", general: "General Training", coming: "Tez orada", start: "Full mockni boshlash", resume: "Davom ettirish", past: "Oldingi urinishlar", finished: "Tugallangan", abandoned: "Tark etilgan", inProgress: "Jarayonda",
    premium: "Premium talab qilinadi", premiumBody: "Full Mock premium funksiyasi. Obuna faol bo‘lgandan keyingina yangi session ochiladi.", upgrade: "Premiumni ko‘rish", error: "Mock session bilan ishlashda xato bo‘ldi. Qayta urinib ko‘ring.", loading: "Mock session yuklanmoqda…",
    listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", exit: "Mockdan chiqish", exitTitle: "Mockni tark etasizmi?", exitBody: "Joriy full mock tugallanmagan deb belgilanadi. Keyingi safar yangi urinish boshlaysiz.", stay: "Davom etish", leave: "Tark etish",
    complete: "section tugadi", band: "Band", next: "Keyingisi", continue: "Davom etish", preparing: "Section tayyorlanmoqda…", listeningIntro: "Audio bir marta ijro etiladi. Barcha javoblarni belgilang.", playsOnce: "Haqiqiy imtihondagidek bir marta ijro etiladi.", submit: "Javoblarni yuborish", unanswered: "javob berildi", task: "Writing vazifasi", taskOf: "2 tadan", words: "so‘z", minimum: "kamida", getBand: "Javobni baholash", combined: "Task 2 ikki hissa hisoblanadi.", speakingIntro: "IELTS examiner savollariga ingliz tilida javob bering. Kamida bitta batafsil javobdan keyin band oling.", answer: "Javobingizni ingliz tilida yozing…", send: "Javobni yuborish", scoreSpeaking: "Speaking bandini olish", examiner: "IELTS Examiner", report: "Full Mock natijasi", overall: "Umumiy band", retake: "Yangi mock", hub: "IELTS markaziga qaytish", pending: "Kutilmoqda", done: "Tugallandi", noAttempts: "Hali mock urinishi yo‘q.", writingLoad: "Writing topshirig‘i yuklanmoqda…",
  },
  ru: {
    back: "Центр IELTS", eyebrow: "Полный пробный IELTS", title: "4 навыка. Один непрерывный экзамен.", subtitle: "Listening, Reading, Writing и Speaking выполняются по порядку. Прогресс хранится на сервере и отображается в профиле.", total: "Около 2 ч 21 мин", academic: "Academic IELTS", academicBody: "Полный банк Academic Reading и все 4 раздела.", general: "General Training", coming: "Скоро", start: "Начать Full Mock", resume: "Продолжить", past: "Предыдущие попытки", finished: "Завершён", abandoned: "Прерван", inProgress: "В процессе", premium: "Нужен Premium", premiumBody: "Full Mock доступен с Premium. Новая сессия создаётся только при активной подписке.", upgrade: "Посмотреть Premium", error: "Не удалось выполнить действие с mock-сессией. Попробуйте снова.", loading: "Загружаем mock-сессию…", listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", exit: "Выйти из mock", exitTitle: "Выйти из mock?", exitBody: "Текущий Full Mock будет отмечен как незавершённый.", stay: "Остаться", leave: "Выйти", complete: "завершён", band: "Band", next: "Далее", continue: "Продолжить", preparing: "Готовим раздел…", listeningIntro: "Аудио воспроизводится один раз. Ответьте на все вопросы.", playsOnce: "Воспроизводится один раз, как на экзамене.", submit: "Отправить ответы", unanswered: "ответов", task: "Задание Writing", taskOf: "из 2", words: "слов", minimum: "минимум", getBand: "Оценить ответ", combined: "Task 2 учитывается вдвое.", speakingIntro: "Отвечайте экзаменатору на английском. После хотя бы одного развёрнутого ответа получите band.", answer: "Напишите ответ на английском…", send: "Отправить ответ", scoreSpeaking: "Получить Speaking band", examiner: "IELTS Examiner", report: "Результат Full Mock", overall: "Общий band", retake: "Новый mock", hub: "Вернуться в IELTS", pending: "Ожидает", done: "Готово", noAttempts: "Попыток mock пока нет.", writingLoad: "Загружаем задание Writing…",
  },
  en: {
    back: "IELTS hub", eyebrow: "Full IELTS mock", title: "4 skills. One continuous exam.", subtitle: "Listening, Reading, Writing, and Speaking run in sequence. Progress is stored on the server and appears in your profile.", total: "About 2 hr 21 min", academic: "Academic IELTS", academicBody: "Full Academic Reading bank and all four sections.", general: "General Training", coming: "Coming soon", start: "Start Full Mock", resume: "Resume mock", past: "Past attempts", finished: "Finished", abandoned: "Abandoned", inProgress: "In progress", premium: "Premium required", premiumBody: "Full Mock is a Premium feature. A new session starts only after the subscription is active.", upgrade: "View Premium", error: "We couldn't update the mock session. Please try again.", loading: "Loading mock session…", listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", exit: "Exit mock", exitTitle: "Exit this mock?", exitBody: "This Full Mock will be marked unfinished and you will start a new attempt next time.", stay: "Keep going", leave: "Exit", complete: "section complete", band: "Band", next: "Next", continue: "Continue", preparing: "Preparing section…", listeningIntro: "The recording plays once. Answer every question.", playsOnce: "Plays once, just like the real exam.", submit: "Submit answers", unanswered: "answered", task: "Writing task", taskOf: "of 2", words: "words", minimum: "minimum", getBand: "Score response", combined: "Task 2 counts twice.", speakingIntro: "Answer the IELTS examiner in English. After at least one detailed answer, request your band.", answer: "Write your answer in English…", send: "Send answer", scoreSpeaking: "Get Speaking band", examiner: "IELTS Examiner", report: "Full Mock result", overall: "Overall band", retake: "New mock", hub: "Back to IELTS hub", pending: "Pending", done: "Done", noAttempts: "No mock attempts yet.", writingLoad: "Loading Writing task…",
  },
} as const;

const skillIcons: Record<MockSkill, keyof typeof Ionicons.glyphMap> = {
  listening: "headset-outline",
  reading: "book-outline",
  writing: "create-outline",
  speaking: "mic-outline",
};

function skillFrom(value: string | null): MockSkill | null {
  return MOCK_SKILLS.includes(value as MockSkill) ? value as MockSkill : null;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function MockExamNative() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const [session, setSession] = useState<IeltsMockSession | null>(null);
  const [transition, setTransition] = useState<{ skill: MockSkill; band: number } | null>(null);
  const [paywalled, setPaywalled] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const readingTestId = useMemo(() => session ? randomAcademicReadingTest() : null, [session?.id]);

  const history = useQuery({
    queryKey: ["ielts-mock-sessions"],
    queryFn: () => mockApi.list(token),
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (session || !history.data) return;
    const active = history.data.find((item) => item.status === "in_progress");
    if (!active) return;
    void mockApi.get(token, active.id).then(setSession).catch(() => setLocalError(t.error));
  }, [history.data, session, t.error, token]);

  const start = useMutation({
    mutationFn: () => mockApi.create(token, "academic"),
    onSuccess: (created) => { setSession(created); setPaywalled(false); setLocalError(null); },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 402) setPaywalled(true);
      else if (error instanceof ApiError && error.status === 409) void history.refetch();
      else setLocalError(t.error);
    },
  });

  async function complete(skill: MockSkill, band: number, detail?: Record<string, unknown>) {
    if (!session) return;
    try {
      const updated = await mockApi.complete(token, session.id, skill, band, detail);
      setSession(updated);
      setTransition(updated.status === "finished" ? null : { skill, band });
      await queryClient.invalidateQueries({ queryKey: ["ielts-mock-sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", "mocks"] });
    } catch {
      setLocalError(t.error);
    }
  }

  function confirmAbandon() {
    if (!session) return;
    Alert.alert(t.exitTitle, t.exitBody, [
      { text: t.stay, style: "cancel" },
      { text: t.leave, style: "destructive", onPress: () => {
        void mockApi.abandon(token, session.id).then((updated) => {
          setSession(updated);
          setTransition(null);
          void queryClient.invalidateQueries({ queryKey: ["ielts-mock-sessions"] });
        }).catch(() => setLocalError(t.error));
      } },
    ]);
  }

  if (history.isLoading && !session) return <Screen appHeader><Loader label={t.loading} /></Screen>;

  if (!session) {
    return <MockIntro locale={locale} history={history.data ?? []} paywalled={paywalled} error={localError ?? (history.isError ? t.error : null)} starting={start.isPending} onStart={() => start.mutate()} onView={(id) => void mockApi.get(token, id).then(setSession).catch(() => setLocalError(t.error))} />;
  }

  if (session.status === "finished" || session.status === "abandoned") {
    return <MockReport locale={locale} session={session} onRetake={() => { setSession(null); setTransition(null); void history.refetch(); }} />;
  }

  const currentSkill = skillFrom(session.current_leg);
  if (transition && currentSkill) {
    return <MockTransition locale={locale} completed={transition} next={currentSkill} onContinue={() => setTransition(null)} />;
  }

  if (!currentSkill) return <MockReport locale={locale} session={session} onRetake={() => setSession(null)} />;

  if (currentSkill === "reading" && readingTestId) {
    return <Screen appHeader><ReadingPracticeNative locale={locale} scope={`${user?.id ?? "guest"}:mock:${session.id}`} mockTestId={readingTestId} mockExitLabel={t.exit} onBack={confirmAbandon} onMockExit={confirmAbandon} onMockComplete={({ band, score, total }) => void complete("reading", band, { correct: score, total })} /></Screen>;
  }
  if (currentSkill === "listening") return <MockListeningLeg locale={locale} token={token} sessionId={session.id} onExit={confirmAbandon} onDone={(band, detail) => void complete("listening", band, detail)} />;
  if (currentSkill === "writing") return <MockWritingLeg locale={locale} token={token} sessionId={session.id} onExit={confirmAbandon} onDone={(band, detail) => void complete("writing", band, detail)} />;
  return <MockSpeakingLeg locale={locale} token={token} mockSessionId={session.id} onExit={confirmAbandon} onDone={(band, detail) => void complete("speaking", band, detail)} />;
}

function MockIntro({ locale, history, paywalled, error, starting, onStart, onView }: { locale: Locale; history: IeltsMockSessionListItem[]; paywalled: boolean; error: string | null; starting: boolean; onStart: () => void; onView: (id: string) => void }) {
  const t = labels[locale];
  return <Screen appHeader appFooter>
    <BackButton label={t.back} onPress={() => router.replace("/(tabs)/ielts")} />
    <View style={styles.hero}>
      <Text accessibilityElementsHidden style={styles.watermark}>MOCK</Text>
      <View style={styles.eyebrow}><Ionicons name="sparkles" size={15} color={colors.gold300} /><Text style={styles.eyebrowText}>{t.eyebrow}</Text></View>
      <Text style={styles.heroTitle}>{t.title}</Text><Text style={styles.heroBody}>{t.subtitle}</Text>
      <View style={styles.flow}>{MOCK_SKILLS.map((skill, index) => <View key={skill} style={styles.flowItem}><View style={styles.flowPill}><Ionicons name={skillIcons[skill]} size={15} color={colors.teal} /><Text style={styles.flowText}>{t[skill]}</Text></View>{index < MOCK_SKILLS.length - 1 ? <Ionicons name="arrow-forward" size={13} color={colors.brand300} /> : null}</View>)}</View>
      <View style={styles.totalRow}><Ionicons name="time-outline" size={17} color={colors.gold300} /><Text style={styles.totalText}>{t.total}</Text></View>
    </View>
    <ErrorNote message={error} />
    {paywalled ? <Paper style={styles.paywall}><View style={styles.darkIcon}><Ionicons name="lock-closed-outline" size={22} color={colors.onAccent} /></View><Text style={styles.paywallTitle}>{t.premium}</Text><Text style={styles.paywallBody}>{t.premiumBody}</Text><Button variant="secondary" onPress={() => router.push("/billing" as Href)}>{t.upgrade}</Button></Paper> : <>
      <View style={styles.trackRow}><Paper style={styles.trackActive}><View style={styles.trackHeading}><Ionicons name="radio-button-on" size={20} color={colors.teal} /><Text style={styles.trackTitle}>{t.academic}</Text></View><Text style={styles.trackBody}>{t.academicBody}</Text></Paper><Paper style={styles.trackDisabled}><View style={styles.trackHeading}><Ionicons name="lock-closed-outline" size={18} color={colors.muted} /><Text style={styles.trackTitle}>{t.general}</Text></View><Text style={styles.coming}>{t.coming}</Text></Paper></View>
      <Button icon="play" loading={starting} onPress={onStart}>{t.start}</Button>
    </>}
    <View style={styles.sectionHeading}><Text style={styles.sectionKicker}>{t.past}</Text><Text style={styles.sectionTitle}>{history.length || t.noAttempts}</Text></View>
    <View style={styles.historyList}>{history.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => onView(item.id)} style={({ pressed }) => [styles.historyCard, pressed && styles.pressed]}><View style={styles.flexOne}><Text style={styles.historyTitle}>{item.track === "academic" ? t.academic : t.general}</Text><Text style={styles.historyMeta}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.started_at))} · {item.status === "finished" ? t.finished : item.status === "in_progress" ? t.inProgress : t.abandoned}</Text></View>{item.overall_band !== null ? <Text style={styles.historyBand}>{item.overall_band.toFixed(1)}</Text> : <Ionicons name="chevron-forward" size={19} color={colors.muted} />}</Pressable>)}</View>
  </Screen>;
}

function MockHeader({ locale, skill, seconds, onExit }: { locale: Locale; skill: MockSkill; seconds?: number; onExit: () => void }) {
  const t = labels[locale];
  return <><View style={styles.legHeader}><BackButton label={t.exit} onPress={onExit} />{seconds !== undefined ? <View style={[styles.timer, seconds < 120 && styles.timerDanger]}><Ionicons name="time-outline" size={16} color={seconds < 120 ? colors.danger : colors.rustDark} /><Text style={[styles.timerText, seconds < 120 && styles.timerDangerText]}>{formatTime(seconds)}</Text></View> : null}</View><View style={styles.legTitleRow}><View style={styles.skillIcon}><Ionicons name={skillIcons[skill]} size={22} color={colors.teal} /></View><View><Text style={styles.sectionKicker}>IELTS FULL MOCK</Text><Text style={styles.legTitle}>{t[skill]}</Text></View></View></>;
}

function MockListeningLeg({ locale, token, sessionId, onExit, onDone }: { locale: Locale; token: string | null; sessionId: string; onExit: () => void; onDone: (band: number, detail: { correct: number; total: number }) => void }) {
  const t = labels[locale];
  const test = useQuery({
    queryKey: ["ielts-mock-listening", sessionId],
    queryFn: async () => {
      const bank = await request<IeltsBankItem[]>("/ielts/listening/bank", { token });
      const pool = bank.filter((item) => !item.done);
      const choices = pool.length ? pool : bank;
      if (!choices.length) throw new Error("empty listening bank");
      const picked = choices[Math.floor(Math.random() * choices.length)];
      return request<IeltsGeneratedTest>(`/ielts/listening/bank/${picked.id}/start`, { method: "POST", token });
    },
  });
  if (test.isLoading) return <Screen appHeader><MockHeader locale={locale} skill="listening" onExit={onExit} /><Loader label={t.preparing} /></Screen>;
  if (test.isError || !test.data) return <Screen appHeader><MockHeader locale={locale} skill="listening" onExit={onExit} /><ErrorNote message={t.error} /><Button icon="refresh" onPress={() => void test.refetch()}>{t.continue}</Button></Screen>;
  return <MockListeningActive locale={locale} token={token} sessionId={sessionId} test={test.data} onExit={onExit} onDone={onDone} />;
}

function MockListeningActive({ locale, token, sessionId, test, onExit, onDone }: { locale: Locale; token: string | null; sessionId: string; test: IeltsGeneratedTest; onExit: () => void; onDone: (band: number, detail: { correct: number; total: number }) => void }) {
  const t = labels[locale];
  const [answers, setAnswers] = useState<number[]>(() => new Array(test.questions.length).fill(-1));
  const [seconds, setSeconds] = useState(MOCK_SKILL_MINUTES.listening * 60);
  const [audioFinished, setAudioFinished] = useState(false);
  const source = useMemo(() => ({ uri: `${API_URL}/api/v1/ielts/listening/${test.test_id}/audio`, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) }), [test.test_id, token]);
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const submit = useMutation({ mutationFn: () => request<IeltsGrade>("/ielts/listening/submit", { method: "POST", token, body: { test_id: test.test_id, answers, mock_session_id: sessionId } }), onSuccess: (grade) => onDone(grade.band, { correct: grade.correct, total: grade.total }) });
  const submitRef = useRef(() => submit.mutate());
  submitRef.current = () => submit.mutate();
  useEffect(() => { void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: "doNotMix" }); const timer = setTimeout(() => player.play(), 450); return () => clearTimeout(timer); }, [player]);
  useEffect(() => { if (status.didJustFinish) setAudioFinished(true); }, [status.didJustFinish]);
  useEffect(() => { const timer = setInterval(() => setSeconds((value) => { if (value <= 1) { clearInterval(timer); submitRef.current(); return 0; } return value - 1; }), 1000); return () => clearInterval(timer); }, []);
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return <Screen appHeader>
    <MockHeader locale={locale} skill="listening" seconds={seconds} onExit={onExit} />
    <Text style={styles.intro}>{t.listeningIntro}</Text>
    <Paper style={styles.audioCard}><Pressable accessibilityRole="button" disabled={audioFinished} onPress={() => status.playing ? player.pause() : player.play()} style={[styles.audioButton, audioFinished && styles.disabled]}><Ionicons name={status.playing ? "pause" : "play"} size={23} color={colors.onAccent} /></Pressable><View style={styles.flexOne}><Text numberOfLines={1} style={styles.audioTitle}>{test.title}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View><Text style={styles.smallMuted}>{t.playsOnce}</Text></View></Paper>
    <View style={styles.questionList}>{test.questions.map((question, qi) => <Paper key={`${question.prompt}-${qi}`} style={styles.questionCard}><View style={styles.questionHeading}><View style={styles.number}><Text style={styles.numberText}>{qi + 1}</Text></View><Text style={styles.questionText}>{question.prompt}</Text></View><View style={styles.optionList}>{question.options.map((option, oi) => { const selected = answers[qi] === oi; return <Pressable key={`${option}-${oi}`} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setAnswers((current) => current.map((answer, index) => index === qi ? oi : answer))} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}><View style={[styles.optionLetter, selected && styles.optionLetterSelected]}><Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>{String.fromCharCode(65 + oi)}</Text></View><Text style={styles.optionText}>{option}</Text></Pressable>; })}</View></Paper>)}</View>
    <Text style={styles.answerCount}>{answers.filter((answer) => answer >= 0).length}/{answers.length} {t.unanswered}</Text><Button loading={submit.isPending} disabled={answers.some((answer) => answer < 0)} onPress={() => submit.mutate()}>{t.submit}</Button><ErrorNote message={submit.isError ? t.error : null} />
  </Screen>;
}

function MockWritingLeg({ locale, token, sessionId, onExit, onDone }: { locale: Locale; token: string | null; sessionId: string; onExit: () => void; onDone: (band: number, detail: { task1: number; task2: number }) => void }) {
  const t = labels[locale];
  const [taskType, setTaskType] = useState<"task1" | "task2">("task1");
  const [task1Band, setTask1Band] = useState<number | null>(null);
  const [essay, setEssay] = useState("");
  const [seconds, setSeconds] = useState(20 * 60);
  const [error, setError] = useState<string | null>(null);
  const tasks = useQuery({ queryKey: ["ielts-writing-tasks", token], queryFn: () => request<Record<"task1" | "task2", IeltsWritingTask[]>>("/ielts/writing/tasks", { token }) });
  const indexes = useRef({ task1: Math.random(), task2: Math.random() });
  const pool = tasks.data?.[taskType] ?? [];
  const prompt = pool.length ? pool[Math.floor(indexes.current[taskType] * pool.length)] : undefined;
  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const submit = useMutation({
    mutationFn: async () => {
      if (!prompt || essay.trim().length < 20) return 0;
      const score = await request<IeltsWritingScore>("/ielts/writing/score", { method: "POST", token, timeoutMs: 60_000, body: { task_type: taskType, prompt: prompt.prompt, essay, lang: locale, mock_session_id: sessionId } });
      return score.band_overall;
    },
    onSuccess: (band) => {
      if (taskType === "task1") { setTask1Band(band); setTaskType("task2"); setEssay(""); setSeconds(40 * 60); submit.reset(); }
      else { const final = combineWritingBand(task1Band ?? band, band); onDone(final, { task1: task1Band ?? band, task2: band }); }
    },
    onError: (caught) => setError(caught instanceof ApiError ? caught.message : t.error),
  });
  const submitRef = useRef(() => submit.mutate());
  submitRef.current = () => submit.mutate();
  useEffect(() => { if (!prompt) return; const timer = setInterval(() => setSeconds((value) => { if (value <= 1) { clearInterval(timer); submitRef.current(); return 0; } return value - 1; }), 1000); return () => clearInterval(timer); }, [prompt, taskType]);
  if (tasks.isLoading || !prompt) return <Screen appHeader><MockHeader locale={locale} skill="writing" onExit={onExit} /><Loader label={t.writingLoad} /><ErrorNote message={tasks.isError ? t.error : null} /></Screen>;
  return <Screen appHeader>
    <MockHeader locale={locale} skill="writing" seconds={seconds} onExit={onExit} />
    <View style={styles.taskStatus}><Text style={styles.taskStatusText}>{t.task} {taskType === "task1" ? "1" : "2"} {t.taskOf}</Text><Text style={styles.smallMuted}>{taskType === "task1" ? "20 min · 150 words" : `40 min · 250 words · ${t.combined}`}</Text></View>
    <Paper style={styles.promptCard}><Text style={styles.promptTitle}>{prompt.title}</Text><Text style={styles.promptText}>{prompt.prompt}</Text>{isWritingVisual(prompt.visual) ? <WritingTaskVisual visual={prompt.visual} locale={locale} /> : null}</Paper>
    <TextInput accessibilityLabel={t.answer} multiline maxLength={6000} value={essay} onChangeText={(value) => { setEssay(value); setError(null); }} placeholder={t.answer} placeholderTextColor={colors.muted} textAlignVertical="top" style={styles.essay} />
    <Text style={[styles.answerCount, words >= (taskType === "task1" ? 150 : 250) && styles.answerCountDone]}>{words} {t.words} · {t.minimum} {taskType === "task1" ? 150 : 250}</Text>
    <Button loading={submit.isPending} disabled={words < 20} onPress={() => submit.mutate()}>{t.getBand}</Button><ErrorNote message={error} />
  </Screen>;
}

type ChatEntry = { role: string; content: string; corrections: CoachTurn["corrections"]; created_at: string };

function MockSpeakingLeg({ locale, token, mockSessionId, onExit, onDone }: { locale: Locale; token: string | null; mockSessionId: string; onExit: () => void; onDone: (band: number, detail: { coach_session_id: string }) => void }) {
  const t = labels[locale];
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const list = useRef<FlatList<ChatEntry>>(null);
  const setup = useQuery({
    queryKey: ["ielts-mock-speaking-session", mockSessionId],
    queryFn: async () => {
      const characters = await request<CoachCharacter[]>("/coach/characters", { token });
      const examiner = characters.find((item) => item.key === "examiner") ?? characters[0];
      if (!examiner) throw new Error("missing examiner");
      const session = await request<CoachSession>("/coach/sessions", { method: "POST", token, body: { character: examiner.key, mode: "ielts", ielts_part: 1 } });
      return { examiner, session };
    },
    staleTime: Infinity,
  });
  useEffect(() => { if (setup.data) setMessages(setup.data.session.messages); }, [setup.data]);
  const send = useMutation({ mutationFn: (text: string) => request<CoachTurn>(`/coach/sessions/${setup.data?.session.id}/message`, { method: "POST", token, timeoutMs: 60_000, body: { text } }), onSuccess: (turn, text) => { const now = new Date().toISOString(); setMessages((current) => [...current, { role: "user", content: text, corrections: [], created_at: now }, { role: "assistant", content: turn.reply, corrections: turn.corrections, created_at: now }]); setDraft(""); } });
  const score = useMutation({ mutationFn: () => request<CoachScore>(`/coach/sessions/${setup.data?.session.id}/score`, { method: "POST", token, timeoutMs: 60_000 }), onSuccess: (result) => { if (setup.data) onDone(result.report.band_overall, { coach_session_id: setup.data.session.id }); } });
  useEffect(() => { if (messages.length) requestAnimationFrame(() => list.current?.scrollToEnd({ animated: true })); }, [messages.length]);
  if (setup.isLoading) return <Screen appHeader><MockHeader locale={locale} skill="speaking" onExit={onExit} /><Loader label={t.preparing} /></Screen>;
  if (setup.isError || !setup.data) return <Screen appHeader><MockHeader locale={locale} skill="speaking" onExit={onExit} /><ErrorNote message={t.error} /><Button icon="refresh" onPress={() => void setup.refetch()}>{t.continue}</Button></Screen>;
  const submitText = () => { const value = draft.trim(); if (value) send.mutate(value); };
  return <Screen appHeader scroll={false}>
    <MockHeader locale={locale} skill="speaking" onExit={onExit} />
    <Paper style={styles.examinerCard}><View style={styles.examinerAvatar}><Text style={styles.examinerEmoji}>{setup.data.examiner.emoji}</Text></View><View style={styles.flexOne}><Text style={styles.examinerName}>{setup.data.examiner.name || t.examiner}</Text><Text style={styles.smallMuted}>{t.speakingIntro}</Text></View></Paper>
    <FlatList ref={list} data={messages} keyExtractor={(item, index) => `${item.created_at}-${index}`} style={styles.chatList} contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Paper><Text style={styles.promptText}>{setup.data.session.topic ?? t.speakingIntro}</Text></Paper>} renderItem={({ item }) => <View style={[styles.messageRow, item.role === "user" && styles.userRow]}><Paper style={[styles.messageBubble, item.role === "user" && styles.userBubble]}><Text style={[styles.messageText, item.role === "user" && styles.userMessageText]}>{item.content}</Text>{item.role === "assistant" ? <Pressable accessibilityRole="button" onPress={() => { Speech.stop(); Speech.speak(item.content, { language: "en-US", rate: setup.data.examiner.rate, pitch: setup.data.examiner.pitch }); }} style={styles.speakButton}><Ionicons name="volume-high-outline" size={19} color={colors.teal} /></Pressable> : null}</Paper></View>} />
    <Paper style={styles.composer}><TextInput accessibilityLabel={t.answer} multiline maxLength={2000} value={draft} onChangeText={setDraft} placeholder={t.answer} placeholderTextColor={colors.muted} textAlignVertical="top" style={styles.composerInput} /><Button icon="send" loading={send.isPending} disabled={!draft.trim()} onPress={submitText}>{t.send}</Button></Paper>
    <ErrorNote message={send.isError || score.isError ? t.error : null} /><Button icon="ribbon-outline" loading={score.isPending} disabled={!messages.some((item) => item.role === "user")} onPress={() => score.mutate()}>{t.scoreSpeaking}</Button>
  </Screen>;
}

function MockTransition({ locale, completed, next, onContinue }: { locale: Locale; completed: { skill: MockSkill; band: number }; next: MockSkill; onContinue: () => void }) {
  const t = labels[locale];
  return <Screen appHeader><View style={styles.transition}><View style={styles.successCircle}><Ionicons name="checkmark" size={34} color={colors.onAccent} /></View><Text style={styles.transitionTitle}>{t[completed.skill]} {t.complete}</Text><Text style={styles.sectionKicker}>{t.band}</Text><Text style={styles.transitionBand}>{completed.band.toFixed(1)}</Text><View style={styles.nextRow}><Ionicons name={skillIcons[next]} size={20} color={colors.teal} /><Text style={styles.nextText}>{t.next}: {t[next]}</Text></View><Button icon="arrow-forward" onPress={onContinue}>{t.continue}</Button></View></Screen>;
}

function MockReport({ locale, session, onRetake }: { locale: Locale; session: IeltsMockSession; onRetake: () => void }) {
  const t = labels[locale];
  const abandoned = session.status === "abandoned";
  return <Screen appHeader appFooter><BackButton label={t.back} onPress={() => router.replace("/(tabs)/ielts")} /><View style={styles.reportHero}><View style={styles.trophy}><Ionicons name={abandoned ? "close" : "trophy-outline"} size={32} color={colors.onAccent} /></View><Text style={styles.reportTitle}>{abandoned ? t.abandoned : t.report}</Text>{!abandoned ? <><Text style={styles.reportLabel}>{t.overall}</Text><Text style={styles.reportBand}>{(session.overall_band ?? 0).toFixed(1)}</Text></> : <Text style={styles.reportBody}>{t.exitBody}</Text>}</View>{!abandoned ? <View style={styles.reportGrid}>{session.legs.map((leg) => { const skill = skillFrom(leg.skill); if (!skill) return null; return <Paper key={skill} style={styles.reportLeg}><View style={styles.skillIcon}><Ionicons name={skillIcons[skill]} size={21} color={colors.teal} /></View><View style={styles.flexOne}><Text style={styles.reportLegTitle}>{t[skill]}</Text><Text style={styles.smallMuted}>{leg.status === "done" ? t.done : t.pending}</Text></View><Text style={styles.reportLegBand}>{leg.band?.toFixed(1) ?? "—"}</Text></Paper>; })}</View> : null}<Button icon="refresh" onPress={onRetake}>{t.retake}</Button><Button variant="secondary" onPress={() => router.replace("/(tabs)/ielts")}>{t.hub}</Button></Screen>;
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 }, pressed: { opacity: 0.72, transform: [{ translateY: 1 }] }, disabled: { opacity: 0.45 },
  hero: { position: "relative", gap: 15, overflow: "hidden", padding: 20, borderRadius: 18, backgroundColor: colors.inkSurface },
  watermark: { position: "absolute", right: -9, top: -12, fontFamily: fonts.display, fontSize: 92, color: "rgba(255,248,234,.06)" },
  eyebrow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, minHeight: 31, paddingHorizontal: 10, borderWidth: 1, borderColor: "rgba(161,194,189,.55)", borderRadius: 8, backgroundColor: "rgba(70,120,120,.20)" },
  eyebrowText: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: .8, textTransform: "uppercase", color: colors.gold300 },
  heroTitle: { maxWidth: 340, fontFamily: fonts.display, fontSize: 38, lineHeight: 42, letterSpacing: .6, textTransform: "uppercase", color: colors.onAccent },
  heroBody: { maxWidth: 340, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.brand200 },
  flow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingTop: 3 }, flowItem: { flexDirection: "row", alignItems: "center", gap: 6 }, flowPill: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, borderRadius: 9, backgroundColor: "rgba(255,248,234,.09)" }, flowText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.brand100 }, totalRow: { flexDirection: "row", alignItems: "center", gap: 7 }, totalText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.gold300 },
  paywall: { gap: 11, backgroundColor: colors.brand900 }, darkIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "rgba(255,255,255,.1)" }, paywallTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.onAccent }, paywallBody: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.brand200 },
  trackRow: { gap: 10 }, trackActive: { gap: 8, borderColor: colors.teal, backgroundColor: "rgba(70,120,120,.08)" }, trackDisabled: { gap: 8, opacity: .58 }, trackHeading: { flexDirection: "row", alignItems: "center", gap: 8 }, trackTitle: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink }, trackBody: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted }, coming: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, backgroundColor: colors.brand100, fontFamily: fonts.uiBold, fontSize: 9, color: colors.muted },
  sectionHeading: { gap: 4, marginTop: 6 }, sectionKicker: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: .75, textTransform: "uppercase", color: colors.teal }, sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink }, historyList: { gap: 9 }, historyCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream }, historyTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, historyMeta: { marginTop: 3, fontFamily: fonts.uiMedium, fontSize: 11, color: colors.muted }, historyBand: { fontFamily: fonts.display, fontSize: 29, color: colors.teal },
  legHeader: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, timer: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, borderRadius: 20, backgroundColor: colors.brand100 }, timerDanger: { backgroundColor: "rgba(220,38,38,.10)" }, timerText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rustDark, fontVariant: ["tabular-nums"] }, timerDangerText: { color: colors.danger }, legTitleRow: { flexDirection: "row", alignItems: "center", gap: 11 }, skillIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand200, borderRadius: 12, backgroundColor: colors.brand50 }, legTitle: { marginTop: 1, fontFamily: fonts.display, fontSize: 27, color: colors.ink }, intro: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  audioCard: { flexDirection: "row", alignItems: "center", gap: 12 }, audioButton: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 25, backgroundColor: colors.brand600 }, audioTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, progressTrack: { height: 5, overflow: "hidden", marginVertical: 8, borderRadius: 3, backgroundColor: colors.brand100 }, progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.teal }, smallMuted: { fontFamily: fonts.uiMedium, fontSize: 10.5, lineHeight: 16, color: colors.muted },
  questionList: { gap: 11 }, questionCard: { gap: 12 }, questionHeading: { flexDirection: "row", alignItems: "flex-start", gap: 9 }, number: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 8 }, numberText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted }, questionText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, lineHeight: 21, color: colors.ink }, optionList: { gap: 7 }, option: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, padding: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised }, optionSelected: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,.10)" }, optionLetter: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.brand100 }, optionLetterSelected: { backgroundColor: colors.teal }, optionLetterText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.ink }, optionLetterTextSelected: { color: colors.onAccent }, optionText: { flex: 1, fontFamily: fonts.ui, fontSize: 13, lineHeight: 19, color: colors.ink }, answerCount: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted }, answerCountDone: { color: colors.teal },
  taskStatus: { gap: 4, padding: 13, borderWidth: 1, borderColor: colors.teal, borderRadius: 12, backgroundColor: "rgba(70,120,120,.08)" }, taskStatusText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, promptCard: { gap: 9 }, promptTitle: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink }, promptText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted }, essay: { minHeight: 290, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 16, lineHeight: 24, color: colors.ink },
  examinerCard: { flexDirection: "row", alignItems: "center", gap: 12 }, examinerAvatar: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, backgroundColor: colors.brand100 }, examinerEmoji: { fontSize: 29 }, examinerName: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, chatList: { flex: 1, minHeight: 0 }, chatContent: { flexGrow: 1, gap: 10, paddingBottom: 8 }, messageRow: { alignItems: "flex-start" }, userRow: { alignItems: "flex-end" }, messageBubble: { maxWidth: "91%", flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 12 }, userBubble: { backgroundColor: colors.brand600, borderColor: colors.brand600 }, messageText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, color: colors.ink }, userMessageText: { color: colors.onAccent }, speakButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", marginTop: -7, marginRight: -7 }, composer: { gap: 10 }, composerInput: { minHeight: 92, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 16, lineHeight: 22, color: colors.ink },
  transition: { flex: 1, minHeight: 520, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 35 }, successCircle: { width: 72, height: 72, alignItems: "center", justifyContent: "center", borderRadius: 36, backgroundColor: colors.teal }, transitionTitle: { marginTop: 7, fontFamily: fonts.uiBold, fontSize: 19, textAlign: "center", color: colors.ink }, transitionBand: { fontFamily: fonts.display, fontSize: 70, lineHeight: 74, color: colors.teal }, nextRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }, nextText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.muted },
  reportHero: { alignItems: "center", gap: 8, padding: 23, borderRadius: 18, backgroundColor: colors.inkSurface }, trophy: { width: 66, height: 66, alignItems: "center", justifyContent: "center", borderRadius: 33, backgroundColor: "rgba(70,120,120,.35)" }, reportTitle: { marginTop: 5, fontFamily: fonts.display, fontSize: 28, textAlign: "center", color: colors.onAccent }, reportLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: .7, textTransform: "uppercase", color: colors.gold300 }, reportBand: { fontFamily: fonts.display, fontSize: 76, lineHeight: 80, color: colors.gold300 }, reportBody: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, textAlign: "center", color: colors.brand200 }, reportGrid: { gap: 10 }, reportLeg: { flexDirection: "row", alignItems: "center", gap: 11 }, reportLegTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, reportLegBand: { fontFamily: fonts.display, fontSize: 31, color: colors.teal },
});
