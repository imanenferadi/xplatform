"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentShell } from "@/components/app/StudentShell";
import { PlanDayView } from "@/components/app/PlanDayView";
import { WeekCalendar } from "@/components/app/WeekCalendar";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CURRENT_DAY_NAME,
  PLAN_DEADLINE_DAY,
  PLAN_WEEK_LABELS,
  WEEK_DAYS,
  mentors,
  type PlanWeek,
} from "@/lib/mock-data";
import {
  formatHours,
  useDoneIds,
  usePublishedWeek,
  weekHours,
} from "@/lib/plan-store";
import { cn } from "@/lib/utils";

type View = "day" | "week";

// «برنامه» and the old «تقویم» were two pages showing the same week. One
// page now: «روز» for the day's blocks and ticks, «هفته» for the whole week
// next to school hours, the fixed session and the exam.
export default function PlanPage() {
  return (
    <StudentShell>
      <Suspense>
        <Plan />
      </Suspense>
    </StudentShell>
  );
}

function Plan() {
  const mentor = mentors[0];
  const [view, setView] = useState<View>(
    useSearchParams().get("view") === "week" ? "week" : "day",
  );
  const [week, setWeek] = useState<PlanWeek>("this");
  const [selected, setSelected] = useState(CURRENT_DAY_NAME);
  const plan = usePublishedWeek("me", week);
  const doneIds = useDoneIds();

  function switchWeek(w: PlanWeek) {
    setWeek(w);
    setSelected(w === "this" ? CURRENT_DAY_NAME : WEEK_DAYS[0]);
  }

  function openDay(day: string) {
    setWeek("this");
    setSelected(day);
    setView("day");
  }

  return (
    <div
      className={cn(
        "mx-auto px-4 py-6 md:py-10",
        view === "week" ? "max-w-5xl" : "max-w-2xl",
      )}
    >
      {/* Title and the day/week switch share one row; the line under it is one short sentence. */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-text-900">برنامه</h1>
        <div
          role="tablist"
          aria-label="نمای برنامه"
          className="flex rounded-x-pill border border-border bg-surface p-1"
        >
          {(["day", "week"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-x-pill px-4 py-1.5 text-sm font-medium transition-colors",
                view === v
                  ? "bg-blue-600 text-white"
                  : "text-text-700 hover:bg-surface-2",
              )}
            >
              {v === "day" ? "روز" : "هفته"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-text-500">
        {plan ? (
          <>
            نوشته‌ی {mentor.name} · جمعاً{" "}
            <span className="tnum">{formatHours(weekHours(plan.days))}</span>{" "}
            ساعت
            <span className="hidden sm:inline"> · ارسال: {plan.sentAt}</span>
          </>
        ) : (
          PLAN_WEEK_LABELS[week]
        )}
      </p>

      {view === "week" ? (
        <div className="mt-5">
          <WeekCalendar onOpenDay={openDay} />
        </div>
      ) : (
        <>
          <div className="mb-3 mt-3 flex gap-1.5">
            {(["this", "next"] as PlanWeek[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => switchWeek(w)}
                aria-pressed={week === w}
                className={cn(
                  "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  week === w
                    ? "border-blue-600 bg-blue-100 text-text-900"
                    : "border-border bg-surface text-text-700",
                )}
              >
                {w === "this" ? "این هفته" : "هفته‌ی بعد"}
              </button>
            ))}
          </div>

          {!plan ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="font-medium text-text-900">
                  {mentor.name} هنوز برنامه‌ی {PLAN_WEEK_LABELS[week]} رو
                  نفرستاده
                </p>
                <p className="mt-1 text-sm text-text-500">
                  برنامه‌ی هر هفته تا {PLAN_DEADLINE_DAY} شب می‌رسه. اگه ساعت
                  مدرسه یا کتاب‌هات عوض شده،{" "}
                  <Link
                    href="/dashboard/setup"
                    className="text-blue-600 hover:underline"
                  >
                    اطلاعات شروع
                  </Link>{" "}
                  رو به‌روز کن تا روی وقت واقعی‌ات بچینه.
                </p>
              </CardContent>
            </Card>
          ) : (
            <PlanDayView
              plan={plan}
              week={week}
              selected={selected}
              onSelect={setSelected}
              doneIds={doneIds}
            />
          )}
        </>
      )}
    </div>
  );
}
