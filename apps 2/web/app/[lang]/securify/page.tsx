import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";

const readexPro = Readex_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const navigation = ["platform", "solutions", "company", "support"];

export const metadata: Metadata = {
  title: {
    absolute: "securify — protect your data",
  },
  description:
    "we can guarding your data with utmost care, empowering you with privacy everywhere",
};

function SecurifyLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function SecurifyPage() {
  return (
    <section
      className={`${readexPro.className} relative h-screen w-full overflow-hidden bg-black text-white antialiased`}
    >
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4"
      />

      <div className="absolute top-0 right-0 left-0 z-20 px-6 pt-6 md:px-10">
        <nav className="flex items-center justify-between gap-4" aria-label="primary navigation">
          <a
            className="flex items-center gap-2 rounded-full bg-neutral-900/90 py-3 pr-6 pl-4 backdrop-blur"
            href="#platform"
          >
            <SecurifyLogo />
            <span className="text-sm font-normal tracking-tight text-white">securify</span>
          </a>

          <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
            {navigation.map((item) => (
              <a
                className="rounded-full px-5 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
                href={`#${item}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>

          <a
            className="rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
            href="#get-started"
          >
            get started
          </a>
        </nav>
      </div>

      <div className="relative h-full w-full">
        <h1 className="hero-title absolute top-[18%] left-4 z-10 text-[14vw] font-medium text-white md:left-10 md:text-[13vw]">
          protect
        </h1>

        <h1 className="hero-title absolute top-[38%] right-4 z-10 text-[14vw] font-medium text-white md:right-10 md:text-[13vw]">
          your
        </h1>

        <h1 className="hero-title absolute top-[58%] left-[18%] z-10 text-[14vw] font-medium text-white md:left-[28%] md:text-[13vw]">
          data
        </h1>

        <p className="absolute top-[46%] left-6 z-10 max-w-[240px] text-[15px] leading-snug text-white/90 md:left-10">
          we can guarding your data with utmost care, empowering you with privacy everywhere
        </p>

        <div className="absolute top-[14%] right-6 z-10 md:right-24">
          <div className="flex items-center justify-end gap-3">
            <span className="hidden h-px w-24 rotate-[20deg] bg-white/40 md:block" />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">+65k</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">startups use</p>
        </div>

        <div className="absolute bottom-20 left-6 z-10 md:bottom-24 md:left-20">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-medium tracking-tight md:text-5xl">+1.5b</span>
            <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
          </div>
          <p className="mt-1 text-xs text-white/70 md:text-sm">gb data was protected</p>
        </div>

        <div className="absolute right-6 bottom-16 z-10 md:right-20 md:bottom-20">
          <div className="flex items-center justify-end gap-3">
            <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">+300k</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">downloads</p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-48 bg-linear-to-b from-transparent to-black"
        />
      </div>
    </section>
  );
}
