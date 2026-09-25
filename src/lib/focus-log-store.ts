"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";

// Focus minutes logged against today's plan tasks — written when a
// task-linked timer finishes (or the student marks it done early), read by
// the dashboard to mark those tasks as done.
export type FocusEntry = { taskId: number; minutes: number };

const EMPTY: FocusEntry[] = [];
const store = createLocalStore<FocusEntry[]>("x-focus-log", EMPTY);

export function useCompletedTaskIds(): Set<number> {
  const log = store.useValue();
  return useMemo(() => new Set(log.map((e) => e.taskId)), [log]);
}

export function logFocus(taskId: number, minutes: number) {
  store.set([...store.get(), { taskId, minutes }]);
}
