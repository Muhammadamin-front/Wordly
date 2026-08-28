import { notFound } from "next/navigation";

import { SpeakingPracticeView } from "@/components/ielts/speaking-practice-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getDictionary, hasLocale } from "../../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return publicPageMetadata({
    lang,
    path: "/ielts/speaking",
    title: dict.speakingPractice.title,
    description: dict.speakingPractice.intro,
  });
}

export default async function IeltsSkillPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <SpeakingPracticeView t={dict.speakingPractice} />
    </>
  );
}
