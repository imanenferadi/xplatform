"use client";

import { createLocalStore } from "./local-store";

// What the student lets their parent see on /parent. Payments are always
// visible (the parent pays); chats are never visible.
export type ParentAccess = {
  summary: boolean;
  trend: boolean;
  subjects: boolean;
  sleep: boolean;
  mentorNote: boolean;
};

export const PARENT_ACCESS_LABELS: Record<keyof ParentAccess, { label: string; hint: string }> = {
  summary: { label: "ساعت مطالعه و اجرای برنامه", hint: "سه عدد خلاصه‌ی هفته" },
  trend: { label: "روند چندهفته‌ای", hint: "نمودار اجرای برنامه" },
  subjects: { label: "جمع درس‌به‌درس", hint: "ساعت و تست هر درس از گزارش کارها" },
  sleep: { label: "ساعت خواب", hint: "میانگین خواب و بیداری هفته" },
  mentorNote: { label: "یادداشت مشاور برای والدین", hint: "پیامی که مشاور برای خانواده می‌نویسه" },
};

const DEFAULT_ACCESS: ParentAccess = { summary: true, trend: true, subjects: false, sleep: false, mentorNote: true };

const store = createLocalStore<ParentAccess>("x-parent-access", DEFAULT_ACCESS);

export const useParentAccess = store.useValue;

export function setParentAccess(key: keyof ParentAccess, value: boolean) {
  store.set({ ...store.get(), [key]: value });
}
