import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import * as Speech from "expo-speech";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { request, type GameAnswerResult, type GameQuestion, type GameSession } from "@/api/client";
import { CrosswordGame, buildCrossword, type Crossword } from "@/components/games/crossword-game";
import { boardPlayableTotal } from "@/components/games/board-progress";
import { HangmanRound } from "@/components/games/hangman-game";
import { MatchGame } from "@/components/games/match-game";
import { MemoryGame, buildMemoryTiles, type Tile } from "@/components/games/memory-game";
import { SentenceRound } from "@/components/games/sentence-game";
import { WordSearchGame, buildWordSearch, type WordSearch } from "@/components/games/word-search-game";
import { metaFor, GAME_TYPES, type GameType } from "./index";
import { BackButton, Button, ErrorNote, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useSoundEffects } from "@/sound/sound-provider";
import { colors, fonts } from "@/theme/tokens";

type Source = { key: string; label: string; query: string };
// Games where the server hands back a definite target and distractors, so a
// plain multiple-choice list is the real, honest UI for them (not a stub).
const choiceTypes = new Set<GameType>(["speed_quiz", "fill_blank", "audio_guess"]);
// Games with a real, specialized single-question UI (still one card at a
// time, like every other mode).
const roundTypes = new Set<GameType>(["hangman", "sentence_builder"]);
// Games that show every card on one board/grid at once rather than one
// question at a time.
const boardTypes = new Set<GameType>(["word_match", "memory", "word_search", "crossword"]);

const labels = {
  uz: { choose: "Mashq manbasini tanlang", sourceHint: "Daraja yoki mavzuni tanlasangiz, o‘yin shu so‘zlarni kartalaringizga qo‘shadi.", mine: "Mening kartalarim", ielts: "IELTS", phrasal: "Phrasal verbs", idioms: "Idioms", start: "O‘yinni boshlash", loading: "O‘yin tayyorlanmoqda...", prompt: "Javobingizni yozing", check: "Tekshirish", next: "Keyingi savol", again: "Yana o‘ynash", change: "Manbani o‘zgartirish", correct: "To‘g‘ri!", wrong: "Javob boshqa edi", complete: "O‘yin tugadi", completeBody: "Natijangiz SRS va kunlik questlarga qo‘shildi.", score: "Natija", xp: "XP", listen: "Eshitish", needWords: "Avval kamida 4 ta so‘z kerak", needWordsBody: "Kartalaringizga bir nechta so‘z qo‘shing yoki CEFR daraja tanlang.", error: "O‘yinni ochib bo‘lmadi.", retry: "Qayta urinib ko‘ring", question: "Savol", lives: "jon", buildSentence: "Gapni yig‘ing", clear: "Tozalash", across: "Ko‘ndalang", down: "Tik", solved: "yechildi" },
  ru: { choose: "Выберите источник задания", sourceHint: "Выбранный уровень или тему игра добавит в ваши карточки.", mine: "Мои карточки", ielts: "IELTS", phrasal: "Фразовые глаголы", idioms: "Идиомы", start: "Начать игру", loading: "Готовим игру...", prompt: "Введите ответ", check: "Проверить", next: "Следующий вопрос", again: "Играть ещё", change: "Изменить источник", correct: "Правильно!", wrong: "Верный ответ другой", complete: "Игра завершена", completeBody: "Результат добавлен в SRS и ежедневные задания.", score: "Результат", xp: "XP", listen: "Слушать", needWords: "Сначала нужно минимум 4 слова", needWordsBody: "Добавьте несколько слов в карточки или выберите уровень CEFR.", error: "Не удалось открыть игру.", retry: "Попробуйте снова", question: "Вопрос", lives: "жизни", buildSentence: "Соберите предложение", clear: "Очистить", across: "По горизонтали", down: "По вертикали", solved: "решено" },
  en: { choose: "Choose practice source", sourceHint: "Choosing a level or topic adds those words to your cards as you play.", mine: "My cards", ielts: "IELTS", phrasal: "Phrasal verbs", idioms: "Idioms", start: "Start game", loading: "Preparing your game...", prompt: "Type your answer", check: "Check answer", next: "Next question", again: "Play again", change: "Change source", correct: "Correct!", wrong: "The answer was different", complete: "Game complete", completeBody: "Your result was added to SRS and daily quests.", score: "Score", xp: "XP", listen: "Listen", needWords: "You need at least 4 words first", needWordsBody: "Add a few words to your cards or choose a CEFR level.", error: "We couldn't open this game.", retry: "Try again", question: "Question", lives: "lives", buildSentence: "Build the sentence", clear: "Clear", across: "Across", down: "Down", solved: "solved" },
} as const;

function sources(locale: Locale): Source[] {
  const t = labels[locale];
  return [
    { key: "mine", label: t.mine, query: "" },
    ...["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => ({ key: level, label: level, query: `&level=${level}` })),
    { key: "ielts", label: t.ielts, query: "&category=ielts" },
    { key: "phrasal", label: t.phrasal, query: "&category=phrasal" },
    { key: "idioms", label: t.idioms, query: "&category=idioms" },
  ];
}

function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }

/** Queues card submissions one at a time so board games (several answers in
 *  quick succession) never race two /games/answer calls for the same
 *  session — same reasoning as the web client's answerQueue. `correct` here
 *  only drives the on-screen score; the server grades `answer` for XP/SRS. */
function useAnswerQueue({ token, sessionId, type, queryClient }: { token: string | null | undefined; sessionId: string | undefined; type: GameType; queryClient: QueryClient }) {
  const queue = useRef(Promise.resolve());
  const failed = useRef<Array<{ cardId: string; answer: string; durationMs: number }>>([]);
  const send = async ({ cardId, answer, durationMs }: { cardId: string; answer: string; durationMs: number }) => {
    await request<GameAnswerResult>("/games/answer", { method: "POST", token, body: { session_id: sessionId, card_id: cardId, game_type: type, answer, duration_ms: Math.min(600_000, Math.max(0, durationMs)) } });
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
    void queryClient.invalidateQueries({ queryKey: ["daily-quests"] });
    void queryClient.invalidateQueries({ queryKey: ["queue"] });
    void queryClient.invalidateQueries({ queryKey: ["mastery-map"] });
    void queryClient.invalidateQueries({ queryKey: ["statistics"] });
    void queryClient.invalidateQueries({ queryKey: ["mistakes"] });
  };
  const submit = (cardId: string, answer: string, durationMs: number) => {
    const payload = { cardId, answer, durationMs };
    queue.current = queue.current
      .then(() => send(payload))
      .catch(() => { failed.current.push(payload); });
  };
  const flush = async () => {
    await queue.current;
    const retry = failed.current;
    failed.current = [];
    for (const payload of retry) {
      try { await send(payload); }
      catch { failed.current.push(payload); }
    }
    return failed.current.length === 0;
  };
  return { submit, flush };
}

export default function GamePlayer() {
  const { type: rawType } = useLocalSearchParams<{ type?: string }>();
  const { token, user } = useAuth();
  const { play } = useSoundEffects();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const type = GAME_TYPES.includes(rawType as GameType) ? rawType as GameType : null;
  const [source, setSource] = useState<Source | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<GameAnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [errorKind, setErrorKind] = useState<"empty" | "error" | null>(null);
  const startedAt = useRef(Date.now());

  const load = useMutation({
    mutationFn: (nextSource: Source) => request<GameSession>(`/games/${type}?count=10${nextSource.query}`, { token }),
    onSuccess: (nextSession) => { setSession(nextSession); setIndex(0); setScore(0); setInput(""); setFeedback(null); setErrorKind(null); startedAt.current = Date.now(); },
    onError: (error: { status?: number }) => setErrorKind(error.status === 409 ? "empty" : "error"),
  });
  const question = session?.questions[index];
  const options = useMemo(() => {
    if (!question || !session || !choiceTypes.has(type ?? "speed_quiz")) return [];
    const pool = question.distractors.length ? question.distractors : session.questions.filter((item) => item.card_id !== question.card_id).map((item) => item.answer);
    return shuffle([question.answer, ...pool].filter((value, itemIndex, all) => all.indexOf(value) === itemIndex)).slice(0, 5);
  }, [question, session, type]);
  const submit = useMutation({
    mutationFn: (answer: string) => request<GameAnswerResult>("/games/answer", { method: "POST", token, body: { session_id: session?.session_id, card_id: question?.card_id, game_type: type, answer, duration_ms: Math.min(600_000, Math.max(0, Date.now() - startedAt.current)) } }),
    onSuccess: (result) => {
      setFeedback(result);
      play(result.rating === "again" ? "error" : "success");
      if (result.rating !== "again") setScore((value) => value + 1);
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-quests"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["mastery-map"] });
      void queryClient.invalidateQueries({ queryKey: ["statistics"] });
      void queryClient.invalidateQueries({ queryKey: ["mistakes"] });
    },
  });

  if (!type) return <Screen appHeader><BackButton label={t.retry} onPress={() => router.back()} /><Heading>{t.error}</Heading></Screen>;
  const meta = metaFor(type, locale);
  const isFinished = Boolean(session && index >= session.questions.length);
  const advance = () => { setIndex((value) => value + 1); setFeedback(null); setInput(""); startedAt.current = Date.now(); };
  const begin = (nextSource: Source) => { setSource(nextSource); load.mutate(nextSource); };
  const backLabel = locale === "uz" ? "O‘yinlar" : locale === "ru" ? "Игры" : "Games";

  if (!session && !load.isPending && !errorKind) {
    return <Screen appHeader><BackButton label={backLabel} onPress={() => router.back()} /><Heading sub={t.sourceHint}>{t.choose}</Heading><View style={styles.sources}>{sources(locale).map((item) => <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected: source?.key === item.key }} onPress={() => setSource(item)} style={({ pressed }) => [styles.source, source?.key === item.key && styles.sourceActive, pressed && styles.pressed]}><Text style={[styles.sourceText, source?.key === item.key && styles.sourceTextActive]}>{item.label}</Text></Pressable>)}</View><Button disabled={!source} icon="play" onPress={() => source && begin(source)}>{t.start}</Button></Screen>;
  }
  if (load.isPending) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (errorKind) return <Screen appHeader><Heading>{errorKind === "empty" ? t.needWords : t.error}</Heading><Paper><Text style={styles.body}>{errorKind === "empty" ? t.needWordsBody : t.retry}</Text></Paper><Button icon="refresh" onPress={() => source && begin(source)}>{t.retry}</Button><Button variant="secondary" onPress={() => { setErrorKind(null); setSession(null); }}>{t.change}</Button></Screen>;

  if (session && boardTypes.has(type)) {
    return (
      <BoardScreen
        key={session.session_id}
        type={type}
        session={session}
        locale={locale}
        meta={meta}
        t={t}
        backLabel={backLabel}
        token={token}
        queryClient={queryClient}
        onAgain={() => source && begin(source)}
        onChange={() => setSession(null)}
      />
    );
  }

  if (!session || !question) {
    if (isFinished && session) return <GameComplete locale={locale} score={score} session={session} onAgain={() => source && begin(source)} onChange={() => setSession(null)} />;
    return <Screen appHeader><Loader label={t.loading} /></Screen>;
  }

  const audioText = question.audio_text;
  const response = (answer: string) => { if (!answer.trim() || submit.isPending || feedback) return; submit.mutate(answer); };
  // Round games (hangman/sentence builder) submit their own result string,
  // including an empty one on a hangman loss — response() rejects empty
  // strings (meant for a blank text box), so this bypasses that guard.
  const respondRound = (answer: string) => { if (submit.isPending || feedback) return; submit.mutate(answer); };

  return <Screen appHeader><BackButton label={backLabel} onPress={() => router.back()} /><View style={styles.topline}><Stamp tone="teal">{`${index + 1}/${session.questions.length}`}</Stamp><Text style={styles.score}>{score} {t.score}</Text></View><Heading>{meta.name}</Heading>{roundTypes.has(type) ? null : <Paper style={styles.question}><View style={[styles.gameIcon, { backgroundColor: `${meta.color}1A` }]}><Ionicons name={meta.icon} size={25} color={meta.color} /></View>{audioText ? <Pressable accessibilityRole="button" accessibilityLabel={t.listen} onPress={() => { Speech.stop(); Speech.speak(audioText, { language: "en-US", rate: 0.9 }); }} style={({ pressed }) => [styles.listen, pressed && styles.pressed]}><Ionicons name="volume-high-outline" size={20} color={colors.teal} /><Text style={styles.listenText}>{t.listen}</Text></Pressable> : null}<Text selectable style={styles.prompt}>{question.prompt || t.listen}</Text></Paper>}{feedback ? <View style={[styles.feedback, feedback.rating !== "again" ? styles.success : styles.failure]}><Ionicons name={feedback.rating !== "again" ? "checkmark-circle" : "close-circle"} size={23} color={feedback.rating !== "again" ? colors.teal : colors.danger} /><View style={{ flex: 1 }}><Text style={styles.feedbackTitle}>{feedback.rating !== "again" ? t.correct : t.wrong}</Text><Text selectable style={styles.answer}>{question.answer}</Text></View></View> : type === "hangman" ? <HangmanRound key={index} question={question} livesLabel={t.lives} onResolved={respondRound} /> : type === "sentence_builder" ? <SentenceRound key={index} question={question} labels={t} onResolved={respondRound} /> : choiceTypes.has(type) ? <View style={styles.options}>{options.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityLabel={option} disabled={submit.isPending} onPress={() => response(option)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}><Text style={styles.optionText}>{option}</Text></Pressable>)}</View> : <View style={styles.inputGroup}><TextInput accessibilityLabel={t.prompt} autoCapitalize="none" autoCorrect={false} editable={!submit.isPending} onChangeText={setInput} onSubmitEditing={() => response(input)} placeholder={t.prompt} placeholderTextColor={colors.muted} returnKeyType="done" style={styles.input} value={input} /><Button loading={submit.isPending} onPress={() => response(input)}>{t.check}</Button></View>}<ErrorNote message={submit.isError ? t.error : null} />{feedback ? <Button icon="arrow-forward" onPress={advance}>{index + 1 >= session.questions.length ? t.complete : t.next}</Button> : null}</Screen>;
}

/** Board games (word_match, memory, word_search, crossword) show every card
 *  at once instead of one question at a time — this owns that whole flow
 *  independently: build the board once from the session, track score as the
 *  player solves pairs/words in whatever order they like, queue each
 *  card's real submission, and hand off to the same completion screen once
 *  every card is solved. */
function BoardScreen({
  type,
  session,
  locale,
  meta,
  t,
  backLabel,
  token,
  queryClient,
  onAgain,
  onChange,
}: {
  type: GameType;
  session: GameSession;
  locale: Locale;
  meta: ReturnType<typeof metaFor>;
  t: (typeof labels)[Locale];
  backLabel: string;
  token: string | null | undefined;
  queryClient: QueryClient;
  onAgain: () => void;
  onChange: () => void;
}) {
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { play } = useSoundEffects();
  const { submit, flush } = useAnswerQueue({ token, sessionId: session.session_id, type, queryClient });

  // BoardScreen is remounted fresh per session (see the `key` on it in the
  // parent), so this only ever runs once per attempt regardless of the
  // dependency array — kept accurate anyway for readability.
  const board = useMemo<{ tiles: Tile[]; wordSearch: WordSearch; crossword: Crossword }>(() => ({
    tiles: type === "memory" ? buildMemoryTiles(session.questions) : [],
    wordSearch: type === "word_search" ? buildWordSearch(session.questions) : { size: 0, grid: [], targets: [] },
    crossword: type === "crossword" ? buildCrossword(session.questions) : { rows: 0, cols: 0, solution: [], placements: [] },
  }), [session.questions, type]);
  const total = boardPlayableTotal(type, session.questions.length, {
    wordSearchTargets: board.wordSearch.targets.length,
    crosswordPlacements: board.crossword.placements.length,
  });

  function onAnswer(cardId: string, correct: boolean, durationMs: number, submitted: string) {
    setAnswered((v) => v + 1);
    if (correct) setScore((v) => v + 1);
    play(correct ? "success" : "error");
    submit(cardId, submitted, durationMs);
  }

  async function onComplete() {
    if (saving) return;
    setSaving(true);
    setSaveError(false);
    const saved = await flush();
    setSaving(false);
    if (saved) setDone(true);
    else setSaveError(true);
  }

  if (!total) return <Screen appHeader><BackButton label={backLabel} onPress={() => router.back()} /><Heading sub={t.needWordsBody}>{t.needWords}</Heading><Button variant="secondary" onPress={onChange}>{t.change}</Button></Screen>;
  if (saving) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (saveError) return <Screen appHeader><BackButton label={backLabel} onPress={() => router.back()} /><Heading>{t.error}</Heading><ErrorNote message={t.error} /><Button icon="refresh" onPress={() => void onComplete()}>{t.retry}</Button></Screen>;
  if (done) return <GameComplete locale={locale} score={score} session={session} total={total} onAgain={onAgain} onChange={onChange} />;

  return (
    <Screen appHeader>
      <BackButton label={backLabel} onPress={() => router.back()} />
      <View style={styles.topline}>
        <Stamp tone="teal">{`${answered}/${total}`}</Stamp>
        <Text style={styles.score}>{score} {t.score}</Text>
      </View>
      <Heading>{meta.name}</Heading>
      <Paper>
        {type === "memory" && <MemoryGame tiles={board.tiles} pairCount={total} matchedLabel={t.solved} onAnswer={onAnswer} onComplete={onComplete} />}
        {type === "word_match" && <MatchGame questions={session.questions} onAnswer={onAnswer} onComplete={onComplete} />}
        {type === "word_search" && <WordSearchGame search={board.wordSearch} onAnswer={onAnswer} onComplete={onComplete} />}
        {type === "crossword" && <CrosswordGame crossword={board.crossword} labels={{ across: t.across, down: t.down, check: t.check, solved: t.solved }} onAnswer={onAnswer} onComplete={onComplete} />}
      </Paper>
    </Screen>
  );
}

function GameComplete({ locale, score, session, total = session.questions.length, onAgain, onChange }: { locale: Locale; score: number; session: GameSession; total?: number; onAgain: () => void; onChange: () => void }) {
  const t = labels[locale];
  const { play } = useSoundEffects();
  useEffect(() => play("complete"), [play]);
  const xp = total ? Math.round((score / total) * 100) : 0;
  return <Screen appHeader><Stamp tone="teal">{t.complete}</Stamp><Heading sub={t.completeBody}>{t.complete}</Heading><Paper style={styles.complete}><Ionicons name="trophy-outline" size={34} color={colors.rust} /><Text style={styles.finalScore}>{score}/{total}</Text><Text style={styles.body}>{t.score} · {xp}%</Text></Paper><Button icon="refresh" onPress={onAgain}>{t.again}</Button><Button variant="secondary" onPress={onChange}>{t.change}</Button></Screen>;
}

const styles = StyleSheet.create({
  sources: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  source: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 13, backgroundColor: colors.cream },
  sourceActive: { borderColor: colors.brand600, backgroundColor: colors.brand600 },
  sourceText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink },
  sourceTextActive: { color: colors.onAccent },
  pressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  score: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.muted },
  question: { minHeight: 228, alignItems: "center", justifyContent: "center", gap: 15, paddingVertical: 24 },
  gameIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  listen: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.teal, borderRadius: 11, backgroundColor: "rgba(70,120,120,0.10)" },
  listenText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.teal },
  prompt: { fontFamily: fonts.uiBold, fontSize: 20, lineHeight: 30, textAlign: "center", color: colors.ink },
  options: { gap: 9 },
  option: { minHeight: 54, justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 15, backgroundColor: colors.cream },
  optionText: { fontFamily: fonts.uiMedium, fontSize: 15, lineHeight: 22, color: colors.ink },
  inputGroup: { gap: 10 },
  input: { minHeight: 54, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 15, fontFamily: fonts.ui, fontSize: 16, color: colors.ink, backgroundColor: colors.raised },
  feedback: { minHeight: 80, flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderRadius: 13, padding: 14 },
  success: { borderColor: "rgba(70,120,120,0.45)", backgroundColor: "rgba(70,120,120,0.09)" },
  failure: { borderColor: "rgba(220,38,38,0.40)", backgroundColor: "rgba(220,38,38,0.07)" },
  feedbackTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  answer: { marginTop: 2, fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
  complete: { alignItems: "center", gap: 7, paddingVertical: 28 },
  finalScore: { fontFamily: fonts.display, fontSize: 50, lineHeight: 54, color: colors.ink },
  body: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted, textAlign: "center" },
});
