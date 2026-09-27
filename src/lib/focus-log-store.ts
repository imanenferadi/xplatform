"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { markTasksDone } from "./plan-store";

// Focus minutes logged against today's plan tasks. A task counts as done
// once its logged minutes reach the mentor's time block (or the student
// says they finished early). The nightly report pre-fills from these.
export type FocusEntry = { taskId: string; minutes: number };

const EMPTY: FocusEntry[] = [];
const store = createLocalStore<FocusEntry[]>("x-focus-log", EMPTY);

export function useFocusMinutesByTask(): Map<string, number> {
  const log = store.useValue();
  return useMemo(() => {
    const m = new Map<string, number>();
    for (const e of log) m.set(e.taskId, (m.get(e.taskId) ?? 0) + e.minutes);
    return m;
  }, [log]);
}

/** Logs a focus session; marks the task done when the block is covered or `finished` is set. */
export function logFocus(taskId: string, minutes: number, blockMinutes: number, finished = false) {
  const next = [...store.get(), { taskId, minutes }];
  store.set(next);
  const total = next.filter((e) => e.taskId === taskId).reduce((s, e) => s + e.minutes, 0);
  if (finished || total >= blockMinutes) markTasksDone([taskId]);
}
