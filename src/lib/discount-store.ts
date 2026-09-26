"use client";

import { createLocalStore } from "./local-store";
import { DEMO_TODAY_ISO, pricingPlans, seedDiscountCodes, type DiscountCode, type PackageDuration } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { toPersianDigits } from "./utils";

// Discount codes: managed on /admin/discounts, redeemed on /checkout.
const store = createLocalStore<DiscountCode[]>("x-discounts", seedDiscountCodes);

export const useDiscountCodes = store.useValue;

export type CodeStatus = "active" | "paused" | "expired" | "exhausted";

export function codeStatus(c: DiscountCode, todayIso = DEMO_TODAY_ISO): CodeStatus {
  if (c.expiresIso < todayIso) return "expired";
  if (c.used >= c.maxUses) return "exhausted";
  if (c.paused) return "paused";
  return "active";
}

export const CODE_STATUS_LABEL: Record<CodeStatus, string> = {
  active: "فعال",
  paused: "متوقف",
  expired: "منقضی",
  exhausted: "ظرفیت تمام",
};

export function discountAmount(c: DiscountCode, total: number) {
  const raw = c.kind === "percent" ? (total * c.value) / 100 : c.value;
  return Math.min(total, Math.round(raw / 1000) * 1000);
}

type CodeContext = { planId: string; durationId: PackageDuration["id"]; firstPurchase: boolean };
type CodeCheck = { ok: true; code: DiscountCode } | { ok: false; error: string };

/** Checks a code typed on checkout; returns a precise reason when it can't be used. */
export function checkCode(codes: DiscountCode[], input: string, ctx: CodeContext): CodeCheck {
  const c = codes.find((x) => x.code === input.trim().toUpperCase());
  if (!c) return { ok: false, error: "این کد تخفیف وجود نداره." };
  const status = codeStatus(c);
  if (status === "expired") return { ok: false, error: "مهلت این کد تموم شده." };
  if (status === "exhausted") return { ok: false, error: "ظرفیت استفاده از این کد پر شده." };
  if (status === "paused") return { ok: false, error: "این کد فعلاً فعال نیست." };
  if (c.planIds.length && !c.planIds.includes(ctx.planId)) {
    const names = c.planIds.map((id) => pricingPlans.find((p) => p.id === id)?.name).join("، ");
    return { ok: false, error: `این کد فقط برای پلن ${names} معتبره.` };
  }
  if (c.durationIds.length && !c.durationIds.includes(ctx.durationId))
    return { ok: false, error: "این کد برای مدت اشتراکی که انتخاب کردی معتبر نیست." };
  if (c.firstPurchaseOnly && !ctx.firstPurchase) return { ok: false, error: "این کد فقط برای خرید اول معتبره." };
  return { ok: true, code: c };
}

export function redeemCode(code: string, paidTotal: number, given: number, buyer: string) {
  store.set(
    store
      .get()
      .map((c) =>
        c.code === code ? { ...c, used: c.used + 1, sales: c.sales + paidTotal, given: c.given + given } : c
      )
  );
  logEvent({
    category: "مالی",
    actor: buyer,
    actorRole: "دانش‌آموز",
    action: "استفاده از کد تخفیف",
    target: code,
    severity: "info",
    details: [
      { label: "تخفیف", value: `${toPersianDigits(given.toLocaleString("en-US"))} تومان` },
      { label: "مبلغ نهایی", value: `${toPersianDigits(paidTotal.toLocaleString("en-US"))} تومان` },
    ],
    href: "/admin/discounts",
  });
}

export function createCode(c: DiscountCode) {
  store.set([c, ...store.get()]);
}

export function setPaused(code: string, paused: boolean) {
  store.set(store.get().map((c) => (c.code === code ? { ...c, paused } : c)));
}
