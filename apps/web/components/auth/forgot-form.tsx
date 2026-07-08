"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ForgotForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await authApi.forgotPassword(String(form.get("email")));
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err, auth));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <Alert tone="success">{auth.forgotSent}</Alert>
        <Link
          href={`/${lang}/auth/login`}
          className="block text-center text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          {auth.backToLogin}
        </Link>
      </div>
    );
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
          <Label htmlFor="email">{auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" fullWidth loading={loading}>
          {auth.forgotButton}
        </Button>
      </div>
      <p className="mt-6 text-center">
        <Link
          href={`/${lang}/auth/login`}
          className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          {auth.backToLogin}
        </Link>
      </p>
    </form>
  );
}
