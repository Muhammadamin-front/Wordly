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

export interface AdminAuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  email_verified: boolean;
  cefr_level: string;
  learning_goal: string;
  onboarding_completed: boolean;
  cards_total: number;
  cards_due: number;
  reviews_total: number;
  latest_review_at: string | null;
  active_sessions: number;
  latest_session_at: string | null;
  password_reset_pending: boolean;
  subscription: {
    plan_code: string;
    status: string;
    provider: string;
    auto_renew: boolean;
    expires_at: string;
  } | null;
  payments: Array<{
    id: string;
    provider: string;
    plan_code: string;
    amount_tiyin: number;
    state: number;
    created_at: string;
  }>;
}

export type StaffRole =
  | "learner"
  | "teacher"
  | "support"
  | "content_manager"
  | "admin"
  | "super_admin";

export const adminApi = {
  analytics: () => apiFetch<AdminAnalytics>("/admin/analytics", { auth: true }),

  reports: (resolved = false) =>
    apiFetch<AiReport[]>(`/admin/ai-reports?resolved=${resolved}`, { auth: true }),

  resolveReport: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/ai-reports/${id}/resolve`, {
      method: "POST",
      body: reason ? { reason } : undefined,
      auth: true,
    }),

  users: (q?: string, page = 1) =>
    apiFetch<{ items: AdminUser[]; total: number; page: number; page_size: number }>(
      `/admin/users?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
      { auth: true }
    ),

  userDetail: (id: string) => apiFetch<AdminUserDetail>(`/admin/users/${id}`, { auth: true }),

  ban: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/ban`, {
      method: "POST",
      body: reason ? { reason } : undefined,
      auth: true,
    }),

  unban: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/unban`, {
      method: "POST",
      body: reason ? { reason } : undefined,
      auth: true,
    }),

  setRole: (id: string, role: StaffRole, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/role`, {
      method: "POST",
      body: { role, ...(reason ? { reason } : {}) },
      auth: true,
    }),

  auditLogs: () => apiFetch<AdminAuditLog[]>("/admin/audit-logs", { auth: true }),
};
