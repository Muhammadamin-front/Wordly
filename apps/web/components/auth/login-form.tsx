"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthField, AuthSubmit } from "@/components/auth/auth-field";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Alert } from "@/components/ui/alert";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function LoginForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const router = useRouter();
  const { applySession, user, ready } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in? Continue the account's current setup path.
  useEffect(() => {
    if (ready && user) {
      router.replace(
        `/${lang}/${user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
    }
  }, [ready, user, router, lang]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const pair = await authApi.login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      applySession(pair);
      trackEvent("login_completed", { locale: lang, provider: "password" });
      router.push(
        `/${lang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
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
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label={auth.email}
          icon={UserRound}
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          reveal
          label={auth.password}
          icon={LockKeyhole}
        />
        <div className="pt-2">
          <AuthSubmit loading={loading}>{auth.loginButton}</AuthSubmit>
        </div>
      </div>

      <SocialLoginButtons lang={lang} auth={auth} />

      <p className="mt-7 text-center">
        <Link
          href={`/${lang}/auth/forgot-password`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-auth-primary underline-offset-4 transition-colors hover:underline dark:text-brand-300"
        >
          {auth.forgotLink}
        </Link>
      </p>

      <p className="mt-6 border-t border-auth-line/60 pt-6 text-center text-sm text-auth-muted">
        {auth.noAccount}{" "}
        <Link
          href={`/${lang}/auth/register`}
          className="inline-flex min-h-11 items-center font-semibold text-auth-ink underline-offset-4 transition-colors hover:underline"
        >
          {auth.registerButton}
        </Link>
      </p>
    </form>
  );
}
