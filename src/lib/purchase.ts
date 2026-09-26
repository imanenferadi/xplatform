"use client";

import { createLocalStore } from "./local-store";
import type { Installment } from "./subscription-store";
import { saveSubscription } from "./subscription-store";
import { redeemCode } from "./discount-store";
import { spendWallet } from "./wallet-store";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { toPersianDigits } from "./utils";
import type { PackageDuration } from "./mock-data";

// Everything a purchase needs, frozen at checkout — so the student can pay
// now, or hand the exact same order to a parent as a payment link.
export type Order = {
  planId: string;
  planName: string;
  durationId: PackageDuration["id"];
  durationLabel: string;
  listTotal: number;
  discount: number;
  discountCode?: string;
  walletUse: number;
  total: number; // after code and wallet
  installments: Installment[];
};

const toman = (n: number) => `${toPersianDigits(n.toLocaleString("en-US"))} تومان`;

/** Activates the subscription and settles the code and wallet. */
export function completePurchase(order: Order, paidBy: "student" | "parent") {
  saveSubscription({
    planId: order.planId,
    planName: order.planName,
    durationId: order.durationId,
    durationLabel: order.durationLabel,
    total: order.total,
    installments: order.installments,
    purchasedDaysAgo: 0,
    refund: null,
    paidBy,
    ...(order.discountCode ? { discountCode: order.discountCode } : {}),
  });
  if (order.discountCode && order.discount > 0)
    redeemCode(order.discountCode, order.total, order.discount, paidBy === "parent" ? "والد ایمان" : "ایمان");
  if (order.walletUse > 0) spendWallet({ amount: order.walletUse, label: `خرید پلن ${order.planName}`, date: "امروز" });
  logEvent({
    category: "مالی",
    actor: paidBy === "parent" ? "والد ایمان" : "ایمان",
    actorRole: paidBy === "parent" ? "والد" : "دانش‌آموز",
    action: paidBy === "parent" ? "پرداخت با لینک والد" : "خرید اشتراک",
    target: `ایمان — پلن ${order.planName} (${order.durationLabel})`,
    severity: "info",
    details: [
      { label: "مبلغ کل", value: toman(order.total) },
      { label: "قسط اول", value: toman(order.installments[0]?.amount ?? 0) },
      ...(order.discountCode ? [{ label: "کد تخفیف", value: order.discountCode }] : []),
      ...(order.walletUse ? [{ label: "اعتبار کیف پول", value: toman(order.walletUse) }] : []),
    ],
    href: "/admin/payments",
  });
}

// ---------------------------------------------------------- pay links

export type PaymentLink = { token: string; order: Order; createdAt: string; status: "pending" | "paid" | "cancelled" };

const links = createLocalStore<PaymentLink[]>("x-pay-links", []);

export const usePaymentLinks = links.useValue;

export const LINK_VALID_HOURS = 48;

export function createPaymentLink(order: Order): string {
  const token = Math.random().toString(36).slice(2, 10);
  // Only one open link at a time — a new order replaces an unpaid one.
  links.set([
    ...links.get().map((l) => (l.status === "pending" ? { ...l, status: "cancelled" as const } : l)),
    { token, order, createdAt: `امروز، ${nowClock()}`, status: "pending" },
  ]);
  logEvent({
    category: "مالی",
    actor: "ایمان",
    actorRole: "دانش‌آموز",
    action: "ساخت لینک پرداخت برای والد",
    target: `ایمان — پلن ${order.planName} (${order.durationLabel})`,
    severity: "info",
    details: [{ label: "مبلغ", value: toman(order.total) }],
    href: "/admin/payments",
  });
  return token;
}

export function payLink(token: string): boolean {
  const link = links.get().find((l) => l.token === token);
  if (!link || link.status !== "pending") return false;
  completePurchase(link.order, "parent");
  links.set(links.get().map((l) => (l.token === token ? { ...l, status: "paid" } : l)));
  return true;
}

export function cancelLink(token: string) {
  links.set(links.get().map((l) => (l.token === token ? { ...l, status: "cancelled" } : l)));
}

export function payLinkUrl(token: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/pay/${token}`;
}
