import type { MetadataRoute } from "next";

import { ALL_LESSONS } from "@/lib/grammar";
import { IELTS_VOCABULARY_RESOURCES } from "@/lib/ielts-resources";

const languages = ["uz", "en", "ru"] as const;
const publicPaths = [
  "",
  "/pricing",
  "/vocabulary",
  "/expressions",
  "/ielts",
  "/ielts/reading",
  "/ielts/writing",
  "/ielts/listening",
  "/ielts/speaking",
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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  const now = new Date();
  return languages.flatMap((lang) =>
    contentPaths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          languages.map((locale) => [locale, `${siteUrl}/${locale}${path}`])
        ),
      },
    }))
  );
}
