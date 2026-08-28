import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { GrammarProgressSync } from "@/components/grammar/grammar-progress-sync";
import { AnalyticsProvider } from "@/components/site/analytics-provider";
import { PwaInstallPrompt } from "@/components/site/pwa-install-prompt";
import { PwaRegister } from "@/components/site/pwa-register";
import { ThemeProvider } from "@/components/site/theme-provider";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale, locales } from "./dictionaries";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3e6cb",
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
  const seo = getSeoCopy(lang, "home");
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.title,
      template: `%s · ${dict.common.appName}`,
    },
    description: seo.description,
    openGraph: {
      type: "website",
      locale: lang,
      siteName: dict.common.appName,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: "/images/vocora-cat-tutor-poster.png",
          width: 1122,
          height: 1402,
          alt: `${dict.common.appName} — ${dict.common.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/vocora-cat-tutor-poster.png"],
    },
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
  const layoutDict = await getDictionary(lang);

  // No data-theme attribute here on purpose: the inline script below sets it
  // before paint, and React leaves an attribute it does not render alone.
  // Hardcoding data-theme="light" meant that switching language re-rendered
  // this layout — the [lang] segment changes — and React reset the attribute,
  // throwing the reader back to the light theme mid-session.
  return (
    <html lang={lang} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsProvider />
            <GrammarProgressSync />
            {children}
          </AuthProvider>
          <PwaRegister />
          <PwaInstallPrompt t={layoutDict.pwaInstall} />
        </ThemeProvider>
      </body>
    </html>
  );
}
