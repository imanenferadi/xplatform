"use client";

import Link from "next/link";
import { AlertTriangle, CalendarX, ChevronLeft, Moon } from "lucide-react";
import { SupervisorShell } from "@/components/app/Supervisor";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getRiskInfo, mentorQuality, mentorStudents, mentors, nightlyCheckIns } from "@/lib/mock-data";
import { computeQuality } from "@/lib/quality";
import { useChurn } from "@/lib/churn-store";
import { usePlans } from "@/lib/plan-store";
import { useReportFeedback } from "@/lib/feedback-store";
import { useMyCheckIns } from "@/lib/checkin-store";
import { byRecency } from "@/lib/reports";
import { useSupervisor } from "@/lib/staff-store";
import { cn, toPersianDigits } from "@/lib/utils";

// In this demo only سارا's students have case-file data.
const MENTOR_OF_STUDENTS = "sara-mohammadi";

// The supervisor's home: the mentors they oversee, how each is doing, and
// the students who need a second look. Read-only; the only action is a
// note to the mentor (from a student's page).
export default function SupervisorHome() {
  const me = useSupervisor();
  const { responses } = useChurn();
  const plans = usePlans();
  const feedback = useReportFeedback();
  const mineLatest = byRecency(useMyCheckIns())[0];
  const reports = [...(mineLatest ? [mineLatest] : []), ...nightlyCheckIns];
  const scope = me?.mentorIds ?? [];

  return (
    <SupervisorShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="text-lg font-bold text-text-900">مشاورهای زیر نظر</h1>
        <p className="mt-1 text-sm text-text-500">
          پرونده‌ها فقط‌خواندنی‌اند. گفتگوها، یادداشت خصوصی مشاور و پرداخت‌ها برای سرپرست نمایش داده نمی‌شن.
        </p>

        {scope.length === 0 && (
          <p className="mt-6 rounded-x-md bg-surface-2 p-4 text-sm text-text-500">
            هنوز مشاوری به تو سپرده نشده — از مدیر کل بخواه.
          </p>
        )}

        {scope.map((mentorId) => {
          const mentor = mentors.find((m) => m.id === mentorId);
          const q = mentorQuality.find((x) => x.mentorId === mentorId);
          if (!mentor) return null;
          const row = q ? computeQuality(mentor, q, responses) : null;
          const students = mentorId === MENTOR_OF_STUDENTS ? mentorStudents : [];
          return (
            <Card key={mentorId} className="mt-4">
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-text-900">{mentor.name}</h2>
                  {row && (
                    <span
                      className={cn(
                        "tnum text-xs font-bold",
                        row.score >= 80 ? "text-mint-500" : row.score >= 60 ? "text-orange-500" : "text-red-500"
                      )}
                    >
                      کیفیت {toPersianDigits(row.score)}
                    </span>
                  )}
                  {row?.flags.map((f) => (
                    <Badge key={f} tone="danger">
                      {f}
                    </Badge>
                  ))}
                </div>

                {students.length === 0 ? (
                  <p className="mt-3 text-xs text-text-500">
                    پرونده‌ی دانش‌آموزهای این مشاور در نسخه‌ی نمایشی موجود نیست.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-border/60">
                    {students.map((s) => {
                      const risk = getRiskInfo(s);
                      const planReady = Boolean(plans[s.id]?.next.published);
                      const waiting = reports.filter(
                        (r) => r.studentId === s.id && !feedback[r.id] && !r.mentorSeen
                      ).length;
                      return (
                        <li key={s.id}>
                          <Link
                            href={`/supervisor/students/${s.id}`}
                            className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-text-900">{s.name}</span>
                                <Badge tone={risk.level}>{risk.label}</Badge>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-500">
                                {!planReady && (
                                  <span className="flex items-center gap-1 text-orange-500">
                                    <CalendarX size={12} /> برنامه‌ی هفته‌ی بعد نرفته
                                  </span>
                                )}
                                {waiting > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Moon size={12} /> {toPersianDigits(waiting)} گزارش بی‌بازخورد
                                  </span>
                                )}
                                {risk.reason && (
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle size={12} /> {risk.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-text-500" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SupervisorShell>
  );
}
