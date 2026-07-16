"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Generative calm background music for games — synthesized live with the
 *  Web Audio API, so there is no audio asset, no network fetch and no
 *  copyright. Slow-crossfading seventh-chord pads through a lowpass filter,
 *  with an occasional soft octave "sparkle" from the current chord. */

const STORAGE_KEY = "wordly:game-music";
const MASTER_VOLUME = 0.07;

// A calm loop: Am7 → Fmaj7 → Cmaj7 → G6 (frequencies in Hz, low-mid register).
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [130.81, 164.81, 196.0, 246.94],
  [196.0, 246.94, 293.66, 329.63],
];
const CHORD_SECONDS = 8;

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private chordTimer: number | null = null;
  private sparkleTimer: number | null = null;
  private chordIndex = 0;
  private running = false;

  /** Must be called from a real user gesture so the context may start. */
  arm(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1400;
    this.filter.connect(this.master);
    this.master.connect(this.ctx.destination);
    void this.ctx.resume();
  }

  start(): void {
    if (!this.ctx || !this.master || this.running) return;
    this.running = true;
    void this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(MASTER_VOLUME, this.ctx.currentTime, 1.5);
    const playChord = () => {
      this.pad(CHORDS[this.chordIndex % CHORDS.length]);
      this.chordIndex += 1;
    };
    playChord();
    this.chordTimer = window.setInterval(playChord, CHORD_SECONDS * 1000);
    const sparkle = () => {
      this.sparkle();
      this.sparkleTimer = window.setTimeout(sparkle, 3000 + Math.random() * 5000);
    };
    this.sparkleTimer = window.setTimeout(sparkle, 4000);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.chordTimer !== null) window.clearInterval(this.chordTimer);
    if (this.sparkleTimer !== null) window.clearTimeout(this.sparkleTimer);
    this.chordTimer = this.sparkleTimer = null;
    if (this.ctx && this.master) {
      // Fade out instead of cutting; oscillators end on their own schedule.
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
  }

  dispose(): void {
    this.stop();
    void this.ctx?.close().catch(() => {});
    this.ctx = this.master = this.filter = null;
  }

  /** One chord: each tone is a slow-attack sine that overlaps the next chord,
   *  so consecutive chords crossfade into each other. */
  private pad(freqs: number[]): void {
    if (!this.ctx || !this.filter) return;
    const now = this.ctx.currentTime;
    const life = CHORD_SECONDS + 4; // seconds, incl. crossfade tail
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22 / freqs.length, now + 3);
      gain.gain.setValueAtTime(0.22 / freqs.length, now + life - 4);
      gain.gain.linearRampToValueAtTime(0, now + life);
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);
      osc.stop(now + life);
    }
  }

  /** A quiet plucked note an octave above a random current-chord tone. */
  private sparkle(): void {
    if (!this.ctx || !this.filter || !this.running) return;
    const chord = CHORDS[Math.max(0, this.chordIndex - 1) % CHORDS.length];
    const freq = chord[Math.floor(Math.random() * chord.length)] * 2;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.connect(gain);
    gain.connect(this.filter);
    osc.start(now);
    osc.stop(now + 1.5);
  }
}

/** Ambient music for the games section. `active` should be true only while a
 *  round is actually being played. Call `arm()` inside a click handler (the
 *  browser requires a user gesture before audio may start). */
export function useAmbientMusic(active: boolean) {
  const engineRef = useRef<AmbientEngine | null>(null);
  // Safe on the client only; the toggle is never part of server-rendered HTML.
  const [enabled, setEnabled] = useState(
    () => typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY) !== "off"
  );

  useEffect(() => {
    const engine = (engineRef.current ??= new AmbientEngine());
    if (active && enabled) engine.start();
    else engine.stop();
  }, [active, enabled]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    []
  );

  const arm = useCallback(() => {
    (engineRef.current ??= new AmbientEngine()).arm();
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  return { enabled, toggle, arm };
}
