import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

// The realtime AI examiner is locked for now (slow, errors after the first
// reply) — the AI budget went to the professional Writing review instead.
// Restore <CoachView/> here once the streaming issues are fixed.
export default async function CoachPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-5xl" aria-hidden>
            🔒
          </p>
          <h1 className="mt-3 text-xl font-bold text-ink">{dict.ielts.speaking}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{dict.ielts.speakingLocked}</p>
        </div>
      </main>
    </>
  );
}
