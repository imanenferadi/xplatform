"use client";

import { createLocalStore } from "./local-store";
import {
  DEFAULT_SCHEDULE,
  studentSetupSeed,
  type BookItem,
  type Commitment,
  type Intake,
  type StudentSetup,
} from "./mock-data";

// ایمان's «اطلاعات شروع» (questionnaire, school hours, books), kept in the
// browser until there's a backend. The mentor's case file reads the same.
const EMPTY_SETUP: StudentSetup = { intake: null, schedule: DEFAULT_SCHEDULE, books: [] };
const store = createLocalStore<StudentSetup>("x-setup", EMPTY_SETUP);

export const useMySetup = store.useValue;

/** Setup of any student: the live one for ایمان ("me"), seeds for the rest. */
export function useStudentSetup(studentId: string): StudentSetup {
  const mine = store.useValue();
  return studentId === "me" ? mine : (studentSetupSeed[studentId] ?? { intake: null, schedule: [], books: [] });
}

export function saveIntake(intake: Intake) {
  store.set({ ...store.get(), intake });
}

export function addCommitment(c: Commitment) {
  store.set({ ...store.get(), schedule: [...store.get().schedule, c] });
}

export function removeCommitment(id: string) {
  store.set({ ...store.get(), schedule: store.get().schedule.filter((c) => c.id !== id) });
}

export function addBook(b: BookItem) {
  store.set({ ...store.get(), books: [...store.get().books, b] });
}

export function updateBook(id: string, patch: Partial<BookItem>) {
  store.set({ ...store.get(), books: store.get().books.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
}

export function removeBook(id: string) {
  store.set({ ...store.get(), books: store.get().books.filter((b) => b.id !== id) });
}

/** The three start-up steps and whether each is done. */
export function setupSteps(s: StudentSetup) {
  return [
    { key: "intake", label: "پرسشنامه‌ی شروع", done: s.intake !== null },
    { key: "schedule", label: "ساعت مدرسه و کلاس‌ها", done: s.schedule.length > 0 },
    { key: "books", label: "کتاب‌ها و منابع", done: s.books.length > 0 },
  ];
}
