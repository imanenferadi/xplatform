"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore, VIEW_AS_STORE_KEY, VIEW_AS_TAB_KEY } from "./local-store";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { currentAdminName } from "./staff-store";
import { toPersianDigits } from "./utils";

// «مشاهده به‌جای کاربر» for technical support: asked for in a ticket, allowed
// by the user, read-only, 30 minutes, every page logged. It opens in its own
// tab (flagged in sessionStorage) so the user's own tab is untouched.
export const VIEW_AS_MINUTES = 30;

export type ViewAsStatus = "pending" | "approved" | "declined" | "active" | "ended";
export type ViewAsRequest = {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  by: string;
  reason: string;
  status: ViewAsStatus;
  requestedAt: string;
  answeredAt?: string;
  startedAtMs?: number;
  expiresAtMs?: number;
  endedAt?: string;
  endedBy?: string;
  pages: string[];
};

const store = createLocalStore<ViewAsRequest[]>(VIEW_AS_STORE_KEY, []);
export const useViewAsRequests = store.useValue;

const update = (id: string, patch: Partial<ViewAsRequest>) =>
  store.set(store.get().map((r) => (r.id === id ? { ...r, ...patch } : r)));
const find = (id: string) => store.get().find((r) => r.id === id);

function audit(action: string, r: ViewAsRequest, extra: { label: string; value: string }[] = [], actor?: string) {
  logEvent({
    category: "امنیت",
    ...(actor ? { actor, actorRole: "دانش‌آموز" as const } : {}),
    action,
    target: `${r.userName} — تیکت ${r.ticketId}`,
    severity: "warning",
    details: [{ label: "پشتیبان", value: r.by }, { label: "دلیل", value: r.reason }, ...extra],
    href: `/admin/tickets?t=${r.ticketId}`,
  });
}

export function requestViewAs(ticketId: string, userId: string, userName: string, reason: string) {
  const r: ViewAsRequest = {
    id: `va-${Date.now()}`,
    ticketId,
    userId,
    userName,
    by: currentAdminName(),
    reason,
    status: "pending",
    requestedAt: `امروز، ${nowClock()}`,
    pages: [],
  };
  store.set([r, ...store.get()]);
  audit("درخواست مشاهده‌ی حساب کاربر", r);
}

/** The user's answer. */
export function answerViewAs(id: string, allow: boolean) {
  const r = find(id);
  if (!r || r.status !== "pending") return;
  update(id, { status: allow ? "approved" : "declined", answeredAt: `امروز، ${nowClock()}` });
  audit(allow ? "اجازه‌ی مشاهده‌ی حساب داده شد" : "اجازه‌ی مشاهده‌ی حساب رد شد", r, [], r.userName);
}

/** Support starts the 30-minute window and gets the URL of the view tab. */
export function startViewAs(id: string): string | null {
  const r = find(id);
  if (!r || r.status !== "approved") return null;
  const now = Date.now();
  update(id, { status: "active", startedAtMs: now, expiresAtMs: now + VIEW_AS_MINUTES * 60_000 });
  audit("شروع مشاهده‌ی حساب (فقط‌خواندنی)", r, [{ label: "مدت", value: `${toPersianDigits(VIEW_AS_MINUTES)} دقیقه` }]);
  return `/dashboard?support-view=${id}`;
}

export function endViewAs(id: string, by: "support" | "user" | "timeout") {
  const r = find(id);
  if (!r || (r.status !== "active" && r.status !== "approved")) return;
  const who = by === "user" ? r.userName : by === "support" ? r.by : "سیستم (پایان ۳۰ دقیقه)";
  update(id, { status: "ended", endedAt: `امروز، ${nowClock()}`, endedBy: who });
  audit(
    "پایان مشاهده‌ی حساب",
    r,
    [
      { label: "پایان توسط", value: who },
      { label: "صفحه‌های دیده‌شده", value: r.pages.length ? r.pages.join("، ") : "—" },
    ],
    by === "user" ? r.userName : undefined
  );
}

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "امروز",
  "/dashboard/plan": "برنامه",
  "/dashboard/calendar": "تقویم",
  "/dashboard/report": "گزارش کار",
  "/dashboard/weekly": "جمع هفته",
  "/dashboard/mistakes": "دفترچه‌ی غلط‌ها",
  "/dashboard/karnameh": "کارنامه",
  "/dashboard/setup": "اطلاعات شروع",
  "/chat": "گفتگو (نمایش داده نشد)",
  "/profile": "پروفایل",
  "/support": "پشتیبانی",
};

export function recordPage(id: string, path: string) {
  const r = find(id);
  const label = PAGE_LABELS[path] ?? path;
  if (!r || r.status !== "active" || r.pages.at(-1) === label) return;
  update(id, { pages: [...r.pages, label] });
}

// ---- the view tab itself ----

const tabListeners = new Set<() => void>();
function subscribeTab(l: () => void) {
  tabListeners.add(l);
  return () => tabListeners.delete(l);
}
function getTabId(): string | null {
  try {
    return sessionStorage.getItem(VIEW_AS_TAB_KEY);
  } catch {
    return null;
  }
}

/** Called once on load: `?support-view=<id>` marks this tab as a support view. */
export function bootViewAsTab() {
  const id = new URLSearchParams(window.location.search).get("support-view");
  if (!id || getTabId() === id) return;
  try {
    sessionStorage.setItem(VIEW_AS_TAB_KEY, id);
  } catch {
    return;
  }
  tabListeners.forEach((l) => l());
}

/** The view session this tab belongs to (null in a normal tab). */
export function useViewAsTab(): ViewAsRequest | null {
  const id = useSyncExternalStore(subscribeTab, getTabId, () => null);
  const all = store.useValue();
  return id ? (all.find((r) => r.id === id) ?? null) : null;
}

export function leaveViewAsTab() {
  try {
    sessionStorage.removeItem(VIEW_AS_TAB_KEY);
  } catch {
    // ignore
  }
  tabListeners.forEach((l) => l());
}

// A coarse clock for expiry checks (render must not call Date.now()).
let nowMs = 0;
const clockListeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribeClock(l: () => void) {
  clockListeners.add(l);
  if (!timer) {
    nowMs = Date.now();
    timer = setInterval(() => {
      nowMs = Date.now();
      clockListeners.forEach((f) => f());
    }, 5_000);
  }
  return () => {
    clockListeners.delete(l);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
export function useNowMs(): number {
  return useSyncExternalStore(
    subscribeClock,
    () => {
      if (!nowMs) nowMs = Date.now();
      return nowMs;
    },
    () => 0
  );
}

export function isLive(r: ViewAsRequest | null, now: number): boolean {
  return Boolean(r && r.status === "active" && r.expiresAtMs && now < r.expiresAtMs);
}

export function clockOf(ms: number): string {
  const d = new Date(ms);
  return toPersianDigits(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}
