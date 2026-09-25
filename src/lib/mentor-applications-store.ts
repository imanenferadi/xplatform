"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import type { Mentor } from "./mock-data";

// Demo bridge: self-registered mentor applications, so the flow
// apply → admin approval → public profile works end to end without a backend.

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type StoredApplication = {
  id: string;
  mentor: Mentor;
  phone: string;
  karnamehFileName: string;
  appliedAt: string;
  status: ApplicationStatus;
};

const EMPTY: StoredApplication[] = [];
const store = createLocalStore<StoredApplication[]>("x-mentor-applications", EMPTY);

export const useStoredApplications = store.useValue;

export function useApprovedMentors(): Mentor[] {
  const apps = store.useValue();
  return useMemo(() => apps.filter((a) => a.status === "approved").map((a) => a.mentor), [apps]);
}

export function addApplication(input: { mentor: Omit<Mentor, "id">; phone: string; karnamehFileName: string }) {
  const id = `applicant-${Math.random().toString(36).slice(2, 10)}`;
  store.set([
    {
      id,
      mentor: { ...input.mentor, id },
      phone: input.phone,
      karnamehFileName: input.karnamehFileName,
      appliedAt: "همین الان",
      status: "pending",
    },
    ...store.get(),
  ]);
  return id;
}

export function setApplicationStatus(id: string, status: ApplicationStatus) {
  store.set(
    store
      .get()
      .map((a) => (a.id === id ? { ...a, status, mentor: { ...a.mentor, verified: status === "approved" } } : a))
  );
}
