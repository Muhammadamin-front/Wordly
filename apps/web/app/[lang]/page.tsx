import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import { hasLocale } from "./dictionaries";

const readexPro = Readex_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "worldy — learn. speak. freely.",
  },
  description:
    "build your vocabulary, improve your speaking, and master english through smart daily practice",
};

function WorldyLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 4.25C6.15 3.65 8.95 4.45 11.25 6.7V19C8.8 16.95 6.05 16.3 2.5 16.8V4.25ZM21.5 4.25C17.85 3.65 15.05 4.45 12.75 6.7V19C15.2 16.95 17.95 16.3 21.5 16.8V4.25ZM8.25 18.05C9.55 18.5 10.8 19.2 12 20.25C13.2 19.2 14.45 18.5 15.75 18.05L14.9 21H9.1L8.25 18.05Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const navigation = [
    { label: "learn", href: `/${lang}/decks` },
    { label: "practice", href: `/${lang}/games` },
    { label: "ielts", href: `/${lang}/ielts` },
    { label: "pricing", href: `/${lang}/pricing` },
  ];

  return (
    <main className={`${readexPro.className} min-h-screen bg-black text-white antialiased`}>
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src="/videos/worldy-english-hero.mp4"
        />

        <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/45 via-transparent to-black/10"
        />

        <div className="absolute top-0 right-0 left-0 z-20 px-6 pt-6 md:px-10">
          <nav className="flex items-center justify-between gap-4" aria-label="primary navigation">
            <Link
              className="flex items-center gap-2 rounded-full bg-neutral-900/90 py-3 pr-6 pl-4 backdrop-blur"
              href={`/${lang}`}
            >
              <WorldyLogo />
              <span className="text-sm font-normal tracking-tight text-white">worldy</span>
            </Link>

            <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
              {navigation.map((item) => (
                <Link
                  className="rounded-full px-5 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              className="rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
              href={`/${lang}/auth/register`}
            >
              start learning
            </Link>
          </nav>
        </div>

        <div className="relative z-10 h-full w-full">
          <h1 className="hero-title absolute top-[18%] left-4 z-10 text-[14vw] font-medium text-white md:left-10 md:text-[13vw]">
            learn
          </h1>

          <h1 className="hero-title absolute top-[38%] right-4 z-10 text-[14vw] font-medium text-white md:right-10 md:text-[13vw]">
            speak
          </h1>

          <h1 className="hero-title absolute top-[58%] left-[10%] z-10 text-[14vw] font-medium text-white md:left-[24%] md:text-[13vw]">
            freely
          </h1>

          <p className="absolute top-[46%] left-6 z-10 max-w-[250px] text-[15px] leading-snug text-white/90 md:left-10">
            build your vocabulary, improve your speaking, and master english through smart daily
            practice
          </p>

          <div className="absolute top-[14%] right-6 z-10 md:right-24">
            <div className="flex items-center justify-end gap-3">
              <span className="hidden h-px w-24 rotate-[20deg] bg-white/40 md:block" />
              <span className="text-4xl font-medium tracking-tight md:text-5xl">+25k</span>
            </div>
            <p className="mt-1 text-right text-xs text-white/70 md:text-sm">active learners</p>
          </div>

          <div className="absolute bottom-20 left-6 z-10 md:bottom-24 md:left-20">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-medium tracking-tight md:text-5xl">+2m</span>
              <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
            </div>
            <p className="mt-1 text-xs text-white/70 md:text-sm">words practiced</p>
          </div>

          <div className="absolute right-6 bottom-16 z-10 md:right-20 md:bottom-20">
            <div className="flex items-center justify-end gap-3">
              <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
              <span className="text-4xl font-medium tracking-tight md:text-5xl">+120</span>
            </div>
            <p className="mt-1 text-right text-xs text-white/70 md:text-sm">learning topics</p>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-[5] h-48 bg-linear-to-b from-transparent to-black"
          />
        </div>
      </section>
    </main>
  );
}
