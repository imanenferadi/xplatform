"use client";

import { createLocalStore } from "./local-store";
import type { LogFollowUp } from "./mock-data";
import { toPersianDigits } from "./utils";

// The editable follow-up layer for anything an admin tracks: log events,
// users, complaints, transactions, mentor applications, payouts, mentor
// swaps. Keyed "kind:id" (e.g. "user:u-1"). Every edit is appended to that
// entity's own history. localStorage bridge until there's a backend.

const store = createLocalStore<Record<string, LogFollowUp>>("x-followups", {});

export const CURRENT_ADMIN = "ادمین پلتفرم";

export const EMPTY_FOLLOW_UP: LogFollowUp = { status: "new", assignee: "", tags: [], note: "", history: [] };

export const FOLLOW_UP_LABEL = { new: "جدید", in_progress: "در حال پیگیری", reviewed: "بررسی‌شده" } as const;

export const useFollowUps = store.useValue;

export function nowClock() {
  const d = new Date();
  return toPersianDigits(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

/** Saves the follow-up and records what changed; false if nothing did. */
export function saveFollowUp(key: string, prev: LogFollowUp, next: Omit<LogFollowUp, "history">): boolean {
  const changes: string[] = [];
  if (prev.status !== next.status)
    changes.push(`وضعیت: ${FOLLOW_UP_LABEL[prev.status]} ← ${FOLLOW_UP_LABEL[next.status]}`);
  if (prev.assignee !== next.assignee) changes.push(`مسئول: ${prev.assignee || "—"} ← ${next.assignee || "—"}`);
  if (prev.tags.join("،") !== next.tags.join("،"))
    changes.push(`برچسب‌ها: ${prev.tags.join("، ") || "—"} ← ${next.tags.join("، ") || "—"}`);
  if (prev.note !== next.note) changes.push(prev.note ? "یادداشت ویرایش شد" : "یادداشت اضافه شد");
  if (changes.length === 0) return false;

  const history = [
    ...prev.history,
    ...changes.map((change) => ({ by: CURRENT_ADMIN, at: `امروز، ${nowClock()}`, change })),
  ];
  store.set({ ...store.get(), [key]: { ...next, history } });
  return true;
}
