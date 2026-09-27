"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import {
  CURRENT_DAY_NAME,
  WEEK_DAYS,
  planDoneSeed,
  planSeed,
  planTemplateSeed,
  type PlanDays,
  type PlanDraft,
  type PlanTask,
  type PlanTemplate,
  type PlanWeek,
  type StudentPlans,
  type WeekPlan,
} from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { toPersianDigits } from "./utils";

// The one source of truth for weekly plans (mentor writes, student reads).
// Dashboard, plan, calendar, focus mode, timer and the nightly report all
// read from here. localStorage until there's a backend.
const plans = createLocalStore<Record<string, StudentPlans>>("x-plans", planSeed);
const done = createLocalStore<string[]>("x-plan-done", planDoneSeed);
const templates = createLocalStore<PlanTemplate[]>("x-plan-templates", planTemplateSeed);

const EMPTY_PLANS: StudentPlans = {
  this: { published: null, draft: null },
  next: { published: null, draft: null },
};

export const emptyDays = (): PlanDays => Object.fromEntries(WEEK_DAYS.map((d) => [d, []]));

export const dayHours = (tasks: PlanTask[]) => tasks.reduce((s, t) => s + t.hours, 0);
export const weekHours = (days: PlanDays) => WEEK_DAYS.reduce((s, d) => s + dayHours(days[d] ?? []), 0);

export function formatHours(h: number): string {
  return toPersianDigits(Number.isInteger(h) ? h : h.toFixed(1));
}

// ---------- reading ----------

export const usePlans = plans.useValue;

export function useStudentPlans(studentId: string): StudentPlans {
  return plans.useValue()[studentId] ?? EMPTY_PLANS;
}

export function usePublishedWeek(studentId: string, week: PlanWeek): WeekPlan | null {
  return useStudentPlans(studentId)[week].published;
}

/** ایمان's tasks for today, as the mentor sent them. */
export function useTodayTasks(): PlanTask[] {
  const week = usePublishedWeek("me", "this");
  return week?.days[CURRENT_DAY_NAME] ?? [];
}

export function useDoneIds(): Set<string> {
  const ids = done.useValue();
  return useMemo(() => new Set(ids), [ids]);
}

export function setTaskDone(id: string, value: boolean) {
  const cur = done.get();
  if (value && !cur.includes(id)) done.set([...cur, id]);
  if (!value) done.set(cur.filter((x) => x !== id));
}

export function markTasksDone(ids: string[]) {
  done.set([...new Set([...done.get(), ...ids])]);
}

/** Planned vs ticked hours for a published week, up to and including `untilDay`. */
export function planProgress(week: WeekPlan | null, doneIds: Set<string>, untilDay = "جمعه") {
  const last = WEEK_DAYS.indexOf(untilDay);
  let planned = 0;
  let ticked = 0;
  for (const d of WEEK_DAYS.slice(0, last + 1)) {
    for (const t of week?.days[d] ?? []) {
      planned += t.hours;
      if (doneIds.has(t.id)) ticked += t.hours;
    }
  }
  return { planned, ticked, percent: planned ? Math.round((ticked / planned) * 100) : 0 };
}

// ---------- mentor editing ----------

/** What the mentor is looking at: unsent edits if any, else what the student has. */
export function workingCopy(p: StudentPlans[PlanWeek]): PlanDraft {
  return (
    p.draft ?? (p.published ? { days: p.published.days, note: p.published.note } : { days: emptyDays(), note: "" })
  );
}

function editDraft(studentId: string, week: PlanWeek, fn: (d: PlanDraft) => PlanDraft) {
  const all = plans.get();
  const sp = all[studentId] ?? EMPTY_PLANS;
  const next = fn(workingCopy(sp[week]));
  plans.set({ ...all, [studentId]: { ...sp, [week]: { ...sp[week], draft: next } } });
}

const newId = (studentId: string) =>
  `${studentId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function addTask(studentId: string, week: PlanWeek, day: string, task: Omit<PlanTask, "id">) {
  editDraft(studentId, week, (d) => ({
    ...d,
    days: { ...d.days, [day]: [...(d.days[day] ?? []), { ...task, id: newId(studentId) }] },
  }));
}

export function updateTask(studentId: string, week: PlanWeek, day: string, id: string, patch: Omit<PlanTask, "id">) {
  editDraft(studentId, week, (d) => ({
    ...d,
    days: { ...d.days, [day]: d.days[day].map((t) => (t.id === id ? { id, ...patch } : t)) },
  }));
}

export function removeTask(studentId: string, week: PlanWeek, day: string, id: string) {
  editDraft(studentId, week, (d) => ({ ...d, days: { ...d.days, [day]: d.days[day].filter((t) => t.id !== id) } }));
}

export function setPlanNote(studentId: string, week: PlanWeek, note: string) {
  editDraft(studentId, week, (d) => ({ ...d, note }));
}

/** Copy/template: fresh ids so ticks from another week never carry over. */
export function replaceDays(studentId: string, week: PlanWeek, days: PlanDays) {
  const fresh: PlanDays = Object.fromEntries(
    WEEK_DAYS.map((d) => [d, (days[d] ?? []).map((t) => ({ ...t, id: newId(studentId) }))])
  );
  editDraft(studentId, week, (d) => ({ ...d, days: fresh }));
}

export function discardDraft(studentId: string, week: PlanWeek) {
  const all = plans.get();
  const sp = all[studentId] ?? EMPTY_PLANS;
  plans.set({ ...all, [studentId]: { ...sp, [week]: { ...sp[week], draft: null } } });
}

export function publishPlan(studentId: string, studentName: string, week: PlanWeek) {
  const all = plans.get();
  const sp = all[studentId] ?? EMPTY_PLANS;
  const draft = sp[week].draft;
  if (!draft) return;
  const sentAt = `${CURRENT_DAY_NAME}، ${nowClock()}`;
  plans.set({ ...all, [studentId]: { ...sp, [week]: { published: { ...draft, sentAt }, draft: null } } });
  logEvent({
    category: "مشاوران",
    actor: "سارا محمدی",
    actorRole: "مشاور",
    action: sp[week].published ? "ویرایش برنامه‌ی هفته" : "ارسال برنامه‌ی هفته",
    target: `${studentName} — ${week === "this" ? "این هفته" : "هفته‌ی بعد"}`,
    severity: "info",
    details: [{ label: "جمع ساعت", value: `${formatHours(weekHours(draft.days))} ساعت` }],
  });
}

/** How many tasks (and the note) differ between the draft and what the student has. */
export function draftChanges(p: StudentPlans[PlanWeek]): number {
  if (!p.draft) return 0;
  const before = new Map<string, string>();
  for (const d of WEEK_DAYS) for (const t of p.published?.days[d] ?? []) before.set(t.id, JSON.stringify([d, t]));
  let n = 0;
  const seen = new Set<string>();
  for (const d of WEEK_DAYS)
    for (const t of p.draft.days[d] ?? []) {
      seen.add(t.id);
      if (before.get(t.id) !== JSON.stringify([d, t])) n++;
    }
  for (const id of before.keys()) if (!seen.has(id)) n++;
  if ((p.published?.note ?? "") !== p.draft.note) n++;
  return n;
}

export function useNextWeekReady(studentId: string): boolean {
  return useStudentPlans(studentId).next.published !== null;
}

// ---------- templates ----------

export const useTemplates = templates.useValue;

export function saveTemplate(name: string, days: PlanDays) {
  templates.set([...templates.get(), { id: `tpl-${Date.now()}`, name, days }]);
}

export function deleteTemplate(id: string) {
  templates.set(templates.get().filter((t) => t.id !== id));
}

/** Drag-and-drop or the «روز» field: move one task to another day (end of its list). */
export function moveTask(studentId: string, week: PlanWeek, fromDay: string, toDay: string, id: string) {
  if (fromDay === toDay) return;
  editDraft(studentId, week, (d) => {
    const task = d.days[fromDay]?.find((t) => t.id === id);
    if (!task) return d;
    return {
      ...d,
      days: {
        ...d.days,
        [fromDay]: d.days[fromDay].filter((t) => t.id !== id),
        [toDay]: [...(d.days[toDay] ?? []), task],
      },
    };
  });
}

/** Appends copies (fresh ids) of one day's tasks to each target day. */
export function copyDay(studentId: string, week: PlanWeek, fromDay: string, toDays: string[]) {
  editDraft(studentId, week, (d) => {
    const days = { ...d.days };
    for (const day of toDays) {
      if (day === fromDay) continue;
      days[day] = [...(days[day] ?? []), ...(d.days[fromDay] ?? []).map((t) => ({ ...t, id: newId(studentId) }))];
    }
    return { ...d, days };
  });
}
