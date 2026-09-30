import { mentors, type Mentor } from "@/lib/mock-data";
import { toLatinDigits } from "@/lib/utils";

/** «رتبه ۴۴۰» → 440, for sorting best rank first. */
export const rankNumber = (m: Mentor) =>
  Number(toLatinDigits(m.rank).replace(/\D/g, "")) || Infinity;

export function mentorsByRank(list: Mentor[] = mentors): Mentor[] {
  return [...list].sort((a, b) => rankNumber(a) - rankNumber(b));
}

/** A few mentors that cover every exam group: the best of each group first, then by rank. */
export function spotlightMentors(
  n: number,
  list: Mentor[] = mentors,
): Mentor[] {
  const ranked = mentorsByRank(list);
  const firsts = [...new Set(ranked.map((m) => m.group))].map((g) =>
    ranked.find((m) => m.group === g)!,
  );
  return [...firsts, ...ranked.filter((m) => !firsts.includes(m))].slice(0, n);
}
