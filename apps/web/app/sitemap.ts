import type { MetadataRoute } from "next";

const languages = ["uz", "en", "ru"];
const publicPaths = ["", "/pricing", "/ielts", "/grammar", "/legal/privacy", "/legal/terms", "/support"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  const now = new Date();
  return languages.flatMap((lang) =>
    publicPaths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.6,
    }))
  );
}
