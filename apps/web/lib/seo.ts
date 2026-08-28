import type { Metadata } from "next";

const PUBLIC_LOCALES = ["uz", "en", "ru"] as const;

export function publicPageMetadata({
  lang,
  path,
  title,
  description,
}: {
  lang: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const normalizedPath = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  const localizedPath = `/${lang}${normalizedPath}`;
  const languageAlternates = Object.fromEntries(
    PUBLIC_LOCALES.map((locale) => [locale, `/${locale}${normalizedPath}`])
  );
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: { ...languageAlternates, "x-default": `/uz${normalizedPath}` },
    },
    openGraph: {
      url: localizedPath,
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}
