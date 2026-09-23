import Link from "next/link";
import { CalendarDays, Video, Phone, FileText, ArrowLeft } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { studentWeekCalendar } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TODAY_INDEX = 1; // "یکشنبه", matching /dashboard/plan's TODAY_INDEX convention

export default function CalendarPage() {
  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تقویم هفته</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          جلسه‌ها، آزمون دوهفتگی، و خلاصه‌ی برنامه‌ی هر روز — یک‌جا.
        </p>

        <div className="space-y-2">
          {studentWeekCalendar.map((d, i) => {
            const isToday = i === TODAY_INDEX;
            return (
              <Card key={d.dayName} className={cn(isToday && "border-blue-600/40 bg-blue-100/40")}>
                <CardContent className="flex items-center gap-3 py-3.5">
                  <div className="w-16 shrink-0">
                    <div className={cn("text-sm font-medium", isToday ? "text-blue-600" : "text-text-900")}>
                      {d.dayName}
                    </div>
                    {isToday && <div className="text-[10px] text-text-500">امروز</div>}
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {d.session && (
                      <span className="flex items-center gap-1.5 rounded-x-pill bg-blue-100 px-2.5 py-1 text-xs text-blue-600">
                        {d.session.mode === "video" ? <Video size={12} /> : <Phone size={12} />}
                        {d.session.time} با {d.session.mentorName}
                      </span>
                    )}
                    {d.exam && (
                      <span className="flex items-center gap-1.5 rounded-x-pill bg-orange-500/15 px-2.5 py-1 text-xs text-orange-500">
                        <FileText size={12} />
                        {d.exam.provider} — {d.exam.name}
                      </span>
                    )}
                    {d.taskSummary && (
                      <span className="tnum text-xs text-text-500">{d.taskSummary}</span>
                    )}
                    {!d.session && !d.exam && !d.taskSummary && (
                      <span className="text-xs text-text-500">برنامه‌ای ثبت نشده</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Link
          href="/dashboard/plan"
          className="mt-4 flex items-center justify-between rounded-x-lg border border-border bg-surface p-4 text-sm font-medium text-text-900 transition-colors hover:bg-surface-2"
        >
          دیدن جزئیات کامل هر روز
          <ArrowLeft size={16} className="text-text-500" />
        </Link>
      </div>
    </StudentShell>
  );
}
