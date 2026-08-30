import type { DailyQuest } from "@/lib/gamification";

export function questHref(lang: string, quest: DailyQuest): string {
  const params = new URLSearchParams();
  if (quest.source_category) params.set("category", quest.source_category);
  const query = params.size ? `?${params}` : "";
  return `/${lang}/games/${quest.game_type}${query}`;
}

export function questProgressPercent(quest: DailyQuest): number {
  if (quest.target <= 0) return 100;
  return Math.min(100, Math.round((quest.progress / quest.target) * 100));
}
