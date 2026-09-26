"use client";

import { createLocalStore } from "./local-store";
import { GUARANTEE_DAYS, INSTALLMENT_DUE_LABELS, type PackageDuration } from "./mock-data";

// The package bought on /checkout (demo bridge in localStorage). Read by the
// student's profile (guarantee + refund), the parent panel (installments)
// and /admin/payments (guarantee refunds queue).

export type Installment = { due: string; amount: number; paid: boolean };

export type Subscription = {
  planId: string;
  planName: string;
  durationId: PackageDuration["id"];
  durationLabel: string;
  total: number;
  installments: Installment[];
  purchasedDaysAgo: number; // demo time doesn't move, so this stays 0
  refund: null | { status: "pending" | "approved" | "rejected"; amount: number; reason: string };
  discountCode?: string;
  paidBy?: "student" | "parent";
};

const store = createLocalStore<Subscription | null>("x-subscription", null);

export const useSubscription = store.useValue;

export function saveSubscription(sub: Subscription) {
  store.set(sub);
}

export function requestRefund(reason: string) {
  const sub = store.get();
  if (!sub || sub.refund) return;
  const paid = sub.installments.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0);
  store.set({ ...sub, refund: { status: "pending", amount: paid, reason } });
}

export function decideRefund(status: "approved" | "rejected") {
  const sub = store.get();
  if (!sub?.refund) return;
  store.set({ ...sub, refund: { ...sub.refund, status } });
}

export function guaranteeDaysLeft(sub: Subscription) {
  return Math.max(0, GUARANTEE_DAYS - sub.purchasedDaysAgo);
}

// Rounded to the nearest 1,000 toman — nobody pays ۱,۳۴۱,۰۰۷.
function round1000(n: number) {
  return Math.round(n / 1000) * 1000;
}

export function packageTotal(monthlyPrice: number, d: PackageDuration) {
  return round1000(monthlyPrice * d.months * (1 - d.discountPercent / 100));
}

/** Equal monthly parts; the last one absorbs rounding so the sum is exact. */
export function splitInstallments(total: number, count: number): Installment[] {
  const part = round1000(total / count);
  return Array.from({ length: count }, (_, i) => ({
    due: INSTALLMENT_DUE_LABELS[i],
    amount: i === count - 1 ? total - part * (count - 1) : part,
    paid: i === 0,
  }));
}
