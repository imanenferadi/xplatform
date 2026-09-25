"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Mentor } from "./mock-data";

// Demo bridge only: persists self-registered mentor applications in this
// browser's localStorage so the flow apply → admin approval → public
// profile works end to end without a backend. Replace with API calls.

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type StoredApplication = {
  id: string;
  mentor: Mentor;
  phone: string;
  karnamehFileName: string;
  appliedAt: string;
  status: ApplicationStatus;
};

const KEY = "x-mentor-applications";
const EMPTY: StoredApplication[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: StoredApplication[] = EMPTY;

function read(): StoredApplication[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as StoredApplication[]) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(apps: StoredApplication[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(apps));
  } catch {
    // Storage blocked (private mode etc.) — keep the in-memory copy so the
    // current tab still reflects the change.
    cachedRaw = null;
    cached = apps;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredApplications(): StoredApplication[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useApprovedMentors(): Mentor[] {
  const apps = useStoredApplications();
  return useMemo(() => apps.filter((a) => a.status === "approved").map((a) => a.mentor), [apps]);
}

export function addApplication(input: { mentor: Omit<Mentor, "id">; phone: string; karnamehFileName: string }) {
  const id = `applicant-${Math.random().toString(36).slice(2, 10)}`;
  const app: StoredApplication = {
    id,
    mentor: { ...input.mentor, id },
    phone: input.phone,
    karnamehFileName: input.karnamehFileName,
    appliedAt: "همین الان",
    status: "pending",
  };
  write([app, ...read()]);
  return id;
}

export function setApplicationStatus(id: string, status: ApplicationStatus) {
  write(
    read().map((a) =>
      a.id === id ? { ...a, status, mentor: { ...a.mentor, verified: status === "approved" } } : a
    )
  );
}
