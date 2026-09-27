"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { can, type Perm, type StaffRole } from "./permissions";
import { toPersianDigits } from "./utils";

// The platform team and who's signed in to the admin panel. The demo has
// no real login for staff, so «ورود به‌عنوان…» picks a member; the logs
// then carry that person's name.
export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  active: boolean;
  mentorIds?: string[]; // supervisor: the mentors they oversee
};

export const staffSeed: StaffMember[] = [
  { id: "st-1", name: "ادمین پلتفرم", role: "super", active: true },
  { id: "st-2", name: "سمیرا (مدیر کل)", role: "super", active: true },
  { id: "st-3", name: "حمید (عملیات)", role: "ops", active: true },
  { id: "st-4", name: "علی (مالی)", role: "finance", active: true },
  { id: "st-5", name: "مریم (پشتیبانی)", role: "edu_support", active: true },
  { id: "st-6", name: "کاوه (پشتیبان فنی)", role: "tech_support", active: true },
  { id: "st-7", name: "نیلوفر (حسابرس)", role: "auditor", active: true },
  {
    id: "st-8",
    name: "نرگس توکلی",
    role: "supervisor",
    active: true,
    mentorIds: ["sara-mohammadi", "negar-ahmadi"],
  },
];

const staff = createLocalStore<StaffMember[]>("x-staff", staffSeed);
const session = createLocalStore<string>("x-staff-session", "st-1");

export const useStaff = staff.useValue;
export const getStaff = staff.get;
export const setStaff = staff.set;

/** The admin-panel user (never a supervisor — they have their own panel). */
export function useMe(): StaffMember {
  const list = staff.useValue();
  const id = session.useValue();
  return useMemo(() => list.find((m) => m.id === id && m.active && m.role !== "supervisor") ?? list[0], [list, id]);
}

export function signInAs(id: string) {
  session.set(id);
}

/** For non-React code (logEvent, ticket replies): who is acting right now. */
export function currentAdminName(): string {
  const list = staff.get();
  return list.find((m) => m.id === session.get())?.name ?? list[0].name;
}

export function useCan(): (perm: Perm) => boolean {
  const me = useMe();
  return (perm: Perm) => can(me.role, perm);
}

/** The supervisor of this demo (the one who signs in at /supervisor). */
export function useSupervisor(): StaffMember | undefined {
  return staff.useValue().find((m) => m.role === "supervisor" && m.active);
}

export const MIN_SUPER_ADMINS = 2;

/**
 * Role/status changes, with the separation-of-duty rules: nobody edits
 * their own access, and at least two active super admins always remain.
 * Returns an error message, or null when saved.
 */
export function updateStaff(id: string, patch: Partial<Omit<StaffMember, "id">>): string | null {
  const list = staff.get();
  const me = list.find((m) => m.id === session.get());
  const target = list.find((m) => m.id === id);
  if (!target) return "این کارمند پیدا نشد.";
  if (me?.id === id && (patch.role !== undefined || patch.active !== undefined))
    return "نقش یا وضعیت خودت رو نمی‌تونی عوض کنی — از مدیر کل دیگه بخواه.";
  const next = list.map((m) => (m.id === id ? { ...m, ...patch } : m));
  const supers = next.filter((m) => m.role === "super" && m.active).length;
  if (supers < MIN_SUPER_ADMINS) return `همیشه باید حداقل ${toPersianDigits(MIN_SUPER_ADMINS)} مدیر کل فعال بمونه.`;
  staff.set(next);
  return null;
}

export function addStaff(name: string, role: StaffRole): string {
  const id = `st-${Date.now()}`;
  staff.set([...staff.get(), { id, name, role, active: true, ...(role === "supervisor" ? { mentorIds: [] } : {}) }]);
  return id;
}
