"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AtSign, LockKeyhole, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthField, AuthSubmit } from "@/components/auth/auth-field";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Alert } from "@/components/ui/alert";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function RegisterForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession, user, ready } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Continue the account's current setup path.
  useEffect(() => {
    if (ready && user) {
      router.replace(
        `/${lang}/${user.profile.onboarding_completed ? "today" : "onboarding"}`
      );
    }
  }, [ready, user, router, lang]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    trackEvent("signup_started", { locale: lang, provider: "password" });
    const form = new FormData(event.currentTarget);
    const ref = searchParams.get("ref") ?? undefined;
    try {
      const pair = await authApi.register({
        email: String(form.get("email")),
        password: String(form.get("password")),
        display_name: String(form.get("display_name")),
        ui_locale: lang,
        referral_code: ref,
      });
      applySession(pair);
      trackEvent("signup_completed", { locale: lang, provider: "password", referral: Boolean(ref) });
      router.push(`/${lang}/onboarding`);
    } catch (err) {
      setError(authErrorMessage(err, auth));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <AuthField
          id="display_name"
          name="display_name"
          autoComplete="name"
          required
          maxLength={80}
          label={auth.displayName}
          icon={UserRound}
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label={auth.email}
          icon={AtSign}
        />
        <div>
          <AuthField
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            reveal
            aria-describedby="password-hint"
            label={auth.password}
            icon={LockKeyhole}
          />
          <p id="password-hint" className="mt-2 pl-5 text-xs text-auth-muted">
            {auth.passwordHint}
          </p>
        </div>
        <div className="pt-2">
          <AuthSubmit loading={loading}>{auth.registerButton}</AuthSubmit>
        </div>
      </div>

      <SocialLoginButtons lang={lang} auth={auth} />

      <p className="mt-7 border-t border-auth-line/60 pt-6 text-center text-sm text-auth-muted">
        {auth.haveAccount}{" "}
        <Link
          href={`/${lang}/auth/login`}
          className="inline-flex min-h-11 items-center font-semibold text-auth-ink underline-offset-4 transition-colors hover:underline"
        >
          {auth.loginButton}
        </Link>
      </p>
    </form>
  );
}
