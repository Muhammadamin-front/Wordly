import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { WritingMasterHub } from "@/components/writing-master/writing-master-hub";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../../dictionaries";

export default async function WritingMasterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <WritingMasterHub lang={lang} />
    </>
  );
}
