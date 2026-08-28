import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { ALL_LESSONS } from "@/lib/grammar";
import { IELTS_VOCABULARY_RESOURCES } from "@/lib/ielts-resources";

describe("sitemap", () => {
  it("publishes localized learning hubs and every authored content page", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    for (const lang of ["uz", "en", "ru"]) {
      expect(urls).toContain(`https://vocora.uz/${lang}/vocabulary`);
      expect(urls).toContain(`https://vocora.uz/${lang}/expressions`);
      expect(urls).toContain(`https://vocora.uz/${lang}/ielts/reading`);
      expect(urls).toContain(`https://vocora.uz/${lang}/grammar/${ALL_LESSONS[0].slug}`);
      expect(urls).toContain(
        `https://vocora.uz/${lang}/ielts/resources/${IELTS_VOCABULARY_RESOURCES[0].slug}`
      );
    }
  });

  it("links every URL to all three localized alternates", () => {
    const entry = sitemap().find((item) => item.url.endsWith("/uz/grammar"));
    expect(entry?.alternates?.languages).toEqual({
      uz: "https://vocora.uz/uz/grammar",
      en: "https://vocora.uz/en/grammar",
      ru: "https://vocora.uz/ru/grammar",
    });
  });
});
