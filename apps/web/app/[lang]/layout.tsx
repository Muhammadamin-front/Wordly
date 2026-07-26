import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { PwaRegister } from "@/components/site/pwa-register";
import { getDictionary, hasLocale, locales } from "./dictionaries";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#071410" },
  ],
};

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
    appleWebApp: {
      capable: true,
      title: dict.common.appName,
      statusBarStyle: "default",
    },
    icons: {
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

// Applies the saved theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("words_theme")||"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

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
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
