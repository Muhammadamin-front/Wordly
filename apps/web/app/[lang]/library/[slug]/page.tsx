import { notFound } from "next/navigation";

import { LevelView } from "@/components/library/level-view";
import { SiteHeader } from "@/components/site/header";
import { shelfBySlug, SHELVES } from "@/lib/library";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export function generateStaticParams() {
  return SHELVES.filter((s) => !s.soon).map(({ slug }) => ({ slug }));
}

export default async function LibraryLevelPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const meta = shelfBySlug(slug);
  if (!meta) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <LevelView lang={lang} meta={meta} t={dict.library} vocab={dict.vocab} />
    </>
  );
}
