import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { getDictionary, hasLocale, locales } from "./dictionaries";

// latin-ext covers Uzbek Latin (oʻ, gʻ); cyrillic covers Russian.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

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
  return {
    title: {
      default: `${dict.common.appName} — ${dict.common.tagline}`,
      template: `%s · ${dict.common.appName}`,
    },
    description: dict.landing.heroSubtitle,
  };
}

// Applies saved/system theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("words_theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

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
    <html lang={lang} className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
