"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const SECTIONS = [
  { key: "listening", icon: "🎧", accent: "from-sky-500/15" },
  { key: "reading", icon: "📖", accent: "from-emerald-500/15" },
  { key: "writing", icon: "✍️", accent: "from-amber-500/15" },
  { key: "speaking", icon: "🗣️", accent: "from-orange-500/15" },
  { key: "grammar", icon: "🧩", accent: "from-purple-500/15" },
] as const;

export function SkillsHub({ lang, skills }: { lang: string; skills: Dictionary["skills"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{skills.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{skills.subtitle}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ key, icon, accent }) => (
          <Link
            key={key}
            href={`/${lang}/skills/${key}`}
            className={`group flex flex-col rounded-xl2 border border-line bg-linear-to-br ${accent} to-transparent p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
          >
            <span className="text-4xl transition-transform group-hover:scale-110" aria-hidden>
              {icon}
            </span>
            <h2 className="mt-3 text-lg font-bold text-ink">{skills[key].name}</h2>
            <p className="mt-1 text-sm text-ink-soft">{skills[key].desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
