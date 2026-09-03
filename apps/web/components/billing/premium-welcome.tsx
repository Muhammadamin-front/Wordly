"use client";

import { ArrowRight, BookOpenText, Crown, Infinity as InfinityIcon, PenLine, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { billingApi } from "@/lib/billing";
import type { Locale } from "@/lib/locales";
import { apiKeys, useApi } from "@/lib/use-api";
import { useModalFocus } from "@/lib/use-modal-focus";

import styles from "./premium-welcome.module.css";

const COPY: Record<
  Locale,
  {
    badge: string;
    title: string;
    body: string;
    cta: string;
    later: string;
    close: string;
    perks: string[];
  }
> = {
  uz: {
    badge: "Premium faollashtirildi",
    title: "Tabriklaymiz! Endi siz Premium'siz",
    body: "Vocora Premium'ni tanlaganingiz uchun rahmat. Barcha imkoniyatlar ochildi.",
    cta: "Premium'ni ko'rish",
    later: "Keyinroq",
    close: "Yopish",
    perks: [
      "Cheksiz to'liq mock imtihonlar",
      "Kuniga ko'proq AI writing tekshiruvi",
      "B1–C2 lug'at va to'liq grammatika",
      "Xatolar ustida ishlash mashqlari",
    ],
  },
  ru: {
    badge: "Premium активирован",
    title: "Поздравляем! Теперь у вас Premium",
    body: "Спасибо, что выбрали Vocora Premium. Все возможности открыты.",
    cta: "Посмотреть Premium",
    later: "Позже",
    close: "Закрыть",
    perks: [
      "Пробные экзамены без ограничений",
      "Больше проверок эссе ИИ в день",
      "Словарь B1–C2 и полная грамматика",
      "Практика работы над ошибками",
    ],
  },
  en: {
    badge: "Premium activated",
    title: "Congratulations! You're now Premium",
    body: "Thank you for choosing Vocora Premium. Everything is unlocked.",
    cta: "Explore Premium",
    later: "Maybe later",
    close: "Close",
    perks: [
      "Unlimited full mock exams",
      "More AI writing checks a day",
      "B1–C2 vocabulary and all grammar",
      "Mistake-practice drills",
    ],
  },
};

const PERK_ICONS = [Trophy, PenLine, BookOpenText, InfinityIcon] as const;

/** Announces an activation the learner had no other way of noticing.
 *
 *  A subscription granted from the admin panel changed nothing visible: the
 *  learner signed in and everything looked the same. The server marks a
 *  subscription as un-announced until this has been shown, so it appears once
 *  per activation, on whatever page they happen to open. */
export function PremiumWelcome({ lang }: { lang: Locale }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const { data: subscription, mutate } = useApi(
    ready && user ? apiKeys.subscription : null,
    () => billingApi.subscription()
  );

  const open = Boolean(subscription?.is_premium && subscription.show_welcome) && !dismissed;

  async function close(then?: () => void) {
    setDismissed(true);
    try {
      await billingApi.markWelcomed();
      await mutate();
    } catch {
      // Marking it seen is best-effort: it is a greeting, and showing it once
      // more later is better than blocking the learner on a failed request.
    }
    then?.();
  }

  useModalFocus({
    containerRef: dialogRef,
    initialFocusRef: ctaRef,
    onDismiss: () => void close(),
    enabled: open,
  });

  if (!open) return null;
  const t = COPY[lang];

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={() => void close()}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-welcome-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className={`${styles.card} relative w-full max-w-md overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 p-6 text-center text-white shadow-[9px_11px_0_rgba(84,37,15,0.58)] sm:p-8`}
      >
        {/* The same architectural ring the mock-exam banner and the review
            wall use, so this reads as Vocora rather than a generic modal. */}
        <span aria-hidden className="absolute -right-20 -top-24 size-72 rounded-full border-24 border-accent-400/22" />

        <Confetti />

        <div className="relative">
          <span className={`${styles.crown} mx-auto flex size-20 items-center justify-center rounded-full border border-accent-400/40 bg-accent-400/12`}>
            <Crown className="size-10 text-accent-400" aria-hidden />
          </span>

          <span className="print-label mt-5 inline-flex w-fit items-center gap-2 border-sand-100/45 bg-sand-100/10 text-sand-100">
            {t.badge}
          </span>

          <h2
            id="premium-welcome-title"
            className="mt-4 text-balance text-3xl font-black leading-tight sm:text-4xl"
          >
            {t.title}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/72">{t.body}</p>

          <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2">
            {t.perks.map((perk, index) => {
              const Icon = PERK_ICONS[index] ?? Trophy;
              return (
                <li
                  key={perk}
                  className="flex items-start gap-2.5 rounded-[14px] border border-sand-100/16 bg-white/6 p-3 text-xs font-bold leading-5 text-sand-100/88"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                  {perk}
                </li>
              );
            })}
          </ul>

          <button
            ref={ctaRef}
            type="button"
            onClick={() => void close(() => router.push(`/${lang}/billing`))}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-brand-950 bg-sand-100 px-6 text-sm font-black text-brand-950 transition-colors hover:bg-brand-50"
          >
            {t.cta}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void close()}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-xs font-bold text-white/64 transition-colors hover:text-white"
          >
            {t.later}
          </button>
        </div>
      </section>
    </div>
  );
}

/** Deliberately CSS-only and short: a single celebratory beat, and nothing at
 *  all for anyone who has asked for reduced motion. */
function Confetti(): ReactNode {
  return (
    <span aria-hidden className={styles.confetti}>
      {Array.from({ length: 14 }).map((_, index) => (
        <span key={index} className={styles.piece} style={{ "--i": index } as React.CSSProperties} />
      ))}
    </span>
  );
}
