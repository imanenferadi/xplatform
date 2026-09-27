"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { WEEK_DAYS, CURRENT_DAY_NAME, callRequestSeed, type CallRequest } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { useAvailability, useWeekSessions } from "./session-store";

// Parent → mentor call requests. The parent picks one of the mentor's free
// slots; the mentor confirms, proposes another, or declines with a note.
const store = createLocalStore<CallRequest[]>("x-calls", callRequestSeed);

export const useCallRequests = store.useValue;

/** سارا's free slots from today on that no session or confirmed call took. */
export function useOpenSlots(): string[] {
  const calls = store.useValue();
  const availability = useAvailability();
  const sessions = useWeekSessions();
  return useMemo(() => {
    const today = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
    return availability.filter((slot) => {
      if (WEEK_DAYS.indexOf(slot.split(" ")[0]) < today) return false;
      const session = sessions.some((s) => s.slot === slot);
      const call = calls.some((c) => c.status === "confirmed" && c.slot === slot);
      return !session && !call;
    });
  }, [calls, availability, sessions]);
}

export function requestCall(r: Omit<CallRequest, "id" | "status" | "mentorNote" | "createdAt">) {
  store.set([
    { ...r, id: `cr-${Date.now()}`, status: "pending", mentorNote: "", createdAt: `امروز، ${nowClock()}` },
    ...store.get(),
  ]);
  logEvent({
    category: "کاربران",
    actor: r.parentName,
    actorRole: "والد",
    action: "درخواست تماس با مشاور",
    target: `سارا محمدی — ${r.studentName}`,
    severity: "info",
    details: [
      { label: "موضوع", value: r.topic },
      { label: "وقت پیشنهادی", value: r.slot },
    ],
  });
}

export function answerCall(id: string, status: "confirmed" | "declined", slot: string, mentorNote: string) {
  store.set(store.get().map((c) => (c.id === id ? { ...c, status, slot, mentorNote } : c)));
}
