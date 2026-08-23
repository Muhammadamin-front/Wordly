import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/api/client";
import { Button, ErrorNote, Field, Heading, Paper, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

type QuizMode = "vocab" | "grammar" | "pairs" | "mixed";
type TimerSeconds = 10 | 15 | 20 | 30;
type Player = { user_id: string; name: string; connected: boolean };
type ScoreRow = { rank: number; user_id: string; name: string; score: number; previous_rank?: number | null; delta?: number };
type Question = { type: "question"; index: number; total: number; prompt: string; options: string[]; mode: QuizMode; category: string; started_at: number; ends_at: number; server_now: number };
type Result = { type: "question_result"; index: number; answer_index: number; explanation: { translation_uz: string; example_en?: string } | null; results: Array<{ user_id: string; option_index: number | null; correct: boolean; points: number; streak: number }>; ends_at: number; server_now: number };
type Summary = { score: number; rank: number | null; accuracy: number; correct_count: number; total: number; avg_response_ms: number | null; fastest_response_ms: number | null; best_streak: number; category_accuracy: Record<string, number> };
type ReviewItem = { index: number; prompt: string; options: string[]; answer_index: number; your_answer_index: number | null; explanation: { translation_uz: string; example_en?: string } | null; category: string };
type Finished = { type: "finished"; board: ScoreRow[]; summaries: Record<string, Summary>; review: Record<string, ReviewItem[]> };
type Phase = "menu" | "connecting" | "lobby" | "countdown" | "question" | "question_result" | "leaderboard" | "finished";

const RESUME_KEY = "vocora:mp-resume-code";
const modes: QuizMode[] = ["vocab", "grammar", "pairs", "mixed"];
const timers: TimerSeconds[] = [10, 15, 20, 30];
const labels = {
  uz: { title: "Multiplayer quiz", subtitle: "Do‘stlaringiz bilan bir roomda tezkor English quiz o‘ynang.", create: "Yangi room yaratish", join: "Roomga qo‘shilish", roomCode: "Room kodi", connect: "Ulanmoqda...", resume: "Oxirgi roomga qaytish", share: "Kod ulashish", players: "O‘yinchilar", host: "Host", reconnecting: "Qayta ulanmoqda", category: "Kategoriya", level: "Daraja", timer: "Har savol uchun vaqt", start: "Quizni boshlash", waiting: "Host quizni boshlashini kuting.", leave: "Roomdan chiqish", countdown: "Tayyorlaning", question: "Savol", submitted: "Javob yuborildi", explanation: "Izoh", leaderboard: "Leaderboard", next: "Keyingi savol", finish: "Yakuniy natija", your: "Sizning natijangiz", score: "Ball", rank: "O‘rin", accuracy: "Aniqlik", correct: "To‘g‘ri", review: "Xatolarni ko‘rish", again: "Yana o‘ynash", skip: "O‘tkazib yuborish", error: "Multiplayer bilan bog‘lanib bo‘lmadi.", modes: { vocab: "Vocabulary", grammar: "Grammar", pairs: "Pairs", mixed: "Mixed" } },
  ru: { title: "Multiplayer quiz", subtitle: "Играйте в быстрый English quiz с друзьями в одной комнате.", create: "Создать комнату", join: "Войти в комнату", roomCode: "Код комнаты", connect: "Подключаемся...", resume: "Вернуться в последнюю комнату", share: "Поделиться кодом", players: "Игроки", host: "Хост", reconnecting: "Переподключается", category: "Категория", level: "Уровень", timer: "Время на вопрос", start: "Начать quiz", waiting: "Ждём, пока хост начнёт quiz.", leave: "Покинуть комнату", countdown: "Приготовьтесь", question: "Вопрос", submitted: "Ответ отправлен", explanation: "Объяснение", leaderboard: "Таблица лидеров", next: "Следующий вопрос", finish: "Итоговый результат", your: "Ваш результат", score: "Баллы", rank: "Место", accuracy: "Точность", correct: "Верно", review: "Разобрать ошибки", again: "Играть снова", skip: "Пропустить", error: "Не удалось подключиться к multiplayer.", modes: { vocab: "Vocabulary", grammar: "Grammar", pairs: "Pairs", mixed: "Mixed" } },
  en: { title: "Multiplayer quiz", subtitle: "Play a fast English quiz with friends in the same room.", create: "Create a room", join: "Join a room", roomCode: "Room code", connect: "Connecting...", resume: "Return to last room", share: "Share code", players: "Players", host: "Host", reconnecting: "Reconnecting", category: "Category", level: "Level", timer: "Time per question", start: "Start quiz", waiting: "Wait for the host to start the quiz.", leave: "Leave room", countdown: "Get ready", question: "Question", submitted: "Answer submitted", explanation: "Explanation", leaderboard: "Leaderboard", next: "Next question", finish: "Final result", your: "Your result", score: "Score", rank: "Rank", accuracy: "Accuracy", correct: "Correct", review: "Review mistakes", again: "Play again", skip: "Skip", error: "We couldn't connect to multiplayer.", modes: { vocab: "Vocabulary", grammar: "Grammar", pairs: "Pairs", mixed: "Mixed" } },
} as const;

type MultiplayerCopy = { [Key in keyof typeof labels.en]: Key extends "modes" ? Record<QuizMode, string> : string };

export default function Multiplayer() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const socket = useRef<WebSocket | null>(null);
  const offset = useRef(0);
  const [phase, setPhase] = useState<Phase>("menu");
  const [code, setCode] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<QuizMode>("vocab");
  const [level, setLevel] = useState("A1");
  const [timer, setTimer] = useState<TimerSeconds>(15);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [board, setBoard] = useState<ScoreRow[]>([]);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const isHost = hostId === user?.id;

  useEffect(() => { void AsyncStorage.getItem(RESUME_KEY).then(setResume); }, []);
  useEffect(() => () => { socket.current?.close(); }, []);
  useEffect(() => { if (deadline === null) { setSeconds(null); return; } const update = () => setSeconds(Math.max(0, Math.ceil((deadline - (Date.now() + offset.current)) / 1000))); update(); const handle = setInterval(update, 250); return () => clearInterval(handle); }, [deadline]);

  const remember = (next: string | null) => { setResume(next); if (next) void AsyncStorage.setItem(RESUME_KEY, next); else void AsyncStorage.removeItem(RESUME_KEY); };
  const resetRound = () => { setQuestion(null); setSelected(null); setResult(null); setBoard([]); setFinished(null); setDeadline(null); };
  const receive = (raw: unknown) => {
    const message = raw as { type?: string; [key: string]: unknown };
    if (typeof message.type !== "string") return;
    const timed = message as { ends_at?: number; server_now?: number };
    if (typeof timed.server_now === "number") offset.current = timed.server_now - Date.now();
    if (typeof timed.ends_at === "number") setDeadline(timed.ends_at);
    setError(null);
    if (message.type === "lobby") { const room = message as unknown as { code: string; host_id: string; players: Player[] }; setCode(room.code); setHostId(room.host_id); setPlayers(room.players); setPhase("lobby"); remember(room.code); return; }
    if (message.type === "countdown") { setPhase("countdown"); return; }
    if (message.type === "question") { setQuestion(message as unknown as Question); setSelected(null); setResult(null); setPhase("question"); return; }
    if (message.type === "question_result") { setResult(message as unknown as Result); setPhase("question_result"); return; }
    if (message.type === "leaderboard") { const next = message as unknown as { board: ScoreRow[] }; setBoard(next.board); setPhase("leaderboard"); return; }
    if (message.type === "finished") { setFinished(message as unknown as Finished); setPhase("finished"); setDeadline(null); return; }
    if (message.type === "host_changed") { setHostId(String(message.host_id)); return; }
    if (message.type === "player_status") { const status = message as unknown as { user_id: string; connected: boolean }; setPlayers((current) => current.map((item) => item.user_id === status.user_id ? { ...item, connected: status.connected } : item)); return; }
    if (message.type === "error") setError(errorFor(String(message.error), locale));
  };
  const withSocket = (after: (open: WebSocket) => void) => {
    if (!token) return;
    if (socket.current?.readyState === WebSocket.OPEN) { after(socket.current); return; }
    setPhase("connecting"); setError(null);
    const base = API_URL.replace(/^http/, "ws");
    const next = new WebSocket(`${base}/api/v1/ws/quiz?token=${encodeURIComponent(token)}`);
    socket.current = next;
    next.onopen = () => after(next);
    next.onmessage = (event) => { try { receive(JSON.parse(String(event.data))); } catch { setError(t.error); } };
    next.onerror = () => setError(t.error);
    next.onclose = () => {
      if (socket.current === next) socket.current = null;
      setPhase((current) => current === "connecting" ? "menu" : current);
    };
  };
  const act = (payload: Record<string, unknown>) => { if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(payload)); };
  const create = () => withSocket((open) => open.send(JSON.stringify({ action: "create" })));
  const join = (value: string) => { const normalized = value.trim().toUpperCase(); if (normalized) withSocket((open) => open.send(JSON.stringify({ action: "join", code: normalized }))); };
  const leave = () => { act({ action: "leave" }); socket.current?.close(); socket.current = null; setPhase("menu"); setCode(null); setHostId(null); setPlayers([]); resetRound(); remember(null); };
  const answer = (option: number) => { if (!question || selected !== null) return; setSelected(option); act({ action: "answer", index: question.index, option }); };
  const share = async () => { if (code) await Share.share({ message: `${t.title}\n${t.roomCode}: ${code}` }); };

  return <Screen appHeader><View style={styles.hero}><Ionicons name="people-outline" size={29} color={colors.raised} /><Heading sub={t.subtitle}>{t.title}</Heading></View><ErrorNote message={error} />
    {(phase === "menu" || phase === "connecting") ? <Menu t={t} code={joinCode} connecting={phase === "connecting"} resume={resume} onCode={setJoinCode} onCreate={create} onJoin={() => join(joinCode)} onResume={() => resume && join(resume)} /> : null}
    {phase === "lobby" && code ? <Lobby t={t} code={code} players={players} isHost={isHost} hostId={hostId} mode={mode} level={level} timer={timer} onShare={() => void share()} onMode={setMode} onLevel={setLevel} onTimer={setTimer} onStart={() => act({ action: "start", level, mode, timer_seconds: timer })} onLeave={leave} /> : null}
    {phase === "countdown" ? <Paper style={styles.countdown}><Ionicons name="hourglass-outline" size={34} color={colors.rust} /><Text style={styles.countdownTitle}>{t.countdown}</Text><Text style={styles.countdownValue}>{seconds ?? "—"}</Text></Paper> : null}
    {(phase === "question" || phase === "question_result") && question ? <QuestionView t={t} question={question} result={result} selected={selected} seconds={seconds} isHost={isHost} players={players} onAnswer={answer} onSkip={() => act({ action: "skip" })} /> : null}
    {phase === "leaderboard" ? <Leaderboard t={t} board={board} seconds={seconds} isHost={isHost} onSkip={() => act({ action: "skip" })} /> : null}
    {phase === "finished" && finished ? <FinishedView t={t} finished={finished} userId={user?.id ?? ""} showReview={showReview} onToggleReview={() => setShowReview((value) => !value)} onAgain={leave} /> : null}
  </Screen>;
}

function Menu({ t, code, connecting, resume, onCode, onCreate, onJoin, onResume }: { t: MultiplayerCopy; code: string; connecting: boolean; resume: string | null; onCode: (value: string) => void; onCreate: () => void; onJoin: () => void; onResume: () => void }) { return <View style={styles.menu}><Button icon="add-circle-outline" loading={connecting} onPress={onCreate}>{t.create}</Button><Text style={styles.or}>{t.roomCode}</Text><Paper style={styles.join}><Field label={t.roomCode} value={code} maxLength={6} autoCapitalize="characters" autoCorrect={false} onChangeText={(value) => onCode(value.toUpperCase())} onSubmitEditing={onJoin} /><Button variant="secondary" icon="enter-outline" disabled={!code.trim() || connecting} onPress={onJoin}>{t.join}</Button></Paper>{resume ? <Button variant="quiet" icon="refresh-outline" onPress={onResume}>{`${t.resume}: ${resume}`}</Button> : null}{connecting ? <Text style={styles.connecting}>{t.connect}</Text> : null}</View>; }
function Lobby({ t, code, players, isHost, hostId, mode, level, timer, onShare, onMode, onLevel, onTimer, onStart, onLeave }: { t: MultiplayerCopy; code: string; players: Player[]; isHost: boolean; hostId: string | null; mode: QuizMode; level: string; timer: TimerSeconds; onShare: () => void; onMode: (value: QuizMode) => void; onLevel: (value: string) => void; onTimer: (value: TimerSeconds) => void; onStart: () => void; onLeave: () => void }) { return <View style={styles.lobby}><Paper style={styles.codePanel}><Text style={styles.codeLabel}>{t.roomCode}</Text><Text selectable style={styles.code}>{code}</Text><Button variant="secondary" icon="share-outline" onPress={onShare}>{t.share}</Button></Paper><Text style={styles.sectionTitle}>{t.players} · {players.length}</Text><View style={styles.playerList}>{players.map((player) => <Paper key={player.user_id} style={[styles.player, !player.connected && styles.playerAway]}><View style={[styles.dot, player.connected && styles.dotOnline]} /><Text style={styles.playerName}>{player.name}</Text>{player.user_id === hostId ? <Text style={styles.host}>{t.host}</Text> : null}{!player.connected ? <Text style={styles.away}>{t.reconnecting}</Text> : null}</Paper>)}</View>{isHost ? <Paper style={styles.setup}><Text style={styles.setupLabel}>{t.category}</Text><View style={styles.choices}>{modes.map((item) => <Choice key={item} active={mode === item} onPress={() => onMode(item)}>{t.modes[item]}</Choice>)}</View><Text style={styles.setupLabel}>{t.level}</Text><View style={styles.choices}>{["A1", "A2", "B1", "B2"].map((item) => <Choice key={item} active={level === item} onPress={() => onLevel(item)}>{item}</Choice>)}</View><Text style={styles.setupLabel}>{t.timer}</Text><View style={styles.choices}>{timers.map((item) => <Choice key={item} active={timer === item} onPress={() => onTimer(item)}>{`${item}s`}</Choice>)}</View><Button icon="play" onPress={onStart}>{t.start}</Button></Paper> : <Paper style={styles.wait}><Ionicons name="time-outline" size={23} color={colors.teal} /><Text style={styles.waitText}>{t.waiting}</Text></Paper>}<Button variant="quiet" icon="exit-outline" onPress={onLeave}>{t.leave}</Button></View>; }
function QuestionView({ t, question, result, selected, seconds, isHost, players, onAnswer, onSkip }: { t: MultiplayerCopy; question: Question; result: Result | null; selected: number | null; seconds: number | null; isHost: boolean; players: Player[]; onAnswer: (option: number) => void; onSkip: () => void }) {
  const revealed = result !== null;
  return <View style={styles.game}>
    <View style={styles.questionMeta}><Text style={styles.modeBadge}>{t.modes[question.mode]}</Text><Text style={styles.counter}>{`${t.question} ${question.index + 1}/${question.total}`}</Text></View>
    {!revealed ? <Text style={styles.time}>{`${seconds ?? "—"}s`}</Text> : null}
    <Paper style={styles.prompt}><Text style={styles.promptText}>{question.prompt}</Text></Paper>
    <View style={styles.options}>{question.options.map((option, index) => {
      const correct = revealed && index === result.answer_index;
      const wrong = revealed && index === selected && !correct;
      return <Pressable key={`${option}-${index}`} accessibilityRole="radio" accessibilityState={{ selected: index === selected, disabled: selected !== null || revealed }} disabled={selected !== null || revealed} onPress={() => onAnswer(index)} style={({ pressed }) => [styles.option, index === selected && !revealed && styles.optionSelected, correct && styles.optionCorrect, wrong && styles.optionWrong, pressed && selected === null && !revealed && styles.pressed]}>
        <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text><Text style={styles.optionText}>{option}</Text>{correct || wrong ? <Ionicons name={correct ? "checkmark-circle" : "close-circle"} size={20} color={correct ? colors.teal : colors.danger} /> : null}
      </Pressable>;
    })}</View>
    {selected !== null && !revealed ? <Text style={styles.submitted}>{t.submitted}</Text> : null}
    {result ? <View style={styles.resultBlock}>
      {result.explanation ? <Paper style={styles.explanation}><Text style={styles.explanationTitle}>{t.explanation}</Text><Text style={styles.explanationBody}>{result.explanation.translation_uz}</Text>{result.explanation.example_en ? <Text style={styles.explanationExample}>{result.explanation.example_en}</Text> : null}</Paper> : null}
      <View style={styles.roundPlayers}>{result.results.map((row) => <Paper key={row.user_id} style={styles.roundPlayer}><Ionicons name={row.correct ? "checkmark-circle" : "close-circle"} size={18} color={row.correct ? colors.teal : colors.danger} /><Text style={styles.roundName}>{players.find((player) => player.user_id === row.user_id)?.name ?? "—"}</Text><Text style={styles.points}>{`+${row.points}`}</Text></Paper>)}</View>
    </View> : null}
    {isHost ? <Button variant="quiet" icon="play-skip-forward-outline" onPress={onSkip}>{t.skip}</Button> : null}
  </View>;
}
function Leaderboard({ t, board, seconds, isHost, onSkip }: { t: MultiplayerCopy; board: ScoreRow[]; seconds: number | null; isHost: boolean; onSkip: () => void }) { return <View style={styles.game}><View style={styles.leaderHeader}><Text style={styles.sectionTitle}>{t.leaderboard}</Text><Text style={styles.time}>{`${seconds ?? "—"}s`}</Text></View><View style={styles.board}>{board.map((row) => <Paper key={row.user_id} style={styles.boardRow}><Text style={styles.rank}>#{row.rank}</Text><Text style={styles.boardName}>{row.name}</Text><Text style={styles.boardScore}>{row.score}</Text></Paper>)}</View>{isHost ? <Button variant="quiet" icon="play-skip-forward-outline" onPress={onSkip}>{t.skip}</Button> : null}</View>; }
function FinishedView({ t, finished, userId, showReview, onToggleReview, onAgain }: { t: MultiplayerCopy; finished: Finished; userId: string; showReview: boolean; onToggleReview: () => void; onAgain: () => void }) { const summary = finished.summaries[userId]; const review = finished.review[userId] ?? []; return <View style={styles.game}><Text style={styles.finishTitle}>{t.finish}</Text><View style={styles.board}>{finished.board.slice(0, 5).map((row) => <Paper key={row.user_id} style={[styles.boardRow, row.user_id === userId && styles.me]}><Text style={styles.rank}>#{row.rank}</Text><Text style={styles.boardName}>{row.name}</Text><Text style={styles.boardScore}>{row.score}</Text></Paper>)}</View>{summary ? <Paper style={styles.summary}><Text style={styles.summaryTitle}>{t.your}</Text><View style={styles.summaryGrid}>{[[t.score, String(summary.score)], [t.rank, summary.rank ? `#${summary.rank}` : "—"], [t.accuracy, `${summary.accuracy}%`], [t.correct, `${summary.correct_count}/${summary.total}`]].map(([label, value]) => <View key={label}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>)}</View></Paper> : null}{review.length ? <Button variant="secondary" icon="search-outline" onPress={onToggleReview}>{t.review}</Button> : null}{showReview ? <View style={styles.review}>{review.map((item) => <Paper key={item.index} style={styles.reviewItem}><Text style={styles.reviewPrompt}>{item.prompt}</Text><Text style={styles.reviewAnswer}>{item.options[item.answer_index]}</Text>{item.explanation?.translation_uz ? <Text style={styles.reviewNote}>{item.explanation.translation_uz}</Text> : null}</Paper>)}</View> : null}<Button icon="refresh" onPress={onAgain}>{t.again}</Button></View>; }
function Choice({ active, onPress, children }: { active: boolean; onPress: () => void; children: string }) { return <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{children}</Text></Pressable>; }
function errorFor(code: string, locale: Locale) { const fallback = labels[locale].error; return ({ unauthorized: locale === "uz" ? "Qayta login qiling." : locale === "ru" ? "Войдите снова." : "Please sign in again.", rate_limited: locale === "uz" ? "Juda ko‘p urinish. Biroz kuting." : locale === "ru" ? "Слишком много попыток. Подождите." : "Too many attempts. Please wait.", room_not_found: locale === "uz" ? "Room topilmadi." : locale === "ru" ? "Комната не найдена." : "Room not found.", already_started: locale === "uz" ? "Quiz allaqachon boshlangan." : locale === "ru" ? "Quiz уже начался." : "The quiz has already started.", room_full: locale === "uz" ? "Room to‘ldi." : locale === "ru" ? "Комната заполнена." : "This room is full.", not_enough_words: locale === "uz" ? "Bu darajada yetarli savol yo‘q." : locale === "ru" ? "Для этого уровня недостаточно вопросов." : "There are not enough questions for this level.", forbidden: locale === "uz" ? "Bu amal sizga ruxsat etilmagan." : locale === "ru" ? "Это действие недоступно." : "You cannot do that.", round_closed: locale === "uz" ? "Bu savol yopilgan." : locale === "ru" ? "Этот вопрос уже закрыт." : "This question is closed." } as Record<string, string>)[code] ?? fallback; }

const styles = StyleSheet.create({ hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.brand950 }, menu: { gap: 13 }, or: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: .7, textAlign: "center", textTransform: "uppercase", color: colors.muted }, join: { gap: 10 }, connecting: { fontFamily: fonts.uiMedium, fontSize: 13, textAlign: "center", color: colors.muted }, lobby: { gap: 14 }, codePanel: { alignItems: "center", gap: 8, paddingVertical: 20, backgroundColor: colors.brand100 }, codeLabel: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted }, code: { fontFamily: fonts.uiBold, fontSize: 32, letterSpacing: 6, color: colors.rustDark }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink }, playerList: { gap: 7 }, player: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 10 }, playerAway: { opacity: .55 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.muted }, dotOnline: { backgroundColor: colors.teal }, playerName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, host: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.rustDark }, away: { fontFamily: fonts.uiMedium, fontSize: 10, color: colors.muted }, setup: { gap: 10 }, setupLabel: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 11, textTransform: "uppercase", letterSpacing: .6, color: colors.muted }, choices: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, choice: { minHeight: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 11, backgroundColor: colors.raised }, choiceActive: { borderColor: colors.brand600, backgroundColor: colors.brand600 }, choiceText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink }, choiceTextActive: { color: colors.raised }, wait: { alignItems: "center", gap: 9, paddingVertical: 22 }, waitText: { fontFamily: fonts.ui, fontSize: 14, textAlign: "center", color: colors.muted }, countdown: { alignItems: "center", gap: 8, paddingVertical: 40 }, countdownTitle: { fontFamily: fonts.uiBold, fontSize: 18, color: colors.ink }, countdownValue: { fontFamily: fonts.display, fontSize: 66, lineHeight: 72, color: colors.rust }, game: { gap: 13 }, questionMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, modeBadge: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5, fontFamily: fonts.uiBold, fontSize: 11, color: colors.rustDark, backgroundColor: colors.brand100 }, counter: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted }, time: { alignSelf: "center", minWidth: 66, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 6, overflow: "hidden", fontFamily: fonts.uiBold, fontSize: 17, textAlign: "center", color: colors.rustDark, backgroundColor: colors.brand100 }, prompt: { paddingVertical: 27 }, promptText: { fontFamily: fonts.uiBold, fontSize: 21, lineHeight: 30, textAlign: "center", color: colors.ink }, options: { gap: 9 }, option: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 12, backgroundColor: colors.cream }, optionSelected: { borderColor: colors.brand600, backgroundColor: "rgba(185,78,40,.10)" }, optionCorrect: { borderColor: colors.teal, backgroundColor: "rgba(70,120,120,.10)" }, optionWrong: { borderColor: colors.danger, backgroundColor: "rgba(220,38,38,.08)" }, optionLetter: { width: 29, height: 29, overflow: "hidden", borderRadius: 15, textAlign: "center", fontFamily: fonts.uiBold, fontSize: 12, lineHeight: 29, color: colors.raised, backgroundColor: colors.brand600 }, optionText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, submitted: { fontFamily: fonts.uiBold, fontSize: 13, textAlign: "center", color: colors.teal }, resultBlock: { gap: 10 }, explanation: { gap: 5, backgroundColor: colors.brand100 }, explanationTitle: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: .6, textTransform: "uppercase", color: colors.rustDark }, explanationBody: { fontFamily: fonts.uiBold, fontSize: 15, lineHeight: 22, color: colors.ink }, explanationExample: { fontFamily: fonts.ui, fontSize: 12, fontStyle: "italic", color: colors.muted }, roundPlayers: { gap: 6 }, roundPlayer: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9 }, roundName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink }, points: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.rustDark }, leaderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, board: { gap: 7 }, boardRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11 }, me: { borderColor: colors.brand600, backgroundColor: colors.brand100 }, rank: { width: 30, fontFamily: fonts.uiBold, fontSize: 14, color: colors.rustDark }, boardName: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, boardScore: { fontFamily: fonts.display, fontSize: 22, color: colors.ink }, finishTitle: { fontFamily: fonts.display, fontSize: 31, textAlign: "center", color: colors.ink, textTransform: "uppercase" }, summary: { gap: 11, alignItems: "center" }, summaryTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, summaryGrid: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", gap: 10 }, summaryValue: { fontFamily: fonts.uiBold, fontSize: 17, textAlign: "center", color: colors.ink }, summaryLabel: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 10, textAlign: "center", color: colors.muted }, review: { gap: 8 }, reviewItem: { gap: 5 }, reviewPrompt: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink }, reviewAnswer: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.teal }, reviewNote: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted }, pressed: { opacity: .72, transform: [{ translateY: 1 }] } });
