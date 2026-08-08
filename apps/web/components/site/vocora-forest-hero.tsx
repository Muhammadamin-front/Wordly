import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroCta } from "@/components/site/hero-cta";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";

type HeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImageAlt: string;
  exploreLevels: string;
  wordsMetric: string;
  levelsMetric: string;
  skillsMetric: string;
};

type LandingCopy = {
  heroCta: string;
  heroCtaContinue: string;
};

export function VocoraForestHero({
  lang,
  copy,
  landing,
  itemCount,
}: {
  lang: string;
  copy: HeroCopy;
  landing: LandingCopy;
  itemCount: string;
}) {
  const metrics = [
    { icon: BookOpen, value: itemCount, label: copy.wordsMetric },
    { icon: ChartNoAxesColumnIncreasing, value: "6", label: copy.levelsMetric },
    { icon: GraduationCap, value: "4", label: copy.skillsMetric },
  ];

  return (
    <section className="relative mx-auto min-h-[660px] max-w-[1480px] overflow-hidden rounded-[22px] border border-white/10 bg-[#06140d] shadow-[0_30px_100px_rgba(4,25,14,0.38)] sm:min-h-[720px]">
      <Image
        src="/images/vocora-forest-hero.webp"
        alt={copy.heroImageAlt}
        fill
        preload
        sizes="(max-width: 640px) calc(100vw - 24px), (max-width: 1024px) calc(100vw - 40px), 1480px"
        className="scale-[1.015] object-cover object-[72%_center] brightness-[0.82] contrast-[1.06] saturate-[0.9]"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,15,9,0.98)_0%,rgba(3,18,10,0.91)_38%,rgba(3,18,10,0.46)_63%,rgba(2,13,7,0.22)_100%)]" />
      <div aria-hidden className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(145deg,rgba(157,202,103,0.12),transparent_32%)]" />
      <div aria-hidden className="absolute inset-y-0 left-[48%] hidden w-px bg-white/16 lg:block" />

      <div className="relative z-10 flex min-h-[660px] flex-col px-6 py-10 sm:min-h-[720px] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <Reveal>
          <p className="inline-flex items-center gap-2 border-b border-[#b5d88e]/65 pb-2 text-[11px] font-black uppercase text-[#d9edc0]">
            <span className="size-1.5 rounded-full bg-[#a9d277]" />
            Vocora method
          </p>
        </Reveal>

        <div className="mt-9 max-w-[760px]">
          <Reveal delay={0.06}>
            <p className="text-sm font-extrabold uppercase text-white/58">{copy.eyebrow}</p>
            <h1 className="mt-3 max-w-[740px] text-5xl font-black leading-[0.91] text-white sm:text-7xl lg:text-[92px]">
              <span className="block text-[#d6ecb2]">{copy.title}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[440px] text-base font-medium leading-7 text-white/68 sm:text-lg">
              {copy.subtitle.replace("{count}", itemCount)}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <HeroCta guestLabel={landing.heroCta} lang={lang} userLabel={landing.heroCtaContinue} />
              <Link href={`/${lang}/preview/a1`}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/26 bg-white/6 text-white shadow-none hover:border-white/48 hover:bg-white/12 hover:text-white"
                >
                  {copy.exploreLevels}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <div className="mt-auto grid max-w-[640px] grid-cols-3 gap-2 pt-10 sm:gap-3">
            {metrics.map(({ icon: Icon, value, label }) => (
              <div key={label} className="border-t border-white/22 pt-3 sm:pt-4">
                <Icon className="mb-2 size-4 text-[#b6db82]" strokeWidth={1.5} aria-hidden />
                <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
                <p className="mt-1 text-[10px] font-semibold leading-4 text-white/48 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div aria-hidden className="absolute right-7 top-1/2 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-3">
        <span className="h-10 w-px bg-white/72" />
        <span className="size-2 rotate-45 border border-white bg-[#b6db82]" />
        <span className="size-2 rotate-45 border border-white/80" />
        <span className="size-2 rotate-45 border border-white/80" />
        <span className="h-10 w-px bg-white/72" />
      </div>
    </section>
  );
}
