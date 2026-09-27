"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { mentors } from "./mock-data";

// The educational supervisor's only action: a note to the mentor about one
// student. The mentor sees it in «کارهای امروز» and on the case file.
export type SupervisorNote = {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  by: string;
  text: string;
  at: string;
  seen: boolean;
};

const store = createLocalStore<SupervisorNote[]>("x-supervisor-notes", []);
export const useSupervisorNotes = store.useValue;

export function useNotesFor(studentId: string): SupervisorNote[] {
  const all = store.useValue();
  return useMemo(() => all.filter((n) => n.studentId === studentId), [all, studentId]);
}

export function addSupervisorNote(n: Omit<SupervisorNote, "id" | "at" | "seen">) {
  store.set([{ ...n, id: `sn-${Date.now()}`, at: `امروز، ${nowClock()}`, seen: false }, ...store.get()]);
  logEvent({
    category: "مشاوران",
    actor: n.by,
    actorRole: "ادمین",
    action: "یادداشت سرپرست آموزشی برای مشاور",
    target: `${n.studentName} — ${mentors.find((m) => m.id === n.mentorId)?.name ?? n.mentorId}`,
    severity: "info",
    details: [{ label: "متن", value: n.text }],
  });
}

export function markNoteSeen(id: string) {
  store.set(store.get().map((n) => (n.id === id ? { ...n, seen: true } : n)));
}
