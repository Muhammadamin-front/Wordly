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
  auto_renew: boolean;
  cancelled_at: string | null;
  show_welcome: boolean;
}

export interface Checkout {
  order_id: string;
  checkout_url: string;
  amount_som: number;
}

export type PaymentProvider = "payme" | "click" | "uzum";

export interface BillingStatus {
  checkout_enabled: boolean;
  sandbox_enabled: boolean;
  providers: {
    payme: boolean;
    click: boolean;
    uzum: boolean;
  };
  family_plan_available: boolean;
}

export interface ReferralInfo {
  code: string;
  invited: number;
  rewarded: number;
  reward_days: number;
}

export interface ManualPayment {
  reference: string;
  plan_code: string;
  amount_som: number;
  status: string;
  created_at: string;
}

export const billingApi = {
  /** Records that the learner says they transferred the price to the card.
   *  Grants nothing — staff activate by hand — but gives them a reference
   *  and gives us a queue. */
  requestManualPayment: (planCode: string) =>
    apiFetch<ManualPayment>("/billing/manual-payment", {
      method: "POST",
      body: { plan_code: planCode },
      auth: true,
    }),

  manualPayment: () =>
    apiFetch<ManualPayment | null>("/billing/manual-payment", { auth: true }),

  plans: () => apiFetch<{ plans: Plan[] }>("/billing/plans"),

  status: () => apiFetch<BillingStatus>("/billing/status"),

  subscription: () => apiFetch<Subscription>("/billing/subscription", { auth: true }),

  /** Marks the "Premium is on" message as seen, so it appears once per
   *  activation rather than on every page load. */
  markWelcomed: () =>
    apiFetch<{ message: string }>("/billing/subscription/welcomed", {
      method: "POST",
      auth: true,
    }),

  checkout: (planCode: string, provider: PaymentProvider, returnUrl: string, idempotencyKey?: string) =>
    apiFetch<Checkout>("/billing/checkout", {
      method: "POST",
      body: { plan_code: planCode, provider, return_url: returnUrl },
      auth: true,
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
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
