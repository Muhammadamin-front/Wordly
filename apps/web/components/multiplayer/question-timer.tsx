"use client";

import { motion } from "framer-motion";

import { useServerCountdown } from "@/lib/multiplayer-timer";
import { cn } from "@/lib/utils";

/** Numeric + visual (bar) countdown, drift-corrected against a server
 *  deadline. The bar animates via a single framer-motion transition set from
 *  the deadline (no per-frame React state); only the digit re-renders, at
 *  1/sec. Reused by the question, countdown and leaderboard phases. */
export function QuestionTimer({
  endsAt,
  serverNow,
  className,
}: {
  endsAt: number;
  serverNow: number;
  className?: string;
}) {
  const { secondsLeft, remainingMsAtMount } = useServerCountdown(endsAt, serverNow);
  const urgent = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "min-w-[2ch] text-center font-display text-2xl tabular-nums",
          urgent ? "text-danger" : "text-ink"
        )}
        aria-live="polite"
      >
        {Math.max(0, secondsLeft)}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-raised">
        <motion.div
          key={endsAt}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: remainingMsAtMount / 1000, ease: "linear" }}
          style={{ transformOrigin: "left" }}
          className={cn("h-full rounded-full", urgent ? "bg-danger" : "bg-brand-500")}
        />
      </div>
    </div>
  );
}
