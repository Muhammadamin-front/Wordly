import { notFound } from "next/navigation";

import { PricingView } from "@/components/billing/pricing-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const seo = getSeoCopy(lang, "pricing");
  return publicPageMetadata({
    lang,
    path: "/pricing",
    ...seo,
  });
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <PricingView lang={lang} t={dict.billing} />
    </>
  );
}
