"use client";

import { useSyncExternalStore } from "react";

// Keeps every `createLocalStore` value in step with the server (SQLite behind
// /api/state). localStorage stays the working copy, so the app still works
// when the server is unreachable — it just stops being shared.
//
//  • on load: pull everything the server has and adopt it
//  • on change: push that one store (debounced), last write wins
//  • every few seconds while the tab is visible: pull what others changed
//
// A few keys describe *this browser* (who is signed in as staff, the support
// view-as session, the theme) and are never shared.

const LOCAL_ONLY = new Set(["x-staff-session", "x-viewas", "x-theme"]);
const PUSH_DELAY_MS = 250;
const POLL_MS = 4000;
const OFFLINE_POLL_MS = 30000;

type Remote = {
  key: string;
  value: string;
  version: number;
  updatedAt: string;
};
export type SyncStatus = "off" | "connecting" | "online" | "offline";

const appliers = new Map<string, (raw: string) => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const dirty = new Set<string>(); // changed here, server doesn't have it yet
const latest = new Map<string, string>(); // newest local text per dirty key
const versions = new Map<string, number>(); // last server version we pushed or adopted
const remoteSeen = new Map<string, string>(); // server text for keys whose store registers late
let cursor: string | null = null;
let started = false;
let status: SyncStatus = "off";
const statusListeners = new Set<() => void>();

function setStatus(next: SyncStatus) {
  if (next === status) return;
  status = next;
  statusListeners.forEach((l) => l());
}
export const getSyncStatus = () => status;
export const subscribeSyncStatus = (l: () => void) => {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
};

export const isShared = (key: string) => !LOCAL_ONLY.has(key);

/** Called by each store when it is created. `apply` writes a server value into the store. */
export function registerStore(key: string, apply: (raw: string) => void) {
  if (typeof window === "undefined" || !isShared(key)) return;
  appliers.set(key, apply);
  const seen = remoteSeen.get(key);
  if (seen !== undefined && !dirty.has(key)) apply(seen);
  start();
}

function adopt(item: Remote) {
  if (dirty.has(item.key)) return; // a newer local change is on its way up
  if ((versions.get(item.key) ?? 0) >= item.version) return; // we already have this or newer
  versions.set(item.key, item.version);
  remoteSeen.set(item.key, item.value);
  appliers.get(item.key)?.(item.value);
}

async function pull() {
  const url = cursor
    ? `/api/state?since=${encodeURIComponent(cursor)}`
    : "/api/state";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`state ${res.status}`);
  const data = (await res.json()) as { items: Remote[]; cursor: string | null };
  for (const item of data.items) adopt(item);
  if (data.cursor) cursor = data.cursor;
}

async function push(key: string) {
  const raw = latest.get(key);
  if (raw === undefined) return;
  try {
    const res = await fetch(`/api/state/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: raw }),
    });
    if (!res.ok) throw new Error(`state ${res.status}`);
    const { version } = (await res.json()) as { version: number };
    versions.set(key, version);
    if (latest.get(key) === raw) {
      dirty.delete(key);
      latest.delete(key);
    } else {
      schedulePush(key); // changed again while this one was in flight
    }
    setStatus("online");
  } catch {
    setStatus("offline"); // stays dirty; the next poll retries it
  }
}

function schedulePush(key: string) {
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void push(key);
    }, PUSH_DELAY_MS),
  );
}

/** Called by a store after the user changed it. */
export function pushLocal(key: string, raw: string) {
  if (typeof window === "undefined" || !isShared(key)) return;
  dirty.add(key);
  latest.set(key, raw);
  schedulePush(key);
  start();
}

let ticking = false;
async function tick() {
  if (ticking || document.visibilityState !== "visible") return;
  ticking = true;
  try {
    // A push that failed leaves its key dirty: retry it now that we're polling again.
    if (status === "offline")
      for (const key of dirty) if (!timers.has(key)) void push(key);
    await pull();
    setStatus("online");
  } catch {
    setStatus("offline");
  } finally {
    ticking = false;
  }
}

function loop() {
  void tick();
  setTimeout(loop, status === "offline" ? OFFLINE_POLL_MS : POLL_MS);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  setStatus("connecting");
  loop();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void tick();
  });
}

/** For a small «synced / offline» indicator. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    subscribeSyncStatus,
    getSyncStatus,
    () => "off" as SyncStatus,
  );
}
