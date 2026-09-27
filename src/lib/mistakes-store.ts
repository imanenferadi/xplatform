"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { DEMO_TODAY_ISO, myMistakesSeed, type MistakeEntry } from "./mock-data";
import { addDaysIso } from "./utils";

// The student's own notebook, kept in this browser until there's a backend.
const store = createLocalStore<MistakeEntry[]>("x-mistakes", myMistakesSeed);

export const useMyMistakes = store.useValue;

export function addMistake(entry: MistakeEntry) {
  store.set([entry, ...store.get()]);
}

/** Each of these returns a function that undoes it (for the «برگردون» toast). */
export function toggleResolved(id: string): () => void {
  const before = store.get();
  store.set(before.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m)));
  return () => store.set(before);
}

export function deleteMistake(id: string): () => void {
  const before = store.get();
  store.set(before.filter((m) => m.id !== id));
  return () => store.set(before);
}

// Spaced review: re-solve each unresolved mistake 3 days after logging it,
// then again a few days later. Two correct re-solves = resolved; a wrong
// one starts over in 3 days.
export const REVIEW_FIRST_DAYS = 3;
export const REVIEW_SECOND_DAYS = 4;

export function reviewDue(m: MistakeEntry): string {
  return m.reviewDueIso ?? addDaysIso(m.createdIso ?? DEMO_TODAY_ISO, REVIEW_FIRST_DAYS);
}

/** Whole days until the next review (≤ 0 = due today or overdue). */
export function daysUntilReview(m: MistakeEntry, todayIso = DEMO_TODAY_ISO): number {
  return Math.round((Date.parse(reviewDue(m)) - Date.parse(todayIso)) / 86_400_000);
}

export function useDueMistakes(): MistakeEntry[] {
  const all = store.useValue();
  return useMemo(
    () =>
      all
        .filter((m) => !m.resolved && daysUntilReview(m) <= 0)
        .sort((a, b) => reviewDue(a).localeCompare(reviewDue(b))),
    [all]
  );
}

export function reviewMistake(id: string, correct: boolean) {
  store.set(
    store.get().map((m) => {
      if (m.id !== id) return m;
      if (!correct) return { ...m, reviewStage: 0, reviewDueIso: addDaysIso(DEMO_TODAY_ISO, REVIEW_FIRST_DAYS) };
      if ((m.reviewStage ?? 0) === 0)
        return { ...m, reviewStage: 1, reviewDueIso: addDaysIso(DEMO_TODAY_ISO, REVIEW_SECOND_DAYS) };
      return { ...m, resolved: true };
    })
  );
}
