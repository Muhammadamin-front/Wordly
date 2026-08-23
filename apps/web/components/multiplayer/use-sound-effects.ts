"use client";

import { useCallback, useRef, useState } from "react";

/** Short UI blips for the multiplayer flow — synthesized live with the Web
 *  Audio API, same approach as games/use-ambient-music.ts, so there is no
 *  audio asset, no network fetch and no copyright. A separate localStorage
 *  key from the ambient-music toggle: a player may want SFX without ambient
 *  music, or vice versa. Never autoplays — every sound is triggered by a
 *  direct game event inside a real user gesture chain (answering, a reveal
 *  arriving, etc.), respecting the same "no unexpected loud sound" rule the
 *  spec calls for. */

const STORAGE_KEY = "vocora:mp-sound";

export type SoundEffect = "tick" | "select" | "correct" | "wrong" | "points" | "leaderboard" | "winner";

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  arm(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.16;
    this.master.connect(this.ctx.destination);
  }

  private tone(freq: number, startAt: number, durationSec: number, type: OscillatorType = "sine", peak = 1): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);
    osc.connect(gain).connect(master);
    osc.start(startAt);
    osc.stop(startAt + durationSec + 0.02);
  }

  play(effect: SoundEffect): void {
    const ctx = this.ctx;
    if (!ctx) return;
    void ctx.resume();
    const now = ctx.currentTime;
    switch (effect) {
      case "tick":
        this.tone(880, now, 0.05, "square", 0.5);
        break;
      case "select":
        this.tone(520, now, 0.06, "triangle", 0.6);
        break;
      case "correct":
        this.tone(523.25, now, 0.1, "sine", 0.8); // C5
        this.tone(659.25, now + 0.08, 0.14, "sine", 0.8); // E5
        this.tone(783.99, now + 0.16, 0.2, "sine", 0.9); // G5
        break;
      case "wrong":
        this.tone(220, now, 0.16, "sawtooth", 0.5);
        this.tone(196, now + 0.09, 0.2, "sawtooth", 0.45);
        break;
      case "points":
        this.tone(1046.5, now, 0.09, "sine", 0.6);
        break;
      case "leaderboard":
        this.tone(392, now, 0.1, "triangle", 0.5);
        this.tone(523.25, now + 0.1, 0.14, "triangle", 0.55);
        break;
      case "winner":
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
          this.tone(freq, now + i * 0.11, 0.28, "sine", 0.85)
        );
        break;
    }
  }

  dispose(): void {
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.master = null;
  }
}

export function useSoundEffects() {
  const engineRef = useRef<SfxEngine | null>(null);
  const [enabled, setEnabled] = useState(
    () => typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY) !== "off"
  );

  const arm = useCallback(() => {
    (engineRef.current ??= new SfxEngine()).arm();
  }, []);

  const play = useCallback(
    (effect: SoundEffect) => {
      if (!enabled) return;
      (engineRef.current ??= new SfxEngine()).play(effect);
    },
    [enabled]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        // Not remembering the preference is not worth failing over.
      }
      return next;
    });
  }, []);

  return { enabled, toggle, arm, play };
}
