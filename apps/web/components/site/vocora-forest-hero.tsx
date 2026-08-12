import { ArrowRight, ChartNoAxesColumnIncreasing, GraduationCap, Play } from "lucide-react";
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
}: {
  lang: string;
  copy: HeroCopy;
  landing: LandingCopy;
}) {
  const metrics = [
    { icon: ChartNoAxesColumnIncreasing, value: "6", label: copy.levelsMetric },
    { icon: GraduationCap, value: "4", label: copy.skillsMetric },
  ];

  return (
    <section className="relative mx-auto min-h-[calc(100svh-5rem)] max-w-[1480px] overflow-hidden rounded-[22px] border border-white/10 bg-[#06140d] shadow-[0_30px_100px_rgba(4,25,14,0.38)] sm:min-h-[720px]">
      <Image
        aria-hidden
        src="/images/vocora-uzbek-student-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[61%_center] brightness-[0.54] saturate-[0.78] sm:hidden"
      />
      <Image
        src="/images/vocora-study-desk-hero.png"
        alt={copy.heroImageAlt}
        fill
        preload
        sizes="(max-width: 640px) calc(100vw - 24px), (max-width: 1024px) calc(100vw - 40px), 1480px"
        className="hidden scale-[1.015] object-cover object-[70%_center] brightness-[0.72] contrast-[1.05] saturate-[0.9] sm:block"
      />
      <div aria-hidden className="absolute inset-0 bg-[#03150d]/58 sm:bg-[#03150d]/48" />
      <div aria-hidden className="absolute inset-y-0 left-0 hidden w-full bg-[linear-gradient(145deg,rgba(157,202,103,0.12),transparent_32%)] sm:block" />
      <div aria-hidden className="absolute inset-y-0 left-[48%] hidden w-px bg-white/16 lg:block" />

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col px-5 py-8 sm:min-h-[720px] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#b5d88e]/28 bg-[#0b2d20]/62 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#d9edc0] sm:rounded-none sm:border-x-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-2">
            <span className="size-1.5 rounded-full bg-[#a9d277]" />
            Vocora method
          </p>
        </Reveal>

        <div className="mt-10 max-w-[760px] sm:mt-9">
          <Reveal delay={0.06}>
            <p className="max-w-[340px] text-xs font-extrabold uppercase leading-5 tracking-[0.045em] text-white/72 sm:text-sm">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-[640px] font-serif text-[54px] font-semibold leading-[0.92] tracking-[-0.04em] text-white min-[390px]:text-[62px] sm:mt-3 sm:max-w-[740px] sm:font-sans sm:text-7xl sm:font-black sm:leading-[0.91] lg:text-[92px]">
              <span className="block text-[#e8f7db]">{copy.title}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[390px] text-[15px] font-medium leading-7 text-white/78 sm:mt-7 sm:max-w-[440px] sm:text-lg sm:leading-7">
              {copy.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-7 sm:flex">
              <HeroCta
                guestLabel={landing.heroCta}
                lang={lang}
                userLabel={landing.heroCtaContinue}
                className="h-auto min-h-16 w-full justify-center bg-[#d9f5a5] px-4 text-center text-[#072d26] shadow-[0_16px_34px_rgba(5,15,8,0.32)] hover:bg-[#edffd0] sm:h-auto sm:min-h-0 sm:w-auto sm:px-5"
                linkClassName="block min-w-0 sm:inline-block"
                icon={<Play className="size-4 fill-current" aria-hidden />}
              />
              <Link href={`/${lang}/preview/a1`}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-auto min-h-16 w-full whitespace-normal border-white/26 bg-[#09251a]/72 px-4 text-center leading-5 text-white shadow-none hover:border-white/48 hover:bg-[#103524] hover:text-white sm:h-auto sm:min-h-0 sm:w-auto sm:whitespace-nowrap sm:px-5"
                >
                  {copy.exploreLevels}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <div className="mt-auto grid max-w-[430px] grid-cols-2 rounded-2xl border border-white/14 bg-[#071b13]/72 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:rounded-none sm:border-x-0 sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none sm:pt-10">
            {metrics.map(({ icon: Icon, value, label }) => (
              <div key={label} className="border-white/22 px-3 first:border-r sm:border-t sm:px-0 sm:pt-4 sm:first:border-r-0 sm:[&:not(:first-child)]:pl-6">
                <Icon className="mb-2 size-5 text-[#c8eb92] sm:size-4" strokeWidth={1.5} aria-hidden />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-white/56 sm:text-xs">{label}</p>
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
