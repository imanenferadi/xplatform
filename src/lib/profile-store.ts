"use client";

import { saveOwnFields, useUsers } from "./user-edits-store";

// ایمان's own name/city — the same record support edits in /admin/users, so a
// correction by support shows up here immediately, and vice versa.
const ME = "u-1";

export function useProfile(): { name: string; city: string; grade?: string; group?: string } {
  const me = useUsers().find((u) => u.id === ME)!;
  return { name: me.name, city: me.city, grade: me.grade, group: me.group };
}

export function saveProfile(p: { name: string; city: string }) {
  saveOwnFields(ME, p);
}
