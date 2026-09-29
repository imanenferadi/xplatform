"use client";

import { useMemo } from "react";
import {
  TICKET_PRIORITY,
  mentorApplications,
  mentorPayouts,
  mentorQuality,
  mentors,
  transactions,
} from "./mock-data";
import { slaState, useTickets } from "./ticket-store";
import { useStoredApplications } from "./mentor-applications-store";
import { useSubscription } from "./subscription-store";
import { useChurn } from "./churn-store";
import { useLogs } from "./admin-log-store";
import { computeQuality } from "./quality";
import { useMe } from "./staff-store";
import { useProposals } from "./reassign-proposals";
import { useShebaRequests } from "./payout-account-store";
import { bankOf, maskIban } from "./iban";
import { PERM_FOR, fa, useBilling } from "./billing-store";
import {
  PAGE_PERM,
  ROLE_META,
  can,
  seesLogCategory,
  seesTicketCategory,
  type StaffRole,
} from "./permissions";
import { toPersianDigits } from "./utils";

export type InboxPriority = "urgent" | "high" | "normal";
export type InboxItem = {
  key: string;
  priority: InboxPriority;
  kind: string; // short label: «تیکت», «بازپرداخت», …
  title: string;
  detail: string;
  href: string;
};

// Everything waiting on an admin, in one queue, from the same data each
// admin page reads. An item leaves the queue when its page resolves it.
export function useAdminInbox(): InboxItem[] {
  const tickets = useTickets();
  const stored = useStoredApplications();
  const sub = useSubscription();
  const { responses } = useChurn();
  const logs = useLogs();
  const me = useMe();
  const proposals = useProposals();
  const shebaRequests = useShebaRequests();
  const { approvals } = useBilling();

  return useMemo(() => {
    const items: InboxItem[] = [];

    for (const t of tickets) {
      // Referrals: waiting on my role, or came back to my role to answer the user.
      for (const r of t.referrals ?? []) {
        if (r.status === "open" && r.toRole === me.role)
          items.push({
            key: `rf-${r.id}`,
            priority: "high",
            kind: "ارجاع",
            title: `${t.id} — ارجاع از ${ROLE_META[r.fromRole as StaffRole].label}`,
            detail: `«${r.note}» · ${r.by}`,
            href: `/admin/tickets?t=${t.id}`,
          });
        if (
          (r.status === "done" || r.status === "returned") &&
          !r.closedLoop &&
          r.fromRole === me.role
        )
          items.push({
            key: `rb-${r.id}`,
            priority: "high",
            kind: "ارجاع",
            title: `${t.id} — ${ROLE_META[r.toRole as StaffRole].label} ${r.status === "done" ? "انجام داد؛ به کاربر جواب بده" : "برگردوند"}`,
            detail: `«${r.answer}» · ${r.answeredBy}`,
            href: `/admin/tickets?t=${t.id}`,
          });
      }
      if (t.status === "closed" || t.status === "answered") continue;
      if (!seesTicketCategory(me.role, t.category)) continue;
      const sla = slaState(t);
      if (sla.overdue || t.status === "new")
        items.push({
          key: `t-${t.id}`,
          priority: sla.overdue || t.priority === "urgent" ? "urgent" : "high",
          kind: "تیکت",
          title: `${t.id} — ${t.subject}`,
          detail: `${t.requester.name} (${t.requester.role}) · اولویت ${TICKET_PRIORITY[t.priority].label}${
            sla.overdue ? " · از SLA گذشته" : ""
          }`,
          href: `/admin/tickets?t=${t.id}`,
        });
    }

    for (const tx of transactions.filter(
      (x) => x.type === "refund_request" && x.status === "pending",
    ))
      items.push({
        key: `r-${tx.id}`,
        priority: "high",
        kind: "بازپرداخت",
        title: `درخواست بازپرداخت ${tx.studentName}`,
        detail: `${tx.planName} · ${toPersianDigits(tx.amount.toLocaleString("en-US"))} تومان · ${tx.date}`,
        href: "/admin/payments",
      });
    if (sub?.refund?.status === "pending")
      items.push({
        key: "r-guarantee",
        priority: "urgent",
        kind: "بازپرداخت",
        title: "ضمانت ۷ روزه — ایمان",
        detail: `${sub.planName} · ${toPersianDigits(sub.refund.amount.toLocaleString("en-US"))} تومان`,
        href: "/admin/payments",
      });

    const apps = [
      ...mentorApplications
        .filter((a) => a.status === "pending")
        .map((a) => ({ id: a.id, name: a.name, at: a.appliedAt })),
      ...stored
        .filter((a) => a.status === "pending")
        .map((a) => ({ id: a.id, name: a.mentor.name, at: a.appliedAt })),
    ];
    for (const a of apps)
      items.push({
        key: `a-${a.id}`,
        priority: "normal",
        kind: "مشاور جدید",
        title: `درخواست همکاری ${a.name}`,
        detail: `ثبت: ${a.at}`,
        href: "/admin/mentors",
      });

    if (can(me.role, "reassign.execute"))
      for (const p of proposals.filter((x) => x.status === "pending"))
        items.push({
          key: `rp-${p.id}`,
          priority: "high",
          kind: "تعویض مشاور",
          title: `پیشنهاد تعویض مشاور ${p.studentName}`,
          detail: `${p.fromMentor} ← ${p.toMentor} · ${p.reason} · از ${p.by}`,
          href: "/admin/reassign",
        });

    if (can(me.role, "sheba.decide"))
      for (const r of shebaRequests.filter((x) => x.status === "pending"))
        items.push({
          key: `sh-${r.id}`,
          priority: "high",
          kind: "تغییر شبا",
          title: `${r.mentorName} شبای جدید درخواست داده`,
          detail: `${maskIban(r.newSheba)} · بانک ${bankOf(r.newSheba)} · ${r.requestedAt}`,
          href: "/admin/finance",
        });

    // Second-person approvals: never to the one who recorded it.
    for (const a of approvals)
      if (
        a.status === "pending" &&
        a.createdBy !== me.name &&
        can(me.role, PERM_FOR[a.kind])
      )
        items.push({
          key: `ap-${a.id}`,
          priority: "high",
          kind: "تأیید نفر دوم",
          title: a.manual
            ? `ثبت دستی پرداخت ${a.manual.userName}`
            : a.payout
              ? `اصلاح تسویه‌ی ${a.payout.mentorName}`
              : `هدیه‌ی تمدید برای ${a.gift!.userName}`,
          detail: `${a.manual ? `${fa(a.manual.amount)} تومان` : a.payout ? `${fa(a.payout.fromGross)} ← ${fa(a.payout.toGross)} تومان` : `${toPersianDigits(a.gift!.days)} روز`} · ثبت: ${a.createdBy}`,
          href: a.payout ? "/admin/finance" : "/admin/payments",
        });

    const pendingPayouts = mentorPayouts.filter((p) => p.status === "pending");
    if (pendingPayouts.length)
      items.push({
        key: "payouts",
        priority: "normal",
        kind: "تسویه",
        title: `${toPersianDigits(pendingPayouts.length)} تسویه‌ی ${pendingPayouts[0].period} در انتظار واریز`,
        detail: pendingPayouts.map((p) => p.mentorName).join("، "),
        href: "/admin/finance",
      });

    for (const q of mentorQuality) {
      const m = mentors.find((x) => x.id === q.mentorId);
      if (!m) continue;
      const row = computeQuality(m, q, responses);
      if (row.flags.length)
        items.push({
          key: `q-${m.id}`,
          priority: "normal",
          kind: "کیفیت",
          title: `${m.name} زیر آستانه‌ی کیفیت`,
          detail: `${row.flags.join("، ")} · امتیاز ${toPersianDigits(row.score)}`,
          href: "/admin/quality",
        });
    }

    for (const l of logs.filter(
      (x) =>
        x.followUp.status === "in_progress" &&
        x.followUp.assignee === me.name &&
        seesLogCategory(me.role, x.category),
    ))
      items.push({
        key: `f-${l.id}`,
        priority: "normal",
        kind: "پیگیری",
        title: `${l.action} — ${l.target}`,
        detail: l.followUp.note || "پیگیری باز به اسم تو",
        href: `/admin/logs?q=${encodeURIComponent(l.target)}`,
      });

    const rank: Record<InboxPriority, number> = {
      urgent: 0,
      high: 1,
      normal: 2,
    };
    // Only what this role can act on or open.
    return items
      .filter((i) => {
        const perm = PAGE_PERM[i.href.split("?")[0]];
        return perm !== undefined && can(me.role, perm);
      })
      .sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, [
    tickets,
    stored,
    sub,
    responses,
    logs,
    me,
    proposals,
    shebaRequests,
    approvals,
  ]);
}

/** Waiting items per admin page, for the sidebar counters. */
export function useInboxCounts(): Record<string, number> {
  const items = useAdminInbox();
  return useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) {
      const page = i.href.split("?")[0];
      c[page] = (c[page] ?? 0) + 1;
    }
    return c;
  }, [items]);
}
