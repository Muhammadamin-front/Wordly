import { ArrowRight, BookOpenText, GraduationCap, Languages, Mic2, Search, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroCta } from "@/components/site/hero-cta";
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

/** The phone band wants a portrait-friendly frame. Point this at a dedicated
 *  crop when one lands in /public/images; the forest frame holds until then. */
const MOBILE_HERO = "/images/vocora-forest-hero.webp";

const SHELF_TILES = [
  { href: "vocabulary", image: "/images/vocora-forest-hero.webp", position: "object-[30%_center]" },
  { href: "grammar", image: "/images/vocora-uzbek-student-hero.webp", position: "object-[70%_center]" },
  { href: "ielts", image: "/images/vocora-study-desk-hero.png", position: "object-center" },
] as const;

/** The landing hero: one white card floating on a grass-green field, split by a
 *  curve that hands the right side to the photograph. The card carries its own
 *  navigation, so the global site header stands down on this route. */
export function HomeHero({
  lang,
  copy,
  ctaLabel,
  ctaContinueLabel,
  navLinks,
  signIn,
  signUp,
}: {
  lang: string;
  copy: HomeHeroCopy;
  ctaLabel: string;
  ctaContinueLabel: string;
  navLinks: { href: string; label: string }[];
  signIn: string;
  signUp: string;
}) {
  return (
    <section className="home-field relative flex min-h-svh items-center justify-center px-4 py-8 sm:px-8 sm:py-14">
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <defs>
          <clipPath id="home-hero-curve" clipPathUnits="objectBoundingBox">
            <path d="M0.487 0 C0.427 0.16 0.400 0.34 0.417 0.52 C0.438 0.72 0.488 0.89 0.542 1 L1 1 L1 0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative w-full max-w-[1180px] overflow-hidden rounded-[26px] bg-home-card shadow-home-card sm:rounded-[32px]">
        {/* Hero region: nav, headline and the curved photograph share one box. */}
        <div className="relative isolate">
          <div
            aria-hidden
            className="absolute inset-0 hidden lg:block"
            style={{ clipPath: "url(#home-hero-curve)" }}
          >
            <Image
              src="/images/vocora-forest-hero.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1023px) 0px, 700px"
              className="object-cover object-[68%_center] brightness-[1.18] saturate-[1.35]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(200deg,rgb(120_190_90/0.55),rgb(30_92_40/0.18)_46%,rgb(9_40_18/0.42))]" />
            {/* Keeps the navigation legible where it crosses the photograph. */}
            <span className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,var(--home-nav-scrim),transparent)]" />
          </div>

          {/* Below lg the global site header is in charge, drawer and all. */}
          <nav
            aria-label={copy.menu}
            className="relative z-10 hidden items-center justify-between gap-4 px-8 py-5 lg:flex"
          >
            <Logo lang={lang} className="shrink-0 text-lg text-home-ink" />
            <div className="flex items-center gap-7 text-[0.78rem] font-black uppercase tracking-[0.06em] text-home-ink">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-65">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle lang={lang as Locale} />
              <LocaleSwitcher current={lang as Locale} />
              <Link
                href={`/${lang}/auth/login`}
                className="inline-flex min-h-10 items-center px-2 text-sm font-bold text-home-muted transition-colors hover:text-home-ink"
              >
                {signIn}
              </Link>
              <Link
                href={`/${lang}/auth/register`}
                className="inline-flex min-h-10 items-center rounded-full bg-home-accent px-4 text-sm font-black text-white transition-colors hover:bg-home-accent-hover"
              >
                {signUp}
              </Link>
              <Link
                href={`/${lang}/vocabulary`}
                aria-label={copy.search}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-home-line bg-home-card text-home-ink transition-colors hover:bg-home-card-soft"
              >
                <Search className="size-4" aria-hidden />
              </Link>
            </div>
          </nav>

          {/* Mobile and tablet take the photograph as a band, since the curve
              needs two columns to read as a split rather than a smear. */}
          <div className="relative h-52 overflow-hidden sm:h-64 lg:hidden">
            <Image
              src={MOBILE_HERO}
              alt={copy.heroImageAlt}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 0px"
              className="object-cover object-[68%_center] brightness-[1.15] saturate-[1.3]"
            />
          </div>

          <div className="relative z-10 grid gap-8 px-5 pb-8 pt-7 sm:px-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:pb-12 lg:pt-0">
            <div className="min-w-0">
              <p className="flex items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.14em] text-home-accent">
                {copy.eyebrow}
                <span aria-hidden className="hidden h-px w-16 bg-home-accent/40 sm:block" />
              </p>
              <h1 className="mt-4 max-w-[14ch] text-balance text-[2.5rem] font-black leading-[0.97] tracking-[-0.035em] text-home-ink sm:text-[3.1rem] lg:max-w-[13ch] lg:text-[3.35rem]">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-[42ch] text-[0.92rem] leading-7 text-home-muted lg:max-w-[34ch]">
                {copy.subtitle}
              </p>
              <div className="mt-7">
                <HeroCta
                  lang={lang}
                  guestLabel={ctaLabel}
                  userLabel={ctaContinueLabel}
                  variant="ghost"
                  className="min-h-12 gap-2.5 rounded-lg bg-home-accent px-6 text-[0.82rem] font-black uppercase tracking-[0.06em] text-white hover:bg-home-accent-hover"
                  icon={<ArrowRight className="order-last size-4" aria-hidden />}
                />
              </div>

              <ul className="mt-9 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
                {copy.pillars.map((pillar, index) => {
                  const Icon = PILLAR_ICONS[index];
                  return (
                    <li
                      key={pillar}
                      className="flex flex-col items-center gap-2.5 px-2 text-center sm:not-first:border-l sm:not-first:border-home-line"
                    >
                      <Icon className="size-6 text-home-accent" aria-hidden strokeWidth={1.6} />
                      <span className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-home-ink">
                        {pillar}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom strip: level shelf, its headline, and the promise badge. */}
        <div className="grid gap-5 border-t border-home-line px-5 py-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-7">
          <div className="flex items-center gap-3">
            {SHELF_TILES.map((tile, index) => (
              <Link
                key={tile.href}
                href={`/${lang}/${tile.href}`}
                className="group relative w-[5.6rem] shrink-0 sm:w-[7.2rem]"
              >
                <span
                  className={`relative block aspect-4/3 overflow-hidden rounded-lg border-2 bg-home-card-soft transition-colors ${
                    index === 0
                      ? "border-home-accent-soft"
                      : "border-transparent group-hover:border-home-accent-soft/60"
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
                <span className="mt-1.5 block text-center text-[0.58rem] font-black uppercase tracking-[0.1em] text-home-muted">
                  {copy.pillars[index === 2 ? 3 : index]}
                </span>
              </Link>
            ))}
            <Link
              href={`/${lang}/vocabulary`}
              aria-label={copy.browseLevels}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-home-line text-home-ink transition-colors hover:bg-home-card-soft"
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
