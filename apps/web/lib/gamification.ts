import { apiFetch } from "@/lib/api";

export interface Stats {
  xp: number;
  level: number;
  xp_into_level: number;
  xp_for_next_level: number;
  coins: number;
  total_reviews: number;
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  daily_goal: number;
  reviews_today: number;
  goal_reached_today: boolean;
  league_tier: string;
  league_tier_index: number;
}

export interface Reward {
  xp_gained: number;
  coins_gained: number;
  total_xp: number;
  level: number;
  leveled_up: boolean;
  current_streak: number;
  streak_increased: boolean;
  freeze_used: boolean;
  goal_reached: boolean;
  new_achievements: string[];
}

export interface Achievement {
  code: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface LeaderboardMember {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  is_me: boolean;
}

export interface Leaderboard {
  tier: string;
  tier_index: number;
  iso_week: string;
  promote_top: number;
  relegate_bottom: number;
  my_rank: number;
  members: LeaderboardMember[];
}

export interface DailyQuest {
  code: string;
  progress: number;
  target: number;
  xp_reward: number;
  completed: boolean;
  game_type: string;
  source_category: string | null;
}

export interface DailyQuests {
  day: string;
  game_xp_today: number;
  completed_count: number;
  total_count: number;
  quests: DailyQuest[];
}

/** Header/dashboard listen for this to refetch stats after a review session. */
export const STATS_CHANGED_EVENT = "words:stats-changed";
export const QUESTS_CHANGED_EVENT = "words:quests-changed";

export function notifyStatsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STATS_CHANGED_EVENT));
  }
}

export function notifyQuestsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(QUESTS_CHANGED_EVENT));
  }
}

export const gamificationApi = {
  stats: () => apiFetch<Stats>("/me/stats", { auth: true }),

  dailyQuests: () => apiFetch<DailyQuests>("/me/daily-quests", { auth: true }),

  achievements: () => apiFetch<Achievement[]>("/me/achievements", { auth: true }),

  leaderboard: () => apiFetch<Leaderboard>("/leaderboard", { auth: true }),

  setDailyGoal: (dailyGoal: number) =>
    apiFetch<Stats>("/me/daily-goal", {
      method: "PUT",
      body: { daily_goal: dailyGoal },
      auth: true,
    }),

  buyStreakFreeze: () =>
    apiFetch<{ streak_freezes: number; coins: number }>("/me/streak-freeze", {
      method: "POST",
      auth: true,
    }),
};
