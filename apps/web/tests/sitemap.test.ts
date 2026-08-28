import { beforeEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { ALL_LESSONS } from "@/lib/grammar";
import { IELTS_VOCABULARY_RESOURCES } from "@/lib/ielts-resources";

describe("sitemap", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [{ slug: "apple-noun", updated_at: "2026-08-28T00:00:00Z" }],
        }),
      })
    );
  });

  it("publishes localized learning hubs and every authored content page", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    for (const lang of ["uz", "en", "ru"]) {
      expect(urls).toContain(`https://vocora.uz/${lang}/vocabulary`);
      expect(urls).toContain(`https://vocora.uz/${lang}/expressions`);
      expect(urls).toContain(`https://vocora.uz/${lang}/ielts/reading`);
      expect(urls).toContain(`https://vocora.uz/${lang}/grammar/${ALL_LESSONS[0].slug}`);
      expect(urls).toContain(
        `https://vocora.uz/${lang}/ielts/resources/${IELTS_VOCABULARY_RESOURCES[0].slug}`
      );
      expect(urls).toContain(`https://vocora.uz/${lang}/words/apple-noun`);
    }
  });

  it("links every URL to all localized alternates and an Uzbek x-default", async () => {
    const entry = (await sitemap()).find((item) => item.url.endsWith("/uz/grammar"));
    expect(entry?.alternates?.languages).toEqual({
      uz: "https://vocora.uz/uz/grammar",
      en: "https://vocora.uz/en/grammar",
      ru: "https://vocora.uz/ru/grammar",
      "x-default": "https://vocora.uz/uz/grammar",
    });
  });

  it("omits misleading last-modified dates from static pages", async () => {
    const entry = (await sitemap()).find((item) => item.url.endsWith("/uz/grammar"));
    expect(entry?.lastModified).toBeUndefined();
  });
});
