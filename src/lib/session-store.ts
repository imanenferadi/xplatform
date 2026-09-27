"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import {
  CURRENT_DAY_NAME,
  SARA_AVAILABILITY,
  WEEK_DAYS,
  fixedSessionSeed,
  mentorStudents,
  type FixedSession,
  type SessionMode,
} from "./mock-data";
import { logEvent } from "./admin-log-store";
import { toLatinDigits } from "./utils";

// سارا's free hours and each student's fixed weekly session. Both calendars,
// the dashboards and parent-call slots read from here.
const availability = createLocalStore<string[]>("x-availability", SARA_AVAILABILITY);
const sessions = createLocalStore<FixedSession[]>("x-fixed-sessions", fixedSessionSeed);

export const useAvailability = availability.useValue;
export const useFixedSessions = sessions.useValue;

const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
export const slotDay = (slot: string) => slot.split(" ")[0];
export const slotTime = (slot: string) => slot.split(" ")[1];
export const slotHour = (slot: string) => Number(toLatinDigits(slotTime(slot)).split(":")[0]);
const byWeekOrder = (a: string, b: string) =>
  WEEK_DAYS.indexOf(slotDay(a)) - WEEK_DAYS.indexOf(slotDay(b)) || slotHour(a) - slotHour(b);

/** This week's session already happened (earlier day than today). */
export const heldThisWeek = (slot: string) => WEEK_DAYS.indexOf(slotDay(slot)) < todayIndex;

export function dayLabel(day: string) {
  const i = WEEK_DAYS.indexOf(day);
  if (i === todayIndex) return "امروز";
  if (i === todayIndex + 1) return "فردا";
  return day;
}

export type WeekSession = FixedSession & { day: string; time: string; done: boolean };

/** Everyone's session this week, in week order. */
export function useWeekSessions(): WeekSession[] {
  const list = sessions.useValue();
  return useMemo(
    () =>
      list
        .map((s) => ({ ...s, day: slotDay(s.slot), time: slotTime(s.slot), done: heldThisWeek(s.slot) }))
        .sort((a, b) => byWeekOrder(a.slot, b.slot)),
    [list]
  );
}

export function useFixedSession(studentId: string): FixedSession | undefined {
  return sessions.useValue().find((s) => s.studentId === studentId);
}

/** «شنبه، ساعت ۱۸:۰۰» or «شنبه‌ی هفته‌ی بعد، …» once this week's is over. */
export function nextSessionLabel(s: FixedSession): string {
  if (!heldThisWeek(s.slot)) return `${dayLabel(slotDay(s.slot))}، ساعت ${slotTime(s.slot)}`;
  const slot = s.nextSlot ?? s.slot;
  return `${slotDay(slot)}‌ی هفته‌ی بعد، ساعت ${slotTime(slot)}`;
}

/** Free hours this student could move their session to (others' sessions excluded). */
export function useSlotsFor(studentId: string): string[] {
  const free = availability.useValue();
  const list = sessions.useValue();
  return useMemo(() => {
    const taken = new Set(
      list.filter((s) => s.studentId !== studentId).flatMap((s) => [s.slot, ...(s.nextSlot ? [s.nextSlot] : [])])
    );
    const mine = list.find((s) => s.studentId === studentId);
    return free.filter((slot) => !taken.has(slot) && slot !== (mine?.nextSlot ?? mine?.slot)).sort(byWeekOrder);
  }, [free, list, studentId]);
}

/**
 * Moves a student's fixed session. If this week's session already happened
 * the new hour starts next week; otherwise it applies right away.
 */
export function changeSession(studentId: string, slot: string, mode: SessionMode, by: "student" | "mentor") {
  const list = sessions.get();
  const cur = list.find((s) => s.studentId === studentId);
  const nextWeek = cur ? heldThisWeek(cur.slot) : false;
  const updated: FixedSession = nextWeek
    ? { studentId, slot: cur!.slot, mode, ...(slot !== cur!.slot ? { nextSlot: slot } : {}) }
    : { studentId, slot, mode };
  sessions.set(cur ? list.map((s) => (s.studentId === studentId ? updated : s)) : [...list, updated]);
  const name = mentorStudents.find((s) => s.id === studentId)?.name ?? studentId;
  logEvent({
    category: "کاربران",
    actor: by === "student" ? name : "سارا محمدی",
    actorRole: by === "student" ? "دانش‌آموز" : "مشاور",
    action: "تغییر وقت جلسه‌ی ثابت",
    target: `${name} — سارا محمدی`,
    severity: "info",
    details: [
      { label: "قبلی", value: cur ? (cur.nextSlot ?? cur.slot) : "—" },
      { label: "جدید", value: `${slot} (${mode === "video" ? "تصویری" : "صوتی"})` },
      { label: "از", value: nextWeek ? "هفته‌ی بعد" : "همین هفته" },
    ],
  });
  return nextWeek ? "next" : "this";
}

/** Toggle a free hour; refuses to remove one a student's session sits on. */
export function toggleAvailability(slot: string): string | null {
  const cur = availability.get();
  if (cur.includes(slot)) {
    const user = sessions.get().find((s) => s.slot === slot || s.nextSlot === slot);
    if (user) {
      const name = mentorStudents.find((s) => s.id === user.studentId)?.name ?? "";
      return `${slot} جلسه‌ی ثابت ${name} است — اول وقت جلسه‌اش رو عوض کن.`;
    }
    availability.set(cur.filter((s) => s !== slot));
  } else {
    availability.set([...cur, slot]);
  }
  return null;
}
