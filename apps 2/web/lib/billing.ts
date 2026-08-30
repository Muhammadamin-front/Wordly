import { apiFetch } from "@/lib/api";

export interface Plan {
  code: string;
  tier: string;
  price_som: number;
  duration_days: number;
  seats: number;
}

export interface Subscription {
  is_premium: boolean;
  plan_code: string | null;
  status: string | null;
  provider: string | null;
  expires_at: string | null;
  seats: number;
}

export interface Checkout {
  order_id: string;
  checkout_url: string;
  amount_som: number;
}

export interface BillingStatus {
  checkout_enabled: boolean;
  sandbox_enabled: boolean;
  providers: {
    payme: boolean;
    click: boolean;
  };
  family_plan_available: boolean;
}

export interface ReferralInfo {
  code: string;
  invited: number;
  rewarded: number;
  reward_days: number;
}

export const billingApi = {
  plans: () => apiFetch<{ plans: Plan[] }>("/billing/plans", { auth: true }),

  status: () => apiFetch<BillingStatus>("/billing/status", { auth: true }),

  subscription: () => apiFetch<Subscription>("/billing/subscription", { auth: true }),

  checkout: (planCode: string, provider: "payme" | "click", returnUrl: string) =>
    apiFetch<Checkout>("/billing/checkout", {
      method: "POST",
      body: { plan_code: planCode, provider, return_url: returnUrl },
      auth: true,
    }),

  sandboxActivate: (planCode: string) =>
    apiFetch<Subscription>("/billing/sandbox-activate", {
      method: "POST",
      body: { plan_code: planCode },
      auth: true,
    }),

  cancel: () =>
    apiFetch<{ message: string }>("/billing/cancel", { method: "POST", auth: true }),

  referral: () => apiFetch<ReferralInfo>("/billing/referral", { auth: true }),
};

export function formatSom(amount: number): string {
  return amount.toLocaleString("ru-RU");
}
