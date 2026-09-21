import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts Latin digits to Persian digits for body/marketing copy (e.g.
 * "۲ از ۶"). Data tables and technical metrics should stay Latin per the
 * design doc (§3 Typography) — use the `tnum` CSS class for those instead.
 */
export function toPersianDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}
