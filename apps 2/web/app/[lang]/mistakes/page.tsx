import { notFound } from "next/navigation";

import { MistakesView } from "@/components/learning/mistakes-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function MistakesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <MistakesView lang={lang} t={dict.learning} common={dict.common} />
    </>
  );
}
