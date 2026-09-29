import type { LogCategory, TicketCategory } from "./mock-data";

// Every access decision for staff lives here — deny by default: a role can
// do only what's listed for it. Pages, menus, buttons and the admin inbox
// all ask `can()`; with a backend, the same table guards the API.
export type StaffRole = "super" | "ops" | "finance" | "edu_support" | "tech_support" | "auditor" | "supervisor";

export type Perm =
  | "inbox.view"
  | "finance.view"
  | "payout.mark"
  | "payments.view"
  | "refund.decide"
  | "discounts.view"
  | "discounts.manage"
  | "mentors.view"
  | "mentors.approve"
  | "quality.view"
  | "quality.warn"
  | "users.view"
  | "users.suspend"
  | "reassign.view"
  | "reassign.execute"
  | "reassign.propose"
  | "tickets.view"
  | "tickets.act"
  | "churn.view"
  | "logs.view"
  | "logs.followup"
  | "staff.view"
  | "staff.manage"
  | "viewas.request"
  | "sheba.decide"
  | "users.edit"
  | "users.editPhone"
  | "users.editAcademic"
  | "billing.manage"
  | "billing.approve"
  | "billing.gift";

export const ROLE_META: Record<StaffRole, { label: string; short: string; desc: string }> = {
  super: { label: "مدیر کل", short: "مدیر کل", desc: "نقش‌ها و تنظیمات؛ همه‌ی بخش‌ها" },
  ops: { label: "مدیر عملیات", short: "عملیات", desc: "مشاورها، کاربران، تعویض مشاور، تیکت‌ها" },
  finance: { label: "مالی", short: "مالی", desc: "پرداخت، بازپرداخت، تسویه، کد تخفیف" },
  edu_support: { label: "پشتیبان آموزشی", short: "پشتیبان آموزشی", desc: "تیکت‌های مشاور و برنامه؛ پیشنهاد تعویض" },
  tech_support: { label: "پشتیبان فنی", short: "پشتیبان فنی", desc: "تیکت‌های فنی و حساب؛ مشاهده با رضایت کاربر" },
  auditor: { label: "حسابرس", short: "حسابرس", desc: "همه‌چیز فقط‌خواندنی" },
  supervisor: { label: "سرپرست آموزشی", short: "سرپرست", desc: "پرونده‌ی فقط‌خواندنی دانش‌آموزهای مشاورهای زیر نظر" },
};

const VIEW_ALL: Perm[] = [
  "inbox.view",
  "finance.view",
  "payments.view",
  "discounts.view",
  "mentors.view",
  "quality.view",
  "users.view",
  "reassign.view",
  "tickets.view",
  "churn.view",
  "logs.view",
  "staff.view",
];

const POLICY: Record<StaffRole, Perm[]> = {
  super: [
    ...VIEW_ALL,
    "payout.mark",
    "refund.decide",
    "sheba.decide",
    "discounts.manage",
    "mentors.approve",
    "quality.warn",
    "users.suspend",
    "users.edit",
    "users.editPhone",
    "users.editAcademic",
    "billing.manage",
    "billing.approve",
    "billing.gift",
    "reassign.execute",
    "tickets.act",
    "logs.followup",
    "staff.manage",
  ],
  ops: [
    "inbox.view",
    "mentors.view",
    "mentors.approve",
    "quality.view",
    "quality.warn",
    "users.view",
    "users.suspend",
    "users.edit",
    "users.editAcademic",
    "reassign.view",
    "reassign.execute",
    "tickets.view",
    "tickets.act",
    "churn.view",
    "logs.view",
    "logs.followup",
  ],
  finance: [
    "inbox.view",
    "finance.view",
    "payout.mark",
    "sheba.decide",
    "billing.manage",
    "billing.approve",
    "payments.view",
    "refund.decide",
    "discounts.view",
    "discounts.manage",
    "tickets.view",
    "tickets.act",
    "churn.view",
    "logs.view",
    "logs.followup",
  ],
  edu_support: ["inbox.view", "reassign.view", "reassign.propose", "tickets.view", "tickets.act"],
  tech_support: [
    "inbox.view",
    "users.view",
    "users.edit",
    "users.editPhone",
    "tickets.view",
    "tickets.act",
    "logs.view",
    "logs.followup",
    "viewas.request",
  ],
  auditor: VIEW_ALL,
  supervisor: [],
};

/** Ticket categories each role works (and sees). */
const TICKET_SCOPE: Record<StaffRole, TicketCategory[] | "all"> = {
  super: "all",
  ops: "all",
  finance: ["پرداخت و اشتراک"],
  edu_support: ["مشاور", "برنامه و محتوا", "سایر"],
  tech_support: ["فنی", "حساب کاربری"],
  auditor: "all",
  supervisor: [],
};

/** Log categories each role may read. */
const LOG_SCOPE: Record<StaffRole, LogCategory[] | "all"> = {
  super: "all",
  ops: ["مشاوران", "کاربران", "شکایات", "پشتیبانی"],
  finance: ["مالی"],
  edu_support: [],
  tech_support: ["امنیت", "پشتیبانی"],
  auditor: "all",
  supervisor: [],
};

export function can(role: StaffRole, perm: Perm): boolean {
  return POLICY[role].includes(perm);
}

/** A role sees a ticket in its categories, or one that was ever referred to it. */
export function seesTicket(
  role: StaffRole,
  t: { category: TicketCategory; referrals?: { toRole: string }[] }
): boolean {
  return seesTicketCategory(role, t.category) || Boolean(t.referrals?.some((r) => r.toRole === role));
}

export function seesTicketCategory(role: StaffRole, c: TicketCategory): boolean {
  const s = TICKET_SCOPE[role];
  return s === "all" || s.includes(c);
}

export function seesLogCategory(role: StaffRole, c: LogCategory): boolean {
  const s = LOG_SCOPE[role];
  return s === "all" || s.includes(c);
}

/** Roles a ticket can be handed to (those who work tickets, plus مدیر کل for escalations). */
export const REFERRAL_TARGETS: StaffRole[] = ["ops", "finance", "edu_support", "tech_support", "super"];

/** Where each role lands after signing in — straight to its own work. */
export const ROLE_HOME: Record<StaffRole, string> = {
  super: "/admin",
  ops: "/admin",
  finance: "/admin",
  edu_support: "/admin/tickets",
  tech_support: "/admin/tickets",
  auditor: "/admin/logs",
  supervisor: "/supervisor",
};

/** Which permission each admin page needs to be opened at all. */
export const PAGE_PERM: Record<string, Perm> = {
  "/admin": "inbox.view",
  "/admin/finance": "finance.view",
  "/admin/payments": "payments.view",
  "/admin/discounts": "discounts.view",
  "/admin/mentors": "mentors.view",
  "/admin/quality": "quality.view",
  "/admin/users": "users.view",
  "/admin/reassign": "reassign.view",
  "/admin/tickets": "tickets.view",
  "/admin/churn": "churn.view",
  "/admin/logs": "logs.view",
  "/admin/staff": "staff.view",
};

/** The roles that may do something — for «فقط …» hints on disabled buttons. */
export function rolesWith(perm: Perm): string {
  const names = (Object.keys(POLICY) as StaffRole[])
    .filter((r) => POLICY[r].includes(perm))
    .map((r) => ROLE_META[r].short);
  return names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join("، ")} و ${names.at(-1)}`;
}
