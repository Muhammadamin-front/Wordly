"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FlipHorizontal2 } from "lucide-react";
import type { PointerEvent, ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type WordFlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  frontActions?: ReactNode;
  backActions?: ReactNode;
  frontLabel: string;
  backLabel: string;
  flipTitle: string;
  unflipTitle: string;
  className?: string;
  minHeight?: number;
  responsiveHeightClass?: string;
};

export function WordFlipCard({
  front,
  back,
  frontActions,
  backActions,
  frontLabel,
  backLabel,
  flipTitle,
  unflipTitle,
  className,
  minHeight = 272,
  responsiveHeightClass,
}: WordFlipCardProps) {
  const reducedMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 240, damping: 24, mass: 0.55 });
  const tiltY = useSpring(rawTiltY, { stiffness: 240, damping: 24, mass: 0.55 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || flipped || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    rawTiltX.set(((0.5 - (event.clientY - rect.top) / rect.height) * 8));
    rawTiltY.set((((event.clientX - rect.left) / rect.width - 0.5) * 10));
  };

  const resetTilt = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const faceClass =
    "absolute inset-0 overflow-hidden rounded-lg border border-line/70 bg-card/94 shadow-[0_22px_64px_rgba(8,12,20,0.14)] backdrop-blur-xl [backface-visibility:hidden]";

  return (
    <motion.article
      layout
      initial={reducedMotion ? false : { opacity: 0, y: 18, rotateX: 7, scale: 0.975 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      exit={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: -28, rotateY: -18, scale: 0.96 }
      }
      transition={{ type: "spring", stiffness: 250, damping: 24 }}
      whileHover={reducedMotion || flipped ? undefined : { y: -6, scale: 1.012 }}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      style={{
        minHeight: responsiveHeightClass ? undefined : minHeight,
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn("group relative h-full", responsiveHeightClass, className)}
      data-flipped={flipped}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 220, damping: 24, mass: 0.8 }
        }
        style={{
          minHeight: responsiveHeightClass ? undefined : minHeight,
          transformStyle: "preserve-3d",
        }}
        className={cn("relative h-full w-full", responsiveHeightClass)}
      >
        <section className={faceClass} aria-hidden={flipped} inert={flipped}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(40,135,115,0.16),transparent_34%),radial-gradient(circle_at_92%_2%,rgba(210,168,79,0.13),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_42%)]" />
          <button
            type="button"
            aria-label={frontLabel}
            title={flipTitle}
            onClick={() => {
              resetTilt();
              setFlipped(true);
            }}
            className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
          />
          <div className="pointer-events-none relative z-20 h-full">{front}</div>
          {frontActions && (
            <div className="pointer-events-auto absolute right-2 top-2 z-30 flex items-center gap-1 sm:right-4 sm:top-4 sm:gap-2">
              {frontActions}
            </div>
          )}
          <FlipHorizontal2
            aria-hidden
            className="pointer-events-none absolute bottom-2 right-2 z-20 size-3 text-ink-soft/45 transition-transform duration-300 group-hover:scale-110 sm:bottom-4 sm:right-4 sm:size-4"
          />
        </section>

        <section
          className={cn(faceClass, "[transform:rotateY(180deg)]")}
          aria-hidden={!flipped}
          inert={!flipped}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_10%,rgba(210,168,79,0.16),transparent_34%),radial-gradient(circle_at_8%_92%,rgba(40,135,115,0.13),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.1),transparent_46%)]" />
          <button
            type="button"
            aria-label={backLabel}
            title={unflipTitle}
            onClick={() => setFlipped(false)}
            className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-inset"
          />
          <div className="pointer-events-none relative z-20 h-full">{back}</div>
          {backActions && (
            <div className="pointer-events-auto absolute inset-x-2 bottom-2 z-30 flex items-center gap-1 sm:inset-x-4 sm:bottom-4 sm:gap-2">
              {backActions}
            </div>
          )}
          <FlipHorizontal2
            aria-hidden
            className="pointer-events-none absolute right-2 top-2 z-20 size-3 rotate-180 text-ink-soft/45 sm:right-4 sm:top-4 sm:size-4"
          />
        </section>
      </motion.div>
    </motion.article>
  );
}
