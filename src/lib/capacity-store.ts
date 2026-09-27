"use client";

import { useCallback, useMemo } from "react";
import { createLocalStore } from "./local-store";
import type { Mentor } from "./mock-data";

// Mentor-set capacity + a per-mentor waitlist (demo bridge in localStorage).
// A mentor who's full — or who paused new students — gets a waitlist
// instead of a booking button.

export type CapacitySetting = { capacityTotal: number; accepting: boolean };
export type WaitlistEntry = { mentorId: string; studentId: string; name: string; joinedAt: string };

type State = { settings: Record<string, CapacitySetting>; waitlist: WaitlistEntry[] };

const SEED: State = {
  settings: {},
  waitlist: [
    { mentorId: "reza-karimi", studentId: "w-1", name: "پارسا کریمی", joinedAt: "۵ روز پیش" },
    { mentorId: "reza-karimi", studentId: "w-2", name: "هانیه مرادی", joinedAt: "۲ روز پیش" },
    { mentorId: "sara-mohammadi", studentId: "w-3", name: "کیانا رستمی", joinedAt: "دیروز" },
  ],
};

const store = createLocalStore<State>("x-capacity", SEED);

export const ME = { studentId: "me", name: "ایمان" };

/** Students the mentor already has, from the seed numbers. */
export function activeStudents(m: Mentor) {
  return m.capacityTotal - m.capacity;
}

export function useMentorCapacity(m: Mentor) {
  const state = store.useValue();
  return useMemo(() => {
    const setting = state.settings[m.id] ?? { capacityTotal: m.capacityTotal, accepting: true };
    const remaining = setting.accepting ? Math.max(0, setting.capacityTotal - activeStudents(m)) : 0;
    const waitlist = state.waitlist.filter((w) => w.mentorId === m.id);
    const myIndex = waitlist.findIndex((w) => w.studentId === ME.studentId);
    return {
      ...setting,
      active: activeStudents(m),
      remaining,
      full: remaining === 0,
      waitlist,
      myPosition: myIndex === -1 ? null : myIndex + 1,
    };
  }, [state, m]);
}

/** Remaining seats for a list of mentors, honoring mentor-set overrides. */
export function useCapacityOverrides() {
  const { settings } = store.useValue();
  return useCallback(
    (m: Mentor) => {
      const s = settings[m.id];
      if (!s) return m.capacity;
      return s.accepting ? Math.max(0, s.capacityTotal - activeStudents(m)) : 0;
    },
    [settings],
  );
}

/** Whether the mentor has set their capacity themselves (onboarding step). */
export function useCapacitySet(mentorId: string): boolean {
  return store.useValue().settings[mentorId] !== undefined;
}

export function setCapacity(mentorId: string, setting: CapacitySetting) {
  const s = store.get();
  store.set({ ...s, settings: { ...s.settings, [mentorId]: setting } });
}

export function joinWaitlist(mentorId: string) {
  const s = store.get();
  if (s.waitlist.some((w) => w.mentorId === mentorId && w.studentId === ME.studentId)) return;
  store.set({ ...s, waitlist: [...s.waitlist, { mentorId, ...ME, joinedAt: "امروز" }] });
}

export function leaveWaitlist(mentorId: string, studentId: string) {
  const s = store.get();
  store.set({ ...s, waitlist: s.waitlist.filter((w) => !(w.mentorId === mentorId && w.studentId === studentId)) });
}
