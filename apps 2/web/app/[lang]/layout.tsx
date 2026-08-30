import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { AnalyticsProvider } from "@/components/site/analytics-provider";
import { PwaRegister } from "@/components/site/pwa-register";
import { ThemeProvider } from "@/components/site/theme-provider";
import { getDictionary, hasLocale, locales } from "./dictionaries";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f5ef",
};

const themeScript = `
  (() => {
    try {
      // Vocora was called Wordly; move an existing choice over once, so the
      // rename does not silently reset everyone to light.
      let saved = localStorage.getItem("vocora-theme");
      if (saved === null) {
        const legacy = localStorage.getItem("wordly-theme");
        if (legacy !== null) {
          localStorage.setItem("vocora-theme", legacy);
          localStorage.removeItem("wordly-theme");
          saved = legacy;
        }
      }
      const theme = saved === "dark" || saved === "light" ? saved : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vocora.uz";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${dict.common.appName} — ${dict.common.tagline}`,
      template: `%s · ${dict.common.appName}`,
    },
    description: dict.landing.heroSubtitle,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: `/${lang}`,
      siteName: dict.common.appName,
      title: `${dict.common.appName} - ${dict.common.tagline}`,
      description: dict.landing.heroSubtitle,
      images: [{ url: "/images/vocora-uzbek-student-hero.webp", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    appleWebApp: {
      capable: true,
      title: dict.common.appName,
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsProvider />
            {children}
          </AuthProvider>
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
