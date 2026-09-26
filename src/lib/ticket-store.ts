"use client";

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
  type TicketRole,
} from "./mock-data";
import { logEvent } from "./admin-log-store";
import { CURRENT_ADMIN, nowClock } from "./followup-store";

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
      author: CURRENT_ADMIN,
      text,
      time: now(),
    };
    if (internal) return { ...t, messages: [...t.messages, msg] };
    return {
      ...t,
      status: "answered",
      unreadForUser: true,
      messages: [...t.messages, msg],
      history:
        t.status === "answered"
          ? t.history
          : [
              ...t.history,
              { by: CURRENT_ADMIN, at: now(), change: `وضعیت: ${TICKET_STATUS[t.status].label} ← پاسخ داده شد` },
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
export function adminUpdate(id: string, patch: Partial<Editable>, by = CURRENT_ADMIN) {
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
