"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { GoogleButton } from "@/components/auth/google-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function RegisterForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession, user, ready } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Already signed in? These pages have nothing to offer — go to the app.
  useEffect(() => {
    if (ready && user) router.replace(`/${lang}/dashboard`);
  }, [ready, user, router, lang]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
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
      router.push(`/${lang}/dashboard`);
    } catch (err) {
      setError(authErrorMessage(err, auth));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="display_name">{auth.displayName}</Label>
          <Input id="display_name" name="display_name" autoComplete="name" required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="email">{auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">{auth.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1.5 text-xs text-ink-soft">
            {auth.passwordHint}
          </p>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          {auth.registerButton}
        </Button>
      </div>

      <GoogleButton lang={lang} divider={auth.googleButton} />

      <p className="mt-6 text-center text-sm text-ink-soft">
        {auth.haveAccount}{" "}
        <Link
          href={`/${lang}/auth/login`}
          className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          {auth.loginButton}
        </Link>
      </p>
    </form>
  );
}
