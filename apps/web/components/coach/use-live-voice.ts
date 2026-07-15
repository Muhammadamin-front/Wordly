"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL, getAccessToken } from "@/lib/api";

export type LiveStatus = "idle" | "connecting" | "live" | "error";

interface LiveVoiceOptions {
  sessionId: string;
  onUserTurn?: (text: string) => void;
  onReply?: (text: string) => void;
  onReward?: (reward: { xp_gained: number; total_xp: number; level: number; leveled_up: boolean }) => void;
  onError?: (code: string) => void;
}

/**
 * Real-time voice bridge to the backend Deepgram proxy.
 *
 * Captures mic audio as 16-bit PCM and streams it over a WebSocket; the server
 * relays to Deepgram (STT), generates the coach reply, and sends events back.
 * The Deepgram key never touches the browser.
 */
export function useLiveVoice({ sessionId, onUserTurn, onReply, onReward, onError }: LiveVoiceOptions) {
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [transcript, setTranscript] = useState(""); // live caption of the current utterance

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Keep the latest callbacks without forcing reconnects.
  const cb = useRef({ onUserTurn, onReply, onReward, onError });
  useEffect(() => {
    cb.current = { onUserTurn, onReply, onReward, onError };
  });

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== "closed") void ctxRef.current.close();
    ctxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "stop" }));
        }
        wsRef.current.close();
      } catch {
        // already closing
      }
      wsRef.current = null;
    }
    setStatus("idle");
    setTranscript("");
  }, []);

  const start = useCallback(async () => {
    setStatus("connecting");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      ctxRef.current = ctx;

      const wsBase = API_URL.replace(/^http/, "ws");
      const ws = new WebSocket(
        `${wsBase}/api/v1/coach/sessions/${sessionId}/live?token=${getAccessToken() ?? ""}`
      );
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "config", sample_rate: ctx.sampleRate }));

        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          ws.send(pcm.buffer);
        };

        // Route through a muted gain node so the processor runs without echoing
        // the mic to the speakers.
        const mute = ctx.createGain();
        mute.gain.value = 0;
        source.connect(processor);
        processor.connect(mute);
        mute.connect(ctx.destination);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        switch (msg.type) {
          case "ready":
            setStatus("live");
            break;
          case "transcript":
            setTranscript(msg.text ?? "");
            break;
          case "user_turn":
            setTranscript("");
            cb.current.onUserTurn?.(msg.text ?? "");
            break;
          case "reply":
            cb.current.onReply?.(msg.text ?? "");
            break;
          case "reward":
            cb.current.onReward?.(msg);
            break;
          case "error":
            cb.current.onError?.(msg.error ?? "error");
            setStatus("error");
            break;
        }
      };

      ws.onerror = () => {
        cb.current.onError?.("connection");
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus((s) => (s === "error" ? s : "idle"));
      };
    } catch {
      cb.current.onError?.("mic_denied");
      setStatus("error");
      stop();
    }
  }, [sessionId, stop]);

  useEffect(() => () => stop(), [stop]);

  return { status, transcript, start, stop };
}
