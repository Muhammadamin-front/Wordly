import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  return {
    rules: {
      userAgent: "*",
      allow: ["/uz", "/en", "/ru"],
      disallow: ["/api/", "/*/auth/", "/*/admin/", "/*/dashboard", "/*/review", "/*/today", "/*/billing"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
