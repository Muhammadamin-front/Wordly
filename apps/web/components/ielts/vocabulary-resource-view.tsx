import { ArrowLeft, ArrowUpRight, BookMarked, Sparkles } from "lucide-react";
import Link from "next/link";

import type { VocabularyResource } from "@/lib/ielts-resources";

export function VocabularyResourceView({
  lang,
  resource,
}: {
  lang: string;
  resource: VocabularyResource;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={`/${lang}/ielts`}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-2 text-sm font-bold text-ink-soft transition-transform hover:-translate-y-0.5 hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        IELTS markazi
      </Link>

      <section className="surface-panel mt-5 rounded-lg p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-lg border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
          <BookMarked className="size-4" aria-hidden />
          {resource.eyebrow}
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-6xl">
          {resource.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
          {resource.description}
        </p>
      </section>

      <div className="mt-6 space-y-5">
        {resource.groups.map((group) => (
          <section key={group.title} className="surface-panel rounded-lg p-5 sm:p-6">
            <p className="text-xs font-extrabold uppercase text-accent-500">Word bank</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{group.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{group.note}</p>
            <div className="mt-5 grid gap-3">
              {group.items.map((item) => (
                <article
                  key={`${group.title}-${item.basic}`}
                  className="grid gap-4 rounded-lg border border-line bg-card/60 p-4 md:grid-cols-[0.35fr_0.65fr]"
                >
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-ink-soft">
                      Basic
                    </p>
                    <p className="mt-1 text-lg font-black text-ink">{item.basic}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-accent-500">
                      <Sparkles className="size-3.5" aria-hidden />
                      Precise alternatives
                    </p>
                    <p className="mt-1 font-bold text-ink">{item.advanced}</p>
                    <p className="mt-3 border-l-2 border-brand-400/35 pl-3 text-sm leading-6 text-ink-soft">
                      {item.example}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/${lang}/vocabulary?category=ielts`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          IELTS so&apos;z kartalarini ochish
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        <Link
          href={`/${lang}/expressions`}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-4 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
        >
          Iboralar kutubxonasi
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </main>
  );
}
