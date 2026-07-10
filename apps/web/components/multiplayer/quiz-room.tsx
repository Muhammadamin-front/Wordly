"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  openQuizSocket,
  sendAction,
  type RoomPlayer,
  type ScoreRow,
  type ServerMessage,
} from "@/lib/multiplayer";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

interface RoomState {
  code: string;
  host_id: string;
  players: RoomPlayer[];
}
interface Question {
  index: number;
  total: number;
  prompt: string;
  options: string[];
}
type Phase = "menu" | "connecting" | "lobby" | "question" | "reveal" | "finished";

export function QuizRoom({ lang, mp }: { lang: string; mp: Dictionary["mp"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);

  const [phase, setPhase] = useState<Phase>("menu");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreRow[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [level, setLevel] = useState<string>("A1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => () => socketRef.current?.close(), []);

  const handleMessage = useCallback((msg: ServerMessage) => {
    setError(null);
    switch (msg.type) {
      case "created":
      case "lobby":
        setRoom({ code: msg.code, host_id: msg.host_id, players: msg.players });
        setPhase("lobby");
        break;
      case "question":
        setQuestion(msg);
        setAnswerIndex(null);
        setSelected(null);
        setPhase("question");
        break;
      case "reveal":
        setAnswerIndex(msg.answer_index);
        setScoreboard(msg.scoreboard);
        setPhase("reveal");
        break;
      case "finished":
        setScoreboard(msg.scoreboard);
        setPhase("finished");
        break;
      case "error":
        setError(msg.error === "not_enough_words" ? mp.notEnoughWords : mp.roomCode);
        break;
    }
  }, [mp]);

  // Opens (or reuses) the socket, then runs `then` once it is ready to send.
  const withSocket = useCallback(
    (then: (socket: WebSocket) => void) => {
      const existing = socketRef.current;
      if (existing && existing.readyState === WebSocket.OPEN) {
        then(existing);
        return;
      }
      setPhase("connecting");
      const socket = openQuizSocket();
      socketRef.current = socket;
      socket.onmessage = (event) => handleMessage(JSON.parse(event.data) as ServerMessage);
      socket.onopen = () => then(socket);
      socket.onclose = () => {
        socketRef.current = null;
      };
    },
    [handleMessage]
  );

  const create = () => withSocket((s) => sendAction(s, { action: "create" }));
  const join = (event: FormEvent) => {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    withSocket((s) => sendAction(s, { action: "join", code }));
  };
  const start = () => {
    if (socketRef.current) sendAction(socketRef.current, { action: "start", level });
  };
  const answer = (option: number) => {
    if (!question || selected !== null || !socketRef.current) return;
    setSelected(option);
    sendAction(socketRef.current, { action: "answer", index: question.index, option });
  };
  const next = () => {
    if (socketRef.current) sendAction(socketRef.current, { action: "next" });
  };
  const leave = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setRoom(null);
    setQuestion(null);
    setScoreboard([]);
    setPhase("menu");
  };

  if (!ready || !user) return null;

  const isHost = room?.host_id === user.id;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{mp.title}</h1>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      {/* --- Menu --- */}
      {phase === "menu" && (
        <div className="mt-6 space-y-6">
          <Button fullWidth onClick={create}>
            {mp.create}
          </Button>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            {mp.roomCode}
            <span className="h-px flex-1 bg-line" />
          </div>
          <form onSubmit={join} className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={mp.roomCode}
              maxLength={4}
              className="text-center text-lg font-bold tracking-widest uppercase"
            />
            <Button type="submit" variant="secondary" disabled={!joinCode.trim()}>
              {mp.join}
            </Button>
          </form>
        </div>
      )}

      {phase === "connecting" && (
        <p className="mt-8 text-center text-sm text-ink-soft">{mp.connecting}</p>
      )}

      {/* --- Lobby --- */}
      {phase === "lobby" && room && (
        <div className="mt-6">
          <div className="rounded-xl2 border border-line bg-linear-to-br from-brand-500/10 to-transparent p-6 text-center">
            <p className="text-sm text-ink-soft">{mp.shareRoom}</p>
            <code className="mt-1 block text-4xl font-extrabold tracking-[0.3em] text-brand-600 dark:text-brand-300">
              {room.code}
            </code>
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-soft">
            {mp.players} ({room.players.length})
          </p>
          <ul className="mt-3 space-y-2">
            {room.players.map((p) => (
              <li key={p.user_id} className="rounded-xl border border-line bg-card px-4 py-3 font-semibold text-ink">
                {p.name}
                {p.user_id === room.host_id && (
                  <span className="ml-2 text-xs text-brand-600 dark:text-brand-300">👑</span>
                )}
              </li>
            ))}
          </ul>

          {isHost ? (
            <div className="mt-6">
              <div className="flex justify-center gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
                      level === l ? "bg-brand-600 text-white" : "bg-card text-ink-soft hover:text-ink"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button fullWidth className="mt-4" onClick={start}>
                {mp.start}
              </Button>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-ink-soft">{mp.waiting}</p>
          )}

          <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={leave}>
            ✕
          </Button>
        </div>
      )}

      {/* --- Question / Reveal --- */}
      {(phase === "question" || phase === "reveal") && question && (
        <div className="mt-6">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-ink-soft">
            {question.index + 1} / {question.total}
          </p>
          <div className="mt-3 rounded-xl2 border border-line bg-card p-8 text-center">
            <p className="text-2xl font-extrabold text-ink">{question.prompt}</p>
          </div>

          <div className="mt-4 grid gap-3">
            {question.options.map((opt, i) => {
              const revealed = phase === "reveal";
              const isAnswer = revealed && i === answerIndex;
              const isWrongPick = revealed && i === selected && i !== answerIndex;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={selected !== null || revealed}
                  onClick={() => answer(i)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors",
                    isAnswer && "border-success bg-success/10 text-success",
                    isWrongPick && "border-danger bg-danger/10 text-danger",
                    !isAnswer && !isWrongPick && i === selected && "border-brand-400 bg-brand-500/5 text-ink",
                    !revealed && i !== selected && "border-line bg-card text-ink hover:border-brand-400",
                    revealed && !isAnswer && !isWrongPick && "border-line bg-card text-ink-soft"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {phase === "reveal" && (
            <>
              <ul className="mt-6 space-y-2">
                {scoreboard.map((row) => (
                  <li
                    key={row.user_id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5",
                      row.user_id === user.id ? "border-brand-400 bg-brand-500/5" : "border-line bg-card"
                    )}
                  >
                    <span className="w-5 text-center text-sm font-bold text-ink-soft">{row.rank}</span>
                    <span className="flex-1 truncate font-semibold text-ink">{row.name}</span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{row.score}</span>
                  </li>
                ))}
              </ul>
              {isHost && (
                <Button fullWidth className="mt-4" onClick={next}>
                  {mp.next}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* --- Finished --- */}
      {phase === "finished" && (
        <div className="mt-8 text-center">
          <p className="text-6xl" aria-hidden>
            🏆
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">{mp.finalScore}</h2>
          <ul className="mt-6 space-y-2 text-left">
            {scoreboard.map((row) => (
              <li
                key={row.user_id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3",
                  row.rank === 1 ? "border-yellow-500/50 bg-yellow-500/10" : "border-line bg-card"
                )}
              >
                <span className="w-6 text-center text-lg">{row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : row.rank}</span>
                <span className="flex-1 truncate font-semibold text-ink">{row.name}</span>
                <span className="font-bold text-brand-600 dark:text-brand-300">{row.score}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-6" onClick={leave}>
            {mp.playAgain}
          </Button>
        </div>
      )}
    </main>
  );
}
