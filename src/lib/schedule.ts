import { AWAKE_HOURS, DAILY_BUFFER_HOURS, type Commitment } from "./mock-data";
import { toLatinDigits } from "./utils";

export function clockMinutes(hhmm: string): number {
  const [h, m] = toLatinDigits(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export function commitmentHours(list: Commitment[], day: string): number {
  return list
    .filter((c) => c.day === day)
    .reduce((s, c) => s + Math.max(0, clockMinutes(c.end) - clockMinutes(c.start)) / 60, 0);
}

/** Rough real study time left in a day after school, classes and daily life. */
export function freeHours(list: Commitment[], day: string): number {
  return Math.max(0, Math.round((AWAKE_HOURS - DAILY_BUFFER_HOURS - commitmentHours(list, day)) * 2) / 2);
}
