import { notFound } from "next/navigation";

import { IeltsHub } from "@/components/ielts/ielts-hub";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function IeltsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <IeltsHub lang={lang} t={dict.ieltsHub} />
    </>
  );
}
