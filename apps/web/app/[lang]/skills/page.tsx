import { notFound } from "next/navigation";

import { SkillsHub } from "@/components/skills/skills-hub";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return publicPageMetadata({ lang, path: "/skills", ...getSeoCopy(lang, "skills") });
}

export default async function SkillsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <SkillsHub lang={lang} skills={dict.skills} />
    </>
  );
}
