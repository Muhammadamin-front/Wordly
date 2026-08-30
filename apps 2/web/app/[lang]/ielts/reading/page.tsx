import { notFound } from "next/navigation";

import { ReadingPracticeView } from "@/components/ielts/reading-practice-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function IeltsSkillPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={(await getDictionary(lang)).nav} />
      <ReadingPracticeView lang={lang} />
    </>
  );
}
