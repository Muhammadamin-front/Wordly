"use client";

import * as Sentry from "@sentry/nextjs";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Inlined rather than pulled from the dictionary loader: error.tsx must stay
// readable even if something in the data/rendering path that a full
// dictionary fetch depends on is itself part of what broke.
const COPY = {
  uz: { title: "Nimadir xato ketdi", body: "Xatolik yuz berdi. Qayta urinib ko'ring.", retry: "Qayta urinish" },
  ru: { title: "Что-то пошло не так", body: "Произошла ошибка. Попробуйте ещё раз.", retry: "Повторить" },
  en: { title: "Something went wrong", body: "An error occurred. Please try again.", retry: "Try again" },
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
    <main className="mx-auto flex min-h-[60svh] w-full max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft sm:text-base">{t.body}</p>
      <Button className="mt-7" onClick={() => retry()}>
        {t.retry}
      </Button>
    </main>
  );
}
