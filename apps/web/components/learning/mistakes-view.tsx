"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpenCheck, CheckCircle2, CircleAlert, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { learningApi, type MistakeNotebook } from "@/lib/learning";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function MistakesView({
  lang,
  t,
  common,
}: {
  lang: string;
  t: Dictionary["learning"];
  common: Dictionary["common"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [notebook, setNotebook] = useState<MistakeNotebook | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    learningApi.mistakes().then(setNotebook).catch(() => setError(true));
  }, [ready, user]);

  if (!ready || !user || !notebook) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center px-4">
        {error ? (
          <Alert tone="error">{t.loadError}</Alert>
        ) : (
          <span
            aria-label={common.loading}
            className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
          />
        )}
      </main>
    );
  }

  const needsPractice = notebook.items.filter((item) => item.status === "needs_practice").length;

  return (
    <main className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel rounded-lg p-5 sm:p-7 lg:p-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="icon-tile size-12 rounded-lg">
              <CircleAlert className="size-6 text-accent-600 dark:text-accent-300" aria-hidden />
            </span>
            <p className="mt-5 text-xs font-black uppercase text-accent-600 dark:text-accent-300">
              {t.personalNotebook}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-5xl">
              {t.mistakesTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {t.mistakesSubtitle}
            </p>
          </div>
          {notebook.total > 0 && (
            <Link
              href={`/${lang}/games/fill_blank`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-900 px-6 text-sm font-black text-white shadow-[0_16px_36px_rgba(7,58,53,0.22)] transition-transform hover:-translate-y-0.5"
            >
              <RefreshCcw className="size-4" aria-hidden />
              {t.practiceMistakes}
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:max-w-lg">
          <Metric label={t.mistakesCount} value={notebook.total} />
          <Metric label={t.needsPractice} value={needsPractice} />
        </div>
      </section>

      {notebook.items.length === 0 ? (
        <section className="mt-5 rounded-lg border border-line bg-card/70 px-5 py-16 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <h2 className="mt-5 text-2xl font-black text-ink">{t.mistakesEmpty}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-soft">
            {t.mistakesEmptyDesc}
          </p>
          <Link
            href={`/${lang}/today`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-brand-200"
          >
            {t.backToRoute}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </section>
      ) : (
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {notebook.items.map((item, index) => {
            const translation = lang === "ru" ? item.translation_ru : item.translation_uz;
            const exampleTranslation = lang === "ru" ? item.example_ru : item.example_uz;
            const improving = item.status === "improving";
            return (
              <motion.article
                key={item.card_id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.035, 0.28) }}
                className="premium-card rounded-lg p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-brand-400/30 bg-brand-500/10 px-2 py-1 text-xs font-black text-brand-700 dark:text-brand-200">
                        {item.cefr_level}
                      </span>
                      <span className="text-xs font-bold text-ink-soft">{item.pos}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-ink">{item.headword}</h2>
                    <p className="mt-1 font-bold text-brand-700 dark:text-brand-200">{translation}</p>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-black ${
                      improving
                        ? "bg-success/12 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {improving ? t.improving : t.needsPractice}
                  </span>
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-xs font-black uppercase text-ink-soft">{t.definition}</p>
                  <p className="mt-2 text-sm leading-6 text-ink">{item.definition_en}</p>
                </div>

                {item.example_en && (
                  <div className="mt-4 border-l-2 border-accent-400 pl-4">
                    <p className="text-sm italic leading-6 text-ink">{item.example_en}</p>
                    {exampleTranslation && (
                      <p className="mt-1 text-xs leading-5 text-ink-soft">{exampleTranslation}</p>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-xs font-bold text-ink-soft">
                    {item.wrong_count}× {t.misses}
                  </p>
                  <Link
                    href={`/${lang}/words/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-black text-brand-700 hover:text-brand-500 dark:text-brand-200"
                  >
                    <BookOpenCheck className="size-4" aria-hidden />
                    {t.openWord}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-3xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold text-ink-soft">{label}</p>
    </div>
  );
}
