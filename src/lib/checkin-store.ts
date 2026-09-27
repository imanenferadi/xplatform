"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { checkInHistory, myCheckInSeed, nightlyCheckIns, type NightlyCheckIn } from "./mock-data";

// Check-ins the student submits in this browser (demo bridge until there's
// a backend). One per night: submitting again for the same day replaces it.
const EMPTY: NightlyCheckIn[] = [];
const store = createLocalStore<NightlyCheckIn[]>("x-checkins", EMPTY);

export function useMyCheckIns(): NightlyCheckIn[] {
  const submitted = store.useValue();
  return useMemo(() => {
    const replaced = new Set(submitted.map((c) => `${c.week}-${c.dayName}`));
    return [...myCheckInSeed.filter((c) => !replaced.has(`${c.week}-${c.dayName}`)), ...submitted];
  }, [submitted]);
}

export function saveCheckIn(checkIn: NightlyCheckIn) {
  store.set([...store.get().filter((c) => !(c.week === checkIn.week && c.dayName === checkIn.dayName)), checkIn]);
}

/** Reports of one student: live ones for ایمان ("me"), seeds for the rest. */
export function useStudentReports(studentId: string): NightlyCheckIn[] {
  const mine = useMyCheckIns();
  return useMemo(
    () =>
      studentId === "me" ? mine : [...nightlyCheckIns, ...checkInHistory].filter((c) => c.studentId === studentId),
    [mine, studentId]
  );
}
