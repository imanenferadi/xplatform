"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import type { ChatMessage } from "./mock-data";

// Mentor → many students at once, replacing the mentor's Telegram channel.
// `recipients: "all"` also reaches the logged-in student's own /chat.
export type Broadcast = { id: number; text: string; time: string; recipients: "all" | string[] };

const EMPTY: Broadcast[] = [];
const store = createLocalStore<Broadcast[]>("x-broadcasts", EMPTY);

export const useBroadcasts = store.useValue;

export function sendBroadcast(b: Broadcast) {
  store.set([...store.get(), b]);
}

/** Broadcasts that reached one student, shaped as chat messages. */
export function useBroadcastMessages(studentId: string | "me"): ChatMessage[] {
  const all = store.useValue();
  return useMemo(
    () =>
      all
        .filter((b) => b.recipients === "all" || (studentId !== "me" && b.recipients.includes(studentId)))
        .map((b) => ({ id: b.id, from: "mentor" as const, text: b.text, time: b.time, broadcast: true })),
    [all, studentId],
  );
}
