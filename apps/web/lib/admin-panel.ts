import { apiFetch } from "@/lib/api";

export interface AdminAnalytics {
  users_total: number;
  premium_users: number;
  active_subscriptions: number;
  revenue_som: number;
  ai_reports_open: number;
  reviews_total: number;
}

export interface AiReport {
  id: string;
  kind: string;
  output: string;
  prompt: string | null;
  reason: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
}

export const adminApi = {
  analytics: () => apiFetch<AdminAnalytics>("/admin/analytics", { auth: true }),

  reports: (resolved = false) =>
    apiFetch<AiReport[]>(`/admin/ai-reports?resolved=${resolved}`, { auth: true }),

  resolveReport: (id: string) =>
    apiFetch<{ message: string }>(`/admin/ai-reports/${id}/resolve`, {
      method: "POST",
      auth: true,
    }),

  users: (q?: string, page = 1) =>
    apiFetch<{ items: AdminUser[]; total: number; page: number; page_size: number }>(
      `/admin/users?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
      { auth: true }
    ),

  ban: (id: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/ban`, { method: "POST", auth: true }),

  unban: (id: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/unban`, { method: "POST", auth: true }),

  setRole: (id: string, role: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/role`, {
      method: "POST",
      body: { role },
      auth: true,
    }),
};
