import { notFound } from "next/navigation";

import { IeltsHub } from "@/components/ielts/ielts-hub";
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
    path: "/ielts",
    title: dict.ieltsHub.title,
    description: dict.ieltsHub.subtitle,
  });
}

export default async function IeltsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <IeltsHub lang={lang} t={dict.ieltsHub} mockT={dict.ieltsMock} />
    </>
  );
}
