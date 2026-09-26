"use client";

import { createLocalStore } from "./local-store";
import { schoolSeed, type SchoolStudent } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { toPersianDigits } from "./utils";

// The school/institute panel: seats bought in bulk and the students on them.
type State = { seats: number; students: SchoolStudent[] };

const store = createLocalStore<State>("x-school", { seats: schoolSeed.seats, students: schoolSeed.students });

export const useSchool = store.useValue;

export function addSchoolStudents(list: { name: string; phone: string }[]) {
  const s = store.get();
  const added: SchoolStudent[] = list.map((x, i) => ({
    id: `ss-new-${Date.now()}-${i}`,
    name: x.name,
    phone: x.phone,
    grade: "—",
    mentorName: "در حال تطبیق",
    reportRate: null,
    studyHours: null,
  }));
  store.set({ ...s, students: [...s.students, ...added] });
  logEvent({
    category: "کاربران",
    actor: schoolSeed.name,
    actorRole: "آموزشگاه",
    action: "افزودن گروهی دانش‌آموز (آموزشگاه)",
    target: `${toPersianDigits(list.length)} دانش‌آموز`,
    severity: "info",
    details: [{ label: "نام‌ها", value: list.map((x) => x.name).join("، ") }],
  });
}

export function buySeats(n: number, amount: number) {
  store.set({ ...store.get(), seats: store.get().seats + n });
  logEvent({
    category: "مالی",
    actor: schoolSeed.name,
    actorRole: "آموزشگاه",
    action: "خرید صندلی آموزشگاه",
    target: `${toPersianDigits(n)} صندلی`,
    severity: "info",
    details: [{ label: "مبلغ ماهانه‌ی اضافه", value: `${toPersianDigits(amount.toLocaleString("en-US"))} تومان` }],
  });
}
