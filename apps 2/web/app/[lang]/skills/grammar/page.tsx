import { notFound } from "next/navigation";

import { GrammarView } from "@/components/skills/grammar-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function GrammarPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <GrammarView lang={lang} skills={dict.skills} />
    </>
  );
}
