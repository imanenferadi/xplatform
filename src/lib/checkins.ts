import type { NightlyCheckIn } from "./mock-data";
import { toPersianDigits } from "./utils";

export type SubjectTotal = { subject: string; minutes: number; tests: number; days: number };

export type SleepSummary = {
  nights: number; // check-ins that included sleep times
  avgMinutes: number;
  avgWake: number; // minutes after midnight
  shortNights: number; // under SHORT_SLEEP_MINUTES
  byDay: Map<string, number>; // dayName → minutes slept the night before
};

export type WeekSummary = {
  subjects: SubjectTotal[]; // sorted by minutes, most first
  totalMinutes: number;
  totalTests: number;
  checkedInDays: Set<string>;
  sleep: SleepSummary;
};

export const SHORT_SLEEP_MINUTES = 6 * 60;

function clockToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Bedtime is usually before midnight and wake-up after, so wrap around.
export function sleepMinutes(sleep: { bed: string; wake: string }): number {
  return (clockToMinutes(sleep.wake) - clockToMinutes(sleep.bed) + 24 * 60) % (24 * 60);
}

// Adds up every check-in of one week subject by subject. A subject logged
// twice in one night counts once toward `days`.
export function aggregateWeek(checkIns: NightlyCheckIn[], week: NightlyCheckIn["week"]): WeekSummary {
  const bySubject = new Map<string, { minutes: number; tests: number; days: Set<string> }>();
  const checkedInDays = new Set<string>();
  const sleepByDay = new Map<string, number>();
  let wakeSum = 0;

  for (const ci of checkIns) {
    if (ci.week !== week) continue;
    checkedInDays.add(ci.dayName);
    if (ci.sleep) {
      sleepByDay.set(ci.dayName, sleepMinutes(ci.sleep));
      wakeSum += clockToMinutes(ci.sleep.wake);
    }
    for (const e of ci.entries) {
      const row = bySubject.get(e.subject) ?? { minutes: 0, tests: 0, days: new Set<string>() };
      row.minutes += e.minutes;
      row.tests += e.tests;
      row.days.add(ci.dayName);
      bySubject.set(e.subject, row);
    }
  }

  const subjects = [...bySubject.entries()]
    .map(([subject, r]) => ({ subject, minutes: r.minutes, tests: r.tests, days: r.days.size }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    subjects,
    totalMinutes: subjects.reduce((s, r) => s + r.minutes, 0),
    totalTests: subjects.reduce((s, r) => s + r.tests, 0),
    checkedInDays,
    sleep: {
      nights: sleepByDay.size,
      avgMinutes: sleepByDay.size ? Math.round([...sleepByDay.values()].reduce((a, b) => a + b, 0) / sleepByDay.size) : 0,
      avgWake: sleepByDay.size ? Math.round(wakeSum / sleepByDay.size) : 0,
      shortNights: [...sleepByDay.values()].filter((m) => m < SHORT_SLEEP_MINUTES).length,
      byDay: sleepByDay,
    },
  };
}

// 390 → "۰۶:۳۰"
export function formatClockTime(minutesOfDay: number): string {
  const h = Math.floor(minutesOfDay / 60) % 24;
  const m = minutesOfDay % 60;
  return toPersianDigits(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

// 200 → "۳ ساعت و ۲۰ دقیقه"; 45 → "۴۵ دقیقه"; 120 → "۲ ساعت".
export function formatStudyTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${toPersianDigits(m)} دقیقه`;
  if (m === 0) return `${toPersianDigits(h)} ساعت`;
  return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
}
