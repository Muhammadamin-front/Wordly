"use client";

import { useEffect, type ReactNode } from "react";
import { SWRConfig, useSWRConfig } from "swr";

import { QUESTS_CHANGED_EVENT, STATS_CHANGED_EVENT } from "@/lib/gamification";
import { apiKeys, SWR_DEFAULTS } from "@/lib/use-api";

/** Applies the app-wide SWR defaults (see lib/use-api.ts) and gives every
 *  client view one shared cache. */
export function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={SWR_DEFAULTS}>
      <StatsInvalidator />
      {children}
    </SWRConfig>
  );
}

/** A finished review or game raises STATS_CHANGED_EVENT / QUESTS_CHANGED_EVENT.
 *  Revalidating the shared keys once here refreshes every mounted view that
 *  reads them — previously each of those views carried its own listener and
 *  its own refetch. */
function StatsInvalidator() {
  const { mutate } = useSWRConfig();
  useEffect(() => {
    const onStats = () => {
      void mutate(apiKeys.stats);
      void mutate(apiKeys.learningPlan);
    };
    const onQuests = () => void mutate(apiKeys.quests);
    window.addEventListener(STATS_CHANGED_EVENT, onStats);
    window.addEventListener(QUESTS_CHANGED_EVENT, onQuests);
    return () => {
      window.removeEventListener(STATS_CHANGED_EVENT, onStats);
      window.removeEventListener(QUESTS_CHANGED_EVENT, onQuests);
    };
  }, [mutate]);
  return null;
}
