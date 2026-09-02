"use client";

import { useEffect, useState } from "react";
import { Flame, Medal } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { socialApi, type PublicProfile } from "@/lib/social";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function PublicProfileView({
  code,
  social,
  gam,
}: {
  code: string;
  social: Dictionary["social"];
  gam: Dictionary["gam"];
}) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    socialApi
      .profile(code)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const share = () => {
    navigator.clipboard?.writeText(window.location.href).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  if (error) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-md flex-1 px-4 py-16">
        <Alert tone="error">{social.invalidCode}</Alert>
      </main>
    );
  }

  if (!profile) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const stats = [
    { label: social.level, value: profile.level },
    { label: "XP", value: profile.xp },
    { label: gam.streak, value: profile.current_streak, icon: Flame },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
      <div className="surface-panel rounded-[18px] p-8 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[18px] border-2 border-brand-950 bg-brand-600 font-display text-5xl tracking-wide text-white shadow-[4px_5px_0_#54250f]">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-wide text-ink">{profile.display_name}</h1>
        <code className="mt-1 inline-block text-xs tracking-widest text-ink-soft">{profile.code}</code>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => {
            const Icon = "icon" in s ? s.icon : null;
            return (
              <div key={`${s.label}-${s.value}`} className="rounded-[10px] border border-line bg-card py-3 shadow-[2px_3px_0_rgb(84,37,15,0.1)]">
                <p className="flex items-center justify-center gap-1 font-display text-3xl tracking-wide text-brand-600 dark:text-brand-300">
                  {Icon && <Icon className="size-4" aria-hidden />} {s.value}
                </p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            );
          })}
        </div>

        {profile.achievements.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              {profile.achievements.length} {social.achievements}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {profile.achievements.map((a) => (
                <span
                  key={a}
                  title={a}
                  className="flex size-10 items-center justify-center rounded-md border border-brand-400/45 bg-brand-50 text-brand-600"
                >
                  <Medal className="size-5" aria-hidden />
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="secondary" size="sm" className="mt-6" onClick={share}>
          {copied ? social.copied : social.shareProfile}
        </Button>
      </div>
    </main>
  );
}
