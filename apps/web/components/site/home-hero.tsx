import { ArrowRight, BookOpenText, GraduationCap, Languages, Mic2, Search, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroCta } from "@/components/site/hero-cta";
import { HeroNavAuth } from "@/components/site/hero-nav-auth";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { Locale } from "@/lib/locales";

export type HomeHeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImageAlt: string;
  pillars: [string, string, string, string];
  shelfTitle: string;
  shelfBody: string;
  badgeTitle: string;
  badgeBody: string;
  browseLevels: string;
  search: string;
  menu: string;
};

const PILLAR_ICONS = [BookOpenText, Languages, Mic2, GraduationCap] as const;

const SHELF_TILES = [
  { href: "vocabulary", image: "/images/vocora-cat-tutor-poster.png", position: "object-center" },
  { href: "grammar", image: "/images/vocora-grammar-desk-poster.png", position: "object-center" },
  { href: "ielts", image: "/images/vocora-ielts-desk-poster.png", position: "object-center" },
] as const;

/** The landing hero keeps the established navigation and CTA behavior, but gives
 * the page a dedicated editorial composition and Vocora's recurring mascot. */
export function HomeHero({
  lang,
  copy,
  ctaLabel,
  ctaContinueLabel,
  navLinks,
  signIn,
  signUp,
  dashboard,
}: {
  lang: string;
  copy: HomeHeroCopy;
  ctaLabel: string;
  ctaContinueLabel: string;
  navLinks: { href: string; label: string }[];
  signIn: string;
  signUp: string;
  dashboard: string;
}) {
  return (
    <section className="home-field relative flex min-h-svh items-center justify-center px-4 py-7 sm:px-8 sm:py-12">
      <div className="relative w-full max-w-[1180px] overflow-hidden rounded-[22px] border-2 border-[#24130c] bg-home-card shadow-home-card sm:rounded-[26px]">
        <div className="relative isolate">
          <nav
            aria-label={copy.menu}
            className="relative z-10 hidden items-center justify-between gap-4 border-b border-home-line px-8 py-5 lg:flex"
          >
            <Logo lang={lang} className="shrink-0 text-lg" tone="home" />
            <div className="flex items-center gap-7 text-[0.78rem] font-black uppercase tracking-[0.06em] text-home-ink">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-65">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle lang={lang as Locale} />
              <LocaleSwitcher current={lang as Locale} tone="dark" />
              <HeroNavAuth lang={lang} signIn={signIn} signUp={signUp} dashboard={dashboard} />
              <Link
                href={`/${lang}/vocabulary`}
                aria-label={copy.search}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-home-line bg-home-card text-home-ink transition-colors hover:bg-home-card-soft"
              >
                <Search className="size-4" aria-hidden />
              </Link>
            </div>
          </nav>

          <div className="relative z-10 grid gap-8 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(21rem,0.75fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-12">
            <div className="min-w-0 lg:py-4">
              <h1 className="editorial-title max-w-[12ch] text-balance text-[3.5rem] text-home-ink sm:text-[4.75rem] lg:max-w-[11ch] lg:text-[clamp(4.4rem,7.3vw,6.6rem)]">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-[48ch] text-[0.9rem] leading-7 text-home-muted sm:text-[0.96rem]">
                {copy.subtitle}
              </p>
              <div className="mt-7">
                <HeroCta
                  lang={lang}
                  guestLabel={ctaLabel}
                  userLabel={ctaContinueLabel}
                  variant="ghost"
                  className="min-h-12 gap-2.5 whitespace-nowrap rounded-md border-2 border-[#f3e6cb]/30 bg-home-accent px-6 text-[0.82rem] font-black uppercase tracking-[0.06em] text-white shadow-[5px_6px_0_rgba(0,0,0,0.38)] hover:-translate-y-0.5 hover:bg-home-accent-hover hover:shadow-[7px_8px_0_rgba(0,0,0,0.38)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_3px_0_rgba(0,0,0,0.38)] max-[359px]:px-4"
                  icon={<ArrowRight className="order-last size-4" aria-hidden />}
                />
              </div>

              <ul className="mt-10 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {copy.pillars.map((pillar, index) => {
                  const Icon = PILLAR_ICONS[index];
                  return (
                    <li
                      key={pillar}
                      className="flex items-center gap-2.5 border border-home-line px-3 py-2.5 text-left sm:min-w-[9rem]"
                    >
                      <Icon className="size-4 text-home-accent" aria-hidden strokeWidth={1.7} />
                      <span className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-home-ink">
                        {pillar}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[29rem]">
              <span aria-hidden className="absolute -left-4 top-[17%] hidden size-16 rounded-full border border-[#f3e6cb]/28 bg-[#b94e28] lg:block" />
              <span aria-hidden className="absolute -right-3 bottom-[12%] h-20 w-20 border border-[#f3e6cb]/22 bg-[#b94e28]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border-2 border-[#f3e6cb]/80 bg-[#54250f] p-2 shadow-[10px_11px_0_rgba(0,0,0,0.42)]">
                <Image
                  src="/images/vocora-cat-tutor-poster.png"
                  alt={copy.heroImageAlt}
                  fill
                  loading="eager"
                  sizes="(max-width: 639px) calc(100vw - 4.5rem), (max-width: 1023px) 29rem, 38vw"
                  className="object-cover"
                />
                <span aria-hidden className="absolute inset-2 border border-[#f3e6cb]/42" />
                <span className="print-label absolute left-5 top-5 bg-[#f3e6cb] text-[#24130c]">Vocora</span>
                <span className="absolute bottom-5 right-5 max-w-[13ch] text-right font-display text-3xl leading-[0.82] tracking-wide text-[#fff8ea] drop-shadow-[0_2px_0_rgba(36,19,12,0.75)] sm:text-4xl">
                  {copy.shelfTitle}
                </span>
              </div>
              <div className="absolute -left-4 bottom-8 hidden max-w-36 rotate-[-5deg] border-2 border-[#24130c] bg-[#f3e6cb] px-3 py-2 text-[#24130c] shadow-[4px_5px_0_rgba(0,0,0,0.35)] sm:block">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.1em]">{copy.pillars[0]}</p>
                <p className="mt-1 font-display text-3xl leading-none">A1–C2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-home-line bg-black/10 px-5 py-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-7">
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:flex sm:items-center">
            {SHELF_TILES.map((tile, index) => (
              <Link
                key={tile.href}
                href={`/${lang}/${tile.href}`}
                className="group relative min-w-0 w-full sm:w-[7.2rem]"
              >
                <span
                  className={`relative block aspect-4/3 overflow-hidden rounded-lg border-2 bg-home-card-soft transition-colors ${
                    index === 0
                      ? "border-home-accent"
                      : "border-transparent group-hover:border-home-accent/60"
                  }`}
                >
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="120px"
                    className={`object-cover ${tile.position}`}
                  />
                </span>
                <span className="mt-1.5 block line-clamp-2 text-center text-[0.58rem] font-black uppercase tracking-[0.1em] text-home-muted">
                  {copy.pillars[index === 2 ? 3 : index]}
                </span>
              </Link>
            ))}
            <Link
              href={`/${lang}/vocabulary`}
              aria-label={copy.browseLevels}
              className="grid size-11 place-self-center place-items-center rounded-full border border-home-line text-home-ink transition-colors hover:bg-home-card-soft sm:size-9"
            >
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="min-w-0">
            <p className="text-[0.8rem] font-black uppercase tracking-[0.08em] text-home-accent">
              {copy.shelfTitle}
            </p>
            <p className="mt-1 text-[0.82rem] leading-6 text-home-muted">{copy.shelfBody}</p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-home-line px-4 py-3">
            <Sprout className="size-6 shrink-0 text-home-accent" aria-hidden strokeWidth={1.6} />
            <div>
              <p className="text-[0.66rem] font-black uppercase tracking-[0.08em] text-home-ink">
                {copy.badgeTitle}
              </p>
              <p className="mt-0.5 text-[0.62rem] font-bold uppercase leading-4 tracking-[0.06em] text-home-muted">
                {copy.badgeBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
