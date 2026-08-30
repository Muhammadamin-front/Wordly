"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready || !pathname) return;
    const [, locale = "unknown", section = "home"] = pathname.split("/");
    trackEvent("page_viewed", {
      locale,
      section: section || "home",
      authenticated: Boolean(user),
      cefr_level: user?.profile.cefr_level,
      learning_goal: user?.profile.learning_goal,
    });
  }, [pathname, ready, user]);

  return null;
}
