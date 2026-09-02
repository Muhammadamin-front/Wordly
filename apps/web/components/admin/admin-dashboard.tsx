"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BookOpen, ShieldCheck, UsersRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AdminGuard } from "@/components/admin/admin-guard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  adminApi,
  GRANTABLE_PLAN_CODES,
  type AdminAnalytics,
  type AdminAuditLog,
  type AdminUserDetail,
  type AdminUser,
  type AiReport,
  type GrantablePlanCode,
  type StaffRole,
} from "@/lib/admin-panel";
import { formatSom } from "@/lib/billing";
import { formatApiDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/use-modal-focus";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Tab = "analytics" | "reports" | "users" | "audit";
type UserAction = { user: AdminUser; kind: "ban" | "unban" | "role"; role?: StaffRole };

export function AdminDashboard({
  lang,
  t,
  deniedMessage,
}: {
  lang: string;
  t: Dictionary["adminPanel"];
  deniedMessage: string;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("analytics");
  const role = user?.role;
  const canManageContent = role === "admin" || role === "super_admin";
  const isSupportOnly = role === "support";
  const tabs = useMemo(
    () => (isSupportOnly ? (["users"] as Tab[]) : (["analytics", "reports", "users", "audit"] as Tab[])),
    [isSupportOnly]
  );

  const activeTab = tabs.includes(tab) ? tab : tabs[0];

  return (
    <AdminGuard
      lang={lang}
      deniedMessage={deniedMessage}
      allowedRoles={["support", "admin", "super_admin"]}
    >
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-300">Vocora operations</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{t.title}</h1>
          </div>
          {canManageContent && (
            <Link
              href={`/${lang}/admin/words`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-raised px-4 text-sm font-bold text-ink transition-colors hover:bg-hover"
            >
              <BookOpen className="size-4" aria-hidden />
              {t.words}
            </Link>
          )}
        </header>

        <nav className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-line bg-raised/60 p-1" aria-label={t.title}>
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "min-h-11 shrink-0 rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                activeTab === key ? "bg-primary text-white shadow-sm dark:text-brand-950" : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              {t[key]}
            </button>
          ))}
        </nav>

        <section className="mt-6">
          {activeTab === "analytics" && <AnalyticsTab t={t} />}
          {activeTab === "reports" && <ReportsTab t={t} />}
          {activeTab === "users" && <UsersTab t={t} lang={lang} role={role} />}
          {activeTab === "audit" && <AuditTab t={t} lang={lang} />}
        </section>
      </main>
    </AdminGuard>
  );
}

function AnalyticsTab({ t }: { t: Dictionary["adminPanel"] }) {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminApi.analytics().then((value) => !cancelled && setStats(value)).catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) return <LoadError t={t} retry={() => { setError(false); setReloadKey((value) => value + 1); }} />;
  if (!stats) return <Spinner />;

  const tiles: Array<{ label: string; value: string; icon: typeof UsersRound }> = [
    { label: t.usersTotal, value: String(stats.users_total), icon: UsersRound },
    { label: t.premiumUsers, value: String(stats.premium_users), icon: ShieldCheck },
    { label: t.activeSubs, value: String(stats.active_subscriptions), icon: Activity },
    { label: t.revenue, value: `${formatSom(stats.revenue_som)} ${t.som}`, icon: Activity },
    { label: t.reportsOpen, value: String(stats.ai_reports_open), icon: ShieldCheck },
    { label: t.reviewsTotal, value: String(stats.reviews_total), icon: BookOpen },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="min-h-32 p-4">
          <Icon className="size-4 text-brand-600 dark:text-brand-300" aria-hidden />
          <p className="mt-5 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
          <p className="mt-1 text-xs font-medium text-ink-soft">{label}</p>
        </Card>
      ))}
    </div>
  );
}

function ReportsTab({ t }: { t: Dictionary["adminPanel"] }) {
  const [reports, setReports] = useState<AiReport[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminApi.reports(false).then((value) => !cancelled && setReports(value)).catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) return <LoadError t={t} retry={() => { setError(false); setReloadKey((value) => value + 1); }} />;
  if (!reports) return <Spinner />;
  if (reports.length === 0) return <Card className="py-10 text-center text-ink-soft">{t.noReports}</Card>;

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                {t.reportKind}: {report.kind}
                {report.reason && <span className="ml-2 font-normal normal-case">{t.reportReason}: {report.reason}</span>}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{report.output}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={async () => {
              await adminApi.resolveReport(report.id);
              setReloadKey((value) => value + 1);
            }}>
              {t.resolve}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersTab({ t, lang, role }: { t: Dictionary["adminPanel"]; lang: string; role?: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<UserAction | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const isSuperAdmin = role === "super_admin";
  const canSuspend = role === "admin" || isSuperAdmin;

  useEffect(() => {
    let cancelled = false;
    adminApi.users(query || undefined).then((page) => !cancelled && setUsers(page.items)).catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const reload = () => { setError(false); setReloadKey((value) => value + 1); };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => { setError(false); setQuery(event.target.value); }}
        placeholder={t.search}
        className="h-11 w-full max-w-sm rounded-lg border border-line bg-raised px-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-focus"
      />
      {error ? <LoadError t={t} retry={reload} /> : !users ? <Spinner /> : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-185 text-left text-sm">
            <thead className="bg-hover text-xs font-bold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">{t.email}</th><th className="px-4 py-3">{t.role}</th><th className="px-4 py-3">{t.status}</th><th className="px-4 py-3">{t.joined}</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-card">
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3"><button type="button" onClick={() => setSelectedUserId(item.id)} className="font-semibold text-ink hover:underline">{item.display_name}</button><p className="mt-0.5 text-xs text-ink-soft">{item.email}{item.is_premium ? " · Premium" : ""}</p></td>
                  <td className="px-4 py-3">
                    {isSuperAdmin ? <select aria-label={t.role} value={item.role} onChange={(event) => setPending({ user: item, kind: "role", role: event.target.value as StaffRole })} className="rounded-md border border-line bg-raised px-2 py-1 text-xs text-ink"><RoleOptions /></select> : <span className="rounded-full bg-hover px-2 py-1 text-xs font-bold text-ink-soft">{item.role}</span>}
                  </td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", item.is_active ? "bg-success/10 text-success-text" : "bg-danger/10 text-danger-text")}>{item.is_active ? t.active : t.banned}</span></td>
                  <td className="px-4 py-3 text-xs text-ink-soft">{formatApiDate(item.created_at, lang) ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{canSuspend && <button type="button" onClick={() => setPending({ user: item, kind: item.is_active ? "ban" : "unban" })} className={cn("min-h-11 px-2 text-xs font-bold hover:underline", item.is_active ? "text-danger-text" : "text-success-text")}>{item.is_active ? t.ban : t.unban}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pending && <ConfirmUserAction t={t} pending={pending} onClose={() => setPending(null)} onDone={reload} />}
      {selectedUserId && (
        <UserDetailDialog
          t={t}
          lang={lang}
          userId={selectedUserId}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

function RoleOptions() {
  return <>{(["learner", "teacher", "support", "content_manager", "admin", "super_admin"] as StaffRole[]).map((role) => <option key={role} value={role}>{role}</option>)}</>;
}

function ConfirmUserAction({ t, pending, onClose, onDone }: { t: Dictionary["adminPanel"]; pending: UserAction; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useModalFocus({ containerRef: dialogRef, initialFocusRef: cancelButtonRef, onDismiss: onClose });
  const submit = async () => {
    setSaving(true); setError("");
    try {
      if (pending.kind === "ban") await adminApi.ban(pending.user.id, reason);
      if (pending.kind === "unban") await adminApi.unban(pending.user.id, reason);
      if (pending.kind === "role" && pending.role) await adminApi.setRole(pending.user.id, pending.role, reason);
      onDone(); onClose();
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.loadingError); } finally { setSaving(false); }
  };
  const actionLabel = pending.kind === "ban" ? t.ban : pending.kind === "unban" ? t.unban : `${t.role}: ${pending.role}`;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" role="presentation" onMouseDown={onClose}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" tabIndex={-1} className="w-full max-w-md rounded-xl2 border border-line bg-card p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><h2 id="admin-confirm-title" className="text-lg font-extrabold text-ink">{t.confirmAction}</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">{pending.user.email} · {actionLabel}</p><label className="mt-5 block text-sm font-bold text-ink"><span className="sr-only">{t.reasonOptional}</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder={t.reasonOptional} className="min-h-24 w-full rounded-lg border border-line bg-raised p-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-focus" /></label>{error && <Alert className="mt-3" tone="error">{error}</Alert>}<div className="mt-5 flex justify-end gap-2"><Button ref={cancelButtonRef} variant="ghost" onClick={onClose} disabled={saving}>{t.cancel}</Button><Button variant={pending.kind === "ban" ? "danger" : "primary"} onClick={submit} loading={saving}>{t.confirm}</Button></div></section></div>;
}

function UserDetailDialog({
  t, lang, userId, isSuperAdmin, onClose,
}: {
  t: Dictionary["adminPanel"]; lang: string; userId: string; isSuperAdmin: boolean; onClose: () => void;
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalFocus({ containerRef: dialogRef, initialFocusRef: closeButtonRef, onDismiss: onClose });
  useEffect(() => { let cancelled = false; adminApi.userDetail(userId).then((value) => !cancelled && setDetail(value)).catch(() => !cancelled && setError(true)); return () => { cancelled = true; }; }, [userId, reloadKey]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" role="presentation" onMouseDown={onClose}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-user-detail-title" tabIndex={-1} className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-xl2 border border-line bg-card p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">{t.details}</p><h2 id="admin-user-detail-title" className="mt-1 text-xl font-extrabold text-ink">{detail?.display_name ?? "..."}</h2></div><Button ref={closeButtonRef} size="sm" variant="ghost" onClick={onClose}>{t.cancel}</Button></div>{error ? <Alert tone="error" className="mt-5">{t.loadingError}</Alert> : !detail ? <Spinner /> : <div className="mt-6 space-y-6"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="CEFR" value={detail.cefr_level} /><Stat label={t.learning} value={`${detail.cards_total} cards`} /><Stat label={t.reviewsTotal} value={String(detail.reviews_total)} /><Stat label="Due" value={String(detail.cards_due)} /></div><section><h3 className="font-extrabold text-ink">{t.details}</h3><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"><Stat label={t.verification} value={detail.email_verified ? t.active : t.banned} /><Stat label={t.sessions} value={String(detail.active_sessions)} /><Stat label={t.resetPending} value={detail.password_reset_pending ? t.active : "-"} /></div></section><section><h3 className="font-extrabold text-ink">{t.subscription}</h3>{detail.subscription ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{detail.subscription.plan_code} · {detail.subscription.status} · {detail.subscription.provider} · {formatApiDate(detail.subscription.expires_at, lang) ?? "—"}</p> : <p className="mt-2 text-sm text-ink-soft">{t.noSubscription}</p>}{isSuperAdmin && <SubscriptionActions t={t} userId={detail.id} hasSubscription={Boolean(detail.subscription)} onDone={() => setReloadKey((n) => n + 1)} />}</section><section><h3 className="font-extrabold text-ink">{t.payments}</h3>{detail.payments.length ? <ul className="mt-2 divide-y divide-line rounded-lg border border-line">{detail.payments.map((payment) => <li className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm" key={payment.id}><span className="font-semibold text-ink">{payment.plan_code} · {payment.provider}</span><span className="text-ink-soft">{formatSom(payment.amount_tiyin / 100)} · {formatApiDate(payment.created_at, lang) ?? "—"}</span></li>)}</ul> : <p className="mt-2 text-sm text-ink-soft">{t.payments}: 0</p>}</section></div>}</section></div>;
}

/** Grant/revoke a subscription directly — the only way to hand out or pull
 *  Premium from the admin panel today (the "premium berish" requirement).
 *  Super-admin only, matching the backend's require_super_admin on both
 *  routes. Revoke requires a reason (enforced server-side too). */
function SubscriptionActions({
  t, userId, hasSubscription, onDone,
}: { t: Dictionary["adminPanel"]; userId: string; hasSubscription: boolean; onDone: () => void }) {
  const [planCode, setPlanCode] = useState<GrantablePlanCode>("plus_monthly");
  const [extraDays, setExtraDays] = useState(30);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function grant() {
    setSaving(true); setError("");
    try {
      await adminApi.grantSubscription(userId, planCode, extraDays, reason || t.grantDefaultReason);
      setReason("");
      onDone();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.loadingError);
    } finally {
      setSaving(false);
    }
  }

  async function revoke() {
    if (!reason.trim()) { setError(t.reasonRequired); return; }
    setSaving(true); setError("");
    try {
      await adminApi.revokeSubscription(userId, reason);
      setReason("");
      onDone();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.loadingError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-raised/50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.grantPremium}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          aria-label={t.plan}
          value={planCode}
          onChange={(event) => setPlanCode(event.target.value as GrantablePlanCode)}
          className="min-h-9 rounded-md border border-line bg-card px-2 text-xs text-ink"
        >
          {GRANTABLE_PLAN_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
        <input
          type="number"
          min={0}
          max={3650}
          aria-label={t.extraDays}
          value={extraDays}
          onChange={(event) => setExtraDays(Number(event.target.value))}
          className="min-h-9 w-20 rounded-md border border-line bg-card px-2 text-xs text-ink"
        />
        <Button size="sm" loading={saving} onClick={grant}>{t.grant}</Button>
        {hasSubscription && (
          <Button size="sm" variant="danger" loading={saving} onClick={revoke}>{t.revoke}</Button>
        )}
      </div>
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t.reasonForRecord}
        maxLength={500}
        className="mt-2 h-9 w-full rounded-md border border-line bg-card px-2 text-xs text-ink outline-none focus:border-brand-400"
      />
      {error && <Alert tone="error" className="mt-2 text-xs">{error}</Alert>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-hover p-3"><p className="text-lg font-extrabold text-ink">{value}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">{label}</p></div>; }

function AuditTab({ t, lang }: { t: Dictionary["adminPanel"]; lang: string }) {
  const [items, setItems] = useState<AdminAuditLog[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => { let cancelled = false; adminApi.auditLogs().then((value) => !cancelled && setItems(value)).catch(() => !cancelled && setError(true)); return () => { cancelled = true; }; }, [reloadKey]);
  if (error) return <LoadError t={t} retry={() => { setError(false); setReloadKey((value) => value + 1); }} />;
  if (!items) return <Spinner />;
  if (!items.length) return <Card className="py-10 text-center text-ink-soft">{t.activity}</Card>;
  return <Card className="divide-y divide-line p-0">{items.map((item) => <div className="p-4" key={item.id}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-ink">{item.action}</p><time className="text-xs text-ink-soft">{formatApiDate(item.created_at, lang, { dateStyle: "medium", timeStyle: "short" }) ?? "—"}</time></div><p className="mt-1 text-sm text-ink-soft">{item.actor_email ?? "Deleted user"} · {item.target_type} {item.target_id}</p>{item.reason && <p className="mt-2 text-sm text-ink">{item.reason}</p>}</div>)}</Card>;
}

function LoadError({ t, retry }: { t: Dictionary["adminPanel"]; retry: () => void }) { return <Alert tone="error" className="flex flex-wrap items-center justify-between gap-3">{t.loadingError}<Button size="sm" variant="secondary" onClick={retry}>{t.retry}</Button></Alert>; }
function Spinner() { return <div className="flex justify-center py-14"><span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" /></div>; }
