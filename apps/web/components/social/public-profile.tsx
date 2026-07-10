"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { socialApi, type PublicProfile } from "@/lib/social";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function PublicProfileView({
  code,
  social,
}: {
  code: string;
  social: Dictionary["social"];
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
      <main className="mx-auto max-w-md flex-1 px-4 py-16">
        <Alert tone="error">{social.invalidCode}</Alert>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const stats = [
    { label: social.level, value: profile.level },
    { label: "XP", value: profile.xp },
    { label: "🔥", value: profile.current_streak },
  ];

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
      <div className="rounded-xl2 border border-line bg-linear-to-br from-brand-500/10 to-transparent p-8 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-extrabold text-white">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">{profile.display_name}</h1>
        <code className="mt-1 inline-block text-xs tracking-widest text-ink-soft">{profile.code}</code>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-card py-3">
              <p className="text-xl font-extrabold text-brand-600 dark:text-brand-300">{s.value}</p>
              <p className="text-xs text-ink-soft">{s.label}</p>
            </div>
          ))}
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
                  className="flex size-10 items-center justify-center rounded-full bg-yellow-500/15 text-lg"
                >
                  🏅
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
