import type { PackageDuration } from "./mock-data";

// Pure pricing math, shared by the checkout (client) and the /pricing page (server).

// Rounded to the nearest 1,000 toman — nobody pays ۱,۳۴۱,۰۰۷.
export function round1000(n: number) {
  return Math.round(n / 1000) * 1000;
}

export function packageTotal(monthlyPrice: number, d: PackageDuration) {
  return round1000(monthlyPrice * d.months * (1 - d.discountPercent / 100));
}
