import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { Loader, Screen } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";

export function Protected({ children, requireOnboarding = true, redirectIfOnboarded = false }: { children: ReactNode; requireOnboarding?: boolean; redirectIfOnboarded?: boolean }) {
  const { ready, user } = useAuth();
  if (!ready) return <Screen scroll={false}><Loader /></Screen>;
  if (!user) return <Redirect href="/(auth)" />;
  if (requireOnboarding && !user.profile.onboarding_completed) return <Redirect href="/onboarding" />;
  if (redirectIfOnboarded && user.profile.onboarding_completed) return <Redirect href="/(tabs)" />;
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  if (!ready) return <Screen scroll={false}><Loader /></Screen>;
  if (user) return <Redirect href={user.profile.onboarding_completed ? "/(tabs)" : "/onboarding"} />;
  return <>{children}</>;
}
