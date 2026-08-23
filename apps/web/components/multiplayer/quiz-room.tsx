"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { AnswerReveal } from "@/components/multiplayer/answer-reveal";
import { CountdownOverlay } from "@/components/multiplayer/countdown-overlay";
import { LeaderboardPanel } from "@/components/multiplayer/leaderboard-panel";
import { LobbyPanel } from "@/components/multiplayer/lobby-panel";
import { PersonalSummary } from "@/components/multiplayer/personal-summary";
import { Podium } from "@/components/multiplayer/podium";
import { QuestionCard } from "@/components/multiplayer/question-card";
import { ReviewMistakes } from "@/components/multiplayer/review-mistakes";
import { SoundToggle } from "@/components/multiplayer/sound-toggle";
import { useSoundEffects } from "@/components/multiplayer/use-sound-effects";
import {
  openQuizSocket,
  recallRoomCode,
  rememberRoomCode,
  sendAction,
  type ClientAction,
  type MultiplayerError,
  type QuizMode,
  type RoomPlayer,
  type ServerMessage,
  type TimerSeconds,
} from "@/lib/multiplayer";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Phase =
  | "menu"
  | "connecting"
  | "lobby"
  | "countdown"
  | "question"
  | "question_result"
  | "leaderboard"
  | "finished";

export interface State {
  phase: Phase;
  code: string | null;
  hostId: string | null;
  players: RoomPlayer[];
  countdown: Extract<ServerMessage, { type: "countdown" }> | null;
  question: Extract<ServerMessage, { type: "question" }> | null;
  selected: number | null;
  result: Extract<ServerMessage, { type: "question_result" }> | null;
  leaderboard: Extract<ServerMessage, { type: "leaderboard" }> | null;
  finished: Extract<ServerMessage, { type: "finished" }> | null;
  error: MultiplayerError | null;
  reviewOpen: boolean;
}

export const initialState: State = {
  phase: "menu",
  code: null,
  hostId: null,
  players: [],
  countdown: null,
  question: null,
  selected: null,
  result: null,
  leaderboard: null,
  finished: null,
  error: null,
  reviewOpen: false,
};

export type Action = { source: "server"; message: ServerMessage } | { source: "local"; type: "select"; option: number } | { source: "local"; type: "connecting" } | { source: "local"; type: "reset" } | { source: "local"; type: "toggle_review" };

export function reducer(state: State, action: Action): State {
  if (action.source === "local") {
    switch (action.type) {
      case "connecting":
        return { ...initialState, phase: "connecting" };
      case "reset":
        return initialState;
      case "select":
        return state.selected === null ? { ...state, selected: action.option } : state;
      case "toggle_review":
        return { ...state, reviewOpen: !state.reviewOpen };
    }
  }

  const msg = action.message;
  switch (msg.type) {
    case "lobby":
      return {
        ...state,
        phase: "lobby",
        code: msg.code,
        hostId: msg.host_id,
        players: msg.players,
        error: null,
      };
    case "countdown":
      return { ...state, phase: "countdown", countdown: msg, error: null };
    case "question":
      return {
        ...state,
        phase: "question",
        question: msg,
        selected: null,
        result: null,
        leaderboard: null,
        error: null,
      };
    case "question_result":
      return { ...state, phase: "question_result", result: msg, error: null };
    case "leaderboard":
      return { ...state, phase: "leaderboard", leaderboard: msg, error: null };
    case "finished":
      return { ...state, phase: "finished", finished: msg, error: null };
    case "host_changed":
      return { ...state, hostId: msg.host_id };
    case "player_status":
      return {
        ...state,
        players: state.players.map((p) =>
          p.user_id === msg.user_id ? { ...p, connected: msg.connected } : p
        ),
      };
    case "error":
      return { ...state, phase: state.phase === "connecting" ? "menu" : state.phase, error: msg.error };
    default:
      return state;
  }
}

export function QuizRoom({ lang, mp }: { lang: string; mp: Dictionary["mp"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const sound = useSoundEffects();
  const attemptedResume = useRef(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  const withSocket = useCallback((then: (socket: WebSocket) => void) => {
    const existing = socketRef.current;
    if (existing && existing.readyState === WebSocket.OPEN) {
      then(existing);
      return;
    }
    dispatch({ source: "local", type: "connecting" });
    const socket = openQuizSocket();
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerMessage;
      dispatch({ source: "server", message });
    };
    socket.onopen = () => then(socket);
    socket.onclose = () => {
      socketRef.current = null;
    };
  }, []);

  // Auto-resume a game that was live when the page was reloaded — the room
  // code isn't secret (every player already sees it), so remembering it is
  // enough; `join` is idempotent per user_id and does the rest.
  useEffect(() => {
    if (!ready || !user || attemptedResume.current) return;
    attemptedResume.current = true;
    const code = recallRoomCode();
    if (code) withSocket((s) => sendAction(s, { action: "join", code }));
  }, [ready, user, withSocket]);

  useEffect(() => {
    rememberRoomCode(state.code);
  }, [state.code]);

  useEffect(() => {
    if (state.phase === "question_result" && state.result) {
      const mine = state.result.results.find((r) => r.user_id === user?.id);
      sound.play(mine?.correct ? "correct" : "wrong");
    }
  }, [state.phase, state.result, sound, user?.id]);

  useEffect(() => {
    if (state.phase === "leaderboard") sound.play("leaderboard");
  }, [state.phase, sound]);

  useEffect(() => {
    if (state.phase === "finished") sound.play("winner");
  }, [state.phase, sound]);

  useEffect(() => () => socketRef.current?.close(), []);

  const act = useCallback((action: ClientAction) => {
    if (socketRef.current) sendAction(socketRef.current, action);
  }, []);

  const create = () => {
    sound.arm();
    withSocket((s) => sendAction(s, { action: "create" }));
  };
  const join = (code: string) => {
    sound.arm();
    withSocket((s) => sendAction(s, { action: "join", code }));
  };
  const start = (level: string, mode: QuizMode, timerSeconds: TimerSeconds) =>
    act({ action: "start", level, mode, timer_seconds: timerSeconds });
  const answer = (option: number) => {
    if (!state.question || state.selected !== null) return;
    dispatch({ source: "local", type: "select", option });
    sound.play("select");
    act({ action: "answer", index: state.question.index, option });
  };
  const skip = () => act({ action: "skip" });
  const leave = () => {
    if (socketRef.current) sendAction(socketRef.current, { action: "leave" });
    socketRef.current?.close();
    socketRef.current = null;
    rememberRoomCode(null);
    dispatch({ source: "local", type: "reset" });
  };

  if (!ready || !user) return null;

  const isHost = state.hostId === user.id;
  const errorLabel = (code: MultiplayerError | null) =>
    code
      ? {
          unauthorized: mp.errorUnauthorized,
          rate_limited: mp.errorRateLimited,
          room_not_found: mp.errorRoomNotFound,
          already_started: mp.errorAlreadyStarted,
          room_full: mp.errorRoomFull,
          not_enough_words: mp.notEnoughWords,
          forbidden: mp.errorForbidden,
          round_closed: mp.errorRoundClosed,
        }[code]
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{mp.title}</h1>
        <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} labels={{ on: mp.soundOn, off: mp.soundOff }} />
      </div>

      {state.error && (
        <Alert tone="error" className="mt-4">
          {errorLabel(state.error)}
        </Alert>
      )}

      {(state.phase === "menu" || state.phase === "connecting") && (
        <LobbyMenu mp={mp} connecting={state.phase === "connecting"} onCreate={create} onJoin={join} />
      )}

      {state.phase === "lobby" && state.code && (
        <LobbyPanel
          mp={mp}
          code={state.code}
          hostId={state.hostId ?? ""}
          players={state.players}
          isHost={isHost}
          onStart={start}
          onLeave={leave}
        />
      )}

      <AnimatePresence>
        {state.phase === "countdown" && state.countdown && (
          <CountdownOverlay endsAt={state.countdown.ends_at} serverNow={state.countdown.server_now} onTick={() => sound.play("tick")} />
        )}
      </AnimatePresence>

      {(state.phase === "question" || state.phase === "question_result") && state.question && (
        <div className="mt-6">
          <QuestionCard
            mp={mp}
            question={state.question}
            selected={state.selected}
            revealed={state.phase === "question_result"}
            revealAnswerIndex={state.result?.answer_index ?? null}
            onAnswer={answer}
          />
          {state.phase === "question_result" && state.result && (
            <AnswerReveal mp={mp} result={state.result} players={state.players} myUserId={user.id} />
          )}
          {isHost && (state.phase === "question" || state.phase === "question_result") && (
            <HostSkip label={mp.hostSkip} onSkip={skip} />
          )}
        </div>
      )}

      {state.phase === "leaderboard" && state.leaderboard && (
        <div className="mt-6">
          <LeaderboardPanel mp={mp} leaderboard={state.leaderboard} myUserId={user.id} />
          {isHost && <HostSkip label={mp.hostSkip} onSkip={skip} />}
        </div>
      )}

      {state.phase === "finished" && state.finished && (
        <div className="mt-6 space-y-8">
          <Podium mp={mp} board={state.finished.board} />
          {state.finished.summaries[user.id] && (
            <PersonalSummary mp={mp} summary={state.finished.summaries[user.id]} />
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={() => dispatch({ source: "local", type: "toggle_review" })}
              className="text-sm font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
            >
              {state.reviewOpen ? mp.hideMistakes : mp.reviewMistakes}
            </button>
          </div>
          {state.reviewOpen && state.finished.review[user.id] && (
            <ReviewMistakes mp={mp} items={state.finished.review[user.id]} />
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={leave}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-950 bg-primary px-6 text-sm font-bold text-white shadow-[3px_4px_0_#54250f] transition-all hover:-translate-y-0.5"
            >
              {mp.playAgain}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function HostSkip({ label, onSkip }: { label: string; onSkip: () => void }) {
  return (
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={onSkip}
        className="text-xs font-bold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
      >
        {label} →
      </button>
    </div>
  );
}

function LobbyMenu({
  mp,
  connecting,
  onCreate,
  onJoin,
}: {
  mp: Dictionary["mp"];
  connecting: boolean;
  onCreate: () => void;
  onJoin: (code: string) => void;
}) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim().toUpperCase();
    if (code) onJoin(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-6"
    >
      <button
        type="button"
        onClick={onCreate}
        disabled={connecting}
        className="flex min-h-14 w-full items-center justify-center rounded-md border border-brand-950 bg-primary text-base font-bold text-white shadow-[3px_4px_0_#54250f] transition-all hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-60"
      >
        {mp.create}
      </button>
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        {mp.roomCode}
        <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          name="code"
          placeholder={mp.roomCode}
          maxLength={4}
          className="h-14 flex-1 rounded-md border border-line bg-card px-4 text-center text-lg font-bold uppercase tracking-widest text-ink outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={connecting}
          className="min-h-14 rounded-md border border-line bg-raised px-5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {mp.join}
        </button>
      </form>
      {connecting && <p className="text-center text-sm text-ink-soft">{mp.connecting}</p>}
    </motion.div>
  );
}
