import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  return {
    rules: {
      userAgent: "*",
      allow: ["/uz", "/en", "/ru"],
      disallow: [
        "/api/",
        "/*/account/",
        "/*/admin/",
        "/*/auth/",
        "/*/billing",
        "/*/classes",
        "/*/coach",
        "/*/dashboard",
        "/*/decks",
        "/*/friends",
        "/*/library/",
        "/*/mastery",
        "/*/mistakes",
        "/*/multiplayer",
        "/*/onboarding",
        "/*/preview/",
        "/*/profile/",
        "/*/review",
        "/*/statistics",
        "/*/teacher",
        "/*/today",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
