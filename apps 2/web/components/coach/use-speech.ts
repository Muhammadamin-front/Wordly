"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// --- Minimal typings for the Web Speech API (not in lib.dom by default). ------
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Capability flags are read via useSyncExternalStore (never never change after
// mount) so we avoid setState-in-effect and stay SSR-safe (server snapshot = false).
const noopSubscribe = () => () => {};

function useRecognitionSupported(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => false
  );
}

function useSynthesisSupported(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );
}

/**
 * Push-to-talk speech-to-text. `transcript` accumulates finalised speech while
 * listening; `interim` holds the in-progress words. Caller reads `transcript`
 * when it stops listening.
 */
export function useSpeechRecognition(lang = "en-US") {
  const supported = useRecognitionSupported();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    finalRef.current = "";
    setTranscript("");
    setInterim("");

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalRef.current += text + " ";
        else interimText += text;
      }
      setTranscript(finalRef.current.trim());
      setInterim(interimText);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, transcript, interim, start, stop, reset };
}

/**
 * Character text-to-speech via the browser's built-in voices. `pitch`/`rate`
 * per character give each one a recognisably different voice — no network,
 * works offline, no TTS spend.
 */
export function useSpeech() {
  const supported = useSynthesisSupported();
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer a natural English voice; fall back to the first English one.
      voiceRef.current =
        voices.find((v) => v.lang.startsWith("en") && /google|natural|samantha|daniel/i.test(v.name)) ??
        voices.find((v) => v.lang.startsWith("en")) ??
        voices[0] ??
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, opts: { pitch?: number; rate?: number } = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current?.lang ?? "en-US";
      utterance.pitch = opts.pitch ?? 1;
      utterance.rate = opts.rate ?? 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return { supported, speaking, speak, cancel };
}
