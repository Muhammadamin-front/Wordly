import { notFound } from "next/navigation";

import { GrammarHub } from "@/components/grammar/grammar-hub";
import { SiteHeader } from "@/components/site/header";
import { LESSON_SUMMARIES } from "@/lib/grammar";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function GrammarPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <GrammarHub lang={lang} t={dict.grammar} lessons={LESSON_SUMMARIES} />
    </>
  );
}
