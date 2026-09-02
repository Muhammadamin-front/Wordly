"use client";

import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Inlined rather than pulled from the dictionary loader: error.tsx must stay
// readable even if something in the data/rendering path that a full
// dictionary fetch depends on is itself part of what broke.
const COPY = {
  uz: {
    title: "Texnik ishlar olib borilmoqda",
    body: "Bu sahifada vaqtincha muammo yuzaga keldi. Bir necha daqiqadan so'ng qayta urinib ko'ring.",
    retry: "Qayta urinish",
  },
  ru: {
    title: "Ведутся технические работы",
    body: "На этой странице временно возникла проблема. Попробуйте ещё раз через несколько минут.",
    retry: "Повторить",
  },
  en: {
    title: "We're doing a bit of maintenance",
    body: "This page hit a temporary snag. Please try again in a few minutes.",
    retry: "Try again",
  },
} as const;

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;
  const t = COPY[lang === "ru" || lang === "en" ? lang : "uz"];

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-[60svh] w-full max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <div className="relative size-28 overflow-hidden rounded-2xl border-2 border-line shadow-[4px_5px_0_rgba(0,0,0,0.15)] sm:size-32">
        <Image
          src="/images/vocora-cat-tutor-poster.png"
          alt=""
          fill
          sizes="128px"
          className="object-cover"
        />
      </div>
      <h1 className="mt-6 text-3xl font-black tracking-tight text-ink sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft sm:text-base">{t.body}</p>
      <Button className="mt-7" onClick={() => retry()}>
        {t.retry}
      </Button>
    </main>
  );
}
