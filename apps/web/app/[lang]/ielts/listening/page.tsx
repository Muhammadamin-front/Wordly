import { notFound } from "next/navigation";

import { SkillView } from "@/components/ielts/skill-view";
import { SiteHeader } from "@/components/site/header";
import { ieltsSkillContent } from "@/lib/ielts-resources";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getDictionary, hasLocale } from "../../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const content = ieltsSkillContent(lang, "listening");
  return publicPageMetadata({
    lang,
    path: "/ielts/listening",
    title: content.title,
    description: content.description,
  });
}

export default async function IeltsSkillPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <SkillView lang={lang} skill="listening" t={dict.ieltsHub} ieltsT={dict.ielts} />
    </>
  );
}
