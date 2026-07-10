"use client";

import { useEffect, useRef, useState } from "react";

import { Progress } from "@/components/games/choice-game";
import type { GameProps } from "@/components/games/game-player";
import { Button } from "@/components/ui/button";
import { normalize, speak, type GameQuestion } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Minimal typing for the Web Speech recognition API (vendor-prefixed). */
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function makeRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/** Speaking — see the Uzbek word, say the English one out loud. */
export function SpeakingGame({
  questions,
  games,
  onAnswer,
  onComplete,
}: GameProps & { questions: GameQuestion[] }) {
  const [index, setIndex] = useState(0);
  const question = questions[index];

  function resolve() {
    if (index + 1 < questions.length) setIndex(index + 1);
    else onComplete();
  }

  return (
    <div>
      <Progress index={index} total={questions.length} />
      <SpeakingRound
        key={index}
        question={question}
        games={games}
        onResolved={(correct, ms) => {
          onAnswer(question.card_id, correct, ms);
          window.setTimeout(resolve, 1400);
        }}
      />
    </div>
  );
}

function SpeakingRound({
  question,
  games,
  onResolved,
}: {
  question: GameQuestion;
  games: GameProps["games"];
  onResolved: (correct: boolean, durationMs: number) => void;
}) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [supported, setSupported] = useState(true);
  const shownAt = useRef(0);
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => {
    shownAt.current = Date.now();
    return () => recognitionRef.current?.stop();
  }, []);

  function finish(correct: boolean, transcript: string | null) {
    if (result) return;
    setHeard(transcript);
    setResult(correct ? "correct" : "wrong");
    onResolved(correct, Date.now() - shownAt.current);
  }

  function startListening() {
    if (result || listening) return;
    const recognition = makeRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      setListening(false);
      const alternatives = Array.from(event.results[0] ?? []).map((a) =>
        normalize(a.transcript)
      );
      const target = normalize(question.answer);
      finish(alternatives.some((t) => t === target || t.includes(target)), alternatives[0] ?? "");
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  // Without SpeechRecognition (Firefox, some in-app browsers) fall back to
  // honest self-assessment: hear the word, say it, grade yourself.
  const selfAssess = (correct: boolean) => finish(correct, null);

  return (
    <div>
      <div className="mt-6 rounded-xl2 border border-line bg-card p-8 text-center">
        <p className="text-sm text-ink-soft">🇺🇿</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{question.prompt}</p>
        <button
          type="button"
          onClick={() => speak(question.answer)}
          className="mt-3 text-sm text-ink-soft underline-offset-2 hover:underline"
        >
          🔊 {games.tapToHear}
        </button>

        {result && (
          <p
            className={cn(
              "mt-4 text-lg font-bold",
              result === "correct" ? "text-success" : "text-danger"
            )}
          >
            {result === "correct" ? "✓" : "✗"} {question.answer}
            {heard !== null && heard !== "" && (
              <span className="block text-sm font-normal text-ink-soft">
                {games.heard}: “{heard}”
              </span>
            )}
          </p>
        )}
      </div>

      {supported ? (
        <button
          type="button"
          disabled={!!result}
          onClick={startListening}
          className={cn(
            "mx-auto mt-6 flex size-24 items-center justify-center rounded-full text-4xl transition-all",
            listening
              ? "animate-pulse bg-danger/20 ring-4 ring-danger/40"
              : "bg-brand-600/10 hover:scale-105"
          )}
          aria-label={games.sayIt}
        >
          🎤
        </button>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-sm text-ink-soft">{games.micUnsupported}</p>
          <div className="mt-3 flex justify-center gap-3">
            <Button size="sm" disabled={!!result} onClick={() => selfAssess(true)}>
              ✓ {games.saidIt}
            </Button>
            <Button variant="secondary" size="sm" disabled={!!result} onClick={() => selfAssess(false)}>
              ✗ {games.notYet}
            </Button>
          </div>
        </div>
      )}
      {supported && <p className="mt-3 text-center text-sm text-ink-soft">{games.sayIt}</p>}
    </div>
  );
}
