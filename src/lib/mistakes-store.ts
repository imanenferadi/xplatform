"use client";

import { createLocalStore } from "./local-store";
import { myMistakesSeed, type MistakeEntry } from "./mock-data";

// The student's own notebook, kept in this browser until there's a backend.
const store = createLocalStore<MistakeEntry[]>("x-mistakes", myMistakesSeed);

export const useMyMistakes = store.useValue;

export function addMistake(entry: MistakeEntry) {
  store.set([entry, ...store.get()]);
}

export function toggleResolved(id: string) {
  store.set(store.get().map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m)));
}

export function deleteMistake(id: string) {
  store.set(store.get().filter((m) => m.id !== id));
}
