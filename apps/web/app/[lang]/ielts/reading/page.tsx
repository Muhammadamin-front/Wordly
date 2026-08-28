import { notFound } from "next/navigation";

import { ReadingPracticeView } from "@/components/ielts/reading-practice-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale } from "../../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const seo = getSeoCopy(lang, "ieltsReading");
  return publicPageMetadata({
    lang,
    path: "/ielts/reading",
    ...seo,
  });
}

export default async function IeltsSkillPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <ReadingPracticeView t={dict.readingPractice} />
    </>
  );
}
