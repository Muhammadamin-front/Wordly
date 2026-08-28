import { describe, expect, it } from "vitest";

import { publicPageMetadata } from "@/lib/seo";
import { SEO_COPY_BY_LOCALE } from "@/lib/seo-copy";

describe("public SEO metadata", () => {
  it("keeps every localized title and description useful and concise", () => {
    for (const [locale, pages] of Object.entries(SEO_COPY_BY_LOCALE)) {
      const titles = new Set<string>();
      const descriptions = new Set<string>();

      for (const [page, copy] of Object.entries(pages)) {
        expect(copy.title.length, `${locale}.${page} title`).toBeGreaterThanOrEqual(18);
        expect(copy.title.length, `${locale}.${page} title`).toBeLessThanOrEqual(62);
        expect(copy.description.length, `${locale}.${page} description`).toBeGreaterThanOrEqual(90);
        expect(copy.description.length, `${locale}.${page} description`).toBeLessThanOrEqual(170);
        expect(titles.has(copy.title), `${locale}.${page} duplicate title`).toBe(false);
        expect(descriptions.has(copy.description), `${locale}.${page} duplicate description`).toBe(false);
        titles.add(copy.title);
        descriptions.add(copy.description);
      }
    }
  });

  it("emits self-canonical and reciprocal hreflang links", () => {
    const metadata = publicPageMetadata({
      lang: "uz",
      path: "/grammar",
      title: "Ingliz tili grammatikasi",
      description: "Ingliz tili grammatikasini tushunarli darslar va amaliy misollar bilan o'rganing.",
    });

    expect(metadata.alternates).toEqual({
      canonical: "/uz/grammar",
      languages: {
        uz: "/uz/grammar",
        en: "/en/grammar",
        ru: "/ru/grammar",
        "x-default": "/uz/grammar",
      },
    });
  });
});
