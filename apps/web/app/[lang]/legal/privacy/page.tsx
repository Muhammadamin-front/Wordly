import { notFound } from "next/navigation";

import { LegalPage } from "@/components/legal/legal-page";
import { getLegalContent } from "@/lib/legal-content";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { hasLocale } from "../../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const content = getLegalContent(lang as Locale, "privacy");
  return publicPageMetadata({ lang, path: "/legal/privacy", title: content.title, description: content.intro });
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <LegalPage lang={lang as Locale} page="privacy" />;
}
