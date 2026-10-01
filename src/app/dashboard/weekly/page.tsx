"use client";

import { BarChart3, LineChart } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { usePlacementDone } from "@/lib/placement-store";
import { WeeklySummary } from "@/components/app/WeeklySummary";
import { CopyWeeklyReport } from "@/components/app/CopyWeeklyReport";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { TrendChart } from "@/components/ui/TrendChart";
import {
  CURRENT_DAY_NAME,
  levelProfile,
  studentWeeklyHistory,
} from "@/lib/mock-data";
import { useMyCheckIns } from "@/lib/checkin-store";
import { aggregateWeek, formatStudyTime } from "@/lib/checkins";
import {
  formatHours,
  planProgress,
  useDoneIds,
  usePublishedWeek,
} from "@/lib/plan-store";
import { cn, toPersianDigits } from "@/lib/utils";

// «جمع هفته» and «روند پیشرفت» were two tabs showing halves of the same
// question — how is this week going, and is it better than before? One
// page now, with real numbers (reports + plan ticks) instead of fixed ones.
export default function WeeklyPage() {
  const checkIns = useMyCheckIns();
  const plan = usePublishedWeek("me", "this");
  const progress = planProgress(plan, useDoneIds(), CURRENT_DAY_NAME);
  const placementDone = usePlacementDone();
  const thisWeek = aggregateWeek(checkIns, "this");
  const lastWeek = aggregateWeek(checkIns, "last");
  const lastPoint = studentWeeklyHistory[studentWeeklyHistory.length - 1];
  const planDelta = progress.percent - lastPoint.planCompletionPercent;

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">جمع هفته و روند</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          این هفته چطور پیش رفته و نسبت به قبل بهتر شدی یا نه — همین عددها رو
          مشاورت هم می‌بینه.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Metric
            label="اجرای برنامه تا امروز"
            value={`${toPersianDigits(progress.percent)}٪`}
            sub={`${formatHours(progress.ticked)} از ${formatHours(progress.planned)} ساعت`}
            delta={planDelta}
            unit="٪"
          />
          <Metric
            label="مطالعه این هفته"
            value={formatStudyTime(thisWeek.totalMinutes)}
            sub={`هفته‌ی قبل کلاً ${formatStudyTime(lastWeek.totalMinutes)}`}
          />
          <Metric
            label="تست این هفته"
            value={toPersianDigits(thisWeek.totalTests)}
            sub={`هفته‌ی قبل کلاً ${toPersianDigits(lastWeek.totalTests)}`}
          />
        </div>

        <Card className="mt-4">
          <CardContent>
            <WeeklySummary checkIns={checkIns} audience="student" />
            <details className="mt-4 border-t border-border pt-3">
              <summary className="cursor-pointer text-xs font-medium text-blue-600">
                برای خانواده بفرست (متن آماده‌ی واتساپ و بله)
              </summary>
              <div className="mt-3">
                <CopyWeeklyReport studentId="me" name="ایمان" includeSleep />
              </div>
            </details>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <LineChart size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">
                روند اجرای برنامه — ۵ هفته‌ی اخیر
              </h2>
            </div>
            <TrendChart
              points={studentWeeklyHistory.map((w) => ({
                label: w.weekLabel,
                value: w.planCompletionPercent,
              }))}
            />
          </CardContent>
        </Card>

        {placementDone && (
          <Card className="mt-4">
            <CardContent>
              <h2 className="mb-4 text-sm font-bold text-text-900">
                تسلط بر مباحث (از تعیین سطح)
              </h2>
              <div className="space-y-4">
                {levelProfile.subjects.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-text-700">{s.name}</span>
                      <span className="tnum text-text-500">
                        {toPersianDigits(s.value)}٪
                      </span>
                    </div>
                    <ProgressBar
                      value={s.value}
                      tone={
                        s.value >= 75
                          ? "success"
                          : s.value >= 55
                            ? "brand"
                            : "warning"
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentShell>
  );
}

function Metric({
  label,
  value,
  sub,
  delta,
  unit = "",
}: {
  label: string;
  value: string;
  sub: string;
  delta?: number;
  unit?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="text-xs text-text-500">{label}</div>
        <div className="tnum mt-1 text-lg font-bold text-text-900">{value}</div>
        <div className="mt-0.5 text-xs text-text-500">{sub}</div>
        {delta !== undefined && delta !== 0 && (
          <div
            className={cn(
              "mt-0.5 text-xs",
              delta > 0 ? "text-mint-500" : "text-orange-500",
            )}
          >
            <span dir="ltr" className="tnum">
              {delta > 0 ? "+" : "−"}
              {toPersianDigits(Math.abs(delta))}
              {unit}
            </span>{" "}
            نسبت به هفته‌ی قبل
          </div>
        )}
      </CardContent>
    </Card>
  );
}
