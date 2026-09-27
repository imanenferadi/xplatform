"use client";

import { useState } from "react";
import { ShieldCheck, Plus, Lock } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Allowed } from "@/components/admin/AdminKit";
import { mentors } from "@/lib/mock-data";
import { ROLE_META, type StaffRole } from "@/lib/permissions";
import { MIN_SUPER_ADMINS, addStaff, updateStaff, useCan, useMe, useStaff, type StaffMember } from "@/lib/staff-store";
import { logEvent } from "@/lib/admin-log-store";
import { cn, toPersianDigits } from "@/lib/utils";

const ROLES = Object.keys(ROLE_META) as StaffRole[];
const fieldClass =
  "h-9 rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none focus:border-blue-600";
const mentorNames = (ids: string[]) => ids.map((id) => mentors.find((x) => x.id === id)?.name).join("، ") || "—";

// Who's on the team and what each can do. Only مدیر کل edits; every change
// needs a reason and lands in the «امنیت» log.
export default function StaffPage() {
  const staff = useStaff();
  const me = useMe();
  const canManage = useCan()("staff.manage");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("edu_support");
  const [addError, setAddError] = useState("");
  const supers = staff.filter((m) => m.role === "super" && m.active).length;

  function add() {
    if (!name.trim()) return setAddError("اسم رو بنویس.");
    if (staff.some((m) => m.name === name.trim())) return setAddError("کارمندی با همین اسم هست.");
    addStaff(name.trim(), role);
    logEvent({
      category: "امنیت",
      action: "افزودن کارمند",
      target: name.trim(),
      severity: "warning",
      details: [{ label: "نقش", value: ROLE_META[role].label }],
      href: "/admin/staff",
    });
    setName("");
    setAddError("");
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">کارکنان و نقش‌ها</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          هر نفر فقط دسترسی نقش خودش رو داره. نقش خودت رو نمی‌تونی عوض کنی و همیشه حداقل{" "}
          <span className="tnum">{toPersianDigits(MIN_SUPER_ADMINS)}</span> مدیر کل فعال می‌مونه (الان{" "}
          <span className="tnum">{toPersianDigits(supers)}</span>).
        </p>

        <div className="mb-5 grid gap-2 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r} className="rounded-x-md border border-border bg-surface p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-900">{ROLE_META[r].label}</span>
                <span className="tnum text-text-500">
                  {toPersianDigits(staff.filter((m) => m.role === r && m.active).length)} نفر
                </span>
              </div>
              <div className="mt-0.5 text-text-500">{ROLE_META[r].desc}</div>
            </div>
          ))}
        </div>

        <Card>
          <ul className="divide-y divide-border/60">
            {staff.map((m) => (
              <StaffRow key={m.id} member={m} isMe={m.id === me.id} canManage={canManage} />
            ))}
          </ul>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <h2 className="mb-3 text-sm font-bold text-text-900">افزودن کارمند</h2>
            <Allowed perm="staff.manage">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.slice(0, 40));
                    setAddError("");
                  }}
                  placeholder="اسم"
                  aria-label="اسم کارمند جدید"
                  className={cn(fieldClass, "flex-1")}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  aria-label="نقش کارمند جدید"
                  className={fieldClass}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_META[r].label}
                    </option>
                  ))}
                </select>
                <Button size="md" onClick={add}>
                  <Plus size={14} /> افزودن
                </Button>
              </div>
              {addError && <p className="mt-2 text-xs text-red-500">{addError}</p>}
            </Allowed>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function StaffRow({ member: m, isMe, canManage }: { member: StaffMember; isMe: boolean; canManage: boolean }) {
  const [role, setRole] = useState<StaffRole>(m.role);
  const [active, setActive] = useState(m.active);
  const [mentorIds, setMentorIds] = useState<string[]>(m.mentorIds ?? []);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const mentorsChanged = role === "supervisor" && mentorIds.join() !== (m.mentorIds ?? []).join();
  const dirty = role !== m.role || active !== m.active || mentorsChanged;

  function save() {
    if (!reason.trim()) return setError("دلیل تغییر رو بنویس — در لاگ امنیت ثبت می‌شه.");
    const err = updateStaff(m.id, { role, active, ...(role === "supervisor" ? { mentorIds } : {}) });
    if (err) return setError(err);
    logEvent({
      category: "امنیت",
      action: "تغییر دسترسی کارمند",
      target: m.name,
      severity: "warning",
      details: [
        ...(role !== m.role ? [{ label: "نقش", value: `${ROLE_META[m.role].label} ← ${ROLE_META[role].label}` }] : []),
        ...(active !== m.active ? [{ label: "وضعیت", value: active ? "فعال شد" : "غیرفعال شد" }] : []),
        ...(mentorsChanged ? [{ label: "مشاورهای زیر نظر", value: mentorNames(mentorIds) }] : []),
        { label: "دلیل", value: reason.trim() },
      ],
      href: "/admin/staff",
    });
    setReason("");
    setError("");
    setSaved(true);
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text-900">{m.name}</span>
        {isMe && <Badge tone="info">خودت</Badge>}
        {!m.active && <Badge tone="neutral">غیرفعال</Badge>}
        <span className="text-xs text-text-500">· {ROLE_META[m.role].label}</span>
        {m.role === "supervisor" && (
          <span className="text-xs text-text-500">· زیر نظر: {mentorNames(m.mentorIds ?? [])}</span>
        )}
      </div>

      {canManage && !isMe && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as StaffRole);
                setSaved(false);
                setError("");
              }}
              aria-label={`نقش ${m.name}`}
              className={fieldClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_META[r].label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-text-700">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => {
                  setActive(e.target.checked);
                  setSaved(false);
                  setError("");
                }}
              />
              فعال
            </label>
          </div>
          {role === "supervisor" && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {mentors.map((x) => (
                <label key={x.id} className="flex items-center gap-1 rounded-x-pill border border-border px-2.5 py-1">
                  <input
                    type="checkbox"
                    checked={mentorIds.includes(x.id)}
                    onChange={(e) =>
                      setMentorIds((ids) => (e.target.checked ? [...ids, x.id] : ids.filter((i) => i !== x.id)))
                    }
                  />
                  {x.name}
                </label>
              ))}
            </div>
          )}
          {dirty && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value.slice(0, 120));
                  setError("");
                }}
                placeholder="دلیل تغییر (اجباری)"
                aria-label={`دلیل تغییر ${m.name}`}
                className={cn(fieldClass, "flex-1")}
              />
              <Button size="md" onClick={save}>
                ذخیره
              </Button>
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {saved && !dirty && <p className="text-xs text-mint-500">ذخیره شد و در لاگ امنیت ثبت شد.</p>}
        </div>
      )}
      {canManage && isMe && (
        <p className="mt-1 flex items-center gap-1 text-xs text-text-500">
          <Lock size={11} /> دسترسی خودت رو نمی‌تونی تغییر بدی.
        </p>
      )}
    </li>
  );
}
