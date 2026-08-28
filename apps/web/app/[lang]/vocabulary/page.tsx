import { SearchX } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VocabularyWordCard } from "@/components/library/vocabulary-word-card";
import { SiteHeader } from "@/components/site/header";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { fetchCategories, fetchWords, CEFR_LEVELS, type Category } from "@/lib/vocab";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getDictionary, hasLocale } from "../dictionaries";

export const dynamic = "force-dynamic";

function categoryName(category: Category, lang: string): string {
  if (lang === "uz") return category.name_uz;
  if (lang === "ru") return category.name_ru;
  return category.name_en;
}

function filterHref(
  lang: string,
  params: { level?: string; category?: string; q?: string; page?: number }
): string {
  const search = new URLSearchParams();
  if (params.level) search.set("level", params.level);
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return `/${lang}/vocabulary${query ? `?${query}` : ""}`;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return publicPageMetadata({
    lang,
    path: "/vocabulary",
    title: dict.vocab.title,
    description: dict.vocab.subtitle,
  });
}

export default async function VocabularyPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ level?: string; category?: string; q?: string; page?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { vocab } = dict;

  const { level, category, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [categories, words] = await Promise.all([
    fetchCategories(),
    fetchWords({ page, level, category, q }),
  ]);
  const lastPage = Math.max(1, Math.ceil(words.total / words.page_size));

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="app-container flex-1 py-8">
        <PageHeader title={vocab.title} subtitle={vocab.subtitle} />

        {/* Search (plain GET form — works without JS, SEO-crawlable) */}
        <form action={`/${lang}/vocabulary`} method="GET" className="mt-6 flex gap-2">
          {level && <input type="hidden" name="level" value={level} />}
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={vocab.searchPlaceholder}
            className="h-11 w-full max-w-md rounded-xl border border-line bg-card px-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            {vocab.searchButton}
          </button>
        </form>

        {/* Level tabs */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          <Link
            href={filterHref(lang, { category, q })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              !level ? "bg-brand-600 text-white" : "border border-line text-ink-soft hover:text-ink"
            )}
          >
            {vocab.allLevels}
          </Link>
          {CEFR_LEVELS.map((cefr) => (
            <Link
              key={cefr}
              href={filterHref(lang, { level: cefr, category, q })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                level === cefr
                  ? "bg-brand-600 text-white"
                  : "border border-line text-ink-soft hover:text-ink"
              )}
            >
              {cefr}
            </Link>
          ))}
        </div>

        {/* Category chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href={filterHref(lang, { level, q })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              !category
                ? "bg-accent-500/15 text-accent-600 dark:text-accent-300"
                : "text-ink-soft hover:text-ink"
            )}
          >
            {vocab.allCategories}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={filterHref(lang, { level, q, category: cat.slug })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                category === cat.slug
                  ? "bg-accent-500/15 text-accent-600 dark:text-accent-300"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {cat.emoji} {categoryName(cat, lang)}
            </Link>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          <strong className="text-ink">{words.total}</strong> {vocab.resultCount}
        </p>

        {words.items.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={SearchX}
            title={vocab.emptyTitle}
            body={vocab.emptyBody}
            actionLabel={vocab.emptyAction}
            actionHref={`/${lang}/vocabulary`}
          />
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {words.items.map((word) => (
              <li key={word.id} className="h-full">
                <VocabularyWordCard
                  word={word}
                  lang={lang}
                  labels={{
                    listen: dict.library.listen,
                    flip: dict.library.flipCard,
                    unflip: dict.library.flipBack,
                    details: dict.library.viewDetails,
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3 text-sm font-medium">
            {page > 1 && (
              <Link
                href={filterHref(lang, { level, category, q, page: page - 1 })}
                className="rounded-lg border border-line px-3.5 py-2 text-ink-soft transition-colors hover:text-ink"
              >
                ← {vocab.prev}
              </Link>
            )}
            <span className="text-ink-soft">
              {vocab.pageOf} {page} / {lastPage}
            </span>
            {page < lastPage && (
              <Link
                href={filterHref(lang, { level, category, q, page: page + 1 })}
                className="rounded-lg border border-line px-3.5 py-2 text-ink-soft transition-colors hover:text-ink"
              >
                {vocab.next} →
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
