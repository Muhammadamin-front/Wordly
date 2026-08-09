"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
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
  const [showPassword, setShowPassword] = useState(false);

  // Already signed in? Continue the account's current setup path.
  useEffect(() => {
    if (ready && user) {
      router.replace(
        `/${lang}/${user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
    }
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
      router.push(
        `/${lang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
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

      <div className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-white/82">{auth.email}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 size-4.5 -translate-y-1/2 text-white/42" aria-hidden />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="h-12 border-white/14 bg-white/5 pl-11 text-white shadow-none placeholder:text-white/28 hover:border-white/24 focus:border-[#63dcc2] focus:bg-white/8 focus:ring-[#63dcc2]/18"
            />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password" className="text-white/82">{auth.password}</Label>
            <Link
              href={`/${lang}/auth/forgot-password`}
              className="text-xs font-semibold text-[#77dcc5] transition-colors hover:text-white"
            >
              {auth.forgotLink}
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 z-10 size-4.5 -translate-y-1/2 text-white/42" aria-hidden />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="h-12 border-white/14 bg-white/5 px-11 text-white shadow-none placeholder:text-white/28 hover:border-white/24 focus:border-[#63dcc2] focus:bg-white/8 focus:ring-[#63dcc2]/18"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/42 transition-colors hover:bg-white/8 hover:text-white"
            >
              {showPassword ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          fullWidth
          loading={loading}
          className="h-12 bg-[linear-gradient(100deg,#69dabe,#2aa786)] text-[#06251f] shadow-[0_16px_36px_rgba(50,190,153,0.23)] hover:bg-[linear-gradient(100deg,#7ce8cd,#36b895)]"
        >
          {auth.loginButton}
          {!loading && <ArrowRight className="size-4.5" aria-hidden />}
        </Button>
      </div>

      <SocialLoginButtons lang={lang} auth={auth} />

      <p className="mt-6 text-center text-sm text-white/48">
        {auth.noAccount}{" "}
        <Link
          href={`/${lang}/auth/register`}
          className="font-bold text-[#77dcc5] transition-colors hover:text-white"
        >
          {auth.registerButton}
        </Link>
      </p>
    </form>
  );
}
