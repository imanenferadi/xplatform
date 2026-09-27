"use client";

import { useState } from "react";
import { Clock, ListChecks, CalendarCheck, BedDouble } from "lucide-react";
import { CURRENT_DAY_NAME, WEEK_DAYS, WEEK_LABELS, type NightlyCheckIn } from "@/lib/mock-data";
import { SHORT_SLEEP_MINUTES, aggregateWeek, formatClockTime, formatStudyTime } from "@/lib/checkins";
import { cn, toPersianDigits } from "@/lib/utils";

type Week = NightlyCheckIn["week"];

// Totals every nightly check-in of a week subject by subject (hours + tests).
// Same component on the student's «جمع هفته» and the mentor's case file.
export function WeeklySummary({
  checkIns,
  audience,
  showSleep = true,
}: {
  checkIns: NightlyCheckIn[];
  audience: "student" | "mentor" | "parent";
  showSleep?: boolean; // the parent panel hides sleep unless the student shares it
}) {
  const [week, setWeek] = useState<Week>("this");
  const summary = aggregateWeek(checkIns, week);
  const maxMinutes = summary.subjects[0]?.minutes ?? 0;
  const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
  const daysSoFar = week === "this" ? todayIndex + 1 : WEEK_DAYS.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(["this", "last"] as Week[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeek(w)}
              className={cn(
                "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                week === w ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
              )}
            >
              {w === "this" ? "این هفته (تا امروز)" : "هفته‌ی قبل"}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-500">{WEEK_LABELS[week]}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Clock} label="ساعت مطالعه" value={formatStudyTime(summary.totalMinutes)} />
        <Stat icon={ListChecks} label="تست زده‌شده" value={toPersianDigits(summary.totalTests)} />
        <Stat
          icon={CalendarCheck}
          label="شب‌های با گزارش"
          value={`${toPersianDigits(summary.checkedInDays.size)} از ${toPersianDigits(daysSoFar)}`}
        />
      </div>

      {/* Which nights had a check-in */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d, i) => {
          const future = week === "this" && i > todayIndex;
          const done = summary.checkedInDays.has(d);
          const slept = summary.sleep.byDay.get(d);
          return (
            <div key={d} className="text-center">
              <div
                className={cn(
                  "mx-auto h-2 rounded-x-pill",
                  done ? "bg-mint-500" : future ? "bg-surface-2" : "bg-red-500/40"
                )}
              />
              <div className="mt-1 text-xs text-text-500">{d.slice(0, 2)}</div>
              {showSleep && slept != null && (
                <div
                  className={cn("text-xs", slept < SHORT_SLEEP_MINUTES ? "font-bold text-orange-500" : "text-text-500")}
                  title={`خواب: ${formatStudyTime(slept)}`}
                >
                  <span className="tnum">{toPersianDigits(Math.round((slept / 60) * 10) / 10)}</span>س
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showSleep && summary.sleep.nights > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-x-md bg-surface-2 px-3 py-2 text-xs text-text-700">
          <span className="flex items-center gap-1 font-medium text-text-900">
            <BedDouble size={13} className="text-blue-600" /> خواب
          </span>
          <span>میانگین {formatStudyTime(summary.sleep.avgMinutes)}</span>
          <span>
            بیداری حدود <span className="tnum">{formatClockTime(summary.sleep.avgWake)}</span>
          </span>
          {summary.sleep.shortNights > 0 && (
            <span className="text-orange-500">{toPersianDigits(summary.sleep.shortNights)} شب زیر ۶ ساعت</span>
          )}
        </div>
      )}

      {summary.subjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-500">
          {audience === "student" ? "این هفته هنوز گزارش کاری نفرستادی." : "این هفته هنوز گزارش کاری ثبت نشده."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-500">
                <th className="py-2 text-right font-normal">درس</th>
                <th className="py-2 text-right font-normal">زمان</th>
                <th className="py-2 text-center font-normal">تست</th>
                <th className="py-2 text-center font-normal">روز</th>
              </tr>
            </thead>
            <tbody>
              {summary.subjects.map((s) => (
                <tr key={s.subject} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 font-medium text-text-900">{s.subject}</td>
                  <td className="py-2.5">
                    <div className="text-text-700">{formatStudyTime(s.minutes)}</div>
                    <div className="mt-1 h-1.5 w-full max-w-40 overflow-hidden rounded-x-pill bg-surface-2">
                      <div
                        className="h-full rounded-x-pill bg-blue-600"
                        style={{ width: `${(s.minutes / maxMinutes) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="tnum py-2.5 text-center text-text-700">{toPersianDigits(s.tests)}</td>
                  <td className="tnum py-2.5 text-center text-text-500">{toPersianDigits(s.days)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-bold text-text-900">
                <td className="py-2.5">جمع</td>
                <td className="py-2.5">{formatStudyTime(summary.totalMinutes)}</td>
                <td className="tnum py-2.5 text-center">{toPersianDigits(summary.totalTests)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-x-md bg-surface-2 p-3">
      <div className="flex items-center gap-1 text-xs text-text-500">
        <Icon size={12} /> {label}
      </div>
      <div className="mt-1 text-sm font-bold text-text-900">{value}</div>
    </div>
  );
}
