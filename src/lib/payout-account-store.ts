"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { mentors } from "./mock-data";
import { bankOf, maskIban } from "./iban";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { currentAdminName } from "./staff-store";
import { toPersianDigits } from "./utils";

// Where each mentor's payout goes, and requests to change it. Only the
// mentor asks; only finance (or مدیر کل) decides; after an approval the
// first payout to the new account waits 48 hours, so a hijacked account
// has time to be noticed.
export const SHEBA_HOLD_HOURS = 48;

export type PayoutAccount = { sheba: string; holder: string; since: string; holdUntilMs?: number };
export type ShebaRequest = {
  id: string;
  mentorId: string;
  mentorName: string;
  oldSheba: string;
  newSheba: string;
  holder: string;
  note: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
  seenByMentor?: boolean;
};

const SEED_ACCOUNTS: Record<string, PayoutAccount> = {
  "sara-mohammadi": { sheba: "IR960017000001110000004521", holder: "سارا محمدی", since: "۱۴۰۳/۱۱/۱۰" },
  "negar-ahmadi": { sheba: "IR660012000002220000007730", holder: "نگار احمدی", since: "۱۴۰۴/۰۲/۰۱" },
  "amirhossein-rezaei": { sheba: "IR240056000003330000000198", holder: "امیرحسین رضایی", since: "۱۴۰۴/۰۱/۱۵" },
  "mahsa-ghasemi": { sheba: "IR260057000004440000003364", holder: "مهسا قاسمی", since: "۱۴۰۴/۰۳/۲۰" },
};

type State = { accounts: Record<string, PayoutAccount>; requests: ShebaRequest[] };
const store = createLocalStore<State>("x-payout-accounts", { accounts: SEED_ACCOUNTS, requests: [] });

export const usePayoutAccounts = () => store.useValue().accounts;
export const useShebaRequests = () => store.useValue().requests;

export function useMyShebaRequests(mentorId: string): ShebaRequest[] {
  const { requests } = store.useValue();
  return useMemo(() => requests.filter((r) => r.mentorId === mentorId), [requests, mentorId]);
}

/** Holder name matches the mentor's (ignoring spaces and ی/ي, ک/ك). */
export function holderMatches(holder: string, mentorName: string): boolean {
  const n = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\s‌]/g, "");
  return n(holder) === n(mentorName);
}

const mentorName = (id: string) => mentors.find((m) => m.id === id)?.name ?? id;

export function requestShebaChange(mentorId: string, newSheba: string, holder: string, note: string): string | null {
  const s = store.get();
  const current = s.accounts[mentorId];
  if (current?.sheba === newSheba) return "این همون شبای فعلیته.";
  if (s.requests.some((r) => r.mentorId === mentorId && r.status === "pending"))
    return "یک درخواست تغییر شبا همین الان منتظر بررسیه — اول اون رو لغو کن.";
  const r: ShebaRequest = {
    id: `sh-${Date.now()}`,
    mentorId,
    mentorName: mentorName(mentorId),
    oldSheba: current?.sheba ?? "",
    newSheba,
    holder: holder.trim().replace(/ي/g, "ی").replace(/ك/g, "ک"),
    note: note.trim(),
    requestedAt: `امروز، ${nowClock()}`,
    status: "pending",
  };
  store.set({ ...s, requests: [r, ...s.requests] });
  logEvent({
    category: "مالی",
    actor: r.mentorName,
    actorRole: "مشاور",
    action: "درخواست تغییر شبا",
    target: r.mentorName,
    severity: "warning",
    details: [
      { label: "شبای فعلی", value: r.oldSheba ? maskIban(r.oldSheba) : "—" },
      { label: "شبای جدید", value: `${maskIban(newSheba)} (${bankOf(newSheba)})` },
      { label: "صاحب حساب", value: r.holder },
    ],
    href: "/admin/finance",
  });
  return null;
}

export function cancelShebaRequest(id: string) {
  const s = store.get();
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "pending") return;
  store.set({ ...s, requests: s.requests.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)) });
  logEvent({
    category: "مالی",
    actor: r.mentorName,
    actorRole: "مشاور",
    action: "لغو درخواست تغییر شبا",
    target: r.mentorName,
    severity: "info",
    details: [{ label: "شبای درخواستی", value: maskIban(r.newSheba) }],
    href: "/admin/finance",
  });
}

/** Finance's decision. `nowMs` comes from the click handler (render stays pure). */
export function decideSheba(id: string, approve: boolean, note: string, nowMs: number): string | null {
  const s = store.get();
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "pending") return "این درخواست دیگه منتظر نیست.";
  if (!approve && !note.trim()) return "برای رد، دلیل لازمه.";
  if (approve && !holderMatches(r.holder, r.mentorName) && !note.trim())
    return "اسم صاحب حساب با اسم مشاور یکی نیست — برای تأیید، دلیلش رو بنویس.";
  const by = currentAdminName();
  const decided: ShebaRequest = {
    ...r,
    status: approve ? "approved" : "rejected",
    decidedBy: by,
    decidedAt: `امروز، ${nowClock()}`,
    decisionNote: note.trim(),
    seenByMentor: false,
  };
  store.set({
    accounts: approve
      ? {
          ...s.accounts,
          [r.mentorId]: {
            sheba: r.newSheba,
            holder: r.holder,
            since: "امروز",
            holdUntilMs: nowMs + SHEBA_HOLD_HOURS * 3_600_000,
          },
        }
      : s.accounts,
    requests: s.requests.map((x) => (x.id === id ? decided : x)),
  });
  logEvent({
    category: "مالی",
    action: approve ? "تأیید تغییر شبا" : "رد تغییر شبا",
    target: r.mentorName,
    severity: "warning",
    details: [
      { label: "از", value: r.oldSheba ? maskIban(r.oldSheba) : "—" },
      { label: "به", value: `${maskIban(r.newSheba)} (${bankOf(r.newSheba)})` },
      ...(approve
        ? [
            {
              label: "دوره‌ی امنیتی",
              value: `تسویه‌ی بعدی تا ${toPersianDigits(SHEBA_HOLD_HOURS)} ساعت نگه داشته می‌شه`,
            },
          ]
        : []),
      ...(note.trim() ? [{ label: approve ? "توضیح" : "دلیل رد", value: note.trim() }] : []),
    ],
    href: "/admin/finance",
  });
  return null;
}

export function markShebaDecisionSeen(mentorId: string) {
  const s = store.get();
  if (!s.requests.some((r) => r.mentorId === mentorId && r.seenByMentor === false)) return;
  store.set({
    ...s,
    requests: s.requests.map((r) =>
      r.mentorId === mentorId && r.seenByMentor === false ? { ...r, seenByMentor: true } : r
    ),
  });
}
