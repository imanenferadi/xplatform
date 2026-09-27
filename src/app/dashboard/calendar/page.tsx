"use client";

import Link from "next/link";
import {
  CalendarDays,
  Video,
  Phone,
  FileText,
  ArrowLeft,
  Check,
  Moon,
  Upload,
  School,
  AlertTriangle,
} from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card } from "@/components/ui/Card";
import { CURRENT_DAY_NAME, WEEK_DAYS, mentors, weekExams, type PlanTask, type SessionMode } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";
import { useMySetup } from "@/lib/setup-store";
import { freeHours } from "@/lib/schedule";
import { formatHours, usePublishedWeek } from "@/lib/plan-store";
import { useWeekSessions } from "@/lib/session-store";
import { FixedSessionCard } from "@/components/app/FixedSession";
import type { Commitment } from "@/lib/mock-data";

type CalendarDay = {
  dayName: string;
  tasks: PlanTask[];
  session?: { time: string; mode: SessionMode; cancelled?: boolean; movedFrom?: string };
  exam?: { provider: string; name: string };
};

const dayTotal = (d: CalendarDay) => d.tasks.reduce((s, t) => s + t.hours, 0);
const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
const isPast = (d: CalendarDay) => WEEK_DAYS.indexOf(d.dayName) < todayIndex;

// Nightly/after-exam nudges, same idea as the mentor's «یادآوری‌ها» row.
const REMINDERS: Record<string, { text: string; href: string; icon: typeof Moon }[]> = {
  [CURRENT_DAY_NAME]: [{ text: "گزارش کار امشب", href: "/dashboard/report", icon: Moon }],
  جمعه: [{ text: "کارنامه‌ی آزمون رو آپلود کن", href: "/dashboard/karnameh", icon: Upload }],
};

// Same look as the mentor's week table (equal day columns, chips, faded
// past days), but the rows stay "kinds of commitment", not hours — a
// student plans in time blocks per subject, not a minute-by-minute grid.
function buildRows(schedule: Commitment[]): { label: string; render: (d: CalendarDay) => React.ReactNode }[] {
  return [
    {
      label: "مدرسه و کلاس",
      render: (d) => {
        const items = schedule.filter((c) => c.day === d.dayName);
        return (
          items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-x-md px-2.5 py-1.5",
                    c.kind === "school" ? "bg-surface-2 text-text-700" : "bg-blue-100 text-blue-600"
                  )}
                >
                  <div className="text-sm font-medium leading-snug text-text-900">{c.title}</div>
                  <div className="tnum text-xs">{toPersianDigits(`${c.start}–${c.end}`)}</div>
                </div>
              ))}
            </div>
          )
        );
      },
    },
    {
      label: "جلسه با مشاور",
      render: (d) => {
        if (!d.session) return null;
        const mentor = mentors[0];
        if (d.session.cancelled)
          return (
            <div className="rounded-x-md bg-red-500/10 px-2.5 py-2 text-xs text-red-500">
              <div className="tnum line-through">{d.session.time}</div>
              این هفته لغو شد
            </div>
          );
        const chip = (
          <>
            <div className="truncate text-sm font-medium text-text-900">{mentor.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs">
              {d.session.mode === "video" ? <Video size={12} /> : <Phone size={12} />}
              <span className="tnum">{d.session.time}</span>
              {isPast(d) && (
                <span className="flex items-center gap-0.5 text-mint-500">
                  <Check size={11} /> برگزار شد
                </span>
              )}
            </div>
            {d.session.movedFrom && (
              <div className="mt-0.5 text-[11px]">فقط این هفته (به‌جای {d.session.movedFrom})</div>
            )}
          </>
        );
        return isPast(d) || !mentor ? (
          <div className="rounded-x-md bg-blue-100 px-2.5 py-2 text-blue-600">{chip}</div>
        ) : (
          <Link
            href={`/session/${mentor.id}`}
            className="block rounded-x-md bg-blue-100 px-2.5 py-2 text-blue-600 transition-colors hover:bg-blue-600/20"
          >
            {chip}
          </Link>
        );
      },
    },
    {
      label: "آزمون",
      render: (d) =>
        d.exam && (
          <div className="rounded-x-md bg-orange-500/15 px-2.5 py-2 text-orange-500">
            <div className="flex items-center gap-1 text-sm font-medium">
              <FileText size={13} className="shrink-0" /> {d.exam.provider}
            </div>
            <div className="mt-0.5 text-xs leading-snug">{d.exam.name}</div>
          </div>
        ),
    },
    {
      label: "برنامه‌ی درسی",
      render: (d) =>
        d.tasks.length > 0 && (
          <div className="space-y-1.5">
            {d.tasks.map((t) => (
              <div key={t.id} className="rounded-x-md bg-surface-2 px-2.5 py-1.5">
                <div className="text-sm font-medium text-text-900">{t.subject}</div>
                <div className="text-xs text-text-500">
                  <span className="tnum">{formatHours(t.hours)}</span> ساعت
                </div>
              </div>
            ))}
          </div>
        ),
    },
    {
      label: "جمع ساعت",
      render: (d) => {
        const free = freeHours(schedule, d.dayName);
        const over = schedule.length > 0 && dayTotal(d) > free;
        return (
          dayTotal(d) > 0 && (
            <div>
              <span className="text-base font-bold text-text-900">
                <span className="tnum">{formatHours(dayTotal(d))}</span> ساعت
              </span>
              {schedule.length > 0 && (
                <div className={cn("mt-0.5 text-[11px]", over ? "font-medium text-orange-500" : "text-text-500")}>
                  {over && <AlertTriangle size={11} className="ml-0.5 inline" />}
                  از ~<span className="tnum">{formatHours(free)}</span> ساعت وقت آزاد
                </div>
              )}
            </div>
          )
        );
      },
    },
    {
      label: "یادآوری‌ها",
      render: (d) =>
        !isPast(d) &&
        (REMINDERS[d.dayName] ?? []).length > 0 && (
          <div className="space-y-1.5">
            {REMINDERS[d.dayName].map((r) => (
              <Link
                key={r.text}
                href={r.href}
                className="flex items-start gap-1 rounded-x-md bg-mint-500/10 px-2.5 py-1.5 text-xs leading-snug text-mint-500 transition-colors hover:bg-mint-500/20"
              >
                <r.icon size={12} className="mt-px shrink-0" />
                {r.text}
              </Link>
            ))}
          </div>
        ),
    },
  ];
}

export default function CalendarPage() {
  const { schedule } = useMySetup();
  const ROWS = buildRows(schedule);
  const plan = usePublishedWeek("me", "this");
  const mySession = useWeekSessions().find((x) => x.studentId === "me");
  const studentWeekCalendar: CalendarDay[] = WEEK_DAYS.map((dayName) => ({
    dayName,
    tasks: plan?.days[dayName] ?? [],
    session:
      mySession?.day === dayName
        ? {
            time: mySession.time,
            mode: mySession.mode,
            cancelled: mySession.cancelled,
            movedFrom: mySession.movedFrom,
          }
        : undefined,
    exam: weekExams[dayName],
  }));
  const overloaded = studentWeekCalendar.filter(
    (d) => schedule.length > 0 && !isPast(d) && dayTotal(d) > freeHours(schedule, d.dayName)
  );
  const weekTotal = studentWeekCalendar.reduce((s, d) => s + dayTotal(d), 0);
  const remaining = studentWeekCalendar.filter((d) => !isPast(d)).reduce((s, d) => s + dayTotal(d), 0);
  const exam = studentWeekCalendar.find((d) => d.exam);

  return (
    <StudentShell>
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تقویم هفته</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          <span className="tnum">{formatHours(weekTotal)}</span> ساعت برنامه‌ی این هفته ·{" "}
          <span className="font-medium text-text-900">
            <span className="tnum">{formatHours(remaining)}</span> ساعت
          </span>{" "}
          از امروز تا آخر هفته
          {exam && (
            <>
              {" "}
              · آزمون {exam.exam!.provider}: {exam.dayName}
            </>
          )}
        </p>
        <FixedSessionCard studentId="me" by="student" className="mb-4" />

        {overloaded.length > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-xs leading-[1.8] text-text-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              برنامه‌ی {overloaded.map((d) => d.dayName).join(" و ")} از وقت آزادت بیشتره (با توجه به ساعت مدرسه و
              کلاس‌هات). به مشاورت بگو تا جابه‌جاش کنه.
            </span>
          </div>
        )}

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed border-collapse text-right">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky right-0 z-10 w-32 bg-surface p-4 text-sm font-normal text-text-500" />
                  {studentWeekCalendar.map((d) => {
                    const isToday = d.dayName === CURRENT_DAY_NAME;
                    return (
                      <th
                        key={d.dayName}
                        className={cn(
                          "border-r border-border/60 p-4 text-sm font-bold",
                          isToday ? "bg-blue-100 text-blue-600" : isPast(d) ? "text-text-500" : "text-text-900"
                        )}
                      >
                        {d.dayName}
                        {isToday && <div className="mt-0.5 text-xs font-normal">امروز</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-0">
                    <th
                      scope="row"
                      className="sticky right-0 z-10 whitespace-nowrap bg-surface p-4 align-top text-sm font-medium text-text-700"
                    >
                      {row.label}
                    </th>
                    {studentWeekCalendar.map((d) => (
                      <td
                        key={d.dayName}
                        className={cn(
                          "h-20 border-r border-border/60 p-2.5 align-top",
                          d.dayName === CURRENT_DAY_NAME && "bg-blue-100/40",
                          isPast(d) && "opacity-60"
                        )}
                      >
                        {row.render(d) || null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-blue-100" /> جلسه (کلیک ← ورود به جلسه)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-orange-500/30" /> آزمون
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-surface-2" /> درس و ساعتش
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-mint-500/20" /> یادآوری (کلیک ← انجامش بده)
          </span>
        </div>

        <Link
          href="/dashboard/setup#schedule"
          className="mt-4 flex items-center justify-between rounded-x-lg border border-border bg-surface p-4 text-sm font-medium text-text-900 transition-colors hover:bg-surface-2"
        >
          <span className="flex items-center gap-2">
            <School size={16} className="text-blue-600" /> ویرایش ساعت مدرسه و کلاس‌ها
          </span>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        <Link
          href="/dashboard/plan"
          className="mt-2 flex items-center justify-between rounded-x-lg border border-border bg-surface p-4 text-sm font-medium text-text-900 transition-colors hover:bg-surface-2"
        >
          مبحث و جزئیات کامل هر روز
          <ArrowLeft size={16} className="text-text-500" />
        </Link>
      </div>
    </StudentShell>
  );
}
