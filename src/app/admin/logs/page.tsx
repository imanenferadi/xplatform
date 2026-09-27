"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ScrollText,
  UserCheck,
  Users,
  Wallet,
  ShieldAlert,
  Lock,
  LifeBuoy,
  Search,
  Download,
  ChevronDown,
  ArrowLeft,
  X,
  MonitorSmartphone,
} from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { FollowUpEditor } from "@/components/admin/AdminKit";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  type FollowUpStatus,
  type LogActorRole,
  type LogCategory,
  type LogSeverity,
  type PlatformLogEntry,
} from "@/lib/mock-data";
import { logsToCsv, updateFollowUp, useLogs } from "@/lib/admin-log-store";
import { cn, toPersianDigits } from "@/lib/utils";
import { rolesWith, seesLogCategory } from "@/lib/permissions";
import { useCan, useMe } from "@/lib/staff-store";
import { FOLLOW_UP_LABEL } from "@/lib/followup-store";

const CATEGORY_ICON: Record<LogCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  مشاوران: UserCheck,
  کاربران: Users,
  مالی: Wallet,
  شکایات: ShieldAlert,
  امنیت: Lock,
  پشتیبانی: LifeBuoy,
};
const CATEGORIES = Object.keys(CATEGORY_ICON) as LogCategory[];
const ROLES: LogActorRole[] = ["ادمین", "سیستم", "دانش‌آموز", "مشاور", "والد", "آموزشگاه"];

const SEVERITY: Record<LogSeverity, { label: string; tone: "neutral" | "warning" | "danger"; dot: string }> = {
  info: { label: "عادی", tone: "neutral", dot: "bg-text-500" },
  warning: { label: "هشدار", tone: "warning", dot: "bg-orange-500" },
  critical: { label: "بحرانی", tone: "danger", dot: "bg-red-500" },
};

const STATUS: Record<FollowUpStatus, { label: string; tone: "info" | "warning" | "success" }> = {
  new: { label: "جدید", tone: "info" },
  in_progress: { label: "در حال پیگیری", tone: "warning" },
  reviewed: { label: "بررسی‌شده", tone: "success" },
};

const TODAY = "۷ مهر ۱۴۰۵";
const selectClass = "h-9 rounded-x-pill border border-border bg-surface px-3 text-xs text-text-900";

export default function AdminLogsPage() {
  return (
    <AdminShell>
      <Suspense>
        <Logs />
      </Suspense>
    </AdminShell>
  );
}

// Other admin tabs link here with ?q=<name> ("همه در لاگ").
function Logs() {
  const me = useMe();
  const allLogs = useLogs();
  // Each role reads only its own log categories (auditor and مدیر کل: all).
  const logs = useMemo(() => allLogs.filter((l) => seesLogCategory(me.role, l.category)), [allLogs, me]);
  const categories = CATEGORIES.filter((c) => seesLogCategory(me.role, c));
  const [query, setQuery] = useState(useSearchParams().get("q") ?? "");
  const [category, setCategory] = useState<LogCategory | "همه">("همه");
  const [severity, setSeverity] = useState<LogSeverity | "همه">("همه");
  const [status, setStatus] = useState<FollowUpStatus | "همه">("همه");
  const [role, setRole] = useState<LogActorRole | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    return logs.filter(
      (l) =>
        (category === "همه" || l.category === category) &&
        (severity === "همه" || l.severity === severity) &&
        (status === "همه" || l.followUp.status === status) &&
        (role === "همه" || l.actorRole === role) &&
        (!q ||
          [l.actor, l.action, l.target, l.followUp.note, ...l.followUp.tags, ...l.details.map((d) => d.value)].some(
            (v) => v.includes(q)
          ))
    );
  }, [logs, query, category, severity, status, role]);

  // Group by calendar day, keeping the newest-first order.
  const byDay = useMemo(() => {
    const groups: { date: string; items: PlatformLogEntry[] }[] = [];
    for (const l of filtered) {
      const g = groups.find((x) => x.date === l.date);
      if (g) g.items.push(l);
      else groups.push({ date: l.date, items: [l] });
    }
    return groups;
  }, [filtered]);

  const todayCount = logs.filter((l) => l.date === TODAY).length;
  const openCount = logs.filter((l) => l.followUp.status !== "reviewed").length;
  const criticalOpen = logs.filter((l) => l.severity === "critical" && l.followUp.status !== "reviewed").length;
  const anyFilter = query || category !== "همه" || severity !== "همه" || status !== "همه" || role !== "همه";

  function exportCsv() {
    const blob = new Blob([logsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "x-platform-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setQuery("");
    setCategory("همه");
    setSeverity("همه");
    setStatus("همه");
    setRole("همه");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">لاگ فعالیت‌ها</h1>
        </div>
        <Button size="md" variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={15} /> خروجی CSV ({toPersianDigits(filtered.length)})
        </Button>
      </div>
      <p className="mb-5 text-sm text-text-500">
        هر کاری که روی پلتفرم انجام می‌شه، با جزئیات. خود رویداد قابل تغییر نیست؛ وضعیت پیگیری، مسئول، برچسب و یادداشت
        رو می‌تونی ویرایش کنی و هر ویرایش هم ثبت می‌شه.
      </p>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="رویداد امروز" value={todayCount} />
        <Stat label="نیاز به پیگیری" value={openCount} onClick={() => setStatus("new")} />
        <Stat
          label="بحرانیِ بررسی‌نشده"
          value={criticalOpen}
          danger={criticalOpen > 0}
          onClick={() => setSeverity("critical")}
        />
      </div>

      {/* Filters */}
      <div className="relative mb-3">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در نام، کار، هدف، جزئیات، برچسب یا یادداشت..."
          className="pr-11"
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["همه", ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
              category === c ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as LogSeverity | "همه")}
          aria-label="شدت"
          className={selectClass}
        >
          <option value="همه">همه‌ی شدت‌ها</option>
          {(Object.keys(SEVERITY) as LogSeverity[]).map((s) => (
            <option key={s} value={s}>
              {SEVERITY[s].label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as FollowUpStatus | "همه")}
          aria-label="وضعیت پیگیری"
          className={selectClass}
        >
          <option value="همه">همه‌ی وضعیت‌ها</option>
          {(Object.keys(STATUS) as FollowUpStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as LogActorRole | "همه")}
          aria-label="نقش انجام‌دهنده"
          className={selectClass}
        >
          <option value="همه">همه‌ی نقش‌ها</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {anyFilter && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <X size={12} /> حذف فیلترها
          </button>
        )}
        <span className="mr-auto text-xs text-text-500">
          <span className="tnum">{toPersianDigits(filtered.length)}</span> رویداد
        </span>
      </div>

      <div className="space-y-6">
        {byDay.map((g) => (
          <section key={g.date}>
            <h2 className="mb-2 text-xs font-bold text-text-500">
              {g.date}
              {g.date === TODAY && " — امروز"}
            </h2>
            <div className="space-y-2">
              {g.items.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  open={openId === log.id}
                  onToggle={() => setOpenId(openId === log.id ? null : log.id)}
                />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-500">رویدادی با این فیلترها پیدا نشد.</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
  onClick,
}: {
  label: string;
  value: number;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="rounded-x-md border border-border bg-surface p-3 text-right transition-colors enabled:hover:border-blue-300"
    >
      <div className={cn("tnum text-xl font-bold", danger ? "text-red-500" : "text-text-900")}>
        {toPersianDigits(value)}
      </div>
      <div className="text-xs text-text-500">{label}</div>
    </button>
  );
}

function LogRow({ log, open, onToggle }: { log: PlatformLogEntry; open: boolean; onToggle: () => void }) {
  const canFollowUp = useCan()("logs.followup");
  const Icon = CATEGORY_ICON[log.category];
  const sev = SEVERITY[log.severity];
  const st = STATUS[log.followUp.status];

  return (
    <Card className={cn(log.severity === "critical" && log.followUp.status !== "reviewed" && "border-red-500/40")}>
      <button type="button" onClick={onToggle} className="w-full text-right" aria-expanded={open}>
        <CardContent className="flex items-center gap-3 py-3.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
            <Icon size={15} className="text-text-700" />
            <span className={cn("absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full", sev.dot)} title={sev.label} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-text-900">
              <span className="font-medium">{log.actor}</span>
              <span className="text-[11px] text-text-500">({log.actorRole})</span>
              <span>— {log.action}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-500">
              <span className="truncate">{log.target}</span>
              {log.followUp.tags.map((t) => (
                <span key={t} className="rounded-x-pill bg-surface-2 px-2 py-0.5 text-[10px] text-text-700">
                  #{t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="tnum text-xs text-text-500">{log.time}</span>
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
          <ChevronDown size={16} className={cn("shrink-0 text-text-500 transition-transform", open && "rotate-180")} />
        </CardContent>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
          <EventDetails log={log} />
          {/* Remount after each save so the draft starts from the saved values. */}
          {canFollowUp ? (
            <FollowUpEditor
              key={log.followUp.history.length}
              value={log.followUp}
              onSave={(next) => updateFollowUp(log, next)}
            />
          ) : (
            <p className="flex items-center gap-1 text-xs text-text-500">
              <Lock size={12} /> پیگیری: {FOLLOW_UP_LABEL[log.followUp.status]} — ویرایش فقط برای{" "}
              {rolesWith("logs.followup")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function EventDetails({ log }: { log: PlatformLogEntry }) {
  const sev = SEVERITY[log.severity];
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-text-900">
        <Lock size={12} className="text-text-500" /> جزئیات رویداد
        <span className="font-normal text-text-500">(ثبت‌شده، غیرقابل ویرایش)</span>
      </div>
      <dl className="space-y-1.5 rounded-x-md bg-surface-2 p-3 text-xs">
        <Row label="زمان">
          {log.date}، ساعت <span className="tnum">{log.time}</span>
        </Row>
        <Row label="دسته">{log.category}</Row>
        <Row label="شدت">
          <Badge tone={sev.tone}>{sev.label}</Badge>
        </Row>
        <Row label="انجام‌دهنده">
          {log.actor} ({log.actorRole})
        </Row>
        <Row label="هدف">{log.target}</Row>
        {log.details.map((d) => (
          <Row key={d.label} label={d.label}>
            {d.value}
          </Row>
        ))}
        {log.device && (
          <Row label="دستگاه">
            <span className="flex items-center gap-1">
              <MonitorSmartphone size={12} /> {log.device}
            </span>
          </Row>
        )}
        <Row label="شناسه">
          <span dir="ltr" className="font-mono text-[11px]">
            {log.id}
          </span>
        </Row>
      </dl>
      {log.href && (
        <Link href={log.href} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
          رفتن به صفحه‌ی مرتبط <ArrowLeft size={12} />
        </Link>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-text-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-text-900">{children}</dd>
    </div>
  );
}
