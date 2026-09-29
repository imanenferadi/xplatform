"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { adminUsers, studentAssignments, type AdminUser, type ExamGroup } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";
import { currentAdminName } from "./staff-store";
import { toLatinDigits, toPersianDigits } from "./utils";

// Staff corrections to a user's info, merged over the seed. Every change
// needs a reason, is logged with before/after, and leaves a notice for the
// account owner. A phone change is confirmed with a code sent to the new
// number; a parent link only happens once the student approves it.

export const GRADES = ["دهم", "یازدهم", "دوازدهم", "پشت‌کنکوری"] as const;
export const GROUPS: ExamGroup[] = ["تجربی", "ریاضی", "انسانی"];
export const PHONE_CODE_MINUTES = 10;
export const PHONE_CODE_TRIES = 3;

const SEED_GRADES: Record<string, string> = {
  "u-1": "دوازدهم",
  "u-2": "دوازدهم",
  "u-4": "پشت‌کنکوری",
  "u-5": "یازدهم",
};

type Fields = { name: string; city: string; phone: string; grade: string; group: ExamGroup };
export type ParentLink = {
  userId: string;
  parentName: string;
  parentPhone: string;
  status: "pending" | "linked" | "declined" | "removed";
  by: string;
  at: string;
};
export type AccountNotice = { id: string; userId: string; text: string; at: string; seen: boolean };
type PendingPhone = { userId: string; newPhone: string; code: string; expiresMs: number; tries: number };

type State = {
  edits: Record<string, Partial<Fields>>;
  parents: ParentLink[];
  notices: AccountNotice[];
  pendingPhone: PendingPhone | null;
};
const store = createLocalStore<State>("x-user-edits", { edits: {}, parents: [], notices: [], pendingPhone: null });

export type EditableUser = AdminUser & { grade?: string; group?: ExamGroup; mentorId?: string };

/** Seed users with staff corrections (and the student's own profile edits) applied. */
export function useUsers(): EditableUser[] {
  const { edits } = store.useValue();
  return useMemo(
    () =>
      adminUsers.map((u) => {
        const a = studentAssignments.find((x) => x.userId === u.id);
        return {
          ...u,
          ...(u.role === "دانش‌آموز" ? { grade: SEED_GRADES[u.id], group: a?.group, mentorId: a?.mentorId } : {}),
          ...edits[u.id],
        };
      }),
    [edits]
  );
}

export const useUserEditsState = store.useValue;

// ---------- validation helpers ----------

/** «۰۹۱۲ ۱۲۳ ۴۵۶۷» / «+98912…» → «09121234567», or null if it isn't an Iranian mobile. */
export function normalizeMobile(input: string): string | null {
  let d = toLatinDigits(input).replace(/[\s-]/g, "");
  if (d.startsWith("+98")) d = "0" + d.slice(3);
  else if (d.startsWith("0098")) d = "0" + d.slice(4);
  return /^09\d{9}$/.test(d) ? d : null;
}

export function formatMobile(d: string): string {
  return toPersianDigits(`${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`);
}

// ---------- plain field edits ----------

type Field = "name" | "city" | "grade" | "group";
// «نامت», «شهرت», «پایه‌ات», «رشته‌ات» — the possessive differs by ending.
const YOUR: Record<Field, string> = { name: "نامت", city: "شهرت", grade: "پایه‌ات", group: "رشته‌ات" };

const FIELD_LABEL: Record<Field | "phone", string> = {
  name: "نام",
  city: "شهر",
  grade: "پایه",
  group: "رشته",
  phone: "موبایل",
};

function notice(s: State, userId: string, text: string): AccountNotice[] {
  return [
    {
      id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      userId,
      text,
      at: `امروز، ${nowClock()}`,
      seen: false,
    },
    ...s.notices,
  ];
}

/** Returns an error message, or null when saved. */
export function updateUserField(user: EditableUser, field: Field, rawValue: string, reason: string): string | null {
  const value = rawValue.trim();
  if (!reason.trim()) return "دلیل تغییر رو بنویس — در لاگ و برای صاحب حساب ثبت می‌شه.";
  if (field === "name") {
    if (user.role === "مشاور") return "اسم مشاور از پروفایل عمومی میاد؛ خودش از «پروفایل من» عوضش می‌کنه.";
    if (value.length < 2 || value.length > 40) return "اسم باید بین ۲ تا ۴۰ حرف باشه.";
  }
  if (field === "city" && (value.length < 2 || value.length > 30)) return "شهر باید بین ۲ تا ۳۰ حرف باشه.";
  if ((field === "grade" || field === "group") && user.role !== "دانش‌آموز") return "پایه و رشته فقط برای دانش‌آموزه.";
  if (field === "grade" && !(GRADES as readonly string[]).includes(value)) return "پایه رو از فهرست انتخاب کن.";
  if (field === "group" && !GROUPS.includes(value as ExamGroup)) return "رشته رو از فهرست انتخاب کن.";
  const before = String(user[field] ?? "—");
  if (before === value) return "مقدار جدید با قبلی یکیه.";

  const s = store.get();
  let notices = notice(
    s,
    user.id,
    `پشتیبانی ${YOUR[field]} رو از «${before}» به «${value}» تغییر داد — دلیل: ${reason.trim()}`
  );
  // Grade/major decide how the mentor plans — the mentor hears about it too.
  if ((field === "grade" || field === "group") && user.mentorId)
    notices = notice(
      { ...s, notices },
      `mentor:${user.mentorId}`,
      `${field === "grade" ? "پایه‌ی" : "رشته‌ی"} ${user.name} از «${before}» به «${value}» تغییر کرد — برنامه‌ی هفته‌ی بعد رو با این تنظیم کن.`
    );
  store.set({ ...s, edits: { ...s.edits, [user.id]: { ...s.edits[user.id], [field]: value } }, notices });
  logEvent({
    category: "کاربران",
    action: `ویرایش ${FIELD_LABEL[field]} کاربر`,
    target: user.name,
    severity: field === "group" ? "warning" : "info",
    details: [
      { label: "قبل", value: before },
      { label: "بعد", value },
      { label: "دلیل", value: reason.trim() },
    ],
    href: `/admin/users?q=${encodeURIComponent(user.name)}`,
  });
  return null;
}

/** The student's own profile edits (no reason, no notice — it's their data). */
export function saveOwnFields(userId: string, fields: Partial<Pick<Fields, "name" | "city">>) {
  const s = store.get();
  store.set({ ...s, edits: { ...s.edits, [userId]: { ...s.edits[userId], ...fields } } });
}

// ---------- phone change (code to the new number) ----------

export function startPhoneChange(
  user: EditableUser,
  raw: string,
  users: EditableUser[],
  nowMs: number
): string | { code: string } {
  const phone = normalizeMobile(raw);
  if (!phone) return "شماره‌ی موبایل باید ۱۱ رقم و با ۰۹ شروع بشه.";
  if (normalizeMobile(user.phone) === phone) return "این همون شماره‌ی فعلیه.";
  const owner = users.find((u) => u.id !== user.id && normalizeMobile(u.phone) === phone);
  if (owner) return `این شماره مال حساب دیگه‌ایه (${owner.name}) — یک شماره نمی‌تونه دو حساب داشته باشه.`;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set({
    ...store.get(),
    pendingPhone: { userId: user.id, newPhone: phone, code, expiresMs: nowMs + PHONE_CODE_MINUTES * 60_000, tries: 0 },
  });
  return { code };
}

export function confirmPhoneChange(user: EditableUser, code: string, reason: string, nowMs: number): string | null {
  const s = store.get();
  const p = s.pendingPhone;
  if (!p || p.userId !== user.id) return "اول کد رو بفرست.";
  if (nowMs > p.expiresMs) {
    store.set({ ...s, pendingPhone: null });
    return "کد منقضی شد — دوباره بفرست.";
  }
  if (!reason.trim()) return "دلیل تغییر رو بنویس.";
  if (toLatinDigits(code.trim()) !== p.code) {
    const tries = p.tries + 1;
    if (tries >= PHONE_CODE_TRIES) {
      store.set({ ...s, pendingPhone: null });
      logEvent({
        category: "امنیت",
        action: "لغو تغییر موبایل — کد اشتباه",
        target: user.name,
        severity: "warning",
        details: [{ label: "تلاش", value: `${toPersianDigits(tries)} بار` }],
      });
      return `${toPersianDigits(PHONE_CODE_TRIES)} بار کد اشتباه — تغییر لغو شد. اگه لازمه از اول شروع کن.`;
    }
    store.set({ ...s, pendingPhone: { ...p, tries } });
    return `کد اشتباهه (${toPersianDigits(PHONE_CODE_TRIES - tries)} فرصت دیگه).`;
  }
  const before = user.phone;
  const after = formatMobile(p.newPhone);
  store.set({
    ...s,
    pendingPhone: null,
    edits: { ...s.edits, [user.id]: { ...s.edits[user.id], phone: after } },
    notices: notice(
      s,
      user.id,
      `شماره‌ی موبایل حسابت از ${before} به ${after} تغییر کرد (پیامک به شماره‌ی قبلی هم رفت). اگه تو نبودی، همین الان به پشتیبانی خبر بده.`
    ),
  });
  logEvent({
    category: "امنیت",
    action: "تغییر موبایل کاربر",
    target: user.name,
    severity: "warning",
    details: [
      { label: "قبل", value: before },
      { label: "بعد", value: after },
      { label: "تأیید", value: "کد به شماره‌ی جدید" },
      { label: "دلیل", value: reason.trim() },
    ],
    href: `/admin/users?q=${encodeURIComponent(user.name)}`,
  });
  return null;
}

export function cancelPhoneChange() {
  store.set({ ...store.get(), pendingPhone: null });
}

// ---------- parent link (student must approve) ----------

export function requestParentLink(
  user: EditableUser,
  parentName: string,
  rawPhone: string,
  reason: string
): string | null {
  if (user.role !== "دانش‌آموز") return "وصل کردن والد فقط برای دانش‌آموزه.";
  if (parentName.trim().length < 2) return "اسم والد رو بنویس.";
  const phone = normalizeMobile(rawPhone);
  if (!phone) return "شماره‌ی والد باید ۱۱ رقم و با ۰۹ شروع بشه.";
  if (normalizeMobile(user.phone) === phone) return "شماره‌ی والد نمی‌تونه همون شماره‌ی خود دانش‌آموز باشه.";
  if (!reason.trim()) return "دلیل رو بنویس.";
  const s = store.get();
  if (s.parents.some((x) => x.userId === user.id && (x.status === "pending" || x.status === "linked")))
    return "این دانش‌آموز الان یک والد وصل‌شده یا درخواست باز داره.";
  const link: ParentLink = {
    userId: user.id,
    parentName: parentName.trim(),
    parentPhone: formatMobile(phone),
    status: "pending",
    by: currentAdminName(),
    at: `امروز، ${nowClock()}`,
  };
  store.set({ ...s, parents: [link, ...s.parents] });
  logEvent({
    category: "کاربران",
    action: "درخواست وصل کردن والد",
    target: user.name,
    severity: "info",
    details: [
      { label: "والد", value: `${link.parentName} (${link.parentPhone})` },
      { label: "دلیل", value: reason.trim() },
      { label: "وضعیت", value: "منتظر تأیید دانش‌آموز" },
    ],
  });
  return null;
}

/** The student answers from their own profile. */
export function answerParentLink(userId: string, approve: boolean, studentName: string) {
  const s = store.get();
  const link = s.parents.find((x) => x.userId === userId && x.status === "pending");
  if (!link) return;
  store.set({
    ...s,
    parents: s.parents.map((x) => (x === link ? { ...x, status: approve ? "linked" : "declined" } : x)),
  });
  logEvent({
    category: "کاربران",
    actor: studentName,
    actorRole: "دانش‌آموز",
    action: approve ? "تأیید وصل شدن والد" : "رد وصل شدن والد",
    target: studentName,
    severity: "info",
    details: [{ label: "والد", value: `${link.parentName} (${link.parentPhone})` }],
  });
}

export function removeParentLink(user: EditableUser, reason: string): string | null {
  if (!reason.trim()) return "دلیل جدا کردن والد رو بنویس.";
  const s = store.get();
  const link = s.parents.find((x) => x.userId === user.id && x.status === "linked");
  if (!link) return "والدی وصل نیست.";
  store.set({
    ...s,
    parents: s.parents.map((x) => (x === link ? { ...x, status: "removed" } : x)),
    notices: notice(s, user.id, `پشتیبانی دسترسی ${link.parentName} رو از حسابت برداشت — دلیل: ${reason.trim()}`),
  });
  logEvent({
    category: "کاربران",
    action: "جدا کردن والد",
    target: user.name,
    severity: "warning",
    details: [
      { label: "والد", value: `${link.parentName} (${link.parentPhone})` },
      { label: "دلیل", value: reason.trim() },
    ],
  });
  return null;
}

export function useParentLink(userId: string): ParentLink | undefined {
  return store.useValue().parents.find((x) => x.userId === userId && x.status !== "removed" && x.status !== "declined");
}

export function markNoticesSeen(userId: string) {
  const s = store.get();
  if (!s.notices.some((n) => n.userId === userId && !n.seen)) return;
  store.set({ ...s, notices: s.notices.map((n) => (n.userId === userId ? { ...n, seen: true } : n)) });
}

export function useNotices(userId: string): AccountNotice[] {
  const all = store.useValue().notices;
  return useMemo(() => all.filter((n) => n.userId === userId), [all, userId]);
}

export function markNoticeSeen(id: string) {
  const s = store.get();
  store.set({ ...s, notices: s.notices.map((n) => (n.id === id ? { ...n, seen: true } : n)) });
}
