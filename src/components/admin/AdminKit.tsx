"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  X,
  History,
  Search,
  Download,
  ScrollText,
  ArrowLeft,
  Lock,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type FollowUpStatus, type LogFollowUp } from "@/lib/mock-data";
import { can, rolesWith, seesLogCategory, type Perm } from "@/lib/permissions";
import { useCan, useMe, useStaff } from "@/lib/staff-store";
import {
  EMPTY_FOLLOW_UP,
  saveFollowUp,
  useFollowUps,
} from "@/lib/followup-store";
import { useLogs } from "@/lib/admin-log-store";
import { cn, toPersianDigits } from "@/lib/utils";

// Shared building blocks for every admin tab, so users, transactions,
// mentor applications, payouts and logs all expand, filter, export and
// track follow-up the same way.

export const FOLLOW_UP_STATUS: Record<
  FollowUpStatus,
  { label: string; tone: "info" | "warning" | "success" }
> = {
  new: { label: "جدید", tone: "info" },
  in_progress: { label: "در حال پیگیری", tone: "warning" },
  reviewed: { label: "بررسی‌شده", tone: "success" },
};

// ---------------------------------------------------------------- rows

export function AdminRow({
  summary,
  open,
  onToggle,
  children,
  className,
}: {
  summary: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-right"
        aria-expanded={open}
      >
        <CardContent className="flex items-center gap-3 py-3.5">
          <div className="min-w-0 flex-1">{summary}</div>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-text-500 transition-transform",
              open && "rotate-180",
            )}
          />
        </CardContent>
      </button>
      {open && <div className="border-t border-border p-4">{children}</div>}
    </Card>
  );
}

export function DetailList({
  title,
  rows,
}: {
  title?: React.ReactNode;
  rows: [string, React.ReactNode][];
}) {
  return (
    <div>
      {title && (
        <div className="mb-2 text-xs font-bold text-text-900">{title}</div>
      )}
      <dl className="space-y-1.5 rounded-x-md bg-surface-2 p-3 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-28 shrink-0 text-text-500">{label}</dt>
            <dd className="min-w-0 flex-1 text-text-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------------------------------------------------------- follow-up

/** Follow-up of one entity ("user:u-1"); `exists` is false until first saved. */
export function useEntityFollowUp(key: string): {
  value: LogFollowUp;
  exists: boolean;
} {
  const all = useFollowUps();
  return all[key]
    ? { value: all[key], exists: true }
    : { value: EMPTY_FOLLOW_UP, exists: false };
}

/** Status badge + tags for a collapsed row — only once someone has followed up. */
export function FollowUpBadges({ entityKey }: { entityKey: string }) {
  const { value, exists } = useEntityFollowUp(entityKey);
  if (!exists) return null;
  const st = FOLLOW_UP_STATUS[value.status];
  return (
    <span className="flex flex-wrap items-center gap-1">
      <Badge tone={st.tone}>{st.label}</Badge>
      {value.tags.map((t) => (
        <span
          key={t}
          className="rounded-x-pill bg-surface-2 px-2 py-0.5 text-xs text-text-700"
        >
          #{t}
        </span>
      ))}
    </span>
  );
}

export function EntityFollowUp({ entityKey }: { entityKey: string }) {
  const { value } = useEntityFollowUp(entityKey);
  const allowed = useCan();
  if (!allowed("logs.followup"))
    return (
      <div className="text-xs">
        <div className="mb-2 font-bold text-text-900">پیگیری</div>
        <p className="text-text-700">
          {FOLLOW_UP_STATUS[value.status].label}
          {value.assignee && ` · مسئول: ${value.assignee}`}
        </p>
        {value.note && <p className="mt-1 text-text-500">«{value.note}»</p>}
        <p className="mt-2 flex items-center gap-1 text-text-500">
          <Lock size={11} /> ویرایش پیگیری: فقط {rolesWith("logs.followup")}
        </p>
      </div>
    );
  return (
    <FollowUpSlot
      key={value.history.length}
      value={value}
      onSave={(next) => saveFollowUp(entityKey, value, next)}
    />
  );
}

// An untouched follow-up is one small link, not a whole form in every row.
function FollowUpSlot({
  value,
  onSave,
}: {
  value: LogFollowUp;
  onSave: (next: Omit<LogFollowUp, "history">) => void;
}) {
  const untouched =
    value.history.length === 0 &&
    !value.assignee &&
    !value.note &&
    value.tags.length === 0;
  const [open, setOpen] = useState(!untouched);
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 self-start text-xs text-text-500 hover:text-blue-600"
      >
        <Plus size={12} /> پیگیری (مسئول، برچسب، یادداشت)
      </button>
    );
  // Remount after each save (key above) so the draft starts from the saved values.
  return <FollowUpEditor value={value} onSave={onSave} />;
}

export function FollowUpEditor({
  value: saved,
  onSave,
}: {
  value: LogFollowUp;
  onSave: (next: Omit<LogFollowUp, "history">) => void;
}) {
  const [draft, setDraft] = useState({
    status: saved.status,
    assignee: saved.assignee,
    tags: saved.tags,
    note: saved.note,
  });
  const [tagInput, setTagInput] = useState("");
  const assignees = useStaff()
    .filter((m) => m.active && m.role !== "supervisor" && m.role !== "auditor")
    .map((m) => m.name);

  const dirty =
    draft.status !== saved.status ||
    draft.assignee !== saved.assignee ||
    draft.note !== saved.note ||
    draft.tags.join("،") !== saved.tags.join("،");

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !draft.tags.includes(t))
      setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    setTagInput("");
  }

  return (
    <div>
      <div className="mb-2 text-xs font-bold text-text-900">پیگیری</div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(FOLLOW_UP_STATUS) as FollowUpStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, status: s }))}
              className={cn(
                "rounded-x-md border px-2 py-1.5 text-xs transition-colors",
                draft.status === s
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700",
              )}
            >
              {FOLLOW_UP_STATUS[s].label}
            </button>
          ))}
        </div>

        <select
          value={draft.assignee}
          onChange={(e) =>
            setDraft((d) => ({ ...d, assignee: e.target.value }))
          }
          aria-label="مسئول پیگیری"
          className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
        >
          <option value="">بدون مسئول</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1.5">
          {draft.tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-x-pill bg-surface-2 px-2 py-0.5 text-xs text-text-700"
            >
              #{t}
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    tags: d.tags.filter((x) => x !== t),
                  }))
                }
                aria-label={`حذف برچسب ${t}`}
                className="text-text-500 hover:text-red-500"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="+ برچسب (Enter)"
            aria-label="افزودن برچسب"
            className="h-7 min-w-24 flex-1 bg-transparent text-xs text-text-900 outline-none placeholder:text-text-500"
          />
        </div>

        <textarea
          value={draft.note}
          onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          rows={2}
          placeholder="یادداشت داخلی — مثلاً «با والدین تماس گرفته شد، منتظر جواب»"
          aria-label="یادداشت"
          className="w-full rounded-x-sm border border-border bg-surface p-2.5 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
        />

        <div className="flex items-center gap-2">
          <Button size="md" disabled={!dirty} onClick={() => onSave(draft)}>
            ذخیره‌ی پیگیری
          </Button>
          {dirty && (
            <button
              type="button"
              onClick={() =>
                setDraft({
                  status: saved.status,
                  assignee: saved.assignee,
                  tags: saved.tags,
                  note: saved.note,
                })
              }
              className="text-xs text-text-500 hover:text-text-900"
            >
              لغو تغییرات
            </button>
          )}
        </div>

        {saved.history.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-text-700">
              <History size={11} /> تاریخچه‌ی ویرایش
            </div>
            <ol className="space-y-1 text-xs text-text-500">
              {[...saved.history].reverse().map((h, i) => (
                <li key={i}>
                  <span className="text-text-700">{h.by}</span> · {h.at} ·{" "}
                  {h.change}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------ activity (logs)

/** Recent log events about this person — straight from the audit log. */
export function EntityActivity({
  match,
  limit = 5,
}: {
  match: string;
  limit?: number;
}) {
  const me = useMe();
  // Only the log categories this role may read.
  const logs = useLogs().filter(
    (l) =>
      (l.target.includes(match) || l.actor === match) &&
      seesLogCategory(me.role, l.category),
  );
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-bold text-text-900">
          <ScrollText size={12} className="text-text-500" /> تاریخچه‌ی فعالیت
        </span>
        {logs.length > 0 && can(me.role, "logs.view") && (
          <Link
            href={`/admin/logs?q=${encodeURIComponent(match)}`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            همه در لاگ ({toPersianDigits(logs.length)}) <ArrowLeft size={11} />
          </Link>
        )}
      </div>
      {logs.length === 0 ? (
        <p className="text-xs text-text-500">
          رویدادی درباره‌ی {match} در لاگ نیست.
        </p>
      ) : (
        <ol className="space-y-1 text-xs">
          {logs.slice(0, limit).map((l) => (
            <li key={l.id} className="flex gap-2">
              <span className="tnum w-28 shrink-0 text-text-500">
                {l.date.replace(" ۱۴۰۵", "")}، {l.time}
              </span>
              <span className="text-text-700">
                {l.actor} — {l.action}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// --------------------------------------------------- required reasons

/** Negative actions (suspend, reject, …) must say why — it goes in the log. */
export function ReasonPrompt({
  title,
  reasons,
  confirmLabel,
  noteRequired = false,
  notePlaceholder = "توضیح بیشتر (اختیاری)",
  onConfirm,
  onCancel,
}: {
  title: string;
  reasons?: string[];
  confirmLabel: string;
  noteRequired?: boolean;
  notePlaceholder?: string;
  onConfirm: (reason: string, note: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function confirm() {
    if (reasons && !reason)
      return setError("دلیل رو انتخاب کن — توی لاگ ثبت می‌شه.");
    if (noteRequired && !note.trim()) return setError("این بخش اجباریه.");
    onConfirm(reason, note.trim());
  }

  return (
    <div className="rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3">
      <div className="mb-2 text-sm font-medium text-text-900">{title}</div>
      <div className="space-y-2">
        {reasons && (
          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            aria-label="دلیل"
            className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
          >
            <option value="">انتخاب دلیل</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        <input
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError("");
          }}
          placeholder={notePlaceholder}
          aria-label="توضیح"
          className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button size="md" onClick={confirm}>
            {confirmLabel}
          </Button>
          <Button size="md" variant="secondary" onClick={onCancel}>
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ toolbar

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-500"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-11"
      />
    </div>
  );
}

export function FilterSelect<T extends string>({
  value,
  onChange,
  label,
  options,
}: {
  value: T | "همه";
  onChange: (v: T | "همه") => void;
  label: string;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T | "همه")}
      aria-label={label}
      className="h-9 rounded-x-pill border border-border bg-surface px-3 text-xs text-text-900"
    >
      <option value="همه">همه‌ی {label}‌ها</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ExportButton({
  count,
  onExport,
}: {
  count: number;
  onExport: () => void;
}) {
  return (
    <Button
      size="md"
      variant="secondary"
      onClick={onExport}
      disabled={count === 0}
    >
      <Download size={15} /> خروجی CSV ({toPersianDigits(count)})
    </Button>
  );
}

/** Renders its children only for roles holding `perm`; otherwise says who can. */
export function Allowed({
  perm,
  children,
}: {
  perm: Perm;
  children: React.ReactNode;
}) {
  const allowed = useCan();
  if (allowed(perm)) return children;
  return (
    <p className="flex items-center gap-1 text-xs text-text-500">
      <Lock size={12} /> این کار فقط با نقش {rolesWith(perm)} انجام می‌شه.
    </p>
  );
}
