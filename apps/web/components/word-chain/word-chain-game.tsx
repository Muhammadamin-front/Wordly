"use client";

import { AlertTriangle, ArrowLeft, Wifi } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { socialApi } from "@/lib/social";
import {
  authenticateWordChainSocket,
  openWordChainSocket,
  recallWordChainRoom,
  rememberWordChainRoom,
  sendWordChainAction,
  type WordChainAction,
  type WordChainError,
  type WordChainServerMessage,
  type WordChainState,
  type WordRejectionReason,
} from "@/lib/word-chain";
import { GameLobby } from "./game-lobby";
import { GameMenu } from "./game-menu";
import { GameTable, type SubmissionFeedback } from "./game-table";
import { WinnerScreen } from "./winner-screen";
import styles from "./word-chain.module.css";

type Copy = Dictionary["wordChain"];
type Connection = "idle" | "connecting" | "connected" | "reconnecting";

function template(value: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) => result.replace(`{${key}}`, String(replacement)),
    value
  );
}

function rejectionMessage(copy: Copy, reason: WordRejectionReason, letter?: string): string {
  const labels: Record<WordRejectionReason, string> = {
    EMPTY_WORD: copy.reason_EMPTY_WORD,
    TOO_SHORT: copy.reason_TOO_SHORT,
    UNSUPPORTED_CHARACTERS: copy.reason_UNSUPPORTED_CHARACTERS,
    INVALID_WORD: copy.reason_INVALID_WORD,
    DICTIONARY_UNAVAILABLE: copy.reason_DICTIONARY_UNAVAILABLE,
    WRONG_LETTER: copy.reason_WRONG_LETTER,
    DUPLICATE_WORD: copy.reason_DUPLICATE_WORD,
    TIME_EXPIRED: copy.reason_TIME_EXPIRED,
    NOT_YOUR_TURN: copy.reason_NOT_YOUR_TURN,
    PLAYER_ELIMINATED: copy.reason_PLAYER_ELIMINATED,
    GAME_NOT_PLAYING: copy.reason_GAME_NOT_PLAYING,
  };
  return template(labels[reason], { letter: letter ?? "" });
}

function errorMessage(copy: Copy, error: WordChainError): string {
  return {
    unauthorized: copy.error_unauthorized,
    rate_limited: copy.error_rate_limited,
    room_not_found: copy.error_room_not_found,
    already_started: copy.error_already_started,
    room_full: copy.error_room_full,
    forbidden: copy.error_forbidden,
    not_enough_players: copy.error_not_enough_players,
    dictionary_unavailable: copy.error_dictionary_unavailable,
    connection_lost: copy.error_connection_lost,
  }[error];
}

export function WordChainGame({
  lang,
  copy,
  inviteeId,
  invitationRoomCode,
}: {
  lang: string;
  copy: Copy;
  inviteeId?: string;
  invitationRoomCode?: string;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const stateRef = useRef<WordChainState | null>(null);
  const queuedActionRef = useRef<WordChainAction | null>(null);
  const authenticatedRef = useRef(false);
  const intentionalCloseRef = useRef(false);
  const resumeAttemptedRef = useRef(false);
  const invitationIntentStartedRef = useRef(false);
  const pendingInviteeIdRef = useRef(inviteeId ?? null);
  const invitationRequestRef = useRef(false);
  const pendingInvitationRoomCodeRef = useRef(invitationRoomCode ?? null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const connectRef = useRef<(action: WordChainAction, reconnecting?: boolean) => void>(() => undefined);
  const [state, setState] = useState<WordChainState | null>(null);
  const [connection, setConnection] = useState<Connection>("idle");
  const [error, setError] = useState<WordChainError | null>(null);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);
  const [invitationTransition, setInvitationTransition] = useState<"creating" | "joining" | null>(
    invitationRoomCode ? "joining" : inviteeId ? "creating" : null
  );
  const [invitationNotice, setInvitationNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  const showFeedback = useCallback((next: SubmissionFeedback) => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    setFeedback(next);
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(null), 2400);
  }, []);

  const connect = useCallback((nextAction: WordChainAction, reconnecting = false) => {
    const existing = socketRef.current;
    if (existing?.readyState === WebSocket.OPEN && authenticatedRef.current) {
      sendWordChainAction(existing, nextAction);
      return;
    }

    queuedActionRef.current = nextAction;
    intentionalCloseRef.current = false;
    authenticatedRef.current = false;
    setConnection(reconnecting ? "reconnecting" : "connecting");
    const socket = openWordChainSocket();
    socketRef.current = socket;

    socket.onopen = () => authenticateWordChainSocket(socket);
    socket.onmessage = (event) => {
      let message: WordChainServerMessage;
      try {
        message = JSON.parse(event.data) as WordChainServerMessage;
      } catch {
        return;
      }
      if (message.type === "authenticated") {
        authenticatedRef.current = true;
        reconnectAttemptsRef.current = 0;
        setConnection("connected");
        const action = queuedActionRef.current;
        queuedActionRef.current = null;
        if (action) sendWordChainAction(socket, action);
        return;
      }
      if (message.type === "word_chain_state") {
        const previousTurn = stateRef.current?.turn;
        stateRef.current = message.state;
        setState(message.state);
        setError(null);
        rememberWordChainRoom(message.state.code);
        if (pendingInvitationRoomCodeRef.current) {
          pendingInvitationRoomCodeRef.current = null;
          setInvitationTransition(null);
          window.history.replaceState(null, "", `/${lang}/multiplayer/word-chain`);
        }
        const pendingInviteeId = pendingInviteeIdRef.current;
        if (
          pendingInviteeId
          && !invitationRequestRef.current
          && message.state.status === "waiting"
          && message.state.host_id === user?.id
          && message.state.matchmaking_status === null
        ) {
          invitationRequestRef.current = true;
          void socialApi
            .inviteToWordChain(pendingInviteeId, message.state.code)
            .then(() => {
              pendingInviteeIdRef.current = null;
              setInvitationTransition(null);
              setInvitationNotice({ tone: "success", text: copy.friendInviteSent });
              window.history.replaceState(null, "", `/${lang}/multiplayer/word-chain`);
            })
            .catch(() => {
              pendingInviteeIdRef.current = null;
              setInvitationTransition(null);
              setInvitationNotice({ tone: "error", text: copy.friendInviteFailed });
              window.history.replaceState(null, "", `/${lang}/multiplayer/word-chain`);
            });
        }
        if (message.state.last_event?.kind === "word_accepted" && message.state.turn !== previousTurn) {
          const base = message.state.last_event.challenge_completed
            ? copy.challengeComplete
            : copy.validWord;
          showFeedback({
            tone: "good",
            // The server can pick a different next letter than the word's own
            // last letter when that one is running low (see WordChainRoom.
            // _next_letter) — "Start with the final letter" is the headline
            // rule, but silently breaking it here would look like a bug
            // instead of the deliberate fairness fallback it is.
            message: message.state.last_event.fallback_used
              ? `${base} ${template(copy.fallbackLetterUsed, { letter: message.state.current_letter })}`
              : base,
            word: message.state.last_event.word?.toUpperCase(),
          });
        }
        if (message.state.last_event?.kind === "life_lost" && message.state.turn !== previousTurn) {
          const player = message.state.players.find(
            (candidate) => candidate.id === message.state.last_event?.player_id
          );
          showFeedback({
            tone: "bad",
            message: template(copy.lifeLost, {
              name: player?.username ?? copy.waitingStatus,
              count: message.state.last_event.lives_remaining ?? 0,
            }),
          });
        }
        return;
      }
      if (message.type === "word_rejected") {
        showFeedback({
          tone: "bad",
          message: rejectionMessage(copy, message.reason, message.required_letter),
        });
        return;
      }
      if (message.type === "word_chain_error") {
        setError(message.error);
        if (message.error === "room_not_found" || message.error === "already_started") {
          rememberWordChainRoom(null);
          stateRef.current = null;
          setState(null);
          setConnection("connected");
          pendingInvitationRoomCodeRef.current = null;
          setInvitationTransition(null);
        }
      }
    };
    socket.onerror = () => {
      socketRef.current = null;
    };
    socket.onclose = () => {
      authenticatedRef.current = false;
      socketRef.current = null;
      if (intentionalCloseRef.current) return;
      const roomCode = stateRef.current?.code ?? recallWordChainRoom();
      if (!roomCode || stateRef.current?.status === "finished") {
        setConnection("idle");
        setError("connection_lost");
        if (!stateRef.current) {
          pendingInviteeIdRef.current = null;
          pendingInvitationRoomCodeRef.current = null;
          setInvitationTransition(null);
        }
        return;
      }
      setConnection("reconnecting");
      setError("connection_lost");
      reconnectAttemptsRef.current += 1;
      const delay = Math.min(5000, 750 * 2 ** Math.min(reconnectAttemptsRef.current, 3));
      reconnectTimerRef.current = window.setTimeout(
        () => connectRef.current({ action: "join", code: roomCode }, true),
        delay
      );
    };
  }, [copy, lang, showFeedback, user?.id]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!ready || !user || inviteeId || invitationRoomCode || resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;
    const roomCode = recallWordChainRoom();
    if (roomCode) connect({ action: "join", code: roomCode }, true);
  }, [ready, user, inviteeId, invitationRoomCode, connect]);

  useEffect(() => {
    if (!ready || !user || invitationIntentStartedRef.current) return;
    const action = invitationRoomCode
      ? { action: "join" as const, code: invitationRoomCode.trim().toUpperCase().slice(0, 6) }
      : inviteeId
        ? { action: "create" as const }
        : null;
    if (!action) return;

    invitationIntentStartedRef.current = true;
    resumeAttemptedRef.current = true;
    rememberWordChainRoom(null);
    connect(action);
  }, [ready, user, inviteeId, invitationRoomCode, connect]);

  useEffect(() => () => {
    intentionalCloseRef.current = true;
    socketRef.current?.close();
    if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current);
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  const act = (action: WordChainAction) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN && authenticatedRef.current) {
      sendWordChainAction(socket, action);
    }
  };

  const leave = () => {
    act({ action: "leave" });
    intentionalCloseRef.current = true;
    socketRef.current?.close();
    socketRef.current = null;
    stateRef.current = null;
    setState(null);
    setConnection("idle");
    setError(null);
    setFeedback(null);
    setInvitationTransition(null);
    setInvitationNotice(null);
    pendingInviteeIdRef.current = null;
    pendingInvitationRoomCodeRef.current = null;
    rememberWordChainRoom(null);
  };

  if (!ready || !user) return null;

  const currentPlayer = state?.players.find((player) => player.id === state.current_player_id);
  const liveStatus = state?.status === "playing"
    ? state.current_player_id === user.id
      ? `${copy.yourTurn}. ${template(copy.mustStart, { letter: state.current_letter })}`
      : template(copy.playersTurn, { name: currentPlayer?.username ?? copy.waitingStatus })
    : state?.status === "finished"
      ? copy.winner
      : connection === "reconnecting"
        ? copy.reconnecting
        : copy.waiting;

  return (
    <main id="main-content" tabIndex={-1} className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.title}>{copy.title}</h1>
            <p className={styles.subtitle}>{copy.subtitle}</p>
          </div>
          <Link href={`/${lang}/multiplayer`} className={styles.quietButton} aria-label={copy.backToQuiz}>
            <ArrowLeft size={18} aria-hidden />
            <span className="hidden sm:inline">{copy.backToQuiz}</span>
          </Link>
        </header>

        <p className="sr-only" aria-live="polite" aria-atomic="true">{liveStatus}</p>

        {connection === "reconnecting" && (
          <div role="status" style={{ display: "flex", alignItems: "center", gap: ".55rem", marginBottom: "1rem", color: "var(--wc-muted)" }}>
            <Wifi size={17} aria-hidden />{copy.reconnecting}
          </div>
        )}
        {error && (
          <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", marginBottom: "1rem", border: "1px solid rgb(255 148 113 / .35)", borderRadius: ".75rem", padding: ".8rem 1rem", color: "#ffb094", background: "rgb(127 29 29 / .15)" }}>
            <AlertTriangle size={18} aria-hidden style={{ flex: "none", marginTop: 2 }} />
            {errorMessage(copy, error)}
          </div>
        )}
        {invitationNotice && (
          <div
            role={invitationNotice.tone === "error" ? "alert" : "status"}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: ".6rem",
              marginBottom: "1rem",
              border: `1px solid ${invitationNotice.tone === "error" ? "rgb(255 148 113 / .35)" : "rgb(143 195 185 / .4)"}`,
              borderRadius: ".75rem",
              padding: ".8rem 1rem",
              color: invitationNotice.tone === "error" ? "#ffb094" : "#d5eee8",
              background: invitationNotice.tone === "error" ? "rgb(127 29 29 / .15)" : "rgb(143 195 185 / .1)",
            }}
          >
            {invitationNotice.tone === "error" && <AlertTriangle size={18} aria-hidden style={{ flex: "none", marginTop: 2 }} />}
            {invitationNotice.text}
          </div>
        )}

        {!state && (
          <GameMenu
            copy={copy}
            connecting={connection === "connecting" || connection === "reconnecting"}
            invitationTransition={invitationTransition}
            onCreate={() => connect({ action: "create" })}
            onFindMatch={() => connect({ action: "find_match" })}
            onJoin={(code) => connect({ action: "join", code })}
          />
        )}
        {state?.status === "waiting" && (
          <GameLobby
            copy={copy}
            state={state}
            myUserId={user.id}
            onAddBot={() => act({ action: "add_bot" })}
            onStart={() => act({ action: "start" })}
            onLeave={leave}
          />
        )}
        {state?.status === "playing" && (
          <GameTable
            copy={copy}
            state={state}
            myUserId={user.id}
            feedback={feedback}
            reconnecting={connection === "reconnecting"}
            onSubmit={(word) => act({ action: "submit_word", word })}
            onLeave={leave}
          />
        )}
        {state?.status === "finished" && (
          <WinnerScreen copy={copy} state={state} myUserId={user.id} onPlayAgain={leave} />
        )}
      </div>
    </main>
  );
}
