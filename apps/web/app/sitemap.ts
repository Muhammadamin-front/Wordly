import type { MetadataRoute } from "next";

import { ALL_LESSONS } from "@/lib/grammar";
import { IELTS_VOCABULARY_RESOURCES } from "@/lib/ielts-resources";

const languages = ["uz", "en", "ru"] as const;
const publicPaths = [
  "",
  "/pricing",
  "/vocabulary",
  "/expressions",
  "/games",
  "/skills",
  "/ielts",
  "/ielts/reading",
  "/ielts/writing",
  "/ielts/listening",
  "/ielts/speaking",
  "/ielts/mock",
  "/grammar",
  "/legal/privacy",
  "/legal/terms",
  "/support",
];

const contentPaths = [
  ...publicPaths,
  ...ALL_LESSONS.map((lesson) => `/grammar/${lesson.slug}`),
  ...IELTS_VOCABULARY_RESOURCES.map((resource) => `/ielts/resources/${resource.slug}`),
];

interface SitemapWord {
  slug: string;
  updated_at: string;
}

async function fetchPublishedWords(): Promise<SitemapWord[]> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/api/v1/catalog/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { items: SitemapWord[] };
    return payload.items;
  } catch {
    // Static learning content remains discoverable while the API is booting;
    // ISR retries this route after deploy and adds the published word pages.
    return [];
  }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  const words = await fetchPublishedWords();
  const staticEntries = languages.flatMap((lang) =>
    contentPaths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      alternates: {
        languages: {
          ...Object.fromEntries(
            languages.map((locale) => [locale, `${siteUrl}/${locale}${path}`])
          ),
          "x-default": `${siteUrl}/uz${path}`,
        },
      },
    }))
  );

  const wordEntries = words.flatMap((word) =>
    languages.map((lang) => ({
      url: `${siteUrl}/${lang}/words/${word.slug}`,
      lastModified: new Date(word.updated_at),
      alternates: {
        languages: {
          ...Object.fromEntries(
            languages.map((locale) => [locale, `${siteUrl}/${locale}/words/${word.slug}`])
          ),
          "x-default": `${siteUrl}/uz/words/${word.slug}`,
        },
      },
    }))
  );

  return [...staticEntries, ...wordEntries];
}
