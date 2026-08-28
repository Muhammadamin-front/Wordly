import { notFound } from "next/navigation";

import { ExpressionsView } from "@/components/expressions/expressions-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return publicPageMetadata({
    lang,
    path: "/expressions",
    title: dict.expressions.title,
    description: dict.expressions.subtitle,
  });
}

export default async function ExpressionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <ExpressionsView lang={lang} t={dict.expressions} />
    </>
  );
}
