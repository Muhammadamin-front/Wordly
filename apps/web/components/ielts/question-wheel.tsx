"use client";

import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { SpeakingPart, SpeakingTopic } from "@/lib/speaking-practice";

/** Segments shown at once. The part pools run to seventy topics, which no
 *  readable wheel can hold, so each spin puts a fresh random sample on the
 *  wheel and then genuinely lands on one of them. */
const SEGMENTS = 8;
const SPIN_MS = 4200;
const SOUND_KEY = "vocora:speaking-wheel-sound";

const SEGMENT_FILLS = ["var(--color-brand-500)", "var(--color-brand-800)"];

export interface WheelPick {
  topic: SpeakingTopic;
  question: string;
}

/** One short click, synthesized rather than fetched — the games already take
 *  this approach, and it keeps the repo free of an audio asset for a sound
 *  that is a hundred milliseconds long. */
class TickPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

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
    const master = this.ctx.createGain();
    master.gain.value = 0.9;
    master.connect(this.ctx.destination);
    this.master = master;

    // One short white-noise buffer, reused by every tick. A real ratchet click
    // is broadband, not a pitch — an oscillator gives the 8-bit toy sound this
    // used to have.
    const frames = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
  }

  /** `strength` (0..1) tracks wheel speed: fast ticks are brighter and louder,
   *  and darken as the wheel slows, the way a real wheel does. */
  tick(strength: number): void {
    const ctx = this.ctx;
    const master = this.master;
    const noise = this.noise;
    if (!ctx || !master || !noise || ctx.state === "closed") return;
    const now = ctx.currentTime;
    const level = 0.35 + 0.65 * strength;

    // Transient: a noise burst through a bandpass — this is the click itself.
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.setValueAtTime(1500 + 1100 * strength, now);
    band.Q.value = 1.1;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.085 * level, now + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    src.connect(band).connect(clickGain).connect(master);
    src.start(now);
    src.stop(now + 0.05);

    // Body: a very short low sine under the transient, so the click has weight
    // rather than sounding thin and plasticky.
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(200 - 45 * (1 - strength), now);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.05 * level, now + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
    body.connect(bodyGain).connect(master);
    body.start(now);
    body.stop(now + 0.05);
  }

  close(): void {
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.master = null;
    this.noise = null;
  }
}

/** Reads the saved preference the same way the rest of this view reads its
 *  stored state: guarded, and defaulting to on when there is nothing to read. */
function readStoredSound(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SOUND_KEY) !== "0";
  } catch {
    return true;
  }
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function sample(pool: SpeakingTopic[], count: number): SpeakingTopic[] {
  if (pool.length <= count) return [...pool];
  const rest = [...pool];
  const out: SpeakingTopic[] = [];
  while (out.length < count && rest.length) {
    out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  }
  return out;
}

/** Wedge path for segment `index` of `total`, starting at 12 o'clock. */
function wedge(index: number, total: number, r = 92, cx = 100, cy = 100): string {
  const step = (Math.PI * 2) / total;
  const start = index * step - Math.PI / 2 - step / 2;
  const end = start + step;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

export function QuestionWheel({
  part,
  topics,
  onOpenTopic,
  labels,
}: {
  part: SpeakingPart;
  topics: SpeakingTopic[];
  onOpenTopic: (topic: SpeakingTopic) => void;
  labels: {
    title: string;
    hint: string;
    button: string;
    again: string;
    spinning: string;
    openTopic: string;
    empty: string;
    soundOn: string;
    soundOff: string;
  };
}) {
  const [wheelTopics, setWheelTopics] = useState<SpeakingTopic[]>(() =>
    sample(topics, SEGMENTS)
  );
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pick, setPick] = useState<WheelPick | null>(null);
  const [soundOn, setSoundOn] = useState(readStoredSound);

  const frame = useRef<number | null>(null);
  const player = useRef<TickPlayer | null>(null);
  const soundRef = useRef(true);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // A spin still running when the part changes or the view closes must not
  // keep animating or clicking.
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      player.current?.close();
      player.current = null;
    },
    []
  );

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      try {
        window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {
        // Not remembering the preference is not worth failing over.
      }
      return next;
    });
  }, []);

  function spin() {
    if (spinning || topics.length === 0) return;

    const next = sample(topics, SEGMENTS);
    const winner = Math.floor(Math.random() * next.length);
    const question =
      next[winner].questions[
        Math.floor(Math.random() * next[winner].questions.length)
      ];

    setWheelTopics(next);
    setPick(null);

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion gets a single short turn rather than the full four-turn,
    // 4.2s spin-up — still visibly animated (an instant jump to the result
    // reads as broken, and this media query is often on by default on
    // Android, not just a deliberate accessibility choice), just much less of it.
    const turns = reduced ? 1 : 4;
    const spinMs = reduced ? 500 : SPIN_MS;

    if (!reduced && soundRef.current) {
      player.current ??= new TickPlayer();
      player.current.arm(); // this call is inside the click, so audio may start
    }
    const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

    const step = 360 / next.length;
    const from = rotation;
    // Land the winning wedge under the pointer, after a few full turns.
    const target =
      from + 360 * turns + (360 - (((from % 360) + 360) % 360)) - winner * step;

    const started = performance.now();
    let lastBoundary = Math.floor(from / step);
    let lastTickAt = 0;

    const run = (now: number) => {
      const t = Math.min(1, (now - started) / spinMs);
      const eased = easeOutQuart(t);
      const current = from + (target - from) * eased;
      setRotation(current);

      const boundary = Math.floor(current / step);
      if (boundary !== lastBoundary) {
        // Near the start the wheel crosses wedges faster than a click can be
        // heard, so rate-limit rather than firing a burst of overlapping tones.
        if (now - lastTickAt > 45) {
          if (!reduced && soundRef.current) player.current?.tick(1 - eased);
          // Short, speed-tracking buzz — mirrors the tick sound so a phone in
          // silent mode still feels the wheel land. No-op on iOS Safari and
          // desktop, which don't implement the Vibration API.
          if (canVibrate) navigator.vibrate(6 + 10 * (1 - eased));
          lastTickAt = now;
        }
        lastBoundary = boundary;
      }

      if (t < 1) {
        frame.current = requestAnimationFrame(run);
      } else {
        frame.current = null;
        setSpinning(false);
        setPick({ topic: next[winner], question });
      }
    };

    setSpinning(true);
    frame.current = requestAnimationFrame(run);
  }

  if (topics.length === 0) {
    return (
      <section className="mt-5 rounded-lg border border-line bg-card/70 p-5">
        <p className="text-sm text-ink-soft">{labels.empty}</p>
      </section>
    );
  }

  const step = 360 / wheelTopics.length;

  return (
    <section className="surface-panel mt-5 overflow-hidden rounded-lg p-5 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto w-[min(15rem,72vw)] shrink-0">
          {/* Pointer, fixed at the top, biting into the wheel. */}
          <span
            aria-hidden
            className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 drop-shadow-[0_2px_0_rgba(36,19,12,0.5)]"
          >
            <svg viewBox="0 0 24 20" className="w-6">
              <path d="M12 20 2 2h20z" fill="var(--color-brand-950)" />
              <path d="M12 16.5 5.2 4h13.6z" fill="var(--color-sand-50)" />
            </svg>
          </span>

          <svg viewBox="0 0 200 200" className="w-full" role="img" aria-hidden>
            <circle cx="100" cy="100" r="96" fill="var(--color-brand-950)" />
            <g
              style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "100px 100px" }}
            >
              {wheelTopics.map((topic, i) => {
                const mid = i * step - 90;
                // Radial text on the left half of the wheel would otherwise sit
                // upside down, so flip it and run it the other way. Both cases
                // occupy the same band of radius, ending at the rim.
                const angle = ((mid % 360) + 360) % 360;
                const flipped = angle > 90 && angle < 270;
                return (
                  <g key={`${topic.slug}-${i}`}>
                    <path
                      d={wedge(i, wheelTopics.length)}
                      fill={SEGMENT_FILLS[i % SEGMENT_FILLS.length]}
                      stroke="var(--color-brand-950)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="0"
                      fill="var(--color-sand-50)"
                      fontSize="7.5"
                      fontWeight="800"
                      dominantBaseline="middle"
                      textAnchor={flipped ? "start" : "end"}
                      // x/y stay at the origin so the optional rotate(180)
                      // turns the label about its own anchor. With x=100 y=100
                      // it pivoted about the group origin instead and threw the
                      // flipped labels clean outside the viewBox.
                      transform={`rotate(${mid} 100 100) translate(180 100)${
                        flipped ? " rotate(180)" : ""
                      }`}
                    >
                      {topic.title.length > 16
                        ? `${topic.title.slice(0, 15)}…`
                        : topic.title}
                    </text>
                  </g>
                );
              })}
            </g>
            <circle
              cx="100"
              cy="100"
              r="16"
              fill="var(--color-sand-50)"
              stroke="var(--color-brand-950)"
              strokeWidth="3"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-wide text-brand-700 dark:text-brand-200">
                {labels.title}
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">{labels.hint}</p>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? labels.soundOff : labels.soundOn}
              title={soundOn ? labels.soundOff : labels.soundOn}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-hover hover:text-ink"
            >
              {soundOn ? (
                <Volume2 className="size-4" aria-hidden />
              ) : (
                <VolumeX className="size-4" aria-hidden />
              )}
            </button>
          </div>

          <Button onClick={spin} disabled={spinning} className="mt-4">
            {spinning ? labels.spinning : pick ? labels.again : labels.button}
          </Button>

          <div aria-live="polite" className="mt-4">
            {pick && !spinning && (
              <div className="rounded-lg border border-line bg-raised/70 p-4">
                <p className="text-[11px] font-black uppercase tracking-wide text-ink-soft">
                  {part.replace("part", "Part ")} · {pick.topic.title}
                </p>
                <p className="mt-2 text-lg font-bold leading-7 text-ink">{pick.question}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => onOpenTopic(pick.topic)}
                >
                  {labels.openTopic}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
