import { WEEK_DAYS, type NightlyCheckIn } from "./mock-data";

/** Newest first: this week before last, later weekdays first. */
export function byRecency(list: NightlyCheckIn[]): NightlyCheckIn[] {
  const rank = (c: NightlyCheckIn) => (c.week === "this" ? 100 : 0) + WEEK_DAYS.indexOf(c.dayName);
  return [...list].sort((a, b) => rank(b) - rank(a));
}
