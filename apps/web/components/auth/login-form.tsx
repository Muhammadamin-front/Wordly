"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function LoginForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const router = useRouter();
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
    try {
      const pair = await authApi.login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      applySession(pair);
      router.push(`/${lang}/dashboard`);
    } catch (err) {
      setError(authErrorMessage(err, auth));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">{auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">{auth.password}</Label>
            <Link
              href={`/${lang}/auth/forgot-password`}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
            >
              {auth.forgotLink}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" fullWidth loading={loading}>
          {auth.loginButton}
        </Button>
      </div>

      <GoogleButton lang={lang} divider={auth.googleButton} />

      <p className="mt-6 text-center text-sm text-ink-soft">
        {auth.noAccount}{" "}
        <Link
          href={`/${lang}/auth/register`}
          className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          {auth.registerButton}
        </Link>
      </p>
    </form>
  );
}
