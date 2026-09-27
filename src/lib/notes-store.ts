"use client";

import { createLocalStore } from "./local-store";
import { studentNotes, type StudentNote } from "./mock-data";

// The student's own notes («دفترچه ← یادداشت‌ها»), kept until there's a backend.
const store = createLocalStore<StudentNote[]>("x-notes", studentNotes);

export const useNotes = store.useValue;

export function addNote(title: string, body: string) {
  store.set([{ id: `sn-${Date.now()}`, title: title || "بدون عنوان", body, date: "امروز" }, ...store.get()]);
}

/** Removes a note and returns a function that puts it back where it was. */
export function removeNote(id: string): () => void {
  const before = store.get();
  store.set(before.filter((n) => n.id !== id));
  return () => store.set(before);
}
