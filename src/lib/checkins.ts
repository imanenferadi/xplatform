import type { NightlyCheckIn } from "./mock-data";
import { toPersianDigits } from "./utils";

export type SubjectTotal = { subject: string; minutes: number; tests: number; days: number };

export type WeekSummary = {
  subjects: SubjectTotal[]; // sorted by minutes, most first
  totalMinutes: number;
  totalTests: number;
  checkedInDays: Set<string>;
};

// Adds up every check-in of one week subject by subject. A subject logged
// twice in one night counts once toward `days`.
export function aggregateWeek(checkIns: NightlyCheckIn[], week: NightlyCheckIn["week"]): WeekSummary {
  const bySubject = new Map<string, { minutes: number; tests: number; days: Set<string> }>();
  const checkedInDays = new Set<string>();

  for (const ci of checkIns) {
    if (ci.week !== week) continue;
    checkedInDays.add(ci.dayName);
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
  };
}

// 200 → "۳ ساعت و ۲۰ دقیقه"; 45 → "۴۵ دقیقه"; 120 → "۲ ساعت".
export function formatStudyTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${toPersianDigits(m)} دقیقه`;
  if (m === 0) return `${toPersianDigits(h)} ساعت`;
  return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
}
