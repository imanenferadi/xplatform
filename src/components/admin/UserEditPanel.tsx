"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Lock,
  Pencil,
  Smartphone,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { mentors } from "@/lib/mock-data";
import { rolesWith, type Perm } from "@/lib/permissions";
import { useCan } from "@/lib/staff-store";
import {
  GRADES,
  GROUPS,
  PHONE_CODE_MINUTES,
  cancelPhoneChange,
  confirmPhoneChange,
  formatMobile,
  removeParentLink,
  requestParentLink,
  startPhoneChange,
  updateUserField,
  useParentLink,
  useUserEditsState,
  type EditableUser,
} from "@/lib/user-edits-store";
import { cn, toPersianDigits } from "@/lib/utils";

const input =
  "h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

type Editing = "name" | "city" | "academic" | "phone" | "parent" | null;

// «ویرایش اطلاعات»: each field on its own, reason required, logged
// before/after, and the account owner is told. Phone needs a code sent to
// the new number; a parent link waits for the student's approval.
export function UserEditPanel({
  user,
  users,
}: {
  user: EditableUser;
  users: EditableUser[];
}) {
  const allowed = useCan();
  const [editing, setEditing] = useState<Editing>(null);
  const parent = useParentLink(user.id);
  const isStudent = user.role === "دانش‌آموز";
  const anyEdit =
    allowed("users.edit") ||
    allowed("users.editPhone") ||
    allowed("users.editAcademic");

  const row = (
    key: Exclude<Editing, null>,
    label: string,
    value: React.ReactNode,
    perm: Perm,
    lockedWhy?: string,
  ) => (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-24 shrink-0 text-text-500">{label}</span>
      <span className="min-w-0 flex-1 text-text-900">{value}</span>
      {lockedWhy ? (
        <span className="text-text-500" title={lockedWhy}>
          <Lock size={12} />
        </span>
      ) : allowed(perm) ? (
        <button
          type="button"
          onClick={() => setEditing(editing === key ? null : key)}
          aria-label={`ویرایش ${label}`}
          className="rounded-x-sm p-1 text-text-500 hover:text-blue-600"
        >
          <Pencil size={13} />
        </button>
      ) : (
        <span className="text-text-500" title={`فقط ${rolesWith(perm)}`}>
          <Lock size={12} />
        </span>
      )}
    </div>
  );

  const done = (msg: string) => {
    toast(msg);
    setEditing(null);
  };

  return (
    <div className="rounded-x-md border border-border p-3 text-xs">
      <div className="mb-1 font-bold text-text-900">اطلاعات فردی</div>
      <p className="mb-2 text-text-500">
        {anyEdit ? (
          "برای تغییر، مداد رو بزن — دلیل می‌خواد، در لاگ ثبت می‌شه و به صاحب حساب خبر داده می‌شه."
        ) : (
          <span className="flex items-center gap-1">
            <Lock size={11} /> فقط مشاهده — ویرایش با نقش{" "}
            {rolesWith("users.edit")}.
          </span>
        )}
      </p>

      {row(
        "name",
        "نام",
        user.name,
        "users.edit",
        user.role === "مشاور"
          ? "اسم مشاور از پروفایل عمومی میاد؛ خودش از «پروفایل من» عوضش می‌کنه."
          : undefined,
      )}
      {editing === "name" && (
        <TextEdit
          initial={user.name}
          onSave={(v, r) => updateUserField(user, "name", v, r)}
          onDone={() => done("نام ذخیره شد")}
          onCancel={() => setEditing(null)}
        />
      )}

      {row("city", "شهر", user.city, "users.edit")}
      {editing === "city" && (
        <TextEdit
          initial={user.city}
          onSave={(v, r) => updateUserField(user, "city", v, r)}
          onDone={() => done("شهر ذخیره شد")}
          onCancel={() => setEditing(null)}
        />
      )}

      {isStudent &&
        row(
          "academic",
          "پایه و رشته",
          `${user.grade} — ${user.group}`,
          "users.editAcademic",
        )}
      {isStudent && editing === "academic" && (
        <AcademicEdit
          user={user}
          onDone={() => done("پایه و رشته ذخیره شد")}
          onCancel={() => setEditing(null)}
        />
      )}

      {row(
        "phone",
        "موبایل",
        <span dir="ltr" className="tnum">
          {user.phone}
        </span>,
        "users.editPhone",
      )}
      {editing === "phone" && (
        <PhoneEdit
          user={user}
          users={users}
          onDone={() => done("شماره‌ی موبایل عوض شد")}
          onCancel={() => setEditing(null)}
        />
      )}

      {isStudent &&
        row(
          "parent",
          "والد",
          parent ? (
            <>
              {parent.parentName} <span dir="ltr">{parent.parentPhone}</span>
              <span
                className={cn(
                  parent.status === "pending"
                    ? "text-orange-500"
                    : "text-mint-500",
                )}
              >
                {" "}
                ·{" "}
                {parent.status === "pending" ? "منتظر تأیید دانش‌آموز" : "وصل"}
              </span>
            </>
          ) : (
            <span className="text-text-500">وصل نیست</span>
          ),
          "users.edit",
        )}
      {isStudent && editing === "parent" && (
        <ParentEdit
          user={user}
          onDone={(m) => done(m)}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Reason({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 160))}
      placeholder="دلیل تغییر (اجباری) — مثلاً «طبق تیکت T-1043، اشتباه تایپی»"
      aria-label="دلیل تغییر"
      className={input}
    />
  );
}

function Actions({
  error,
  onSave,
  onCancel,
  label = "ذخیره",
}: {
  error: string;
  onSave: () => void;
  onCancel: () => void;
  label?: string;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="md" onClick={onSave}>
          {label}
        </Button>
        <button type="button" onClick={onCancel} className="text-text-500">
          انصراف
        </button>
      </div>
    </>
  );
}

function TextEdit({
  initial,
  onSave,
  onDone,
  onCancel,
}: {
  initial: string;
  onSave: (value: string, reason: string) => string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
      <input
        value={value}
        onChange={(e) => (setValue(e.target.value), setError(""))}
        aria-label="مقدار جدید"
        className={input}
      />
      <Reason value={reason} onChange={(v) => (setReason(v), setError(""))} />
      <Actions
        error={error}
        onCancel={onCancel}
        onSave={() => {
          const err = onSave(value, reason);
          if (err) setError(err);
          else onDone();
        }}
      />
    </div>
  );
}

function AcademicEdit({
  user,
  onDone,
  onCancel,
}: {
  user: EditableUser;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [grade, setGrade] = useState(user.grade ?? "");
  const [group, setGroup] = useState<string>(user.group ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const mentor = mentors.find((m) => m.id === user.mentorId);
  const mismatch = mentor && group && mentor.group !== group;

  function save() {
    if (grade === user.grade && group === user.group)
      return setError("چیزی عوض نشده.");
    for (const [field, v] of [
      ["grade", grade],
      ["group", group],
    ] as const) {
      if (v === user[field]) continue;
      const err = updateUserField(user, field, v, reason);
      if (err) return setError(err);
    }
    onDone();
  }

  return (
    <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={grade}
          onChange={(e) => (setGrade(e.target.value), setError(""))}
          aria-label="پایه"
          className={input}
        >
          {GRADES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select
          value={group}
          onChange={(e) => (setGroup(e.target.value), setError(""))}
          aria-label="رشته"
          className={input}
        >
          {GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      {mismatch && (
        <p className="flex items-start gap-1 text-orange-500">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          مشاور فعلی ({mentor.name} — {mentor.group}) با رشته‌ی {group} جور
          نیست. بعد از ذخیره،{" "}
          <Link
            href={`/admin/reassign?student=${user.id}`}
            className="underline"
          >
            مشاورش رو عوض کن
          </Link>
          .
        </p>
      )}
      <Reason value={reason} onChange={(v) => (setReason(v), setError(""))} />
      <Actions error={error} onSave={save} onCancel={onCancel} />
    </div>
  );
}

function PhoneEdit({
  user,
  users,
  onDone,
  onCancel,
}: {
  user: EditableUser;
  users: EditableUser[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const { pendingPhone } = useUserEditsState();
  const pending = pendingPhone?.userId === user.id ? pendingPhone : null;
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!pending)
    return (
      <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
        <input
          value={phone}
          onChange={(e) => (
            setPhone(e.target.value.slice(0, 20)),
            setError("")
          )}
          dir="ltr"
          inputMode="tel"
          placeholder="09xx xxx xxxx"
          aria-label="شماره‌ی جدید"
          className={cn(input, "tnum text-left")}
        />
        <Actions
          label="فرستادن کد به شماره‌ی جدید"
          error={error}
          onCancel={onCancel}
          onSave={() => {
            // Date.now() in the handler, not during render.
            const r = startPhoneChange(user, phone, users, Date.now());
            if (typeof r === "string") setError(r);
          }}
        />
      </div>
    );

  return (
    <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
      <p className="flex items-center gap-1 text-text-700">
        <Smartphone size={13} /> کد ۶ رقمی به{" "}
        <span dir="ltr" className="tnum">
          {formatMobile(pending.newPhone)}
        </span>{" "}
        فرستاده شد ({toPersianDigits(PHONE_CODE_MINUTES)} دقیقه اعتبار). از
        کاربر بپرس.
      </p>
      <p className="rounded-x-sm border border-dashed border-border p-2 text-text-500">
        پیامک شبیه‌سازی‌شده (فقط در نسخه‌ی نمایشی دیده می‌شه): کد{" "}
        <span className="tnum font-bold text-text-900">
          {toPersianDigits(pending.code)}
        </span>
      </p>
      <input
        value={code}
        onChange={(e) => (setCode(e.target.value.slice(0, 6)), setError(""))}
        dir="ltr"
        inputMode="numeric"
        placeholder="کد ۶ رقمی"
        aria-label="کد تأیید"
        className={cn(input, "tnum text-left")}
      />
      <Reason value={reason} onChange={(v) => (setReason(v), setError(""))} />
      <Actions
        label="تأیید و تغییر شماره"
        error={error}
        onCancel={() => {
          cancelPhoneChange();
          onCancel();
        }}
        onSave={() => {
          const err = confirmPhoneChange(user, code, reason, Date.now());
          if (err) setError(err);
          else onDone();
        }}
      />
    </div>
  );
}

function ParentEdit({
  user,
  onDone,
  onCancel,
}: {
  user: EditableUser;
  onDone: (msg: string) => void;
  onCancel: () => void;
}) {
  const link = useParentLink(user.id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (link?.status === "linked")
    return (
      <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
        <p className="text-text-700">
          جدا کردن {link.parentName} از حساب {user.name} (فوری انجام می‌شه و به
          دانش‌آموز خبر داده می‌شه):
        </p>
        <Reason value={reason} onChange={(v) => (setReason(v), setError(""))} />
        <Actions
          label="جدا کردن والد"
          error={error}
          onCancel={onCancel}
          onSave={() => {
            const err = removeParentLink(user, reason);
            if (err) setError(err);
            else onDone("والد جدا شد");
          }}
        />
      </div>
    );

  if (link?.status === "pending")
    return (
      <p className="mb-2 rounded-x-sm bg-surface-2 p-2.5 text-text-700">
        درخواست وصل شدن {link.parentName} منتظر تأیید خود {user.name}ه — تا
        تأیید نکنه، والد به چیزی دسترسی نداره.
      </p>
    );

  return (
    <div className="mb-2 space-y-2 rounded-x-sm bg-surface-2 p-2.5">
      <p className="flex items-center gap-1 text-text-700">
        <UsersIcon size={13} /> والد فقط بعد از تأیید خود دانش‌آموز وصل می‌شه.
      </p>
      <input
        value={name}
        onChange={(e) => (setName(e.target.value.slice(0, 40)), setError(""))}
        placeholder="اسم والد — مثلاً مادر ایمان"
        aria-label="اسم والد"
        className={input}
      />
      <input
        value={phone}
        onChange={(e) => (setPhone(e.target.value.slice(0, 20)), setError(""))}
        dir="ltr"
        inputMode="tel"
        placeholder="09xx xxx xxxx"
        aria-label="موبایل والد"
        className={cn(input, "tnum text-left")}
      />
      <Reason value={reason} onChange={(v) => (setReason(v), setError(""))} />
      <Actions
        label="فرستادن برای تأیید دانش‌آموز"
        error={error}
        onCancel={onCancel}
        onSave={() => {
          const err = requestParentLink(user, name, phone, reason);
          if (err) setError(err);
          else onDone("درخواست برای تأیید دانش‌آموز فرستاده شد");
        }}
      />
    </div>
  );
}
