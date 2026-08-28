import { notFound } from "next/navigation";

import { VocabularyResourceView } from "@/components/ielts/vocabulary-resource-view";
import { SiteHeader } from "@/components/site/header";
import {
  IELTS_VOCABULARY_RESOURCES,
  vocabularyResourceBySlug,
} from "@/lib/ielts-resources";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getDictionary, hasLocale } from "../../../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const resource = vocabularyResourceBySlug(slug, lang);
  if (!resource) return {};
  return publicPageMetadata({
    lang,
    path: `/ielts/resources/${slug}`,
    title: resource.title,
    description: resource.description,
  });
}

export function generateStaticParams() {
  return IELTS_VOCABULARY_RESOURCES.flatMap((resource) =>
    ["uz", "ru", "en"].map((lang) => ({ lang, slug: resource.slug }))
  );
}

export default async function IeltsResourcePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const resource = vocabularyResourceBySlug(slug, lang);
  if (!resource) notFound();

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <VocabularyResourceView lang={lang} resource={resource} t={dict.ieltsHub} />
    </>
  );
}
