"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  label,
  className,
  barClassName,
}: {
  value: number;
  label?: string;
  className?: string;
  barClassName?: string;
}) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10", className)}
    >
      <motion.div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
    </div>
  );
}
