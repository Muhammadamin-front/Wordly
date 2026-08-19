import Link from "next/link";

import type { Locale } from "@/lib/locales";
import { getLegalContent } from "@/lib/legal-content";

export function LegalPage({ lang, page }: { lang: Locale; page: "privacy" | "terms" | "support" }) {
  const content = getLegalContent(lang, page);
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{content.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{content.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">{content.intro}</p>
      <div className="mt-12 space-y-9">{content.sections.map((section) => <section key={section.title}><h2 className="text-xl font-extrabold text-ink">{section.title}</h2><p className="mt-3 text-sm leading-7 text-ink-soft sm:text-base">{section.body}</p></section>)}</div>
      <aside className="mt-12 rounded-xl border border-accent-500/25 bg-accent-500/8 p-5 text-sm leading-6 text-ink-soft">{content.review}</aside>
      <Link className="mt-7 inline-flex min-h-11 items-center text-sm font-bold text-brand-700 hover:text-brand-600 dark:text-brand-200" href={`/${lang}`}>← Vocora</Link>
    </main>
  );
}
