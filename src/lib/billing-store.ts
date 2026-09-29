"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { DEMO_TODAY_ISO, studentAssignments, transactions } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { can } from "./permissions";
import { currentAdminName, currentAdminRole } from "./staff-store";
import { addNotice } from "./user-edits-store";
import {
  addDaysIso,
  formatJalali,
  toLatinDigits,
  toPersianDigits,
} from "./utils";

// The finance ledger: each student's subscription with real dated
// installments, pauses and gift days — plus the second-person approvals,
// manual payments, payout corrections and official invoices built on it.
//
// Rule: anything that records money or changes an amount needs a second
// person. The one who asked can never approve — checked here, not only in
// the UI.

export type LedgerInstallment = {
  id: string;
  dueIso: string;
  origDueIso: string;
  amount: number;
  paid: boolean;
  paidIso?: string;
  ref?: string;
  moves: number;
};
export type Pause = {
  id: string;
  days: number;
  reason: string;
  by: string;
  at: string;
  startIso: string;
  cancelled?: boolean;
};
export type LedgerSub = {
  userId: string;
  userName: string;
  planName: string;
  durationLabel: string;
  months: number;
  startIso: string;
  installments: LedgerInstallment[];
  pauses: Pause[];
  giftDays: number;
};

export type ApprovalKind = "manual_payment" | "payout_correction" | "gift";
type ManualPayload = {
  userId: string;
  userName: string;
  installmentId: string;
  amount: number;
  ref: string;
  paidIso: string;
  note: string;
};
type PayoutPayload = {
  payoutId: string;
  mentorName: string;
  fromGross: number;
  toGross: number;
  reason: string;
};
type GiftPayload = {
  userId: string;
  userName: string;
  days: number;
  reason: string;
};
export type Approval = {
  id: string;
  kind: ApprovalKind;
  createdBy: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  decidedBy?: string;
  decidedAt?: string;
  rejectReason?: string;
  manual?: ManualPayload;
  payout?: PayoutPayload;
  gift?: GiftPayload;
};
export type ManualTx = {
  id: string;
  studentName: string;
  planName: string;
  amount: number;
  ref: string;
  dateIso: string;
  by: string;
  approvedBy: string;
};
export type Buyer = {
  kind: "person" | "company";
  name: string;
  nationalId: string;
  economicCode?: string;
  address?: string;
};
export type Invoice = {
  no: string;
  txKey: string;
  studentName: string;
  description: string;
  amount: number;
  buyer: Buyer;
  issuedBy: string;
  issuedIso: string;
};

const inst = (
  id: string,
  dueIso: string,
  amount: number,
  paid: boolean,
  ref?: string,
): LedgerInstallment => ({
  id,
  dueIso,
  origDueIso: dueIso,
  amount,
  paid,
  ...(paid ? { paidIso: dueIso, ref } : {}),
  moves: 0,
});

const SEED_SUBS: LedgerSub[] = [
  {
    userId: "u-1",
    userName: "ایمان",
    planName: "همراه",
    durationLabel: "سه‌ماهه",
    months: 3,
    startIso: "2026-09-20",
    installments: [
      inst("u1-i1", "2026-09-20", 1341000, true, "GW-5514001"),
      inst("u1-i2", "2026-10-20", 1341000, false),
      inst("u1-i3", "2026-11-19", 1341000, false),
    ],
    pauses: [],
    giftDays: 0,
  },
  {
    userId: "u-2",
    userName: "امیرحسین رضایی",
    planName: "همراه",
    durationLabel: "یک‌ماهه",
    months: 1,
    startIso: "2026-09-10",
    installments: [inst("u2-i1", "2026-09-10", 1490000, true, "GW-5510044")],
    pauses: [],
    giftDays: 0,
  },
  {
    userId: "u-5",
    userName: "نگین احمدی",
    planName: "پایه",
    durationLabel: "سه‌ماهه",
    months: 3,
    startIso: "2026-08-15",
    installments: [
      inst("u5-i1", "2026-08-15", 801000, true, "GW-5507702"),
      inst("u5-i2", "2026-09-14", 801000, true, "GW-5511203"),
      inst("u5-i3", "2026-10-14", 801000, false),
    ],
    pauses: [],
    giftDays: 0,
  },
];

type State = {
  subs: LedgerSub[];
  approvals: Approval[];
  manualTx: ManualTx[];
  payoutGross: Record<string, number>;
  invoices: Invoice[];
};
const store = createLocalStore<State>("x-billing", {
  subs: SEED_SUBS,
  approvals: [],
  manualTx: [],
  payoutGross: {},
  invoices: [],
});

export const useBilling = store.useValue;

export const MAX_MOVE_DAYS = 30;
export const MAX_MOVES = 2;
export const MAX_PAUSE_DAYS = 30;
export const DAY_OPTIONS = [7, 14, 30];

const pausedDays = (s: LedgerSub) =>
  s.pauses.filter((p) => !p.cancelled).reduce((a, p) => a + p.days, 0);
/** Valid until: start + months (30-day months) + active pauses + gift days. */
export function validUntilIso(s: LedgerSub): string {
  return addDaysIso(s.startIso, s.months * 30 + pausedDays(s) + s.giftDays);
}
export const nextDue = (s: LedgerSub) => s.installments.find((i) => !i.paid);
export const fa = (n: number) => toPersianDigits(n.toLocaleString("en-US"));
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const now = () => `امروز، ${nowClock()}`;
const mentorOf = (userId: string) =>
  studentAssignments.find((a) => a.userId === userId)?.mentorId;

function mutateSub(userId: string, fn: (s: LedgerSub) => LedgerSub) {
  const st = store.get();
  store.set({
    ...st,
    subs: st.subs.map((s) => (s.userId === userId ? fn(s) : s)),
  });
}

// ---------------------------------------------------------------- 3. move an installment

export function moveInstallment(
  userId: string,
  installmentId: string,
  days: number,
  reason: string,
): string | null {
  const sub = store.get().subs.find((s) => s.userId === userId);
  const i = sub?.installments.find((x) => x.id === installmentId);
  if (!sub || !i) return "قسط پیدا نشد.";
  if (i.paid) return "این قسط پرداخت شده.";
  if (!reason.trim()) return "دلیل جابه‌جایی رو بنویس.";
  if (i.moves >= MAX_MOVES)
    return `هر قسط حداکثر ${toPersianDigits(MAX_MOVES)} بار جابه‌جا می‌شه.`;
  const to = addDaysIso(i.dueIso, days);
  if (daysBetween(i.origDueIso, to) > MAX_MOVE_DAYS)
    return `حداکثر ${toPersianDigits(MAX_MOVE_DAYS)} روز بعد از موعد اصلی (${formatJalali(i.origDueIso)}) — این جابه‌جایی بیشتر می‌شه.`;
  const after = sub.installments[sub.installments.indexOf(i) + 1];
  if (after && to >= after.dueIso)
    return `به موعد قسط بعدی (${formatJalali(after.dueIso)}) می‌رسه — دو قسط هم‌زمان نمی‌شن. کمتر جابه‌جا کن.`;
  mutateSub(userId, (s) => ({
    ...s,
    installments: s.installments.map((x) =>
      x.id === installmentId ? { ...x, dueIso: to, moves: x.moves + 1 } : x,
    ),
  }));
  logEvent({
    category: "مالی",
    action: "جابه‌جایی قسط",
    target: sub.userName,
    severity: "info",
    details: [
      { label: "مبلغ", value: `${fa(i.amount)} تومان` },
      { label: "از", value: formatJalali(i.dueIso) },
      { label: "به", value: formatJalali(to) },
      { label: "دلیل", value: reason.trim() },
    ],
    href: "/admin/payments",
  });
  addNotice(
    userId,
    `موعد قسط ${fa(i.amount)} تومانی‌ات از ${formatJalali(i.dueIso)} به ${formatJalali(to)} منتقل شد — دلیل: ${reason.trim()}`,
  );
  return null;
}

// ---------------------------------------------------------------- 4. pause

export function pauseSubscription(
  userId: string,
  days: number,
  reason: string,
): string | null {
  const sub = store.get().subs.find((s) => s.userId === userId);
  if (!sub) return "اشتراک پیدا نشد.";
  if (!reason.trim()) return "دلیل توقف رو بنویس.";
  if (pausedDays(sub) + days > MAX_PAUSE_DAYS)
    return `جمع توقف در طول اشتراک حداکثر ${toPersianDigits(MAX_PAUSE_DAYS)} روزه (الان ${toPersianDigits(pausedDays(sub))} روز استفاده شده).`;
  const before = validUntilIso(sub);
  const p: Pause = {
    id: `pz-${Date.now()}`,
    days,
    reason: reason.trim(),
    by: currentAdminName(),
    at: now(),
    startIso: DEMO_TODAY_ISO,
  };
  mutateSub(userId, (s) => ({ ...s, pauses: [...s.pauses, p] }));
  const after = addDaysIso(before, days);
  logEvent({
    category: "مالی",
    action: "توقف اشتراک",
    target: sub.userName,
    severity: "info",
    details: [
      { label: "مدت", value: `${toPersianDigits(days)} روز` },
      {
        label: "اعتبار تا",
        value: `${formatJalali(before)} ← ${formatJalali(after)}`,
      },
      { label: "دلیل", value: p.reason },
    ],
    href: "/admin/payments",
  });
  addNotice(
    userId,
    `اشتراکت ${toPersianDigits(days)} روز متوقف شد و اعتبارش تا ${formatJalali(after)} تمدید شد — دلیل: ${p.reason}`,
  );
  const m = mentorOf(userId);
  if (m)
    addNotice(
      `mentor:${m}`,
      `اشتراک ${sub.userName} ${toPersianDigits(days)} روز متوقفه (${p.reason}) — این مدت برنامه لازم نداره.`,
    );
  return null;
}

export function cancelPause(userId: string, pauseId: string) {
  const sub = store.get().subs.find((s) => s.userId === userId);
  const p = sub?.pauses.find((x) => x.id === pauseId);
  if (!sub || !p || p.cancelled) return;
  mutateSub(userId, (s) => ({
    ...s,
    pauses: s.pauses.map((x) =>
      x.id === pauseId ? { ...x, cancelled: true } : x,
    ),
  }));
  logEvent({
    category: "مالی",
    action: "لغو توقف اشتراک",
    target: sub.userName,
    severity: "info",
    details: [{ label: "مدت", value: `${toPersianDigits(p.days)} روز` }],
    href: "/admin/payments",
  });
  addNotice(
    userId,
    `توقف ${toPersianDigits(p.days)} روزه‌ی اشتراکت لغو شد و اعتبارت به حالت قبل برگشت.`,
  );
}

// ---------------------------------------------------------------- approvals (1, 2, 5)

function allRefs(st: State): Set<string> {
  const refs = new Set<string>();
  for (const t of transactions) {
    refs.add(t.gatewayRef);
    refs.add(t.code);
  }
  for (const s of st.subs)
    for (const i of s.installments) if (i.ref) refs.add(i.ref);
  for (const m of st.manualTx) refs.add(m.ref);
  for (const a of st.approvals)
    if (a.manual && a.status === "pending") refs.add(a.manual.ref);
  return refs;
}

function addApproval(
  a: Omit<Approval, "id" | "createdBy" | "createdAt" | "status">,
) {
  const st = store.get();
  store.set({
    ...st,
    approvals: [
      {
        ...a,
        id: `ap-${Date.now()}`,
        createdBy: currentAdminName(),
        createdAt: now(),
        status: "pending",
      },
      ...st.approvals,
    ],
  });
}

/** 1. A payment that reached the bank but not the platform — recorded by one person, approved by another. */
export function requestManualPayment(
  userId: string,
  installmentId: string,
  rawAmount: string,
  rawRef: string,
  paidIso: string,
  note: string,
): string | null {
  const st = store.get();
  const sub = st.subs.find((s) => s.userId === userId);
  const i = sub?.installments.find((x) => x.id === installmentId);
  if (!sub || !i) return "قسط پیدا نشد.";
  if (i.paid) return "این قسط قبلاً پرداخت شده.";
  if (
    st.approvals.some(
      (a) =>
        a.status === "pending" && a.manual?.installmentId === installmentId,
    )
  )
    return "برای همین قسط یک ثبت دستی منتظر تأییده.";
  const amount = Number(toLatinDigits(rawAmount).replace(/[,\s٬]/g, ""));
  if (amount !== i.amount)
    return `مبلغ باید دقیقاً مبلغ قسط باشه (${fa(i.amount)} تومان).`;
  const ref = toLatinDigits(rawRef).trim().toUpperCase();
  if (!/^[A-Z-]*\d{6,20}$/.test(ref))
    return "کد پیگیری بانکی باید ۶ تا ۲۰ رقم باشه.";
  if (allRefs(st).has(ref))
    return "این کد پیگیری قبلاً ثبت شده — یک پرداخت دو بار ثبت نمی‌شه.";
  if (!paidIso) return "تاریخ پرداخت رو بزن.";
  if (paidIso > DEMO_TODAY_ISO) return "تاریخ پرداخت نمی‌تونه آینده باشه.";
  if (!note.trim())
    return "توضیح بده از کجا فهمیدی پرداخت انجام شده (مثلاً تیکت یا صورت‌حساب بانک).";
  addApproval({
    kind: "manual_payment",
    manual: {
      userId,
      userName: sub.userName,
      installmentId,
      amount,
      ref,
      paidIso,
      note: note.trim(),
    },
  });
  logEvent({
    category: "مالی",
    action: "ثبت دستی پرداخت (منتظر تأیید نفر دوم)",
    target: sub.userName,
    severity: "warning",
    details: [
      { label: "مبلغ", value: `${fa(amount)} تومان` },
      { label: "کد پیگیری", value: ref },
      { label: "تاریخ پرداخت", value: formatJalali(paidIso) },
      { label: "توضیح", value: note.trim() },
    ],
    href: "/admin/payments",
  });
  return null;
}

/** 2. Correct a pending mentor payout — also two people. */
export function requestPayoutCorrection(
  payoutId: string,
  mentorName: string,
  fromGross: number,
  rawTo: string,
  reason: string,
): string | null {
  const st = store.get();
  const toGross = Number(toLatinDigits(rawTo).replace(/[,\s٬]/g, ""));
  if (!Number.isFinite(toGross) || toGross <= 0)
    return "مبلغ جدید رو به تومان وارد کن.";
  if (toGross === fromGross) return "مبلغ جدید با مبلغ فعلی یکیه.";
  if (!reason.trim())
    return "دلیل اصلاح رو بنویس (مثلاً دانش‌آموزی وسط ماه رفته).";
  if (
    st.approvals.some(
      (a) => a.status === "pending" && a.payout?.payoutId === payoutId,
    )
  )
    return "برای این تسویه یک اصلاح منتظر تأییده.";
  addApproval({
    kind: "payout_correction",
    payout: { payoutId, mentorName, fromGross, toGross, reason: reason.trim() },
  });
  logEvent({
    category: "مالی",
    action: "اصلاح مبلغ تسویه (منتظر تأیید نفر دوم)",
    target: mentorName,
    severity: "warning",
    details: [
      { label: "از", value: `${fa(fromGross)} تومان` },
      { label: "به", value: `${fa(toGross)} تومان` },
      { label: "دلیل", value: reason.trim() },
    ],
    href: "/admin/finance",
  });
  return null;
}

/** 5. Gift days — finance asks, only مدیر کل approves. */
export function requestGift(
  userId: string,
  days: number,
  reason: string,
): string | null {
  const st = store.get();
  const sub = st.subs.find((s) => s.userId === userId);
  if (!sub) return "اشتراک پیدا نشد.";
  if (!reason.trim()) return "دلیل هدیه رو بنویس (مثلاً جبران قطعی سرویس).";
  if (
    st.approvals.some(
      (a) => a.status === "pending" && a.gift?.userId === userId,
    )
  )
    return "یک درخواست هدیه برای این دانش‌آموز منتظر تأییده.";
  addApproval({
    kind: "gift",
    gift: { userId, userName: sub.userName, days, reason: reason.trim() },
  });
  logEvent({
    category: "مالی",
    action: "درخواست هدیه‌ی تمدید (منتظر مدیر کل)",
    target: sub.userName,
    severity: "info",
    details: [
      { label: "مدت", value: `${toPersianDigits(days)} روز` },
      { label: "دلیل", value: reason.trim() },
    ],
    href: "/admin/payments",
  });
  return null;
}

export const PERM_FOR: Record<
  ApprovalKind,
  "billing.approve" | "billing.gift"
> = {
  manual_payment: "billing.approve",
  payout_correction: "billing.approve",
  gift: "billing.gift",
};

/** The second person decides. Enforced here: right permission, and not the one who asked. */
export function decideApproval(
  id: string,
  approve: boolean,
  rejectReason = "",
): string | null {
  const st = store.get();
  const a = st.approvals.find((x) => x.id === id);
  if (!a || a.status !== "pending") return "این مورد دیگه منتظر نیست.";
  const me = currentAdminName();
  if (a.createdBy === me)
    return "خودت ثبتش کردی — نفر دوم باید تأیید یا رد کنه.";
  if (!can(currentAdminRole(), PERM_FOR[a.kind]))
    return "نقش تو اجازه‌ی این تأیید رو نداره.";
  if (!approve && !rejectReason.trim()) return "دلیل رد رو بنویس.";

  const decided: Approval = {
    ...a,
    status: approve ? "approved" : "rejected",
    decidedBy: me,
    decidedAt: now(),
    rejectReason: rejectReason.trim() || undefined,
  };
  let next: State = {
    ...st,
    approvals: st.approvals.map((x) => (x.id === id ? decided : x)),
  };
  let target = "";
  let details: { label: string; value: string }[] = [];

  if (a.manual) {
    const m = a.manual;
    target = m.userName;
    details = [
      { label: "مبلغ", value: `${fa(m.amount)} تومان` },
      { label: "کد پیگیری", value: m.ref },
      { label: "ثبت‌کننده", value: a.createdBy },
    ];
    if (approve) {
      const sub = next.subs.find((s) => s.userId === m.userId)!;
      next = {
        ...next,
        subs: next.subs.map((s) =>
          s.userId === m.userId
            ? {
                ...s,
                installments: s.installments.map((i) =>
                  i.id === m.installmentId
                    ? { ...i, paid: true, paidIso: m.paidIso, ref: m.ref }
                    : i,
                ),
              }
            : s,
        ),
        manualTx: [
          {
            id: `mt-${Date.now()}`,
            studentName: m.userName,
            planName: `${sub.planName} ${sub.durationLabel}`,
            amount: m.amount,
            ref: m.ref,
            dateIso: m.paidIso,
            by: a.createdBy,
            approvedBy: me,
          },
          ...next.manualTx,
        ],
      };
      addNotice(
        m.userId,
        `پرداخت ${fa(m.amount)} تومانی‌ات (کد پیگیری ${m.ref}) ثبت شد و قسطت پرداخت‌شده حساب شد.`,
      );
    }
  }
  if (a.payout) {
    target = a.payout.mentorName;
    details = [
      { label: "از", value: `${fa(a.payout.fromGross)} تومان` },
      { label: "به", value: `${fa(a.payout.toGross)} تومان` },
      { label: "ثبت‌کننده", value: a.createdBy },
    ];
    if (approve)
      next = {
        ...next,
        payoutGross: {
          ...next.payoutGross,
          [a.payout.payoutId]: a.payout.toGross,
        },
      };
  }
  if (a.gift) {
    const g = a.gift;
    target = g.userName;
    details = [
      { label: "مدت", value: `${toPersianDigits(g.days)} روز` },
      { label: "درخواست‌کننده", value: a.createdBy },
    ];
    if (approve) {
      next = {
        ...next,
        subs: next.subs.map((s) =>
          s.userId === g.userId ? { ...s, giftDays: s.giftDays + g.days } : s,
        ),
      };
      addNotice(
        g.userId,
        `${toPersianDigits(g.days)} روز هدیه به اشتراکت اضافه شد — ${g.reason}`,
      );
    }
  }
  store.set(next);
  const label =
    a.kind === "manual_payment"
      ? "ثبت دستی پرداخت"
      : a.kind === "payout_correction"
        ? "اصلاح مبلغ تسویه"
        : "هدیه‌ی تمدید";
  logEvent({
    category: "مالی",
    action: `${approve ? "تأیید" : "رد"} ${label} (نفر دوم)`,
    target,
    severity: approve ? "info" : "warning",
    details: [
      ...details,
      ...(approve ? [] : [{ label: "دلیل رد", value: rejectReason.trim() }]),
    ],
    href: a.kind === "payout_correction" ? "/admin/finance" : "/admin/payments",
  });
  return null;
}

// ---------------------------------------------------------------- 6. official invoice

/** Iranian national code (کد ملی): 10 digits with a check digit. */
export function validNationalCode(raw: string): boolean {
  const c = toLatinDigits(raw).trim();
  if (!/^\d{10}$/.test(c) || /^(\d)\1{9}$/.test(c)) return false;
  const sum = [...c.slice(0, 9)].reduce(
    (s, d, i) => s + Number(d) * (10 - i),
    0,
  );
  const r = sum % 11;
  const check = Number(c[9]);
  return r < 2 ? check === r : check === 11 - r;
}

export function issueInvoice(
  txKey: string,
  studentName: string,
  description: string,
  amount: number,
  buyer: Buyer,
): string | { no: string } {
  const st = store.get();
  if (st.invoices.some((v) => v.txKey === txKey))
    return "برای این پرداخت قبلاً فاکتور صادر شده.";
  if (buyer.name.trim().length < 3)
    return "نام خریدار (مطابق مدرک) رو کامل بنویس.";
  const id = toLatinDigits(buyer.nationalId).trim();
  if (buyer.kind === "person" && !validNationalCode(id))
    return "کد ملی معتبر نیست — ۱۰ رقم و رقم آخرش رقم کنترله.";
  if (buyer.kind === "company" && !/^\d{11}$/.test(id))
    return "شناسه‌ی ملی شرکت باید ۱۱ رقم باشه.";
  if (
    buyer.economicCode &&
    !/^\d{12}$/.test(toLatinDigits(buyer.economicCode).trim())
  )
    return "کد اقتصادی باید ۱۲ رقم باشه.";
  const no = `X-1405-${String(st.invoices.length + 1).padStart(4, "0")}`;
  const inv: Invoice = {
    no,
    txKey,
    studentName,
    description,
    amount,
    buyer: { ...buyer, name: buyer.name.trim(), nationalId: id },
    issuedBy: currentAdminName(),
    issuedIso: DEMO_TODAY_ISO,
  };
  store.set({ ...st, invoices: [...st.invoices, inv] });
  logEvent({
    category: "مالی",
    action: "صدور فاکتور رسمی",
    target: `${studentName} — ${no}`,
    severity: "info",
    details: [
      { label: "مبلغ", value: `${fa(amount)} تومان` },
      {
        label: "خریدار",
        value: `${inv.buyer.name} (${buyer.kind === "person" ? "حقیقی" : "حقوقی"})`,
      },
    ],
    href: `/invoice/${no}`,
  });
  return { no };
}

export function useInvoice(no: string): Invoice | undefined {
  return store.useValue().invoices.find((v) => v.no === no);
}

export function usePendingApprovals(kinds: ApprovalKind[]): Approval[] {
  const { approvals } = store.useValue();
  return useMemo(
    () =>
      approvals.filter((a) => kinds.includes(a.kind) && a.status === "pending"),
    [approvals, kinds],
  );
}
