"use client";

import { createLocalStore } from "./local-store";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { currentAdminName } from "./staff-store";

// Educational support can only *propose* a mentor change; operations
// reviews it and executes (or declines with a note). Separation of duties.
export type ReassignProposal = {
  id: string;
  userId: string;
  studentName: string;
  fromMentor: string;
  toMentorId: string;
  toMentor: string;
  reason: string;
  handover: string;
  by: string;
  at: string;
  status: "pending" | "executed" | "rejected";
  decidedBy?: string;
  rejectNote?: string;
};

const store = createLocalStore<ReassignProposal[]>("x-reassign-proposals", []);
export const useProposals = store.useValue;

export function propose(p: Omit<ReassignProposal, "id" | "by" | "at" | "status">) {
  const entry: ReassignProposal = {
    ...p,
    id: `rp-${Date.now()}`,
    by: currentAdminName(),
    at: `امروز، ${nowClock()}`,
    status: "pending",
  };
  store.set([entry, ...store.get()]);
  logEvent({
    category: "مشاوران",
    action: "پیشنهاد تعویض مشاور",
    target: p.studentName,
    severity: "info",
    details: [
      { label: "از", value: p.fromMentor },
      { label: "به", value: p.toMentor },
      { label: "دلیل", value: p.reason },
    ],
    href: "/admin/reassign",
  });
}

export function decideProposal(id: string, status: "executed" | "rejected", rejectNote = "") {
  const p = store.get().find((x) => x.id === id);
  store.set(store.get().map((x) => (x.id === id ? { ...x, status, decidedBy: currentAdminName(), rejectNote } : x)));
  if (p && status === "rejected")
    logEvent({
      category: "مشاوران",
      action: "رد پیشنهاد تعویض مشاور",
      target: p.studentName,
      severity: "info",
      details: [
        { label: "پیشنهاد از", value: p.by },
        { label: "دلیل رد", value: rejectNote },
      ],
      href: "/admin/reassign",
    });
}
