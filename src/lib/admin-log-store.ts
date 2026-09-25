"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { platformLogs, type LogFollowUp, type PlatformLogEntry } from "./mock-data";
import { toPersianDigits } from "./utils";

// Audit log bridge (localStorage until there's a backend):
// - `added`: events recorded live by admin actions on other admin pages.
// - `followUps`: the only editable part of any event — status, assignee,
//   tags, note — each edit appended to that event's own history.

type State = { added: PlatformLogEntry[]; followUps: Record<string, LogFollowUp> };

const EMPTY: State = { added: [], followUps: {} };
const store = createLocalStore<State>("x-admin-log", EMPTY);

export const CURRENT_ADMIN = "ادمین پلتفرم";
const DEMO_TODAY = "۷ مهر ۱۴۰۵";

function nowClock() {
  const d = new Date();
  return toPersianDigits(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

/** Newest first: live events, then the seeded history. */
export function useLogs(): PlatformLogEntry[] {
  const { added, followUps } = store.useValue();
  return useMemo(
    () =>
      [...[...added].reverse(), ...platformLogs].map((l) =>
        followUps[l.id] ? { ...l, followUp: followUps[l.id] } : l
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

/** Edits the follow-up layer and records what changed, by whom. */
export function updateFollowUp(log: PlatformLogEntry, next: Omit<LogFollowUp, "history">) {
  const prev = log.followUp;
  const changes: string[] = [];
  const label = { new: "جدید", in_progress: "در حال پیگیری", reviewed: "بررسی‌شده" };
  if (prev.status !== next.status) changes.push(`وضعیت: ${label[prev.status]} ← ${label[next.status]}`);
  if (prev.assignee !== next.assignee) changes.push(`مسئول: ${prev.assignee || "—"} ← ${next.assignee || "—"}`);
  if (prev.tags.join("،") !== next.tags.join("،"))
    changes.push(`برچسب‌ها: ${prev.tags.join("، ") || "—"} ← ${next.tags.join("، ") || "—"}`);
  if (prev.note !== next.note) changes.push(prev.note ? "یادداشت ویرایش شد" : "یادداشت اضافه شد");
  if (changes.length === 0) return false;

  const s = store.get();
  const history = [
    ...prev.history,
    ...changes.map((change) => ({ by: CURRENT_ADMIN, at: `امروز، ${nowClock()}`, change })),
  ];
  store.set({ ...s, followUps: { ...s.followUps, [log.id]: { ...next, history } } });
  return true;
}

export function logsToCsv(logs: PlatformLogEntry[]): string {
  const statusLabel = { new: "جدید", in_progress: "در حال پیگیری", reviewed: "بررسی‌شده" };
  const header = [
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
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = logs.map((l) =>
    [
      l.date,
      l.time,
      l.category,
      l.severity,
      l.actor,
      l.actorRole,
      l.action,
      l.target,
      l.details.map((d) => `${d.label}: ${d.value}`).join(" | "),
      statusLabel[l.followUp.status],
      l.followUp.assignee,
      l.followUp.tags.join("، "),
      l.followUp.note,
    ]
      .map(esc)
      .join(",")
  );
  // BOM so Excel opens Persian text correctly.
  return "﻿" + [header.map(esc).join(","), ...rows].join("\n");
}
