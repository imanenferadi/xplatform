"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import {
  DEFAULT_AVAILABILITY,
  WEEK_DAYS,
  CURRENT_DAY_NAME,
  callRequestSeed,
  mentors,
  upcomingSessions,
  type CallRequest,
} from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { toLatinDigits } from "./utils";

// Parent → mentor call requests. The parent picks one of the mentor's free
// slots; the mentor confirms, proposes another, or declines with a note.
const store = createLocalStore<CallRequest[]>("x-calls", callRequestSeed);

export const useCallRequests = store.useValue;

const hour = (t: string) => Number(toLatinDigits(t).split(":")[0]);

/** سارا's free slots from today on that no session already took. */
export function useOpenSlots(): string[] {
  const calls = store.useValue();
  return useMemo(() => {
    const me = mentors[0];
    const availability = me.availability?.length ? me.availability : DEFAULT_AVAILABILITY;
    const today = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
    return availability.filter((slot) => {
      const [day, time] = slot.split(" ");
      if (WEEK_DAYS.indexOf(day) < today) return false;
      const session = upcomingSessions.some((s) => s.dayName === day && hour(s.time) === hour(time));
      const call = calls.some((c) => c.status === "confirmed" && c.slot === slot);
      return !session && !call;
    });
  }, [calls]);
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
