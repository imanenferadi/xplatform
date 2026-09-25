import Link from "next/link";
import { CalendarDays, Video, Phone, FileText, ArrowLeft } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card } from "@/components/ui/Card";
import { CURRENT_DAY_NAME, studentWeekCalendar, type CalendarDay } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";

function formatHours(h: number): string {
  return toPersianDigits(Number.isInteger(h) ? h : h.toFixed(1));
}

// Days are columns, kinds of commitment are rows — the whole week reads at
// a glance. On a phone the row labels stay pinned while the days scroll.
const ROWS: { label: string; render: (d: CalendarDay) => React.ReactNode }[] = [
  {
    label: "جلسه با مشاور",
    render: (d) =>
      d.session && (
        <span className="inline-flex items-center gap-1 rounded-x-sm bg-blue-100 px-1.5 py-1 text-[11px] leading-tight text-blue-600">
          {d.session.mode === "video" ? <Video size={11} /> : <Phone size={11} />}
          <span className="tnum">{d.session.time}</span>
        </span>
      ),
  },
  {
    label: "آزمون",
    render: (d) =>
      d.exam && (
        <span className="inline-flex items-start gap-1 rounded-x-sm bg-orange-500/15 px-1.5 py-1 text-[11px] leading-tight text-orange-500">
          <FileText size={11} className="mt-px shrink-0" />
          {d.exam.provider} — {d.exam.name}
        </span>
      ),
  },
  {
    label: "برنامه‌ی درسی",
    render: (d) =>
      d.tasks.length > 0 && (
        <ul className="space-y-1">
          {d.tasks.map((t) => (
            <li
              key={t.subject}
              className="flex items-center justify-between gap-1.5 whitespace-nowrap text-xs text-text-700"
            >
              <span>{t.subject}</span>
              <span className="text-text-500">
                <span className="tnum">{formatHours(t.hours)}</span> س
              </span>
            </li>
          ))}
        </ul>
      ),
  },
  {
    label: "جمع ساعت",
    render: (d) => {
      const total = d.tasks.reduce((s, t) => s + t.hours, 0);
      return (
        total > 0 && (
          <span className="text-sm font-bold text-text-900">
            <span className="tnum">{formatHours(total)}</span> ساعت
          </span>
        )
      );
    },
  },
];

export default function CalendarPage() {
  const weekTotal = studentWeekCalendar.reduce((s, d) => s + d.tasks.reduce((a, t) => a + t.hours, 0), 0);

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تقویم هفته</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          جلسه‌ها، آزمون دوهفتگی و ساعت هر درس، کل هفته در یک جدول. جمع برنامه‌ی این هفته:{" "}
          <span className="font-medium text-text-900">
            <span className="tnum">{formatHours(weekTotal)}</span> ساعت
          </span>
        </p>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-right">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky right-0 z-10 w-24 bg-surface p-3 text-xs font-normal text-text-500" />
                  {studentWeekCalendar.map((d) => {
                    const isToday = d.dayName === CURRENT_DAY_NAME;
                    return (
                      <th
                        key={d.dayName}
                        className={cn(
                          "p-3 text-xs font-medium",
                          isToday ? "bg-blue-100 text-blue-600" : "text-text-900",
                        )}
                      >
                        {d.dayName}
                        {isToday && <div className="text-[10px] font-normal">امروز</div>}
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
                      className="sticky right-0 z-10 bg-surface p-3 align-top text-xs font-medium text-text-700"
                    >
                      {row.label}
                    </th>
                    {studentWeekCalendar.map((d) => (
                      <td
                        key={d.dayName}
                        className={cn("p-2.5 align-top", d.dayName === CURRENT_DAY_NAME && "bg-blue-100/40")}
                      >
                        {row.render(d) || <span className="text-xs text-text-500/50">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Link
          href="/dashboard/plan"
          className="mt-4 flex items-center justify-between rounded-x-lg border border-border bg-surface p-4 text-sm font-medium text-text-900 transition-colors hover:bg-surface-2"
        >
          مبحث و جزئیات کامل هر روز
          <ArrowLeft size={16} className="text-text-500" />
        </Link>
      </div>
    </StudentShell>
  );
}
