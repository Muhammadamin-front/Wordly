import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from "react-native";

import { request, type WordLookupEntry, type WordLookupResponse } from "@/api/client";

import {
  READING_FULL_TESTS,
  READING_PRACTICE_TESTS,
  READING_QUESTION_TYPE_GUIDES,
  allReadingQuestions,
  getQuestionsForReadingQuestionType,
  getReadingQuestionTypeGuide,
  getReadingTest,
  readingBand,
  type ReadingPracticeTest,
  type ReadingQuestion,
  type ReadingQuestionTypeGuideId,
} from "@/ielts/reading-practice";
import type { Locale } from "@/i18n";
import { useScreenScroll } from "@/components/ui";
import { colors, fonts } from "@/theme/tokens";

type ReadingScreen = "library" | "focused" | "start" | "test" | "result";
type StudyMode = "practice" | "exam";
type AnswerValue = string | string[];
type HighlightColor = "yellow" | "green" | "blue" | "pink";
type Drawer = "notes" | "vocabulary" | null;
type Highlight = { id: string; passageId: string; paragraphIndex: number; start: number; end: number; text: string; color: HighlightColor };
type PassageNote = { id: string; quote: string; body: string };
type SavedVocabulary = { id: string; word: string; translation: string; definition: string; example: string; passageTitle: string; note: string; favourite: boolean; learned: boolean };
type ReadingHistory = { bestScore: number; lastScore: number; total: number; attempts: number; completed: boolean };

const highlightColors: Record<HighlightColor, string> = {
  yellow: "rgba(244,211,94,0.62)",
  green: "rgba(146,190,132,0.55)",
  blue: "rgba(125,184,196,0.48)",
  pink: "rgba(221,138,150,0.45)",
};

const advancedCopy = {
  uz: { notes: "Eslatmalarim", vocabulary: "Lug'at daftarim", clear: "Belgilashlarni tozalash", highlight: "So'zni belgilash uchun bosib turing", flag: "Ko'rib chiqish uchun belgilash", saved: "Saqlandi", saveWord: "Lug'atga saqlash", addNote: "Eslatma qo'shish", notePlaceholder: "Bu dalil haqida eslatma yozing…", saveNote: "Eslatmani saqlash", emptyNotes: "Hali eslatma yo'q", emptyVocabulary: "Hali saqlangan so'z yo'q", delete: "O'chirish", favourite: "Muhim", learned: "O'rganildi", markLearned: "O'rganildi deb belgilash", personalNote: "Shaxsiy eslatma", focused: "Maqsadli mashq", drillComplete: "Mashq tugadi", accuracy: "aniqlik", check: "Javobni tekshirish", nextQuestion: "Keyingi savol", seeResults: "Natijalarni ko'rish", retryDrill: "Shu turni qayta ishlash", chooseType: "Boshqa tur tanlash", source: "Manba matni", strategy: "Strategiya", correctFeedback: "To'g'ri. Dalilni yaxshi topdingiz.", wrongFeedback: "Hali emas. Dalilni diqqat bilan tekshiring.", progressRestored: "Oldingi progress tiklandi" },
  ru: { notes: "Мои заметки", vocabulary: "Мой словарь", clear: "Очистить выделения", highlight: "Удерживайте слово, чтобы выделить", flag: "Отметить для проверки", saved: "Сохранено", saveWord: "Сохранить слово", addNote: "Добавить заметку", notePlaceholder: "Напишите заметку к этому фрагменту…", saveNote: "Сохранить заметку", emptyNotes: "Заметок пока нет", emptyVocabulary: "Сохранённых слов пока нет", delete: "Удалить", favourite: "Важное", learned: "Изучено", markLearned: "Отметить изученным", personalNote: "Личная заметка", focused: "Целевая практика", drillComplete: "Практика завершена", accuracy: "точность", check: "Проверить ответ", nextQuestion: "Следующий вопрос", seeResults: "Показать результат", retryDrill: "Повторить этот тип", chooseType: "Выбрать другой тип", source: "Исходный текст", strategy: "Стратегия", correctFeedback: "Верно. Доказательство найдено точно.", wrongFeedback: "Не совсем. Внимательно проверьте доказательство.", progressRestored: "Предыдущий прогресс восстановлен" },
  en: { notes: "My notes", vocabulary: "My vocabulary", clear: "Clear highlights", highlight: "Long-press a word to highlight it", flag: "Mark for review", saved: "Saved", saveWord: "Save word", addNote: "Add note", notePlaceholder: "Write a note about this evidence…", saveNote: "Save note", emptyNotes: "No notes yet", emptyVocabulary: "No saved words yet", delete: "Delete", favourite: "Favourite", learned: "Learned", markLearned: "Mark learned", personalNote: "Personal note", focused: "Focused practice", drillComplete: "Drill complete", accuracy: "accuracy", check: "Check answer", nextQuestion: "Next question", seeResults: "See results", retryDrill: "Retry this type", chooseType: "Choose another type", source: "Source passage", strategy: "Strategy", correctFeedback: "Correct. Good evidence reading.", wrongFeedback: "Not quite. Check the evidence carefully.", progressRestored: "Previous progress restored" },
} as const;

const detailCopy = {
  uz: { best: "Eng yaxshi natija", attempts: "urinish", timeUsed: "Sarflangan vaqt", reviewMistakes: "Xatolarni ko'rish", showAll: "Barcha javoblar", nextTest: "Keyingi test", clearTitle: "Belgilashlarni tozalash?", clearBody: "Bu testdagi barcha rangli belgilashlar o'chiriladi.", cancel: "Bekor qilish", confirm: "Tozalash" },
  ru: { best: "Лучший результат", attempts: "попыток", timeUsed: "Затраченное время", reviewMistakes: "Разобрать ошибки", showAll: "Все ответы", nextTest: "Следующий тест", clearTitle: "Очистить выделения?", clearBody: "Все цветные выделения в этом тесте будут удалены.", cancel: "Отмена", confirm: "Очистить" },
  en: { best: "Best score", attempts: "attempts", timeUsed: "Time used", reviewMistakes: "Review mistakes", showAll: "Show all answers", nextTest: "Next test", clearTitle: "Clear highlights?", clearBody: "All coloured highlights in this test will be removed.", cancel: "Cancel", confirm: "Clear" },
} as const;

const STORAGE_PREFIX = "vocora-reading-native";

const PARTS = [
  { label: "Part 1", title: "Build confidence with a clear academic passage", testId: "academic-roof-gardens" },
  { label: "Part 2", title: "Follow denser ideas and precise evidence", testId: "academic-aerofoil" },
  { label: "Part 3", title: "Handle the most demanding academic questions", testId: "academic-libraries" },
] as const;

const copy = {
  uz: {
    label: "IELTS Reading practice",
    title: "Diqqat bilan o'qing. Dalil bilan isbotlang.",
    subtitle: "Original academic passages, computer-based test controls va o'zbek IELTS o'quvchilari uchun yaratilgan vocabulary practice.",
    journey: "Sizning Reading yo'lingiz",
    journeyBody: "Bitta passage bilan ko'nikma yarating, so'ng o'nta to'liq testdan birini imtihon sharoitida bajaring.",
    academic: "Academic Reading",
    fullLabel: "To'liq sinov test",
    fullTitle: "10 ta to'liq Academic testdan tanlang",
    typeLabel: "Maqsadli mashq",
    typeTitle: "Savol turlarini birma-bir o'zlashtiring",
    typeBody: "Formatni tanlang, strategiyani o'qing va javobni matndagi dalil bilan tekshiring.",
    generalLabel: "General Training",
    generalTitle: "Kundalik ingliz tili uchun amaliy Reading",
    generalBody: "Academic IELTS topshirmayapsizmi? E'lonlar, xizmatlar va amaliy ma'lumotlardan boshlang.",
    questions: "Savollar",
    time: "Vaqt",
    level: "Daraja",
    open: "Mashqni ochish",
    practiceType: "Shu turni mashq qilish",
    backLibrary: "Reading kutubxonasi",
    startTitle: "Mashq rejimini tanlang",
    startBody: "Practice rejimida izohlar bilan ishlang. Exam rejimida taymer va yakuniy natijaga e'tibor qarating.",
    practice: "Practice",
    exam: "Exam",
    passage: "Matn",
    pause: "Pauza",
    resume: "Davom etish",
    previous: "Oldingi passage",
    next: "Keyingi passage",
    submit: "Testni yakunlash",
    unanswered: "Javobsiz",
    result: "Reading natijangiz",
    correct: "to'g'ri",
    band: "Taxminiy band",
    tryAgain: "Qayta ishlash",
    another: "Boshqa test",
    yourAnswer: "Sizning javobingiz",
    correctAnswer: "To'g'ri javob",
    evidence: "Dalil",
    explanation: "Izoh",
    typeAnswer: "Javobni yozing",
    requiredChoice: "Variantni tanlang",
  },
  ru: {
    label: "IELTS Reading practice", title: "Читайте внимательно. Доказывайте текстом.", subtitle: "Оригинальные академические тексты, управление компьютерным тестом и словарь для подготовки к IELTS.", journey: "Ваш путь Reading", journeyBody: "Начните с одного текста, затем выполните один из десяти полных тестов.", academic: "Academic Reading", fullLabel: "Полный пробный тест", fullTitle: "Выберите один из 10 полных Academic тестов", typeLabel: "Целевая практика", typeTitle: "Осваивайте типы вопросов по одному", typeBody: "Выберите формат, изучите стратегию и проверяйте ответ доказательством из текста.", generalLabel: "General Training", generalTitle: "Практический Reading для повседневного английского", generalBody: "Начните с объявлений, услуг и практической информации.", questions: "Вопросы", time: "Время", level: "Уровень", open: "Открыть", practiceType: "Практиковать тип", backLibrary: "Библиотека Reading", startTitle: "Выберите режим", startBody: "Practice показывает объяснения, Exam фокусируется на времени и результате.", practice: "Practice", exam: "Exam", passage: "Текст", pause: "Пауза", resume: "Продолжить", previous: "Предыдущий текст", next: "Следующий текст", submit: "Завершить тест", unanswered: "Без ответа", result: "Ваш результат Reading", correct: "правильно", band: "Примерный band", tryAgain: "Повторить", another: "Другой тест", yourAnswer: "Ваш ответ", correctAnswer: "Правильный ответ", evidence: "Доказательство", explanation: "Объяснение", typeAnswer: "Введите ответ", requiredChoice: "Выберите вариант",
  },
  en: {
    label: "IELTS Reading practice", title: "Read closely. Prove it with evidence.", subtitle: "Original academic passages, computer-based test controls, and vocabulary practice built for IELTS learners.", journey: "Your Reading journey", journeyBody: "Build skill with one passage, then complete one of ten full tests under exam conditions.", academic: "Academic Reading", fullLabel: "Full mock test", fullTitle: "Choose from 10 full Academic tests", typeLabel: "Targeted practice", typeTitle: "Master question types one by one", typeBody: "Choose a format, follow its strategy, then verify every answer with evidence.", generalLabel: "General Training", generalTitle: "Practical Reading for everyday English", generalBody: "Start with notices, services, and practical information.", questions: "Questions", time: "Time", level: "Level", open: "Open practice", practiceType: "Practice this type", backLibrary: "Reading library", startTitle: "Choose a study mode", startBody: "Practice mode supports careful review. Exam mode keeps the focus on time and your final score.", practice: "Practice", exam: "Exam", passage: "Passage", pause: "Pause", resume: "Resume", previous: "Previous passage", next: "Next passage", submit: "Finish test", unanswered: "Unanswered", result: "Your Reading result", correct: "correct", band: "Estimated band", tryAgain: "Try again", another: "Another test", yourAnswer: "Your answer", correctAnswer: "Correct answer", evidence: "Evidence", explanation: "Explanation", typeAnswer: "Type your answer", requiredChoice: "Choose an option",
  },
} as const;

const answerKinds = new Set(["sentence-completion", "summary-completion", "table-completion", "form-completion", "diagram-labelling", "short-answer"]);

function questionIsCorrect(question: ReadingQuestion, value: AnswerValue | undefined) {
  if (Array.isArray(question.answer)) {
    return Array.isArray(value) && [...value].sort().join("|") === [...question.answer].sort().join("|");
  }
  if (Array.isArray(value) || !value) return false;
  const normalise = (entry: string) => entry.trim().toLocaleLowerCase().replace(/[.]/g, "");
  return [question.answer, ...(question.acceptedAnswers ?? [])].map(normalise).includes(normalise(value));
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`;
}

function questionCount(test: ReadingPracticeTest) {
  return allReadingQuestions(test).length;
}

export function ReadingPracticeNative({ locale, scope, onBack }: { locale: Locale; scope: string; onBack: () => void }) {
  const screenScroll = useScreenScroll();
  const t = copy[locale];
  const a = advancedCopy[locale];
  const [screen, setScreen] = useState<ReadingScreen>("library");
  const [partIndex, setPartIndex] = useState(0);
  const [selectedTestId, setSelectedTestId] = useState<string>(PARTS[0].testId);
  const [selectedQuestionType, setSelectedQuestionType] = useState<ReadingQuestionTypeGuideId>("matching-headings");
  const [mode, setMode] = useState<StudyMode>("practice");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [passageIndex, setPassageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, ReadingHistory>>({});
  const [result, setResult] = useState<{ score: number; total: number; unanswered: number; timeUsed: number } | null>(null);
  const [reviewMistakesOnly, setReviewMistakesOnly] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<PassageNote[]>([]);
  const [vocabulary, setVocabulary] = useState<SavedVocabulary[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [activeHighlight, setActiveHighlight] = useState<HighlightColor>("yellow");
  const [wordLookup, setWordLookup] = useState<Record<string, WordLookupEntry>>({});
  const [tappedWord, setTappedWord] = useState<{ word: string; entry: WordLookupEntry; example: string } | null>(null);
  const [noteQuote, setNoteQuote] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [restored, setRestored] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const submitRef = useRef<() => void>(() => undefined);
  const pendingQuestionId = useRef<string | null>(null);
  const questionsSheetY = useRef(0);
  const questionListY = useRef(0);
  const questionOffsets = useRef<Record<string, number>>({});

  const storageKey = (suffix: string, testId = selectedTestId) => `${STORAGE_PREFIX}:${scope}:${testId}:${suffix}`;

  const selectedTest = getReadingTest(selectedTestId);
  const allQuestions = useMemo(() => allReadingQuestions(selectedTest), [selectedTest]);
  const currentPassage = selectedTest.passages[Math.min(passageIndex, selectedTest.passages.length - 1)];
  const fullCompleted = READING_FULL_TESTS.filter((test) => completed.includes(test.id)).length;

  useEffect(() => {
    if (screen !== "test" || !currentPassage) return;
    const words = new Set<string>();
    currentPassage.paragraphs.forEach((paragraph) => {
      for (const match of paragraph.text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) words.add(match[0].toLowerCase());
    });
    const unresolved = [...words].filter((word) => !(word in wordLookup)).slice(0, 300);
    if (!unresolved.length) return;
    let cancelled = false;
    void request<WordLookupResponse>("/words/lookup", { method: "POST", body: { headwords: unresolved } }).then((response) => {
      if (!cancelled) setWordLookup((current) => ({ ...current, ...response.entries }));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [currentPassage, screen]); // wordLookup is intentionally retained across passages

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(`${STORAGE_PREFIX}:${scope}:completed`),
      AsyncStorage.getItem(`${STORAGE_PREFIX}:${scope}:history`),
    ]).then(([rawCompleted, rawHistory]) => {
      let restoredCompleted: string[] = [];
      try { restoredCompleted = rawCompleted ? JSON.parse(rawCompleted) as string[] : []; } catch { restoredCompleted = []; }
      let restoredHistory: Record<string, ReadingHistory> = {};
      try { restoredHistory = rawHistory ? JSON.parse(rawHistory) as Record<string, ReadingHistory> : {}; } catch { restoredHistory = {}; }
      setCompleted([...new Set([...restoredCompleted, ...Object.keys(restoredHistory).filter((id) => restoredHistory[id]?.completed)])]);
      setHistory(restoredHistory);
      setRestored(true);
    });
  }, [scope]);

  useEffect(() => {
    if (screen !== "test" || mode !== "exam" || paused || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [mode, paused, screen, secondsLeft]);

  useEffect(() => {
    if (screen === "test" && mode === "exam" && secondsLeft === 0) submitRef.current();
  }, [mode, screen, secondsLeft]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => screenScroll?.current?.scrollTo({ y: 0, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [screen, screenScroll, selectedTestId]);

  useEffect(() => {
    const questionId = pendingQuestionId.current;
    const offset = questionId ? questionOffsets.current[questionId] : undefined;
    if (!questionId || offset === undefined) return;
    pendingQuestionId.current = null;
    requestAnimationFrame(() => screenScroll?.current?.scrollTo({
      y: Math.max(0, questionsSheetY.current + questionListY.current + offset - 82),
      animated: true,
    }));
  }, [layoutVersion, passageIndex, screenScroll]);

  const openTest = (testId: string) => {
    setSelectedTestId(testId);
    setResult(null);
    setScreen("start");
  };

  const launch = async (nextMode: StudyMode, fresh = false) => {
    setMode(nextMode);
    const selected = getReadingTest(selectedTestId);
    const [savedAnswers, savedFlags, savedHighlights, savedNotes, savedVocabulary] = await Promise.all([
      AsyncStorage.getItem(storageKey("answers", selected.id)),
      AsyncStorage.getItem(storageKey("flags", selected.id)),
      AsyncStorage.getItem(storageKey("highlights", selected.id)),
      AsyncStorage.getItem(storageKey("notes", selected.id)),
      AsyncStorage.getItem(storageKey("vocabulary", selected.id)),
    ]);
    const parse = <T,>(raw: string | null, fallback: T): T => {
      try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
    };
    const nextAnswers = fresh ? {} : parse<Record<string, AnswerValue>>(savedAnswers, {});
    const nextFlags = fresh ? [] : parse<string[]>(savedFlags, []);
    setAnswers(nextAnswers);
    setFlagged(nextFlags);
    if (fresh) {
      await AsyncStorage.multiRemove([storageKey("answers", selected.id), storageKey("flags", selected.id)]);
    }
    setHighlights(parse(savedHighlights, []));
    setNotes(parse(savedNotes, []));
    setVocabulary(parse(savedVocabulary, []));
    setPassageIndex(0);
    setSecondsLeft(selected.minutes * 60);
    setPaused(false);
    setResult(null);
    setReviewMistakesOnly(false);
    setStartedAt(Date.now());
    setScreen("test");
  };

  function submit() {
    const score = allQuestions.filter((question) => questionIsCorrect(question, answers[question.id])).length;
    const unanswered = allQuestions.filter((question) => {
      const value = answers[question.id];
      return !value || (Array.isArray(value) && !value.length);
    }).length;
    const timeUsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setResult({ score, total: allQuestions.length, unanswered, timeUsed });
    setReviewMistakesOnly(false);
    setHistory((current) => {
      const prior = current[selectedTest.id];
      const next = {
        ...current,
        [selectedTest.id]: {
          bestScore: Math.max(prior?.bestScore ?? 0, score),
          lastScore: score,
          total: allQuestions.length,
          attempts: (prior?.attempts ?? 0) + 1,
          completed: true,
        },
      };
      void AsyncStorage.setItem(`${STORAGE_PREFIX}:${scope}:history`, JSON.stringify(next));
      return next;
    });
    setCompleted((current) => {
      const next = current.includes(selectedTest.id) ? current : [...current, selectedTest.id];
      void AsyncStorage.setItem(`${STORAGE_PREFIX}:${scope}:completed`, JSON.stringify(next));
      return next;
    });
    setScreen("result");
  }
  submitRef.current = submit;

  const persistAnswers = (next: Record<string, AnswerValue>) => { setAnswers(next); void AsyncStorage.setItem(storageKey("answers"), JSON.stringify(next)); };
  const persistFlags = (next: string[]) => { setFlagged(next); void AsyncStorage.setItem(storageKey("flags"), JSON.stringify(next)); };
  const persistHighlights = (next: Highlight[]) => { setHighlights(next); void AsyncStorage.setItem(storageKey("highlights"), JSON.stringify(next)); };
  const persistNotes = (next: PassageNote[]) => { setNotes(next); void AsyncStorage.setItem(storageKey("notes"), JSON.stringify(next)); };
  const persistVocabulary = (next: SavedVocabulary[]) => { setVocabulary(next); void AsyncStorage.setItem(storageKey("vocabulary"), JSON.stringify(next)); };

  const goBack = () => {
    if (screen === "library") onBack();
    else setScreen("library");
  };

  const navigateToQuestion = (question: ReadingQuestion) => {
    const targetPassage = selectedTest.passages.findIndex((item) => item.questions.some((candidate) => candidate.id === question.id));
    if (targetPassage < 0) return;
    setActiveQuestionId(question.id);
    pendingQuestionId.current = question.id;
    if (targetPassage !== passageIndex) {
      questionOffsets.current = {};
      setPassageIndex(targetPassage);
    } else {
      setLayoutVersion((value) => value + 1);
    }
  };

  if (screen === "focused") {
    return <FocusedPracticeNative locale={locale} typeId={selectedQuestionType} onBack={() => setScreen("library")} />;
  }

  if (screen === "library") {
    const part = PARTS[partIndex];
    const partTest = getReadingTest(part.testId);
    const general = getReadingTest("general-training-community");
    return (
      <View style={styles.page}>
        <BackControl label="IELTS" onPress={onBack} />
        <View style={styles.hero}>
          <View style={styles.heroLabel}><Ionicons name="search-outline" size={15} color={colors.teal} /><Text style={styles.heroLabelText}>{t.label}</Text></View>
          <Text style={styles.heroTitle}>{t.title}</Text>
          <Text style={styles.heroBody}>{t.subtitle}</Text>
          <View style={styles.journey}>
            <View style={styles.journeyTop}><View><Text style={styles.journeyLabel}>{t.journey}</Text><Text style={styles.journeyScore}>{fullCompleted}<Text style={styles.journeyTotal}>/10</Text></Text></View><View style={styles.journeyIcon}><Ionicons name="library-outline" size={22} color={colors.teal} /></View></View>
            <Text style={styles.journeyBody}>{t.journeyBody}</Text>
            {restored && fullCompleted > 0 ? <View style={styles.restoredBadge}><Ionicons name="cloud-done-outline" size={14} color={colors.teal} /><Text style={styles.restoredText}>{a.progressRestored}</Text></View> : null}
          </View>
        </View>

        <View accessibilityRole="tablist" style={styles.segmented}>
          {PARTS.map((item, index) => (
            <Pressable key={item.label} accessibilityRole="tab" accessibilityState={{ selected: partIndex === index }} onPress={() => setPartIndex(index)} style={[styles.segment, partIndex === index && styles.segmentActive]}>
              <Text style={[styles.segmentText, partIndex === index && styles.segmentTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeading label={`${t.academic} · ${part.label}`} title={part.title} />
        <TestCard test={partTest} locale={locale} history={history[partTest.id]} onOpen={() => openTest(part.testId)} />

        <SectionHeading label={t.fullLabel} title={t.fullTitle} />
        <View style={styles.cardList}>{READING_FULL_TESTS.map((test) => <TestCard key={test.id} test={test} locale={locale} history={history[test.id]} onOpen={() => openTest(test.id)} />)}</View>

        <SectionHeading label={t.typeLabel} title={t.typeTitle} body={t.typeBody} />
        <View style={styles.cardList}>
          {READING_QUESTION_TYPE_GUIDES.map((guide) => {
            const items = getQuestionsForReadingQuestionType(guide.id);
            return (
              <View key={guide.id} style={styles.typeCard}>
                <View style={styles.typeTop}><Text style={styles.countStamp}>{items.length} questions</Text><Ionicons name="locate-outline" size={18} color={colors.teal} /></View>
                <Text style={styles.typeTitle}>{guide.title}</Text>
                <Text style={styles.typeBody}>{guide.description}</Text>
                <View style={styles.strategy}><Ionicons name="bulb-outline" size={16} color={colors.rust} /><Text style={styles.strategyText}>{guide.strategy[0]}</Text></View>
                <Pressable accessibilityRole="button" accessibilityLabel={`${t.practiceType}: ${guide.title}`} onPress={() => { setSelectedQuestionType(guide.id); setScreen("focused"); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{t.practiceType}</Text><Ionicons name="arrow-forward" size={16} color={colors.ink} /></Pressable>
              </View>
            );
          })}
        </View>

        <SectionHeading label={t.generalLabel} title={t.generalTitle} body={t.generalBody} />
        <TestCard test={general} locale={locale} history={history[general.id]} onOpen={() => openTest(general.id)} />
      </View>
    );
  }

  if (screen === "start") {
    return (
      <View style={styles.page}>
        <BackControl label={t.backLibrary} onPress={goBack} />
        <View style={styles.startHero}>
          <Text style={styles.trackStamp}>{selectedTest.track}</Text>
          <Text style={styles.startTitle}>{selectedTest.title}</Text>
          <Text style={styles.startDescription}>{selectedTest.description}</Text>
          <View style={styles.metaRow}><Meta icon="help-circle-outline" value={String(questionCount(selectedTest))} label={t.questions} /><Meta icon="time-outline" value={`${selectedTest.minutes}m`} label={t.time} /><Meta icon="speedometer-outline" value={selectedTest.level} label={t.level} /></View>
        </View>
        <SectionHeading label={t.startTitle} title={t.startBody} />
        <View style={styles.modeList}>
          <ModeCard icon="school-outline" title={t.practice} body={locale === "uz" ? "Matn va savollarni xotirjam tempda bajaring, so'ng har bir javobning dalilini ko'ring." : "Work carefully, then review the evidence for every answer."} onPress={() => void launch("practice")} />
          <ModeCard icon="timer-outline" title={t.exam} body={locale === "uz" ? "Taymer bilan imtihon sharoitida ishlang va yakunda band natijasini oling." : "Work against the timer and receive a band result at the end."} onPress={() => void launch("exam")} />
        </View>
      </View>
    );
  }

  if (screen === "result" && result) {
    const details = detailCopy[locale];
    const band = readingBand(result.score, result.total, selectedTest.track);
    const bandDisplay = band.approximate ? `${Math.max(0, band.band - 0.5).toFixed(1)}–${(band.band + 0.5).toFixed(1)}` : band.band.toFixed(1);
    const nextTestIndex = (READING_PRACTICE_TESTS.findIndex((test) => test.id === selectedTest.id) + 1) % READING_PRACTICE_TESTS.length;
    const reviewQuestions = reviewMistakesOnly ? allQuestions.filter((question) => !questionIsCorrect(question, answers[question.id])) : allQuestions;
    return (
      <View style={styles.page}>
        <BackControl label={t.backLibrary} onPress={() => setScreen("library")} />
        <View style={styles.resultHero}>
          <View style={styles.resultSeal}><Ionicons name="checkmark" size={25} color={colors.raised} /></View>
          <Text style={styles.resultLabel}>{t.result}</Text>
          <Text style={styles.resultScore}>{result.score}<Text style={styles.resultTotal}>/{result.total}</Text></Text>
          <Text style={styles.resultCaption}>{t.correct} · {result.unanswered} {t.unanswered.toLocaleLowerCase()}</Text>
          <Text style={styles.resultCaption}>{details.timeUsed}: {formatTime(result.timeUsed)}</Text>
          <View style={styles.bandBox}><Text style={styles.bandLabel}>{t.band}</Text><Text style={styles.bandValue}>{bandDisplay}</Text></View>
          <View style={styles.resultActions}>
            <Pressable accessibilityRole="button" onPress={() => void launch(mode, true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Ionicons name="refresh" size={17} color={colors.raised} /><Text style={styles.primaryButtonText}>{t.tryAgain}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: reviewMistakesOnly }} onPress={() => setReviewMistakesOnly((value) => !value)} style={({ pressed }) => [styles.secondaryButton, reviewMistakesOnly && styles.filterButtonActive, pressed && styles.pressed]}><Ionicons name="search-outline" size={16} color={colors.ink} /><Text style={styles.secondaryButtonText}>{reviewMistakesOnly ? details.showAll : details.reviewMistakes}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => openTest(READING_PRACTICE_TESTS[nextTestIndex].id)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{details.nextTest}</Text><Ionicons name="arrow-forward" size={16} color={colors.ink} /></Pressable>
            <Pressable accessibilityRole="button" onPress={() => setScreen("library")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{t.another}</Text></Pressable>
          </View>
        </View>
        <View style={styles.reviewList}>
          {reviewQuestions.map((question) => {
            const value = answers[question.id];
            const correct = questionIsCorrect(question, value);
            return (
              <View key={question.id} style={[styles.reviewCard, correct ? styles.reviewCorrect : styles.reviewWrong]}>
                <View style={styles.reviewTop}><Text style={styles.questionNumber}>Q{question.number}</Text><Ionicons name={correct ? "checkmark-circle" : "close-circle"} size={20} color={correct ? colors.teal : colors.rust} /></View>
                <Text style={styles.questionPrompt}>{question.prompt}</Text>
                <ReviewLine label={t.yourAnswer} value={Array.isArray(value) ? value.join(", ") : value || "—"} />
                {!correct ? <ReviewLine label={t.correctAnswer} value={Array.isArray(question.answer) ? question.answer.join(", ") : question.answer} /> : null}
                <ReviewLine label={t.evidence} value={question.evidence} />
                <ReviewLine label={t.explanation} value={question.explanation} />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const passage = currentPassage;
  const answeredCount = allQuestions.filter((question) => {
    const value = answers[question.id];
    return Boolean(value && (!Array.isArray(value) || value.length));
  }).length;

  const toggleHighlight = (range: Omit<Highlight, "id" | "color">) => {
    const existing = highlights.find((item) => item.passageId === range.passageId && item.paragraphIndex === range.paragraphIndex && item.start === range.start && item.end === range.end);
    const withoutOverlap = highlights.filter((item) => item.passageId !== range.passageId || item.paragraphIndex !== range.paragraphIndex || item.end <= range.start || item.start >= range.end);
    persistHighlights(existing?.color === activeHighlight ? withoutOverlap : [...withoutOverlap, { ...range, id: `${Date.now()}-${range.start}`, color: activeHighlight }]);
  };
  const openWord = (word: string, example: string) => {
    const entry = wordLookup[word.toLowerCase()];
    if (entry) setTappedWord({ word, entry, example });
  };
  const saveTappedWord = () => {
    if (!tappedWord) return;
    const translation = locale === "uz" ? tappedWord.entry.translation_uz : locale === "ru" ? tappedWord.entry.translation_ru : tappedWord.entry.definition_en;
    const item: SavedVocabulary = { id: `${Date.now()}-${tappedWord.word}`, word: tappedWord.word, translation: translation ?? "—", definition: tappedWord.entry.definition_en ?? "", example: tappedWord.example, passageTitle: passage.title, note: "", favourite: false, learned: false };
    persistVocabulary([item, ...vocabulary.filter((saved) => saved.word.toLowerCase() !== tappedWord.word.toLowerCase())]);
    setTappedWord(null);
    setDrawer("vocabulary");
  };
  const startNote = (quote: string) => { setNoteQuote(quote); setNoteDraft(""); setTappedWord(null); setDrawer("notes"); };
  const saveNote = () => {
    if (!noteQuote || !noteDraft.trim()) return;
    persistNotes([{ id: `${Date.now()}`, quote: noteQuote, body: noteDraft.trim() }, ...notes]);
    setNoteQuote(""); setNoteDraft("");
  };
  const confirmClearHighlights = () => {
    const details = detailCopy[locale];
    Alert.alert(details.clearTitle, details.clearBody, [
      { text: details.cancel, style: "cancel" },
      { text: details.confirm, style: "destructive", onPress: () => persistHighlights([]) },
    ]);
  };

  return (
    <View style={styles.page}>
      <BackControl label={t.backLibrary} onPress={() => setScreen("library")} />
      <View style={styles.testBar}>
        <View style={styles.testBarCopy}><Text numberOfLines={1} style={styles.testBarTitle}>{selectedTest.title}</Text><Text style={styles.testBarMeta}>{answeredCount}/{allQuestions.length} · {mode}</Text></View>
        {mode === "exam" ? <><View style={styles.timer}><Ionicons name="time-outline" size={16} color={secondsLeft < 300 ? colors.rust : colors.ink} /><Text style={[styles.timerText, secondsLeft < 300 && styles.timerDanger]}>{formatTime(secondsLeft)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={paused ? t.resume : t.pause} onPress={() => setPaused((value) => !value)} style={({ pressed }) => [styles.pauseButton, pressed && styles.pressed]}><Ionicons name={paused ? "play" : "pause"} size={17} color={colors.ink} /></Pressable></> : <View style={styles.practiceBadge}><Ionicons name="school-outline" size={15} color={colors.teal} /><Text style={styles.practiceBadgeText}>{t.practice}</Text></View>}
      </View>

      {paused ? (
        <View style={styles.pausedPanel}><Ionicons name="pause-circle-outline" size={38} color={colors.rust} /><Text style={styles.pausedTitle}>{t.pause}</Text><Pressable accessibilityRole="button" onPress={() => setPaused(false)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t.resume}</Text></Pressable></View>
      ) : (
        <>
          <View style={styles.annotationToolbar}>
            <View style={styles.annotationTop}><Text style={styles.annotationHint}>{a.highlight}</Text><View style={styles.annotationActions}><Pressable accessibilityRole="button" accessibilityLabel={a.notes} onPress={() => setDrawer("notes")} style={styles.toolButton}><Ionicons name="document-text-outline" size={17} color={colors.ink} /><Text style={styles.toolCount}>{notes.length}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={a.vocabulary} onPress={() => setDrawer("vocabulary")} style={styles.toolButton}><Ionicons name="bookmark-outline" size={17} color={colors.ink} /><Text style={styles.toolCount}>{vocabulary.length}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={a.clear} onPress={confirmClearHighlights} style={styles.toolButton}><Ionicons name="trash-outline" size={18} color={colors.rust} /></Pressable></View></View>
            <View style={styles.colorRow}>{(Object.keys(highlightColors) as HighlightColor[]).map((color) => <Pressable key={color} accessibilityRole="radio" accessibilityState={{ checked: activeHighlight === color }} accessibilityLabel={`${a.highlight}: ${color}`} onPress={() => setActiveHighlight(color)} style={[styles.colorButton, { backgroundColor: highlightColors[color] }, activeHighlight === color && styles.colorButtonActive]} />)}</View>
          </View>

          <View style={styles.passageSheet}>
            <Text style={styles.passageLabel}>{t.passage} {passageIndex + 1}/{selectedTest.passages.length}</Text>
            <Text style={styles.passageTitle}>{passage.title}</Text>
            <Text style={styles.passageSubtitle}>{passage.subtitle}</Text>
            <View style={styles.paragraphs}>{passage.paragraphs.map((paragraph, paragraphIndex) => <View key={paragraph.label} style={styles.paragraph}><Text style={styles.paragraphLabel}>{paragraph.label}</Text><InteractiveParagraph passageId={passage.id} paragraphIndex={paragraphIndex} text={paragraph.text} highlights={highlights} onHighlight={toggleHighlight} onWordPress={(word) => openWord(word, paragraph.text)} /></View>)}</View>
          </View>

          <View onLayout={(event) => { questionsSheetY.current = event.nativeEvent.layout.y; }} style={styles.questionsSheet}>
            <View style={styles.questionsHeader}><Text style={styles.questionsTitle}>{t.questions}</Text><Text style={styles.questionsProgress}>{passage.questions.filter((q) => answers[q.id]).length}/{passage.questions.length}</Text></View>
            <View onLayout={(event) => { questionListY.current = event.nativeEvent.layout.y; }} style={styles.questionList}>{passage.questions.map((question) => <QuestionCard key={question.id} question={question} value={answers[question.id]} locale={locale} active={activeQuestionId === question.id} flagged={flagged.includes(question.id)} onLayout={(event) => { questionOffsets.current[question.id] = event.nativeEvent.layout.y; if (pendingQuestionId.current === question.id) setLayoutVersion((value) => value + 1); }} onFlag={() => persistFlags(flagged.includes(question.id) ? flagged.filter((id) => id !== question.id) : [...flagged, question.id])} onChange={(value) => persistAnswers({ ...answers, [question.id]: value })} />)}</View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questionNavigator}><Text style={styles.navigatorLabel}>{answeredCount}/{allQuestions.length}</Text>{allQuestions.map((question) => { const value = answers[question.id]; const answered = Boolean(value && (!Array.isArray(value) || value.length)); return <Pressable key={question.id} accessibilityRole="button" accessibilityLabel={`Q${question.number}`} accessibilityState={{ selected: activeQuestionId === question.id }} onPress={() => navigateToQuestion(question)} style={[styles.navigatorButton, answered && styles.navigatorAnswered, flagged.includes(question.id) && styles.navigatorFlagged, activeQuestionId === question.id && styles.navigatorActive]}><Text style={[styles.navigatorNumber, answered && styles.navigatorNumberAnswered]}>{question.number}</Text>{flagged.includes(question.id) ? <View style={styles.flagDot} /> : null}</Pressable>; })}</ScrollView>

          <View style={styles.testActions}>
            {passageIndex > 0 ? <Pressable accessibilityRole="button" onPress={() => setPassageIndex((value) => value - 1)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={16} color={colors.ink} /><Text style={styles.secondaryButtonText}>{t.previous}</Text></Pressable> : null}
            {passageIndex < selectedTest.passages.length - 1 ? <Pressable accessibilityRole="button" onPress={() => setPassageIndex((value) => value + 1)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{t.next}</Text><Ionicons name="arrow-forward" size={16} color={colors.raised} /></Pressable> : <Pressable accessibilityRole="button" onPress={submit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{t.submit}</Text><Ionicons name="checkmark" size={17} color={colors.raised} /></Pressable>}
          </View>

          <Modal transparent visible={Boolean(tappedWord)} animationType="fade" onRequestClose={() => setTappedWord(null)}>
            <Pressable style={styles.popoverBackdrop} onPress={() => setTappedWord(null)}><Pressable accessibilityViewIsModal onPress={() => undefined} style={styles.wordPopover}>{tappedWord ? <><View style={styles.popoverHeading}><View style={styles.flexOne}><Text style={styles.popoverWord}>{tappedWord.word}</Text><Text style={styles.popoverTranslation}>{locale === "uz" ? tappedWord.entry.translation_uz : locale === "ru" ? tappedWord.entry.translation_ru : tappedWord.entry.definition_en}</Text></View><Pressable accessibilityRole="button" onPress={() => setTappedWord(null)} style={styles.popoverClose}><Ionicons name="close" size={19} color={colors.ink} /></Pressable></View><Text style={styles.popoverDefinition}>{tappedWord.entry.definition_en}</Text><View style={styles.popoverActions}><Pressable accessibilityRole="button" onPress={saveTappedWord} style={styles.popoverPrimary}><Ionicons name="bookmark-outline" size={16} color={colors.raised} /><Text style={styles.popoverPrimaryText}>{a.saveWord}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => startNote(tappedWord.word)} style={styles.popoverSecondary}><Ionicons name="document-text-outline" size={16} color={colors.ink} /><Text style={styles.popoverSecondaryText}>{a.addNote}</Text></Pressable></View></> : null}</Pressable></Pressable>
          </Modal>
          <ReadingDrawer locale={locale} drawer={drawer} notes={notes} vocabulary={vocabulary} noteQuote={noteQuote} noteDraft={noteDraft} onDrawer={setDrawer} onDraft={setNoteDraft} onSaveNote={saveNote} onClose={() => { setDrawer(null); setNoteQuote(""); setNoteDraft(""); }} onDeleteNote={(id) => persistNotes(notes.filter((note) => note.id !== id))} onUpdateVocabulary={(id, patch) => persistVocabulary(vocabulary.map((word) => word.id === id ? { ...word, ...patch } : word))} onDeleteVocabulary={(id) => persistVocabulary(vocabulary.filter((word) => word.id !== id))} />
        </>
      )}
    </View>
  );
}

function BackControl({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Ionicons name="arrow-back" size={19} color={colors.brown} /><Text style={styles.backText}>{label}</Text></Pressable>;
}

function SectionHeading({ label, title, body }: { label: string; title: string; body?: string }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>{label}</Text><Text style={styles.sectionTitle}>{title}</Text>{body ? <Text style={styles.sectionBody}>{body}</Text> : null}</View>;
}

function TestCard({ test, locale, history, onOpen }: { test: ReadingPracticeTest; locale: Locale; history?: ReadingHistory; onOpen: () => void }) {
  const t = copy[locale];
  const details = detailCopy[locale];
  return (
    <View style={styles.testCard}>
      <View style={styles.cardTop}><Text style={styles.trackStamp}>{test.track}</Text>{history?.completed ? <Ionicons name="checkmark-circle" size={21} color={colors.teal} /> : null}</View>
      <Text style={styles.cardTitle}>{test.title}</Text>
      <Text style={styles.cardBody}>{test.description}</Text>
      {history ? <View style={styles.scoreHistory}><Ionicons name="ribbon-outline" size={17} color={colors.teal} /><Text style={styles.scoreHistoryText}>{details.best}: {history.bestScore}/{history.total} · {Math.round(history.bestScore / Math.max(1, history.total) * 100)}% · {history.attempts} {details.attempts}</Text></View> : null}
      <View style={styles.metaRow}><Meta icon="help-circle-outline" value={String(questionCount(test))} label={t.questions} /><Meta icon="time-outline" value={`${test.minutes}m`} label={t.time} /><Meta icon="speedometer-outline" value={test.level} label={t.level} /></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${t.open}: ${test.title}`} onPress={onOpen} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{t.open}</Text><Ionicons name="arrow-forward" size={16} color={colors.raised} /></Pressable>
    </View>
  );
}

function Meta({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <View style={styles.meta}><Ionicons name={icon} size={15} color={colors.teal} /><View><Text numberOfLines={1} style={styles.metaValue}>{value}</Text><Text style={styles.metaLabel}>{label}</Text></View></View>;
}

function ModeCard({ icon, title, body, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}><View style={styles.modeIcon}><Ionicons name={icon} size={24} color={colors.brand600} /></View><Text style={styles.modeTitle}>{title}</Text><Text style={styles.modeBody}>{body}</Text><View style={styles.modeArrow}><Ionicons name="arrow-forward" size={17} color={colors.raised} /></View></Pressable>;
}

function QuestionCard({ question, value, locale, active = false, flagged = false, disabled = false, onLayout, onFlag, onChange }: { question: ReadingQuestion; value?: AnswerValue; locale: Locale; active?: boolean; flagged?: boolean; disabled?: boolean; onLayout?: (event: LayoutChangeEvent) => void; onFlag?: () => void; onChange: (value: AnswerValue) => void }) {
  const t = copy[locale];
  const a = advancedCopy[locale];
  const isMultiple = Array.isArray(question.answer);
  const toggleOption = (option: string) => {
    if (!isMultiple) return onChange(option);
    const selected = Array.isArray(value) ? value : [];
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  };

  return (
    <View onLayout={onLayout} style={[styles.questionCard, active && styles.questionCardActive]}>
      <View style={styles.questionTop}><Text style={styles.questionNumber}>Q{question.number}</Text><View style={styles.questionTopRight}><Text style={styles.questionKind}>{question.kind.replaceAll("-", " ")}</Text>{onFlag ? <Pressable accessibilityRole="button" accessibilityLabel={a.flag} accessibilityState={{ selected: flagged }} disabled={disabled} onPress={onFlag} style={[styles.flagButton, flagged && styles.flagButtonActive]}><Ionicons name={flagged ? "flag" : "flag-outline"} size={17} color={flagged ? colors.rust : colors.muted} /></Pressable> : null}</View></View>
      <Text style={styles.questionGroup}>{question.group}</Text>
      {question.instruction ? <Text style={styles.instruction}>{question.instruction}</Text> : null}
      <Text style={styles.questionPrompt}>{question.prompt}</Text>
      {question.options?.length ? (
        <View accessibilityRole={isMultiple ? undefined : "radiogroup"} style={styles.options}>
          {question.options.map((option) => {
            const selected = Array.isArray(value) ? value.includes(option.value) : value === option.value;
            return <Pressable key={option.value} accessibilityRole={isMultiple ? "checkbox" : "radio"} accessibilityState={{ checked: selected, disabled }} disabled={disabled} accessibilityLabel={option.label || t.requiredChoice} onPress={() => toggleOption(option.value)} style={({ pressed }) => [styles.option, selected && styles.optionSelected, disabled && styles.disabledOption, pressed && styles.pressed]}><View style={[styles.optionMark, selected && styles.optionMarkSelected]}>{selected ? <Ionicons name="checkmark" size={13} color={colors.raised} /> : null}</View><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text></Pressable>;
          })}
        </View>
      ) : answerKinds.has(question.kind) ? <TextInput accessibilityLabel={`${t.typeAnswer}: ${question.number}`} editable={!disabled} autoCapitalize="none" autoCorrect={false} onChangeText={onChange} placeholder={t.typeAnswer} placeholderTextColor={colors.muted} style={[styles.answerInput, disabled && styles.disabledOption]} value={typeof value === "string" ? value : ""} /> : null}
    </View>
  );
}

function InteractiveParagraph({ passageId, paragraphIndex, text, highlights, onHighlight, onWordPress }: { passageId: string; paragraphIndex: number; text: string; highlights: Highlight[]; onHighlight: (range: Omit<Highlight, "id" | "color">) => void; onWordPress: (word: string) => void }) {
  const parts: { text: string; start: number; end: number; word: boolean }[] = [];
  let cursor = 0;
  for (const match of text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: text.slice(cursor, start), start: cursor, end: start, word: false });
    parts.push({ text: match[0], start, end: start + match[0].length, word: true });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), start: cursor, end: text.length, word: false });
  const matching = highlights.filter((highlight) => highlight.passageId === passageId && highlight.paragraphIndex === paragraphIndex);
  return <Text selectable style={styles.paragraphText}>{parts.map((part, index) => { const highlight = matching.find((item) => item.start <= part.start && item.end >= part.end); return <Text key={`${part.start}-${index}`} onPress={part.word ? () => onWordPress(part.text) : undefined} onLongPress={part.word ? () => onHighlight({ passageId, paragraphIndex, start: part.start, end: part.end, text: part.text }) : undefined} style={highlight ? { backgroundColor: highlightColors[highlight.color] } : undefined}>{part.text}</Text>; })}</Text>;
}

function hasAnswer(value: AnswerValue | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
}

function FocusedPracticeNative({ locale, typeId, onBack }: { locale: Locale; typeId: ReadingQuestionTypeGuideId; onBack: () => void }) {
  const t = copy[locale];
  const a = advancedCopy[locale];
  const guide = getReadingQuestionTypeGuide(typeId);
  const items = useMemo(() => getQuestionsForReadingQuestionType(typeId), [typeId]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue>();
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showPassage, setShowPassage] = useState(false);
  const item = items[index];
  const complete = index >= items.length;

  const restart = () => { setIndex(0); setAnswer(undefined); setChecked(false); setScore(0); setShowPassage(false); };
  if (!items.length) return null;
  if (complete) {
    const percentage = Math.round((score / items.length) * 100);
    return <View style={styles.page}><BackControl label={a.focused} onPress={onBack} /><View style={styles.focusComplete}><View style={styles.resultSeal}><Ionicons name="checkmark" size={25} color={colors.raised} /></View><Text style={styles.focusLabel}>{a.drillComplete}</Text><Text style={styles.focusScore}>{score}<Text style={styles.focusTotal}>/{items.length}</Text></Text><Text style={styles.focusAccuracy}>{percentage}% {a.accuracy} · {guide.title}</Text><View style={styles.focusActions}><Pressable accessibilityRole="button" onPress={restart} style={styles.primaryButton}><Ionicons name="refresh" size={16} color={colors.raised} /><Text style={styles.primaryButtonText}>{a.retryDrill}</Text></Pressable><Pressable accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{a.chooseType}</Text></Pressable></View></View></View>;
  }

  const correct = checked && questionIsCorrect(item.question, answer);
  const check = () => { if (!hasAnswer(answer) || checked) return; if (questionIsCorrect(item.question, answer)) setScore((value) => value + 1); setChecked(true); };
  const next = () => { setIndex((value) => value + 1); setAnswer(undefined); setChecked(false); setShowPassage(false); };
  return <View style={styles.page}><BackControl label={a.focused} onPress={onBack} /><View style={styles.focusHero}><View style={styles.focusHeroTop}><View style={styles.flexOne}><View style={styles.focusStamp}><Ionicons name="locate-outline" size={15} color={colors.rustDark} /><Text style={styles.focusStampText}>{a.focused}</Text></View><Text style={styles.focusTitle}>{guide.title}</Text><Text style={styles.focusBody}>{guide.description}</Text></View><View style={styles.focusProgress}><Text style={styles.focusProgressLabel}>{index + 1}/{items.length}</Text><View style={styles.focusTrack}><View style={[styles.focusFill, { width: `${(index / items.length) * 100}%` }]} /></View></View></View><Text style={styles.strategyLabel}>{a.strategy}</Text>{guide.strategy.map((tip, tipIndex) => <View key={tip} style={styles.strategyRow}><Text style={styles.strategyNumber}>{tipIndex + 1}.</Text><Text style={styles.strategyTip}>{tip}</Text></View>)}</View><View style={styles.sourceCard}><Text style={styles.sectionLabel}>{a.source}</Text><Text style={styles.sourceTitle}>{item.passage.title}</Text><Text style={styles.sourceSubtitle}>{item.passage.subtitle}</Text><Pressable accessibilityRole="button" accessibilityState={{ expanded: showPassage }} onPress={() => setShowPassage((value) => !value)} style={styles.sourceToggle}><Text style={styles.sourceToggleText}>{showPassage ? t.pause : t.passage}</Text><Ionicons name={showPassage ? "chevron-up" : "chevron-down"} size={17} color={colors.ink} /></Pressable>{showPassage ? <View style={styles.sourceParagraphs}>{item.passage.paragraphs.map((paragraph) => <Text key={paragraph.label} style={styles.sourceText}><Text style={styles.sourceLetter}>{paragraph.label}  </Text>{paragraph.text}</Text>)}</View> : null}</View><View style={styles.focusQuestion}><QuestionCard question={item.question} value={answer} locale={locale} disabled={checked} onChange={setAnswer} />{checked ? <View style={[styles.feedbackCard, correct ? styles.feedbackCorrect : styles.feedbackWrong]}><Text style={[styles.feedbackTitle, correct ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>{correct ? a.correctFeedback : a.wrongFeedback}</Text>{!correct ? <ReviewLine label={t.correctAnswer} value={Array.isArray(item.question.answer) ? item.question.answer.join(", ") : item.question.answer} /> : null}<Text style={styles.feedbackExplanation}>{item.question.explanation}</Text><View style={styles.evidenceBox}><Text style={styles.reviewLabel}>{t.evidence}</Text><Text style={styles.evidenceText}>“{item.question.evidence}”</Text></View></View> : null}<View style={styles.focusQuestionAction}>{!checked ? <Pressable accessibilityRole="button" disabled={!hasAnswer(answer)} onPress={check} style={[styles.primaryButton, !hasAnswer(answer) && styles.buttonDisabled]}><Text style={styles.primaryButtonText}>{a.check}</Text><Ionicons name="checkmark-circle-outline" size={17} color={colors.raised} /></Pressable> : <Pressable accessibilityRole="button" onPress={next} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{index + 1 === items.length ? a.seeResults : a.nextQuestion}</Text><Ionicons name="arrow-forward" size={17} color={colors.raised} /></Pressable>}</View></View></View>;
}

function ReadingDrawer({ locale, drawer, notes, vocabulary, noteQuote, noteDraft, onDrawer, onDraft, onSaveNote, onClose, onDeleteNote, onUpdateVocabulary, onDeleteVocabulary }: { locale: Locale; drawer: Drawer; notes: PassageNote[]; vocabulary: SavedVocabulary[]; noteQuote: string; noteDraft: string; onDrawer: (drawer: Drawer) => void; onDraft: (value: string) => void; onSaveNote: () => void; onClose: () => void; onDeleteNote: (id: string) => void; onUpdateVocabulary: (id: string, patch: Partial<SavedVocabulary>) => void; onDeleteVocabulary: (id: string) => void }) {
  const a = advancedCopy[locale];
  const isNotes = drawer === "notes";
  return <Modal visible={Boolean(drawer)} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><SafeAreaView style={styles.drawerSafe}><View style={styles.drawerHeader}><View style={styles.drawerTabs}><Pressable accessibilityRole="tab" accessibilityState={{ selected: isNotes }} onPress={() => onDrawer("notes")} style={[styles.drawerTab, isNotes && styles.drawerTabActive]}><Ionicons name="document-text-outline" size={17} color={isNotes ? colors.raised : colors.ink} /><Text style={[styles.drawerTabText, isNotes && styles.drawerTabTextActive]}>{a.notes} · {notes.length}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: !isNotes }} onPress={() => onDrawer("vocabulary")} style={[styles.drawerTab, !isNotes && styles.drawerTabActive]}><Ionicons name="bookmark-outline" size={17} color={!isNotes ? colors.raised : colors.ink} /><Text style={[styles.drawerTabText, !isNotes && styles.drawerTabTextActive]}>{a.vocabulary} · {vocabulary.length}</Text></Pressable></View><Pressable accessibilityRole="button" onPress={onClose} style={styles.drawerClose}><Ionicons name="close" size={21} color={colors.ink} /></Pressable></View><ScrollView contentContainerStyle={styles.drawerScroll} showsVerticalScrollIndicator={false}>{isNotes ? <>{noteQuote ? <View style={styles.noteComposer}><Text style={styles.noteQuote}>“{noteQuote}”</Text><TextInput multiline value={noteDraft} onChangeText={onDraft} placeholder={a.notePlaceholder} placeholderTextColor={colors.muted} style={styles.noteInput} /><Pressable accessibilityRole="button" disabled={!noteDraft.trim()} onPress={onSaveNote} style={[styles.primaryButton, !noteDraft.trim() && styles.buttonDisabled]}><Ionicons name="save-outline" size={16} color={colors.raised} /><Text style={styles.primaryButtonText}>{a.saveNote}</Text></Pressable></View> : null}{notes.length ? notes.map((note) => <View key={note.id} style={styles.noteCard}><Text style={styles.noteQuote}>“{note.quote}”</Text><Text style={styles.noteBody}>{note.body}</Text><Pressable accessibilityRole="button" onPress={() => onDeleteNote(note.id)} style={styles.deleteButton}><Ionicons name="trash-outline" size={16} color={colors.danger} /><Text style={styles.deleteText}>{a.delete}</Text></Pressable></View>) : <EmptyDrawer icon="document-text-outline" title={a.emptyNotes} />}</> : vocabulary.length ? vocabulary.map((word) => <View key={word.id} style={styles.vocabCard}><View style={styles.vocabHeading}><View style={styles.flexOne}><Text style={styles.vocabWord}>{word.word}</Text><Text style={styles.vocabTranslation}>{word.translation}</Text></View><Pressable accessibilityRole="button" accessibilityState={{ selected: word.favourite }} onPress={() => onUpdateVocabulary(word.id, { favourite: !word.favourite })} style={styles.favouriteButton}><Ionicons name={word.favourite ? "bookmark" : "bookmark-outline"} size={20} color={word.favourite ? colors.rust : colors.muted} /></Pressable></View><Text style={styles.vocabDefinition}>{word.definition}</Text><Text style={styles.vocabExample}>“{word.example}”</Text><Text style={styles.vocabSource}>{word.passageTitle}</Text><TextInput multiline value={word.note} onChangeText={(note) => onUpdateVocabulary(word.id, { note })} placeholder={a.personalNote} placeholderTextColor={colors.muted} style={styles.vocabNote} /><View style={styles.vocabActions}><Pressable accessibilityRole="button" accessibilityState={{ selected: word.learned }} onPress={() => onUpdateVocabulary(word.id, { learned: !word.learned })} style={[styles.learnedButton, word.learned && styles.learnedButtonActive]}><Ionicons name="checkmark-circle-outline" size={16} color={word.learned ? colors.teal : colors.rustDark} /><Text style={[styles.learnedText, word.learned && styles.learnedTextActive]}>{word.learned ? a.learned : a.markLearned}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => onDeleteVocabulary(word.id)} style={styles.trashButton}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable></View></View>) : <EmptyDrawer icon="bookmark-outline" title={a.emptyVocabulary} />}</ScrollView></SafeAreaView></Modal>;
}

function EmptyDrawer({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) { return <View style={styles.emptyDrawer}><View style={styles.emptyDrawerIcon}><Ionicons name={icon} size={25} color={colors.teal} /></View><Text style={styles.emptyDrawerTitle}>{title}</Text></View>; }

function ReviewLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.reviewLine}><Text style={styles.reviewLabel}>{label}</Text><Text selectable style={styles.reviewValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  flexOne: { flex: 1, minWidth: 0 },
  page: { gap: 18 },
  back: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 7, paddingRight: 12 },
  backText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rustDark },
  hero: { gap: 16, padding: 19, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.18, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  heroLabel: { alignSelf: "flex-start", minHeight: 31, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.brand200, borderRadius: 9, backgroundColor: "rgba(185,78,40,0.07)" },
  heroLabelText: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase", color: colors.muted },
  heroTitle: { maxWidth: 320, fontFamily: fonts.display, fontSize: 37, lineHeight: 39, letterSpacing: 0.45, textTransform: "uppercase", color: colors.ink },
  heroBody: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 24, color: colors.muted },
  journey: { gap: 12, marginTop: 4, padding: 15, borderWidth: 1, borderColor: colors.brand200, borderRadius: 12, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.11, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  journeyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  journeyLabel: { fontFamily: fonts.uiBold, fontSize: 9.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.muted },
  journeyScore: { marginTop: 4, fontFamily: fonts.ui, fontSize: 29, color: colors.ink },
  journeyTotal: { fontSize: 16, color: colors.muted },
  journeyIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.14, shadowRadius: 0, shadowOffset: { width: 3, height: 3 }, elevation: 2 },
  journeyBody: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  restoredBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: "rgba(70,120,120,0.09)" },
  restoredText: { fontFamily: fonts.uiBold, fontSize: 9, color: colors.teal },
  segmented: { flexDirection: "row", padding: 4, borderWidth: 1, borderColor: colors.line, borderRadius: 24, backgroundColor: colors.cream },
  segment: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  segmentActive: { backgroundColor: colors.brand600 },
  segmentText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.muted },
  segmentTextActive: { fontFamily: fonts.uiBold, color: colors.raised },
  sectionHeading: { gap: 6, marginTop: 8 },
  sectionLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.teal },
  sectionTitle: { maxWidth: 330, fontFamily: fonts.uiMedium, fontSize: 22, lineHeight: 29, color: colors.ink },
  sectionBody: { maxWidth: 330, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  cardList: { gap: 12 },
  testCard: { gap: 13, padding: 17, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.14, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  cardTop: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackStamp: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 7, backgroundColor: "rgba(36,19,12,0.80)", fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.45, textTransform: "uppercase", color: colors.raised },
  cardTitle: { fontFamily: fonts.uiBold, fontSize: 19, lineHeight: 25, color: colors.ink },
  cardBody: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  scoreHistory: { flexDirection: "row", alignItems: "center", gap: 7, padding: 10, borderRadius: 9, backgroundColor: "rgba(70,120,120,0.09)" },
  scoreHistoryText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 10.5, lineHeight: 16, color: colors.teal },
  metaRow: { flexDirection: "row", gap: 7 },
  meta: { flex: 1, minHeight: 57, flexDirection: "row", alignItems: "center", gap: 7, padding: 8, borderRadius: 9, backgroundColor: colors.raised },
  metaValue: { maxWidth: 72, fontFamily: fonts.uiBold, fontSize: 11, color: colors.ink },
  metaLabel: { marginTop: 1, fontFamily: fonts.ui, fontSize: 8.5, color: colors.muted },
  primaryButton: { alignSelf: "flex-start", minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 17, borderWidth: 1, borderColor: colors.brand950, borderRadius: 10, backgroundColor: colors.brand600, shadowColor: colors.brown, shadowOpacity: 0.72, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 3 },
  primaryButtonText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 12.5, textAlign: "center", color: colors.raised },
  secondaryButton: { alignSelf: "flex-start", minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 2, height: 3 }, elevation: 2 },
  filterButtonActive: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,0.10)" },
  secondaryButtonText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 12, textAlign: "center", color: colors.ink },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  buttonDisabled: { opacity: 0.48 },
  typeCard: { gap: 11, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  typeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countStamp: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: colors.teal, borderRadius: 7, backgroundColor: "rgba(70,120,120,0.09)", fontFamily: fonts.uiBold, fontSize: 9, color: colors.teal },
  typeTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink },
  typeBody: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 20, color: colors.muted },
  strategy: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, borderRadius: 9, backgroundColor: colors.raised },
  strategyText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 11.5, lineHeight: 18, color: colors.ink },
  startHero: { gap: 13, padding: 19, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.16, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  startTitle: { fontFamily: fonts.display, fontSize: 35, lineHeight: 39, letterSpacing: 0.45, textTransform: "uppercase", color: colors.ink },
  startDescription: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  modeList: { gap: 12 },
  modeCard: { minHeight: 180, gap: 12, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.14, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  modeIcon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand200, borderRadius: 11, backgroundColor: colors.brand50 },
  modeTitle: { fontFamily: fonts.display, fontSize: 25, color: colors.ink },
  modeBody: { maxWidth: 300, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  modeArrow: { position: "absolute", right: 17, top: 18, width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colors.brand600 },
  testBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 3, height: 3 }, elevation: 3 },
  testBarCopy: { flex: 1, minWidth: 0 },
  testBarTitle: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  testBarMeta: { marginTop: 2, fontFamily: fonts.ui, fontSize: 9.5, color: colors.muted },
  timer: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, borderRadius: 8, backgroundColor: colors.raised },
  timerText: { fontFamily: fonts.uiBold, fontSize: 11.5, color: colors.ink },
  timerDanger: { color: colors.rust },
  pauseButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.raised },
  practiceBadge: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.09)" },
  practiceBadgeText: { fontFamily: fonts.uiBold, fontSize: 9.5, textTransform: "uppercase", color: colors.teal },
  pausedPanel: { minHeight: 280, alignItems: "center", justifyContent: "center", gap: 15, padding: 24, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream },
  pausedTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  annotationToolbar: { gap: 9, padding: 11, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream },
  annotationTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  annotationHint: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 9.5, lineHeight: 14, color: colors.muted },
  annotationActions: { flexDirection: "row", gap: 5 },
  toolButton: { minWidth: 48, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, paddingHorizontal: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.raised },
  toolCount: { fontFamily: fonts.uiBold, fontSize: 8.5, color: colors.muted },
  colorRow: { flexDirection: "row", gap: 8 },
  colorButton: { width: 48, height: 38, borderWidth: 1, borderColor: colors.line, borderRadius: 7 },
  colorButtonActive: { borderWidth: 2.5, borderColor: colors.ink, transform: [{ scale: 1.05 }] },
  passageSheet: { gap: 12, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.raised },
  passageLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: colors.teal },
  passageTitle: { fontFamily: fonts.display, fontSize: 31, lineHeight: 35, letterSpacing: 0.35, textTransform: "uppercase", color: colors.ink },
  passageSubtitle: { fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 20, color: colors.muted },
  paragraphs: { gap: 16, paddingTop: 7 },
  paragraph: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  paragraphLabel: { width: 27, height: 27, textAlign: "center", textAlignVertical: "center", borderRadius: 6, backgroundColor: colors.brand600, fontFamily: fonts.uiBold, fontSize: 11, color: colors.raised },
  paragraphText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, lineHeight: 24, color: colors.ink },
  questionsSheet: { gap: 14 },
  questionsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  questionsTitle: { fontFamily: fonts.display, fontSize: 27, color: colors.ink },
  questionsProgress: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 7, backgroundColor: "rgba(70,120,120,0.10)", fontFamily: fonts.uiBold, fontSize: 10, color: colors.teal },
  questionList: { gap: 11 },
  questionCard: { gap: 10, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  questionCardActive: { borderColor: colors.brand600, shadowColor: colors.rust, shadowOpacity: 0.2, shadowRadius: 0, shadowOffset: { width: 3, height: 3 }, elevation: 2 },
  questionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  questionTopRight: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 7 },
  flagButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.raised },
  flagButtonActive: { borderColor: colors.rust, backgroundColor: "rgba(185,78,40,0.09)" },
  questionNumber: { fontFamily: fonts.display, fontSize: 20, color: colors.brand600 },
  questionKind: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 8.5, letterSpacing: 0.45, textAlign: "right", textTransform: "uppercase", color: colors.teal },
  questionGroup: { fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 15, color: colors.muted },
  instruction: { padding: 9, borderRadius: 8, backgroundColor: colors.raised, fontFamily: fonts.uiMedium, fontSize: 10.5, lineHeight: 16, color: colors.muted },
  questionPrompt: { fontFamily: fonts.uiMedium, fontSize: 13.5, lineHeight: 21, color: colors.ink },
  options: { gap: 8 },
  option: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  optionSelected: { borderColor: colors.brand600, backgroundColor: "rgba(185,78,40,0.09)" },
  optionMark: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 6, backgroundColor: colors.cream },
  optionMarkSelected: { borderColor: colors.brand600, backgroundColor: colors.brand600 },
  optionText: { flex: 1, fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
  optionTextSelected: { fontFamily: fonts.uiMedium, color: colors.ink },
  answerInput: { minHeight: 50, paddingHorizontal: 13, borderWidth: 1.5, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 15, color: colors.ink },
  disabledOption: { opacity: 0.66 },
  questionNavigator: { alignItems: "center", gap: 7, paddingVertical: 2 },
  navigatorLabel: { alignSelf: "center", marginRight: 3, fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  navigatorButton: { position: "relative", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  navigatorAnswered: { borderColor: "rgba(70,120,120,0.42)", backgroundColor: "rgba(70,120,120,0.10)" },
  navigatorFlagged: { borderColor: "rgba(185,78,40,0.45)" },
  navigatorActive: { borderWidth: 2, borderColor: colors.brand600 },
  navigatorNumber: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.muted },
  navigatorNumberAnswered: { color: colors.teal },
  flagDot: { position: "absolute", right: -2, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rust },
  testActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 10 },
  popoverBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(36,19,12,0.45)" },
  wordPopover: { width: "100%", maxWidth: 360, gap: 12, padding: 18, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.raised, shadowColor: colors.ink, shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  popoverHeading: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  popoverWord: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33, color: colors.ink },
  popoverTranslation: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 12, color: colors.rustDark },
  popoverClose: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.cream },
  popoverDefinition: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  popoverActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popoverPrimary: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.brand950, borderRadius: 9, backgroundColor: colors.rust },
  popoverPrimaryText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.raised },
  popoverSecondary: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.cream },
  popoverSecondaryText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.ink },
  drawerSafe: { flex: 1, backgroundColor: colors.paper },
  drawerHeader: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.raised },
  drawerTabs: { flex: 1, flexDirection: "row", gap: 5 },
  drawerTab: { flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 7, borderRadius: 9 },
  drawerTabActive: { backgroundColor: colors.brown },
  drawerTabText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 9.5, textAlign: "center", color: colors.ink },
  drawerTabTextActive: { color: colors.raised },
  drawerClose: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.cream },
  drawerScroll: { gap: 11, padding: 16, paddingBottom: 44 },
  noteComposer: { gap: 10, padding: 14, borderWidth: 1.5, borderColor: "rgba(70,120,120,0.38)", borderRadius: 13, backgroundColor: "rgba(70,120,120,0.07)" },
  noteQuote: { fontFamily: fonts.uiBold, fontSize: 12, lineHeight: 19, fontStyle: "italic", color: colors.ink },
  noteInput: { minHeight: 108, padding: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 12, lineHeight: 19, color: colors.ink, textAlignVertical: "top" },
  noteCard: { gap: 9, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream },
  noteBody: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 20, color: colors.muted },
  deleteButton: { alignSelf: "flex-start", minHeight: 38, flexDirection: "row", alignItems: "center", gap: 5 },
  deleteText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.danger },
  vocabCard: { gap: 10, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  vocabHeading: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  vocabWord: { fontFamily: fonts.display, fontSize: 26, lineHeight: 29, color: colors.ink },
  vocabTranslation: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 12, color: colors.rustDark },
  favouriteButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  vocabDefinition: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  vocabExample: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.line, fontFamily: fonts.ui, fontSize: 11, lineHeight: 17, fontStyle: "italic", color: colors.muted },
  vocabSource: { fontFamily: fonts.uiBold, fontSize: 8.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.teal },
  vocabNote: { minHeight: 72, padding: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.raised, fontFamily: fonts.ui, fontSize: 11, lineHeight: 17, color: colors.ink, textAlignVertical: "top" },
  vocabActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  learnedButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "rgba(185,78,40,0.08)" },
  learnedButtonActive: { backgroundColor: "rgba(70,120,120,0.10)" },
  learnedText: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.rustDark },
  learnedTextActive: { color: colors.teal },
  trashButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  emptyDrawer: { minHeight: 310, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyDrawerIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  emptyDrawerTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.muted },
  focusComplete: { minHeight: 420, alignItems: "center", justifyContent: "center", gap: 11, padding: 22, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream },
  focusLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.teal },
  focusScore: { fontFamily: fonts.display, fontSize: 62, lineHeight: 66, color: colors.ink },
  focusTotal: { fontSize: 28, color: colors.muted },
  focusAccuracy: { fontFamily: fonts.uiBold, fontSize: 13, textAlign: "center", color: colors.muted },
  focusActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 9, marginTop: 8 },
  focusHero: { gap: 11, padding: 17, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream },
  focusHeroTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  focusStamp: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(185,78,40,0.09)" },
  focusStampText: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", color: colors.rustDark },
  focusTitle: { marginTop: 9, fontFamily: fonts.display, fontSize: 31, lineHeight: 34, color: colors.ink },
  focusBody: { marginTop: 5, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  focusProgress: { width: 67, padding: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  focusProgressLabel: { fontFamily: fonts.uiBold, fontSize: 11, textAlign: "right", color: colors.ink },
  focusTrack: { height: 5, overflow: "hidden", marginTop: 7, borderRadius: 3, backgroundColor: colors.brand100 },
  focusFill: { height: "100%", borderRadius: 3, backgroundColor: colors.rust },
  strategyLabel: { marginTop: 4, fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase", color: colors.teal },
  strategyRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  strategyNumber: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.rust },
  strategyTip: { flex: 1, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 17, color: colors.muted },
  sourceCard: { gap: 7, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.raised },
  sourceTitle: { fontFamily: fonts.uiBold, fontSize: 16, lineHeight: 21, color: colors.ink },
  sourceSubtitle: { fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 18, color: colors.muted },
  sourceToggle: { alignSelf: "flex-start", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.cream },
  sourceToggleText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.ink },
  sourceParagraphs: { gap: 12, paddingTop: 7 },
  sourceText: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 21, color: colors.muted },
  sourceLetter: { fontFamily: fonts.uiBold, color: colors.rustDark },
  focusQuestion: { gap: 12 },
  focusQuestionAction: { alignItems: "flex-end" },
  feedbackCard: { gap: 10, padding: 14, borderWidth: 1, borderRadius: 11 },
  feedbackCorrect: { borderColor: "rgba(70,120,120,0.35)", backgroundColor: "rgba(70,120,120,0.07)" },
  feedbackWrong: { borderColor: "rgba(220,38,38,0.25)", backgroundColor: "rgba(220,38,38,0.05)" },
  feedbackTitle: { fontFamily: fonts.uiBold, fontSize: 12.5, lineHeight: 18 },
  feedbackTitleCorrect: { color: colors.teal },
  feedbackTitleWrong: { color: colors.danger },
  feedbackExplanation: { fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 18, color: colors.muted },
  evidenceBox: { gap: 5, padding: 10, borderRadius: 8, backgroundColor: "rgba(185,78,40,0.06)" },
  evidenceText: { fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 18, fontStyle: "italic", color: colors.ink },
  resultHero: { alignItems: "center", gap: 10, padding: 21, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.17, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  resultSeal: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: colors.teal },
  resultLabel: { marginTop: 4, fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.teal },
  resultScore: { fontFamily: fonts.display, fontSize: 66, lineHeight: 69, color: colors.ink },
  resultTotal: { fontSize: 30, color: colors.muted },
  resultCaption: { fontFamily: fonts.uiMedium, fontSize: 12.5, color: colors.muted },
  bandBox: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13, borderRadius: 10, backgroundColor: colors.raised },
  bandLabel: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  bandValue: { fontFamily: fonts.display, fontSize: 27, color: colors.brand600 },
  resultActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 5 },
  reviewList: { gap: 11 },
  reviewCard: { gap: 10, padding: 15, borderWidth: 1.5, borderRadius: 13, backgroundColor: colors.cream },
  reviewCorrect: { borderColor: "rgba(70,120,120,0.48)" },
  reviewWrong: { borderColor: "rgba(185,78,40,0.48)" },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewLine: { gap: 3, paddingTop: 7, borderTopWidth: 1, borderTopColor: colors.line },
  reviewLabel: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.45, textTransform: "uppercase", color: colors.teal },
  reviewValue: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 19, color: colors.muted },
});
