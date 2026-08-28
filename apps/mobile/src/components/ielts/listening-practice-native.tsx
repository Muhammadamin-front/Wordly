import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router } from "expo-router";
import { createContext, useEffect, useMemo, useRef, useState, type Context, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  API_URL,
  ApiError,
  request,
  type IeltsBankItem,
  type IeltsGeneratedTest,
  type IeltsGrade,
} from "@/api/client";
import { BackButton, Button } from "@/components/ui";
import type { Locale } from "@/i18n";
import { getIeltsResources, getIeltsSkill, type IeltsGuideSection } from "@/ielts/content";
import {
  LISTENING_GROUPS,
  LISTENING_TRACKS,
  type ListeningTrack,
  type ListeningTrackGroup,
} from "@/ielts/listening-tracks";
import { colors, fonts } from "@/theme/tokens";

// This list is an independent, fixed-height scroller. Reset the parent ScrollView
// context so React Native can virtualize its 100 rows without treating it as one
// unbounded page list.
const IndependentScrollContext = (ScrollView as unknown as {
  Context?: Context<"horizontal" | "vertical" | null>;
}).Context ?? createContext<"horizontal" | "vertical" | null>(null);

const copy = {
  uz: {
    back: "IELTS markazi",
    testEyebrow: "Listening tushunish testi",
    testTitle: "Bir marta tinglang, keyin xotiradan javob bering",
    intro: "Yozuvni tinglang (bir marta ijro etiladi), keyin savollarga javob bering. Taxminiy band olasiz.",
    aiUnlimited: "AI cheksiz amaliyot",
    aiUnlimitedDesc: "Har safar faqat siz uchun yangi test yaratiladi.",
    passages: "Amaliy testlar",
    start: "Testni boshlash",
    tryAgain: "Yana urinish",
    loading: "Test tayyorlanmoqda…",
    band: "Ball",
    words: "so'z",
    questions: "savol",
    error: "Nimadir xato ketdi. Qayta urinib ko'ring.",
    quotaOut: "Bugungi bepul AI amallarini ishlatib bo'ldingiz. Premiumga o'ting.",
    notConfigured: "AI mashqi bu serverda hali sozlanmagan.",
    pause: "Pauza",
    play: "Ijro",
    playsOnce: "Yozuv haqiqiy imtihondagidek bir marta ijro etiladi. Pauza mumkin; javoblardan keyin qayta tinglaysiz.",
    hint: "Diqqat bilan tinglang — xotiradan javob berasiz.",
    submit: "Javoblarni yuborish",
    yourBand: "Sizning band",
    correct: "to'g'ri",
    newTest: "Yangi test",
    leaveTest: "Testlardan chiqish",
    unanswered: "Barcha savollarga javob bering",
    libraryEyebrow: "Audio amaliyot kutubxonasi",
    libraryTitle: "100 ta haqiqiy hayotiy suhbat",
    libraryDescription: "Avval tinglang, keyin o'tkazib yuborgan so'zlaringizni transcript orqali tekshiring.",
    libraryBadge: "100 audio · transcriptlar mavjud",
    search: "Suhbatni qidiring",
    noTrack: "Suhbat topilmadi.",
    conversation: "Suhbat",
    practice: "tinglash amaliyoti",
    method: "Mashq usuli",
    methods: ["Bir marta matnsiz tinglang.", "Eshitgan asosiy tafsilotlarni yozib oling.", "Transcriptni ochib, qiyin qismini qayta tinglang."],
    showTranscript: "Transcriptni ko'rsatish",
    transcriptOpen: "Transcript ochiq",
    transcriptLoading: "Transcript yuklanmoqda…",
    transcriptUnavailable: "Bu audio uchun transcript mavjud emas.",
    stepByStep: "Bosqichma-bosqich",
    modelExample: "Model misol",
    vocabulary: "Muhim lug'at",
    traps: "Ko'p uchraydigan xatolar",
    vocabularyNext: "Keyingi lug'at mashqi",
    continueVocabulary: "IELTS lug'atini davom ettiring",
    open: "Ochish",
    all: "Barchasi",
    groups: { "Everyday life": "Kundalik hayot", "Health & services": "Sog'liq va xizmatlar", "Work & travel": "Ish va sayohat", "Social & feelings": "Ijtimoiy hayot va hislar" },
  },
  ru: {
    back: "Центр IELTS",
    testEyebrow: "Тест понимания Listening",
    testTitle: "Прослушайте один раз и ответьте по памяти",
    intro: "Прослушайте запись один раз, затем ответьте на вопросы и получите примерный band.",
    aiUnlimited: "Безлимитная AI-практика",
    aiUnlimitedDesc: "Каждый раз — новый тест специально для вас.",
    passages: "Практические тесты",
    start: "Начать тест",
    tryAgain: "Ещё раз",
    loading: "Готовим тест…",
    band: "Балл",
    words: "слов",
    questions: "вопросов",
    error: "Что-то пошло не так. Попробуйте снова.",
    quotaOut: "Вы использовали сегодняшние бесплатные действия ИИ. Оформите Premium.",
    notConfigured: "Практика с ИИ ещё не настроена на этом сервере.",
    pause: "Пауза",
    play: "Играть",
    playsOnce: "Запись звучит один раз, как на экзамене. Можно поставить на паузу; переслушивание доступно после ответов.",
    hint: "Слушайте внимательно — отвечаете по памяти.",
    submit: "Отправить ответы",
    yourBand: "Ваш band",
    correct: "верно",
    newTest: "Новый тест",
    leaveTest: "К списку тестов",
    unanswered: "Ответьте на все вопросы",
    libraryEyebrow: "Библиотека аудиопрактики",
    libraryTitle: "100 разговоров из реальной жизни",
    libraryDescription: "Сначала слушайте, затем откройте transcript и проверьте пропущенные слова.",
    libraryBadge: "100 аудио · с transcript",
    search: "Найти разговор",
    noTrack: "Разговор не найден.",
    conversation: "Разговор",
    practice: "практика аудирования",
    method: "Метод практики",
    methods: ["Прослушайте один раз без текста.", "Запишите основные услышанные детали.", "Откройте transcript и переслушайте сложный фрагмент."],
    showTranscript: "Показать transcript",
    transcriptOpen: "Transcript открыт",
    transcriptLoading: "Загрузка transcript…",
    transcriptUnavailable: "Для этой записи transcript недоступен.",
    stepByStep: "По шагам",
    modelExample: "Пример",
    vocabulary: "Полезная лексика",
    traps: "Частые ошибки",
    vocabularyNext: "Следующая практика словаря",
    continueVocabulary: "Продолжить словарь IELTS",
    open: "Открыть",
    all: "Все",
    groups: { "Everyday life": "Повседневная жизнь", "Health & services": "Здоровье и услуги", "Work & travel": "Работа и поездки", "Social & feelings": "Общение и чувства" },
  },
  en: {
    back: "IELTS hub",
    testEyebrow: "Listening comprehension test",
    testTitle: "Listen once, then answer from memory",
    intro: "Listen to the recording once, then answer the questions. You'll get an estimated band.",
    aiUnlimited: "AI unlimited practice",
    aiUnlimitedDesc: "A brand-new test generated just for you, every time.",
    passages: "Practice tests",
    start: "Start test",
    tryAgain: "Try again",
    loading: "Preparing the test…",
    band: "Band",
    words: "words",
    questions: "questions",
    error: "Something went wrong. Please try again.",
    quotaOut: "You've used today's free AI actions. Upgrade to Premium for unlimited.",
    notConfigured: "AI practice isn't set up on this server yet.",
    pause: "Pause",
    play: "Play",
    playsOnce: "The recording plays once, as in the real exam. You can pause, and replay it after you submit.",
    hint: "Listen carefully — you answer from memory.",
    submit: "Submit answers",
    yourBand: "Your band",
    correct: "correct",
    newTest: "New test",
    leaveTest: "Practice tests",
    unanswered: "Answer every question",
    libraryEyebrow: "Audio practice library",
    libraryTitle: "100 real-world listening conversations",
    libraryDescription: "Listen first, then open the transcript to check the words you missed.",
    libraryBadge: "100 audio tracks · transcripts included",
    search: "Search a conversation",
    noTrack: "No conversation found.",
    conversation: "Conversation",
    practice: "listening practice",
    method: "Practice method",
    methods: ["Listen once without reading.", "Write down the key details you hear.", "Open the transcript and replay the difficult part."],
    showTranscript: "Show transcript",
    transcriptOpen: "Transcript open",
    transcriptLoading: "Loading transcript…",
    transcriptUnavailable: "Transcript is not available for this track.",
    stepByStep: "Step by step",
    modelExample: "Model example",
    vocabulary: "Vocabulary highlight",
    traps: "Common traps",
    vocabularyNext: "Vocabulary next",
    continueVocabulary: "Continue your IELTS vocabulary",
    open: "Open",
    all: "All",
    groups: { "Everyday life": "Everyday life", "Health & services": "Health & services", "Work & travel": "Work & travel", "Social & feelings": "Social & feelings" },
  },
} as const;

function formatTime(seconds: number) {
  const value = Math.max(0, Math.round(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function apiErrorMessage(error: unknown, locale: Locale) {
  const t = copy[locale];
  return error instanceof ApiError && error.status === 429 ? t.quotaOut : error instanceof ApiError && error.status === 503 ? t.notConfigured : t.error;
}

export function ListeningPracticeNative({ locale, token, onBack }: { locale: Locale; token: string | null; onBack: () => void }) {
  const t = copy[locale];
  const content = getIeltsSkill(locale, "listening");
  const resources = getIeltsResources(locale);
  const [test, setTest] = useState<IeltsGeneratedTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<IeltsGrade | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bank = useQuery({
    queryKey: ["ielts-listening-bank"],
    queryFn: () => request<IeltsBankItem[]>("/ielts/listening/bank", { token }),
    enabled: Boolean(token),
  });
  const submitMutation = useMutation({
    mutationFn: ({ testId, selected }: { testId: string; selected: number[] }) => request<IeltsGrade>("/ielts/listening/submit", { method: "POST", token, body: { test_id: testId, answers: selected } }),
    onSuccess: (grade) => {
      setResult(grade);
      setError(null);
      void bank.refetch();
    },
    onError: () => setError(t.error),
  });

  function begin(generated: IeltsGeneratedTest) {
    setTest(generated);
    setAnswers(new Array(generated.questions.length).fill(-1));
    setResult(null);
    setError(null);
  }

  async function start(source: "ai" | string) {
    if (!token || loadingId) return;
    setLoadingId(source);
    setError(null);
    try {
      begin(await request<IeltsGeneratedTest>(source === "ai" ? "/ielts/listening/generate" : `/ielts/listening/bank/${source}/start`, {
        method: "POST",
        token,
        body: source === "ai" ? { band: 6 } : undefined,
      }));
    } catch (caught) {
      setError(apiErrorMessage(caught, locale));
    } finally {
      setLoadingId(null);
    }
  }

  function closeTest() {
    setTest(null);
    setResult(null);
    setAnswers([]);
    setError(null);
  }

  return (
    <>
      <BackButton label={t.back} onPress={onBack} />
      <View style={styles.hero}>
        <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.watermark}>LISTENING</Text>
        <View style={styles.heroLabel}><Ionicons name="headset-outline" size={16} color={colors.teal} /><Text style={styles.heroLabelText}>{content.eyebrow}</Text></View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
        <View style={styles.stats}>{content.stats.map((stat) => <View key={stat.label} style={styles.stat}><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></View>)}</View>
      </View>

      <View style={styles.practiceHeading}><Text style={styles.eyebrow}>{t.testEyebrow}</Text><Text style={styles.practiceTitle}>{t.testTitle}</Text></View>
      {error ? <View accessibilityRole="alert" style={styles.errorCard}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
      <Text style={styles.intro}>{t.intro}</Text>

      <View style={styles.aiCard}>
        <View style={styles.aiIcon}><Ionicons name="sparkles" size={21} color={colors.rust} /></View>
        <View style={styles.flexOne}><Text style={styles.aiTitle}>{t.aiUnlimited}</Text><Text style={styles.aiBody}>{t.aiUnlimitedDesc}</Text></View>
        <Pressable accessibilityRole="button" disabled={!token || loadingId !== null} onPress={() => void start("ai")} style={({ pressed }) => [styles.startSmall, pressed && styles.pressed, (!token || loadingId !== null) && styles.disabled]}>
          {loadingId === "ai" ? <ActivityIndicator color={colors.onAccent} size="small" /> : <Text style={styles.startSmallText}>{t.start}</Text>}
        </Pressable>
      </View>

      <View style={styles.bankHeading}><Text style={styles.bankTitle}>📚 {t.passages}</Text>{bank.isFetching ? <ActivityIndicator color={colors.rust} size="small" /> : null}</View>
      {bank.isError ? <Pressable accessibilityRole="button" onPress={() => void bank.refetch()} style={styles.retryCard}><Text style={styles.errorText}>{t.error}</Text><Ionicons name="refresh" size={18} color={colors.rust} /></Pressable> : null}
      <View style={styles.bankList}>
        {bank.data?.map((item) => (
          <View key={item.id} style={styles.bankCard}>
            <View style={styles.flexOne}>
              <Text style={styles.bankItemTitle}>{item.done ? "✓ " : ""}{item.title}</Text>
              <View style={styles.bankMeta}><Text style={styles.bandBadge}>{t.band} {item.band.toFixed(1)}</Text><Text style={styles.bankMetaText}>{item.word_count} {t.words} · {item.question_count} {t.questions}</Text></View>
            </View>
            <Pressable accessibilityRole="button" disabled={loadingId !== null} onPress={() => void start(item.id)} style={({ pressed }) => [styles.bankButton, item.done && styles.bankButtonDone, pressed && styles.pressed]}>
              {loadingId === item.id ? <ActivityIndicator color={colors.onAccent} size="small" /> : <Text style={[styles.bankButtonText, item.done && styles.bankButtonTextDone]}>{item.done ? t.tryAgain : t.start}</Text>}
            </Pressable>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionNav}>{content.sections.map((section) => <View key={section.id} style={styles.sectionPill}><Text style={styles.sectionPillText}>{section.title}</Text></View>)}</ScrollView>
      <View style={styles.guideList}>{content.sections.map((section) => <GuideSection key={section.id} section={section} locale={locale} />)}</View>

      <ListeningAudioLibrary locale={locale} />

      <View style={styles.resourceHeading}><View style={styles.resourceIcon}><Ionicons name="bookmarks-outline" size={20} color={colors.teal} /></View><View style={styles.flexOne}><Text style={styles.eyebrow}>{t.vocabularyNext}</Text><Text style={styles.resourceTitle}>{t.continueVocabulary}</Text></View></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resourceList}>{resources.map((resource) => <Pressable key={resource.slug} accessibilityRole="link" onPress={() => router.push(`/ielts/resource/${resource.slug}`)} style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}><Text style={styles.resourceEyebrow}>{resource.eyebrow}</Text><Text style={styles.resourceCardTitle}>{resource.title}</Text><View style={styles.resourceOpen}><Text style={styles.resourceOpenText}>{t.open}</Text><Ionicons name="arrow-forward" size={16} color={colors.rustDark} /></View></Pressable>)}</ScrollView>

      <Modal visible={Boolean(test)} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeTest}>
        {test ? <ActiveListeningTest locale={locale} token={token} test={test} answers={answers} setAnswers={setAnswers} result={result} error={error} pending={submitMutation.isPending} onClose={closeTest} onSubmit={() => submitMutation.mutate({ testId: test.test_id, selected: answers })} /> : null}
      </Modal>
    </>
  );
}

function ActiveListeningTest({ locale, token, test, answers, setAnswers, result, error, pending, onClose, onSubmit }: {
  locale: Locale;
  token: string | null;
  test: IeltsGeneratedTest;
  answers: number[];
  setAnswers: React.Dispatch<React.SetStateAction<number[]>>;
  result: IeltsGrade | null;
  error: string | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = copy[locale];
  const [secondsLeft, setSecondsLeft] = useState(360);
  const [audioFinished, setAudioFinished] = useState(false);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const source = useMemo<{ uri: string; headers?: Record<string, string> }>(() => {
    const uri = `${API_URL}/api/v1/ielts/listening/${test.test_id}/audio`;
    return token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
  }, [test.test_id, token]);
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const played = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: "doNotMix" });
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => player.play(), 400);
    return () => clearTimeout(timer);
  }, [player]);
  useEffect(() => {
    if (status.didJustFinish) setAudioFinished(true);
  }, [status.didJustFinish]);
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => setSecondsLeft((value) => {
      if (value <= 1) {
        clearInterval(timer);
        submitRef.current();
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [result]);

  function toggleAudio() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (audioFinished && !result) return;
    if (audioFinished && result) {
      void player.seekTo(0).then(() => player.play());
      return;
    }
    player.play();
  }

  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.testSafe}>
      <View style={styles.testHeader}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.testBack}><Ionicons name="arrow-back" size={18} color={colors.muted} /><Text style={styles.testBackText}>{t.leaveTest}</Text></Pressable>
        {!result ? <View style={[styles.timerBadge, secondsLeft < 60 && styles.timerDanger]}><Ionicons name="time-outline" size={16} color={secondsLeft < 60 ? colors.danger : colors.rustDark} /><Text style={[styles.timerText, secondsLeft < 60 && styles.timerDangerText]}>{formatTime(secondsLeft)}</Text></View> : null}
      </View>
      <View style={styles.audioExamCard}>
        <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? t.pause : t.play} disabled={audioFinished && !result} onPress={toggleAudio} style={[styles.audioRoundButton, audioFinished && !result && styles.disabled]}><Ionicons name={status.playing ? "pause" : "play"} size={22} color={colors.onAccent} /></Pressable>
        <View style={styles.flexOne}>
          <View style={styles.audioTitleRow}><Text numberOfLines={1} style={styles.audioExamTitle}>{test.title}</Text>{status.duration > 0 ? <Text style={styles.audioTime}>{formatTime(status.currentTime)} / {formatTime(status.duration)}</Text> : status.isBuffering ? <ActivityIndicator color={colors.rust} size="small" /> : null}</View>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(played * 100) }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${played * 100}%` }]} /></View>
          <Text style={styles.audioHint}>{result ? t.hint : t.playsOnce}</Text>
        </View>
      </View>
      {error ? <View accessibilityRole="alert" style={[styles.errorCard, styles.modalError]}><Text style={styles.errorText}>{error}</Text></View> : null}
      <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
        {result ? <ResultCard locale={locale} result={result} onClose={onClose} /> : null}
        {test.questions.map((question, questionIndex) => (
          <View key={`${question.prompt}-${questionIndex}`} style={styles.questionCard}>
            <View style={styles.questionHeading}><View style={styles.questionNumber}><Text style={styles.questionNumberText}>{questionIndex + 1}</Text></View><Text style={styles.questionText}>{question.prompt}</Text></View>
            <View style={styles.optionList}>{question.options.map((option, optionIndex) => {
              const selected = answers[questionIndex] === optionIndex;
              const correct = result?.answers[questionIndex] === optionIndex;
              const wrong = Boolean(result && selected && !correct);
              return <Pressable key={`${option}-${optionIndex}`} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: Boolean(result) }} disabled={Boolean(result)} onPress={() => setAnswers((previous) => previous.map((value, index) => index === questionIndex ? optionIndex : value))} style={({ pressed }) => [styles.option, selected && !result && styles.optionSelected, correct && styles.optionCorrect, wrong && styles.optionWrong, pressed && styles.pressed]}><View style={[styles.optionLetter, selected && !result && styles.optionLetterSelected, correct && styles.optionLetterCorrect, wrong && styles.optionLetterWrong]}><Text style={[styles.optionLetterText, (selected || correct || wrong) && styles.optionLetterTextActive]}>{String.fromCharCode(65 + optionIndex)}</Text></View><Text style={[styles.optionText, correct && styles.correctText, wrong && styles.wrongText]}>{option}</Text>{correct ? <Ionicons name="checkmark-circle" size={18} color={colors.teal} /> : wrong ? <Ionicons name="close-circle" size={18} color={colors.danger} /> : null}</Pressable>;
            })}</View>
            {result?.explanations?.[questionIndex] ? <Text style={styles.explanation}>{result.explanations[questionIndex]}</Text> : null}
          </View>
        ))}
        {!result ? <View style={styles.submitArea}><Text style={styles.answerProgress}>{answers.filter((answer) => answer >= 0).length}/{answers.length} · {answers.some((answer) => answer < 0) ? t.unanswered : t.submit}</Text><Button loading={pending} disabled={answers.some((answer) => answer < 0)} onPress={onSubmit}>{t.submit}</Button></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultCard({ locale, result, onClose }: { locale: Locale; result: IeltsGrade; onClose: () => void }) {
  const t = copy[locale];
  return <View style={styles.resultCard}><Text style={styles.resultLabel}>{t.yourBand}</Text><Text style={styles.resultBand}>{result.band.toFixed(1)}</Text><Text style={styles.resultMeta}>{result.correct} / {result.total} {t.correct} · +{result.reward.xp_gained} XP</Text><Button onPress={onClose}>{t.newTest}</Button></View>;
}

function ConversationPlayer({ track, playLabel, pauseLabel }: { track: ListeningTrack; playLabel: string; pauseLabel: string }) {
  const source = useMemo(() => `https://vocora.uz/audio/conversations/${track.file}`, [track.file]);
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const played = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return (
    <View style={styles.libraryPlayer}>
      <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? pauseLabel : playLabel} onPress={() => status.playing ? player.pause() : player.play()} style={styles.audioRoundButton}><Ionicons name={status.playing ? "pause" : "play"} size={22} color={colors.onAccent} /></Pressable>
      <View style={styles.flexOne}>
        <View style={styles.audioTitleRow}><Text style={styles.audioTime}>{formatTime(status.currentTime)} / {formatTime(status.duration)}</Text>{status.isBuffering ? <ActivityIndicator color={colors.rust} size="small" /> : null}</View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${played * 100}%` }]} /></View>
        <View style={styles.seekRow}><Pressable accessibilityRole="button" accessibilityLabel="Back 10 seconds" onPress={() => void player.seekTo(Math.max(0, status.currentTime - 10))}><Ionicons name="play-back" size={20} color={colors.muted} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Forward 10 seconds" onPress={() => void player.seekTo(Math.min(status.duration, status.currentTime + 10))}><Ionicons name="play-forward" size={20} color={colors.muted} /></Pressable></View>
      </View>
    </View>
  );
}

function ListeningAudioLibrary({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<(typeof LISTENING_GROUPS)[number]>("All");
  const [selected, setSelected] = useState<ListeningTrack>(LISTENING_TRACKS[0]);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return LISTENING_TRACKS.filter((track) => (group === "All" || track.group === group) && (!normalized || track.title.toLowerCase().includes(normalized) || String(track.number).includes(normalized)));
  }, [group, query]);

  function choose(track: ListeningTrack) {
    setSelected(track);
    setTranscript(null);
  }
  async function showTranscript() {
    if (transcript || transcriptLoading) return;
    setTranscriptLoading(true);
    try {
      const response = await fetch(`https://vocora.uz/audio/conversation-scripts/${selected.file.replace(/\.mp3$/, ".txt")}`);
      if (!response.ok) throw new Error("unavailable");
      setTranscript(await response.text());
    } catch {
      setTranscript(t.transcriptUnavailable);
    } finally {
      setTranscriptLoading(false);
    }
  }

  const groupLabel = (value: "All" | ListeningTrackGroup) => value === "All" ? t.all : t.groups[value];
  return (
    <View style={styles.librarySection}>
      <View style={styles.libraryHeading}><Text style={styles.eyebrow}>{t.libraryEyebrow}</Text><Text style={styles.libraryTitle}>{t.libraryTitle}</Text><Text style={styles.libraryDescription}>{t.libraryDescription}</Text><View style={styles.libraryBadge}><Text style={styles.libraryBadgeText}>{t.libraryBadge}</Text></View></View>
      <View style={styles.libraryPanel}>
        <View style={styles.searchBox}><Ionicons name="search" size={18} color={colors.muted} /><TextInput accessibilityLabel={t.search} value={query} onChangeText={setQuery} placeholder={t.search} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupList}>{LISTENING_GROUPS.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: group === item }} onPress={() => setGroup(item)} style={[styles.groupChip, group === item && styles.groupChipActive]}><Text style={[styles.groupChipText, group === item && styles.groupChipTextActive]}>{groupLabel(item)}</Text></Pressable>)}</ScrollView>
        <IndependentScrollContext.Provider value={null}>
          <FlatList data={filtered} keyExtractor={(track) => track.file} initialNumToRender={12} maxToRenderPerBatch={8} updateCellsBatchingPeriod={40} windowSize={5} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.trackList} contentContainerStyle={styles.trackListContent} showsVerticalScrollIndicator ListEmptyComponent={<Text style={styles.noTrack}>{t.noTrack}</Text>} renderItem={({ item: track }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected.file === track.file }} onPress={() => choose(track)} style={[styles.trackRow, selected.file === track.file && styles.trackRowActive]}><View style={styles.trackNumber}><Text style={styles.trackNumberText}>{String(track.number).padStart(2, "0")}</Text></View><View style={styles.flexOne}><Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text><Text style={styles.trackGroup}>{groupLabel(track.group)}</Text></View>{selected.file === track.file ? <Ionicons name="volume-high" size={17} color={colors.rust} /> : null}</Pressable>} />
        </IndependentScrollContext.Provider>
      </View>
      <View style={styles.selectedTrackCard}>
        <View style={styles.selectedHeading}><View style={styles.selectedIcon}><Ionicons name="headset" size={22} color={colors.teal} /></View><View style={styles.flexOne}><Text style={styles.eyebrow}>{t.conversation} {String(selected.number).padStart(2, "0")}</Text><Text style={styles.selectedTitle}>{selected.title}</Text><Text style={styles.selectedGroup}>{groupLabel(selected.group)} {t.practice}</Text></View></View>
        <ConversationPlayer key={selected.file} track={selected} playLabel={t.play} pauseLabel={t.pause} />
        <View style={styles.methodCard}><Text style={styles.methodTitle}>{t.method}</Text>{t.methods.map((method, index) => <View key={method} style={styles.methodRow}><Text style={styles.methodNumber}>{index + 1}.</Text><Text style={styles.methodText}>{method}</Text></View>)}</View>
        <Pressable accessibilityRole="button" onPress={() => void showTranscript()} style={styles.transcriptButton}>{transcriptLoading ? <ActivityIndicator color={colors.rust} size="small" /> : <Ionicons name="document-text-outline" size={18} color={colors.rustDark} />}<Text style={styles.transcriptButtonText}>{transcriptLoading ? t.transcriptLoading : transcript ? t.transcriptOpen : t.showTranscript}</Text></Pressable>
        {transcript ? <Text selectable style={styles.transcript}>{transcript}</Text> : null}
      </View>
    </View>
  );
}

function GuideSection({ section, locale }: { section: IeltsGuideSection; locale: Locale }) {
  const t = copy[locale];
  return <View style={styles.guide}><Text style={styles.guideEyebrow}>{section.eyebrow}</Text><Text style={styles.guideTitle}>{section.title}</Text><Text style={styles.guideDescription}>{section.description}</Text>{section.steps?.length ? <Detail icon="list-outline" title={t.stepByStep}>{section.steps.map((step, index) => <View key={step} style={styles.stepRow}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.detailText}>{step}</Text></View>)}</Detail> : null}{section.example ? <Detail icon="chatbox-ellipses-outline" title={t.modelExample} tone="teal"><Text style={styles.exampleText}>{section.example}</Text></Detail> : null}{section.vocabulary?.length ? <Detail icon="sparkles-outline" title={t.vocabulary}><View style={styles.chips}>{section.vocabulary.map((item) => <Text key={item} style={styles.chip}>{item}</Text>)}</View></Detail> : null}{section.traps?.length ? <Detail icon="warning-outline" title={t.traps} tone="rust">{section.traps.map((trap) => <View key={trap} style={styles.stepRow}><Ionicons name="radio-button-on" size={13} color={colors.rust} style={styles.trapIcon} /><Text style={styles.detailText}>{trap}</Text></View>)}</Detail> : null}</View>;
}

function Detail({ icon, title, tone, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; tone?: "teal" | "rust"; children: ReactNode }) {
  return <View style={[styles.detailBlock, tone === "teal" && styles.tealBlock, tone === "rust" && styles.rustBlock]}><View style={styles.detailHeading}><Ionicons name={icon} size={17} color={tone === "rust" ? colors.rust : colors.teal} /><Text style={styles.detailTitle}>{title}</Text></View>{children}</View>;
}

const styles = StyleSheet.create({
  flexOne: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  disabled: { opacity: 0.5 },
  hero: { position: "relative", gap: 14, overflow: "hidden", padding: 19, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.17, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  watermark: { position: "absolute", right: -12, top: -10, fontFamily: fonts.display, fontSize: 64, letterSpacing: 1, color: "rgba(185,78,40,0.07)" },
  heroLabel: { alignSelf: "flex-start", minHeight: 32, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.teal, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.10)" },
  heroLabelText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.teal },
  title: { maxWidth: 315, fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: 0.45, textTransform: "uppercase", color: colors.ink },
  description: { maxWidth: 320, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  stats: { flexDirection: "row", gap: 7, marginTop: 2, padding: 7, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  stat: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", padding: 7, borderRadius: 9, backgroundColor: colors.raised },
  statValue: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: 0.4, color: colors.ink },
  statLabel: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 8.5, lineHeight: 12, textAlign: "center", textTransform: "uppercase", color: colors.muted },
  eyebrow: { fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 14, letterSpacing: 0.75, textTransform: "uppercase", color: colors.teal },
  practiceHeading: { gap: 5, marginTop: 2 },
  practiceTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: 0.35, color: colors.ink },
  intro: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  errorCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderWidth: 1, borderColor: "rgba(220,38,38,0.35)", borderRadius: 11, backgroundColor: "rgba(220,38,38,0.06)" },
  errorText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 18, color: colors.danger },
  aiCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderWidth: 1.5, borderColor: "rgba(185,78,40,0.4)", borderRadius: 14, backgroundColor: "rgba(185,78,40,0.07)" },
  aiIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.raised },
  aiTitle: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  aiBody: { marginTop: 2, fontFamily: fonts.ui, fontSize: 10.5, lineHeight: 15, color: colors.muted },
  startSmall: { minHeight: 48, minWidth: 72, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderWidth: 1, borderColor: colors.brand950, borderRadius: 9, backgroundColor: colors.rust },
  startSmallText: { fontFamily: fonts.uiBold, fontSize: 10, textAlign: "center", color: colors.onAccent },
  bankHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bankTitle: { fontFamily: fonts.uiBold, fontSize: 12, letterSpacing: 0.45, textTransform: "uppercase", color: colors.muted },
  retryCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.cream },
  bankList: { gap: 9 },
  bankCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  bankItemTitle: { fontFamily: fonts.uiBold, fontSize: 12.5, lineHeight: 18, color: colors.ink },
  bankMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 5 },
  bandBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, backgroundColor: "rgba(70,120,120,0.10)", fontFamily: fonts.uiBold, fontSize: 9, color: colors.teal },
  bankMetaText: { fontFamily: fonts.uiMedium, fontSize: 9.5, color: colors.muted },
  bankButton: { minHeight: 48, minWidth: 72, alignItems: "center", justifyContent: "center", paddingHorizontal: 9, borderWidth: 1, borderColor: colors.brand950, borderRadius: 9, backgroundColor: colors.rust },
  bankButtonDone: { borderColor: colors.line, backgroundColor: colors.raised },
  bankButtonText: { fontFamily: fonts.uiBold, fontSize: 9.5, textAlign: "center", color: colors.onAccent },
  bankButtonTextDone: { color: colors.ink },
  sectionNav: { gap: 7, paddingVertical: 2 },
  sectionPill: { maxWidth: 230, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: "rgba(255,248,234,0.66)" },
  sectionPillText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  guideList: { gap: 13 },
  guide: { gap: 11, padding: 17, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  guideEyebrow: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase", color: colors.teal },
  guideTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 29, letterSpacing: 0.35, color: colors.ink },
  guideDescription: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 21, color: colors.muted },
  detailBlock: { gap: 10, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised },
  tealBlock: { borderColor: "rgba(70,120,120,0.42)", backgroundColor: "rgba(70,120,120,0.07)" },
  rustBlock: { borderColor: "rgba(185,78,40,0.38)", backgroundColor: "rgba(185,78,40,0.07)" },
  detailHeading: { flexDirection: "row", alignItems: "center", gap: 7 },
  detailTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 10.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.ink },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNumber: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: "rgba(185,78,40,0.12)" },
  stepNumberText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.brand600 },
  trapIcon: { marginTop: 3, marginHorizontal: 5 },
  detailText: { flex: 1, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  exampleText: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "rgba(70,120,120,0.42)", fontFamily: fonts.uiMedium, fontSize: 12.5, lineHeight: 20, color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: colors.brand200, borderRadius: 7, backgroundColor: "rgba(185,78,40,0.08)", fontFamily: fonts.uiBold, fontSize: 10.5, lineHeight: 15, color: colors.ink },
  librarySection: { gap: 13, marginTop: 5 },
  libraryHeading: { gap: 5 },
  libraryTitle: { fontFamily: fonts.display, fontSize: 29, lineHeight: 32, color: colors.ink },
  libraryDescription: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  libraryBadge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.cream },
  libraryBadgeText: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.muted },
  libraryPanel: { gap: 10, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  searchBox: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised },
  searchInput: { flex: 1, fontFamily: fonts.ui, fontSize: 13, color: colors.ink },
  groupList: { gap: 6, paddingVertical: 1 },
  groupChip: { justifyContent: "center", paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.raised },
  groupChipActive: { borderColor: colors.rust, backgroundColor: colors.rust },
  groupChipText: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.muted },
  groupChipTextActive: { color: colors.onAccent },
  trackList: { height: 390 },
  trackListContent: { gap: 3, paddingRight: 3 },
  trackRow: { minHeight: 53, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: "transparent", borderRadius: 10 },
  trackRowActive: { borderColor: "rgba(185,78,40,0.38)", backgroundColor: "rgba(185,78,40,0.08)" },
  trackNumber: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.raised },
  trackNumberText: { fontFamily: fonts.uiBold, fontSize: 9, color: colors.muted },
  trackTitle: { fontFamily: fonts.uiBold, fontSize: 11.5, color: colors.ink },
  trackGroup: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 8.5, color: colors.muted },
  noTrack: { padding: 20, fontFamily: fonts.uiMedium, fontSize: 12, textAlign: "center", color: colors.muted },
  selectedTrackCard: { gap: 15, padding: 17, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  selectedHeading: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  selectedIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised },
  selectedTitle: { marginTop: 3, fontFamily: fonts.display, fontSize: 26, lineHeight: 29, color: colors.ink },
  selectedGroup: { marginTop: 3, fontFamily: fonts.uiMedium, fontSize: 10.5, color: colors.muted },
  libraryPlayer: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.raised },
  audioRoundButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand950, borderRadius: 24, backgroundColor: colors.rust },
  audioTitleRow: { minHeight: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  audioTime: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.muted },
  progressTrack: { height: 6, overflow: "hidden", marginTop: 6, borderRadius: 3, backgroundColor: "rgba(84,37,15,0.15)" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.rust },
  seekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  methodCard: { gap: 7, padding: 13, borderWidth: 1, borderColor: "rgba(185,78,40,0.28)", borderRadius: 11, backgroundColor: "rgba(185,78,40,0.06)" },
  methodTitle: { fontFamily: fonts.uiBold, fontSize: 9.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.rustDark },
  methodRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  methodNumber: { fontFamily: fonts.uiBold, fontSize: 11.5, color: colors.rust },
  methodText: { flex: 1, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 17, color: colors.muted },
  transcriptButton: { alignSelf: "flex-start", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  transcriptButtonText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.ink },
  transcript: { padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 12, lineHeight: 20, color: colors.ink },
  resourceHeading: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 4 },
  resourceIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.cream },
  resourceTitle: { marginTop: 2, fontFamily: fonts.display, fontSize: 24, lineHeight: 27, color: colors.ink },
  resourceList: { gap: 10, paddingBottom: 8 },
  resourceCard: { width: 190, minHeight: 155, justifyContent: "space-between", padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  resourceEyebrow: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase", color: colors.teal },
  resourceCardTitle: { marginTop: 9, fontFamily: fonts.display, fontSize: 22, lineHeight: 25, color: colors.ink },
  resourceOpen: { flexDirection: "row", alignItems: "center", gap: 5 },
  resourceOpenText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.rustDark },
  testSafe: { flex: 1, backgroundColor: colors.paper },
  testHeader: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.raised },
  testBack: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 },
  testBackText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 15, backgroundColor: "rgba(185,78,40,0.10)" },
  timerDanger: { backgroundColor: "rgba(220,38,38,0.10)" },
  timerText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.rustDark },
  timerDangerText: { color: colors.danger },
  audioExamCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.cream },
  audioExamTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  audioHint: { marginTop: 6, fontFamily: fonts.uiMedium, fontSize: 9.5, lineHeight: 14, color: colors.muted },
  modalError: { margin: 12 },
  questionScroll: { gap: 12, padding: 14, paddingBottom: 40 },
  questionCard: { gap: 11, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  questionHeading: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  questionNumber: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.raised },
  questionNumberText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  questionText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 12.5, lineHeight: 19, color: colors.ink },
  optionList: { gap: 7 },
  option: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised },
  optionSelected: { borderColor: colors.rust, backgroundColor: "rgba(185,78,40,0.08)" },
  optionCorrect: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,0.09)" },
  optionWrong: { borderColor: colors.danger, backgroundColor: "rgba(220,38,38,0.07)" },
  optionLetter: { width: 25, height: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 7 },
  optionLetterSelected: { borderColor: colors.rust, backgroundColor: colors.rust },
  optionLetterCorrect: { borderColor: colors.teal, backgroundColor: colors.teal },
  optionLetterWrong: { borderColor: colors.danger, backgroundColor: colors.danger },
  optionLetterText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  optionLetterTextActive: { color: colors.onAccent },
  optionText: { flex: 1, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 17, color: colors.ink },
  correctText: { color: colors.teal },
  wrongText: { color: colors.danger },
  explanation: { padding: 10, borderRadius: 9, backgroundColor: "rgba(185,78,40,0.06)", fontFamily: fonts.ui, fontSize: 11, lineHeight: 17, color: colors.muted },
  submitArea: { gap: 10, marginTop: 2 },
  answerProgress: { fontFamily: fonts.uiBold, fontSize: 10.5, textAlign: "center", color: colors.muted },
  resultCard: { alignItems: "center", gap: 7, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream },
  resultLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.muted },
  resultBand: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60, color: colors.teal },
  resultMeta: { marginBottom: 6, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
});
