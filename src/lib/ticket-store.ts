"use client";

import { currentAdminName } from "./staff-store";
import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import {
  CATEGORY_PRIORITY,
  TICKET_PRIORITY,
  TICKET_STATUS,
  seedTickets,
  type Ticket,
  type TicketCategory,
  type TicketMessage,
  type TicketReferral,
  type TicketRole,
} from "./mock-data";
import { logEvent } from "./admin-log-store";
import { ROLE_META, type StaffRole } from "./permissions";
import { nowClock } from "./followup-store";

// Support tickets, shared by the requester pages (/support, /mentor/support,
// /parent/support) and /admin/tickets. localStorage bridge until there's a
// backend, so a ticket filed as a student shows up in the admin queue.

const store = createLocalStore<Ticket[]>("x-tickets", seedTickets);

export const useTickets = store.useValue;

export function useMyTickets(requesterName: string) {
  const all = store.useValue();
  return useMemo(() => all.filter((t) => t.requester.name === requesterName), [all, requesterName]);
}

const now = () => `امروز، ${nowClock()}`;

function update(id: string, fn: (t: Ticket) => Ticket) {
  store.set(store.get().map((t) => (t.id === id ? fn(t) : t)));
}

/** First reply is overdue when support hasn't answered within the priority's SLA. */
export function slaState(t: Ticket): { overdue: boolean; hoursLeft: number } {
  const answered = t.messages.some((m) => m.from === "support");
  const sla = TICKET_PRIORITY[t.priority].slaHours;
  if (answered || t.status === "closed") return { overdue: false, hoursLeft: sla };
  return { overdue: t.createdHoursAgo > sla, hoursLeft: sla - t.createdHoursAgo };
}

export function createTicket(input: {
  subject: string;
  category: TicketCategory;
  text: string;
  attachment?: string;
  requester: { name: string; role: TicketRole; userId?: string };
}): string {
  const all = store.get();
  const maxNo = Math.max(...all.map((t) => Number(t.id.slice(2))), 1045);
  const id = `T-${maxNo + 1}`;
  const time = now();
  const ticket: Ticket = {
    id,
    subject: input.subject,
    category: input.category,
    priority: CATEGORY_PRIORITY[input.category],
    status: "new",
    requester: input.requester,
    createdAt: time,
    createdHoursAgo: 0,
    assignee: "",
    messages: [
      { id: "m1", from: "user", author: input.requester.name, text: input.text, time, attachment: input.attachment },
    ],
    unreadForUser: false,
    history: [],
  };
  store.set([ticket, ...all]);
  logEvent({
    category: "پشتیبانی",
    actor: input.requester.name,
    actorRole: input.requester.role,
    action: "ثبت تیکت جدید",
    target: `${id} — ${input.subject}`,
    severity: ticket.priority === "high" || ticket.priority === "urgent" ? "warning" : "info",
    details: [
      { label: "دسته", value: input.category },
      { label: "اولویت", value: TICKET_PRIORITY[ticket.priority].label },
    ],
    href: "/admin/tickets",
  });
  return id;
}

/** Requester writes back: the ticket goes back to support's queue. */
export function userReply(id: string, author: string, text: string) {
  update(id, (t) => ({
    ...t,
    status: "in_progress",
    messages: [...t.messages, { id: `m${t.messages.length + 1}`, from: "user", author, text, time: now() }],
    history:
      t.status === "in_progress"
        ? t.history
        : [...t.history, { by: author, at: now(), change: `وضعیت: ${TICKET_STATUS[t.status].label} ← در حال بررسی` }],
  }));
}

/** Support reply (visible to the requester) or internal note (never shown to them). */
export function supportMessage(id: string, text: string, internal: boolean) {
  update(id, (t) => {
    const msg: TicketMessage = {
      id: `m${t.messages.length + 1}`,
      from: internal ? "internal" : "support",
      author: currentAdminName(),
      text,
      time: now(),
    };
    if (internal) return { ...t, messages: [...t.messages, msg] };
    return {
      ...t,
      referrals: closeLoops(t.referrals),
      status: "answered",
      unreadForUser: true,
      messages: [...t.messages, msg],
      history:
        t.status === "answered"
          ? t.history
          : [
              ...t.history,
              { by: currentAdminName(), at: now(), change: `وضعیت: ${TICKET_STATUS[t.status].label} ← پاسخ داده شد` },
            ],
    };
  });
  if (!internal) {
    const t = store.get().find((x) => x.id === id);
    if (t)
      logEvent({
        category: "پشتیبانی",
        action: "پاسخ به تیکت",
        target: `${t.id} — ${t.requester.name}`,
        severity: "info",
        details: [{ label: "موضوع", value: t.subject }],
        href: "/admin/tickets",
      });
  }
}

type Editable = Pick<Ticket, "status" | "priority" | "category" | "assignee">;

/** Admin changes to status / priority / category / assignee, each recorded. */
export function adminUpdate(id: string, patch: Partial<Editable>, by = currentAdminName()) {
  const t = store.get().find((x) => x.id === id);
  if (!t) return;
  const changes: string[] = [];
  if (patch.status && patch.status !== t.status)
    changes.push(`وضعیت: ${TICKET_STATUS[t.status].label} ← ${TICKET_STATUS[patch.status].label}`);
  if (patch.priority && patch.priority !== t.priority)
    changes.push(`اولویت: ${TICKET_PRIORITY[t.priority].label} ← ${TICKET_PRIORITY[patch.priority].label}`);
  if (patch.category && patch.category !== t.category) changes.push(`دسته: ${t.category} ← ${patch.category}`);
  if (patch.assignee !== undefined && patch.assignee !== t.assignee)
    changes.push(`مسئول: ${t.assignee || "—"} ← ${patch.assignee || "—"}`);
  if (changes.length === 0) return;
  update(id, (x) => ({
    ...x,
    ...patch,
    ...(patch.status === "closed" ? { referrals: closeLoops(x.referrals) } : {}),
    history: [...x.history, ...changes.map((change) => ({ by, at: now(), change }))],
  }));
  if (patch.status === "closed" || (patch.priority && patch.priority !== t.priority)) {
    logEvent({
      category: "پشتیبانی",
      actor: by,
      actorRole: by === t.requester.name ? t.requester.role : "ادمین",
      action: patch.status === "closed" ? "بستن تیکت" : "تغییر اولویت تیکت",
      target: `${t.id} — ${t.requester.name}`,
      severity: patch.priority === "urgent" ? "warning" : "info",
      details: changes.map((c) => ({ label: "تغییر", value: c })),
      href: "/admin/tickets",
    });
  }
}

export function markReadByUser(id: string) {
  const t = store.get().find((x) => x.id === id);
  if (t?.unreadForUser) update(id, (x) => ({ ...x, unreadForUser: false }));
}

export function rateTicket(id: string, rating: number) {
  update(id, (t) => ({ ...t, rating }));
}

/** Tickets where support replied and the requester hasn't looked yet. */
export function useUnreadTicketCount(requesterName: string) {
  return useMyTickets(requesterName).filter((t) => t.unreadForUser).length;
}

// ---------------------------------------------------------------- referrals

const closeLoops = (list: TicketReferral[] | undefined) =>
  list?.map((r) => (r.status === "done" || r.status === "returned" ? { ...r, closedLoop: true } : r));

function referralLog(action: string, t: Ticket, r: TicketReferral, text: string) {
  logEvent({
    category: "پشتیبانی",
    action,
    target: `${t.id} — ${t.requester.name}`,
    severity: "info",
    details: [
      { label: "از", value: ROLE_META[r.fromRole as StaffRole].label },
      { label: "به", value: ROLE_META[r.toRole as StaffRole].label },
      { label: "یادداشت", value: text },
    ],
    href: `/admin/tickets?t=${t.id}`,
  });
}

function internalNote(t: Ticket, text: string): TicketMessage {
  return { id: `m${t.messages.length + 1}`, from: "internal", author: currentAdminName(), text, time: now() };
}

/** Hand the ticket to another role. Returns an error message, or null. */
export function referTicket(id: string, fromRole: StaffRole, toRole: StaffRole, note: string): string | null {
  const t = store.get().find((x) => x.id === id);
  if (!t) return "تیکت پیدا نشد.";
  if (toRole === fromRole) return "به نقش خودت نمی‌شه ارجاع داد.";
  if (note.trim().length < 10) return "بنویس نقش مقصد دقیقاً چیکار کنه (حداقل ۱۰ حرف).";
  if (t.referrals?.some((r) => r.toRole === toRole && r.status === "open"))
    return `یک ارجاع باز به ${ROLE_META[toRole].label} همین الان هست.`;
  const r: TicketReferral = {
    id: `rf-${Date.now()}`,
    toRole,
    fromRole,
    by: currentAdminName(),
    note: note.trim(),
    at: now(),
    status: "open",
  };
  update(id, (x) => ({
    ...x,
    status: x.status === "new" ? "in_progress" : x.status,
    referrals: [...(x.referrals ?? []), r],
    messages: [...x.messages, internalNote(x, `↪ ارجاع به ${ROLE_META[toRole].label}: ${r.note}`)],
    history: [...x.history, { by: r.by, at: r.at, change: `ارجاع به ${ROLE_META[toRole].label}` }],
  }));
  referralLog("ارجاع تیکت", t, r, r.note);
  return null;
}

/** The receiving role: done (with what was done) or sent back (with why). */
export function answerReferral(
  id: string,
  referralId: string,
  outcome: "done" | "returned",
  answer: string
): string | null {
  const t = store.get().find((x) => x.id === id);
  const r = t?.referrals?.find((x) => x.id === referralId);
  if (!t || !r || r.status !== "open") return "این ارجاع دیگه باز نیست.";
  if (answer.trim().length < 5) return outcome === "done" ? "بنویس چی انجام دادی." : "بنویس چرا برمی‌گردونی.";
  const role = ROLE_META[r.toRole as StaffRole].label;
  const next: TicketReferral = {
    ...r,
    status: outcome,
    answer: answer.trim(),
    answeredBy: currentAdminName(),
    answeredAt: now(),
  };
  update(id, (x) => ({
    ...x,
    referrals: x.referrals?.map((y) => (y.id === referralId ? next : y)),
    messages: [
      ...x.messages,
      internalNote(
        x,
        `${outcome === "done" ? "✓" : "↩"} ${role} ${outcome === "done" ? "انجام داد" : "برگردوند"}: ${answer.trim()}`
      ),
    ],
    history: [
      ...x.history,
      { by: currentAdminName(), at: now(), change: `ارجاع ${role}: ${outcome === "done" ? "انجام شد" : "برگشت خورد"}` },
    ],
  }));
  referralLog(outcome === "done" ? "انجام ارجاع" : "برگشت ارجاع", t, r, answer.trim());
  return null;
}

/** The referring side withdraws a referral made by mistake (only while open). */
export function cancelReferral(id: string, referralId: string) {
  const t = store.get().find((x) => x.id === id);
  const r = t?.referrals?.find((x) => x.id === referralId);
  if (!t || !r || r.status !== "open") return;
  const role = ROLE_META[r.toRole as StaffRole].label;
  update(id, (x) => ({
    ...x,
    referrals: x.referrals?.map((y) => (y.id === referralId ? { ...y, status: "cancelled" as const } : y)),
    messages: [...x.messages, internalNote(x, `✕ ارجاع به ${role} لغو شد`)],
    history: [...x.history, { by: currentAdminName(), at: now(), change: `لغو ارجاع به ${role}` }],
  }));
  referralLog("لغو ارجاع", t, r, "لغو توسط ارجاع‌دهنده");
}
