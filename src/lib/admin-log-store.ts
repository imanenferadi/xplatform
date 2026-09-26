"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { platformLogs, type LogFollowUp, type PlatformLogEntry } from "./mock-data";
import { toCsv } from "./csv";
import { CURRENT_ADMIN, FOLLOW_UP_LABEL, nowClock, saveFollowUp, useFollowUps } from "./followup-store";

// Audit log bridge (localStorage until there's a backend): `added` holds
// events recorded live by admin actions on other admin pages. The only
// editable part of an event is its follow-up (see followup-store, key
// "log:<id>"), each edit appended to that event's own history.

type State = { added: PlatformLogEntry[] };

const EMPTY: State = { added: [] };
const store = createLocalStore<State>("x-admin-log", EMPTY);

const DEMO_TODAY = "۷ مهر ۱۴۰۵";

/** Newest first: live events, then the seeded history. */
export function useLogs(): PlatformLogEntry[] {
  const { added } = store.useValue();
  const followUps = useFollowUps();
  return useMemo(
    () =>
      [...[...added].reverse(), ...platformLogs].map((l) =>
        followUps[`log:${l.id}`] ? { ...l, followUp: followUps[`log:${l.id}`] } : l
      ),
    [added, followUps]
  );
}

type NewEvent = Omit<PlatformLogEntry, "id" | "date" | "time" | "actor" | "actorRole" | "followUp" | "device"> &
  Partial<Pick<PlatformLogEntry, "actor" | "actorRole">>;

/** Called from admin pages whenever an admin actually does something. */
export function logEvent(e: NewEvent) {
  const s = store.get();
  const entry: PlatformLogEntry = {
    actor: CURRENT_ADMIN,
    actorRole: "ادمین",
    device: "تهران · همین مرورگر",
    ...e,
    id: `log-live-${Date.now()}`,
    date: DEMO_TODAY,
    time: nowClock(),
    followUp: { status: e.severity === "info" ? "reviewed" : "new", assignee: "", tags: [], note: "", history: [] },
  };
  store.set({ ...s, added: [...s.added, entry] });
}

/** Edits the follow-up layer of one event and records what changed. */
export function updateFollowUp(log: PlatformLogEntry, next: Omit<LogFollowUp, "history">) {
  return saveFollowUp(`log:${log.id}`, log.followUp, next);
}

export function logsToCsv(logs: PlatformLogEntry[]): string {
  return toCsv(
    [
      "تاریخ",
      "ساعت",
      "دسته",
      "شدت",
      "انجام‌دهنده",
      "نقش",
      "کار",
      "هدف",
      "جزئیات",
      "وضعیت پیگیری",
      "مسئول",
      "برچسب‌ها",
      "یادداشت",
    ],
    logs.map((l) => [
      l.date,
      l.time,
      l.category,
      l.severity,
      l.actor,
      l.actorRole,
      l.action,
      l.target,
      l.details.map((d) => `${d.label}: ${d.value}`).join(" | "),
      FOLLOW_UP_LABEL[l.followUp.status],
      l.followUp.assignee,
      l.followUp.tags.join("، "),
      l.followUp.note,
    ])
  );
}
