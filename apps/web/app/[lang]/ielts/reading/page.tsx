import { notFound } from "next/navigation";

import { ComprehensionTest } from "@/components/ielts/comprehension-test";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function ReadingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <ComprehensionTest lang={lang} kind="reading" t={dict.ielts} />
    </>
  );
}
