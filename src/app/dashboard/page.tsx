"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  CalendarClock,
  Flame,
  Moon,
  FileText,
  Timer,
  Focus,
  Hourglass,
  ClipboardCheck,
} from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { KONKUR_DATE, REPORT_REACTIONS, daysUntilKonkur, mentors, studentStreakDays } from "@/lib/mock-data";
import { formatHours, useDoneIds, usePublishedWeek, useTodayTasks, weekHours } from "@/lib/plan-store";
import { nextSessionLabel, useFixedSession } from "@/lib/session-store";
import { aggregateWeek, formatStudyTime } from "@/lib/checkins";
import { setupSteps, useMySetup } from "@/lib/setup-store";
import { useMyCheckIns } from "@/lib/checkin-store";
import { useReportFeedback } from "@/lib/feedback-store";
import { byRecency } from "@/lib/reports";
import { toPersianDigits, cn } from "@/lib/utils";

export default function DashboardPage() {
  const mentor = mentors[0];
  const completed = useDoneIds();
  const tasks = useTodayTasks().map((t) => ({ ...t, done: completed.has(t.id) }));
  const week = usePublishedWeek("me", "this");
  const plannedHours = week ? weekHours(week.days) : 0;
  const checkIns = useMyCheckIns();
  const studiedMinutes = aggregateWeek(checkIns, "this").totalMinutes;
  const session = useFixedSession("me");
  const nextTask = tasks.find((t) => !t.done);
  const steps = setupSteps(useMySetup());
  const stepsDone = steps.filter((st) => st.done).length;
  // The most recent report the mentor reacted to.
  const feedbackMap = useReportFeedback();
  const lastWithFeedback = byRecency(checkIns).find((c) => feedbackMap[c.id]);
  const feedback = lastWithFeedback ? feedbackMap[lastWithFeedback.id] : null;
  const todoCount = tasks.filter((t) => !t.done).length;

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-900">سلام ایمان 👋</h1>
            <p className="mt-1 text-sm text-text-500">
              {todoCount > 0 ? `امروز ${toPersianDigits(todoCount)} کار داری` : "همه‌ی کارهای امروز انجام شد"}
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-x-md border border-border bg-surface px-3 py-2"
            title={
              KONKUR_DATE.estimated
                ? `تاریخ تخمینی (${KONKUR_DATE.label}) — هنوز سنجش رسماً اعلام نکرده`
                : KONKUR_DATE.label
            }
          >
            <Hourglass size={16} className="text-orange-500" />
            <div>
              <div className="text-sm font-bold text-text-900">
                <span className="tnum">{toPersianDigits(daysUntilKonkur())}</span> روز تا کنکور
              </div>
              <div className="text-[10px] text-text-500">
                {KONKUR_DATE.label}
                {KONKUR_DATE.estimated && " · تخمینی"}
              </div>
            </div>
          </div>
        </div>

        {stepsDone < steps.length && (
          <Link
            href="/dashboard/setup"
            className="mt-5 block rounded-x-lg border border-blue-600/30 bg-surface p-4 transition-colors hover:bg-surface-2"
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck size={18} className="shrink-0 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-900">
                  <span className="tnum">{toPersianDigits(steps.length - stepsDone)}</span> قدم تا شروع کامل
                </div>
                <div className="text-xs text-text-500">
                  {steps
                    .filter((st) => !st.done)
                    .map((st) => st.label)
                    .join("، ")}{" "}
                  — مشاورت برای برنامه‌نویسی لازمشون داره.
                </div>
              </div>
              <ArrowLeft size={16} className="text-text-500" />
            </div>
            <div className="mt-3 flex gap-1">
              {steps.map((st) => (
                <div
                  key={st.key}
                  className={cn("h-1.5 flex-1 rounded-x-pill", st.done ? "bg-mint-500" : "bg-surface-2")}
                />
              ))}
            </div>
          </Link>
        )}

        {feedback && lastWithFeedback && (
          <Card className="mt-4">
            <CardContent className="flex items-start gap-3">
              <span className="text-2xl leading-none">{REPORT_REACTIONS[feedback.reaction].emoji}</span>
              <div className="flex-1">
                <div className="text-xs text-text-500">
                  {mentor.name} روی گزارش کار {lastWithFeedback.date} — {feedback.at}
                </div>
                <div className="mt-0.5 text-sm font-medium text-text-900">
                  {REPORT_REACTIONS[feedback.reaction].label}
                </div>
                {feedback.comment && <p className="mt-1 text-sm leading-[1.8] text-text-700">«{feedback.comment}»</p>}
                {feedback.reaction === "lets_talk" && (
                  <Link
                    href="/chat"
                    className={buttonVariants({ size: "md", variant: "secondary", className: "mt-2" })}
                  >
                    <MessageCircle size={14} /> جواب بده
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero — one tap into distraction-free focus mode on the next task */}
        {nextTask && (
          <Card className="mt-5 border-blue-600/20 bg-blue-100">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-text-500">کار بعدی</div>
                <div className="font-bold text-text-900">{nextTask.topic || nextTask.subject}</div>
                <div className="tnum mt-1 text-xs text-text-500">
                  {formatHours(nextTask.hours)} ساعت · {nextTask.subject}
                </div>
              </div>
              <Link href="/dashboard/focus" className={buttonVariants({ size: "md" })}>
                <Focus size={16} />
                حالت «فقط الان»
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Secondary cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarClock size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-500">جلسه‌ی بعدی با {mentor.name}</div>
                <div className="text-sm font-medium text-text-900">
                  {session ? nextSessionLabel(session) : "هنوز وقت ثابت نداری"}
                </div>
                <Link href="/dashboard/calendar" className="text-[11px] text-blue-600 hover:underline">
                  تغییر وقت ثابت
                </Link>
              </div>
              <Link href={`/session/${mentor.id}`} className={buttonVariants({ size: "md" })}>
                ورود به جلسه
              </Link>
            </CardContent>
          </Card>
          <Link href="/chat">
            <Card interactive>
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                  <MessageCircle size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-xs text-text-500">پیام خوانده‌نشده</div>
                  <div className="text-sm font-medium text-text-900">۱ پیام از {mentor.name}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Weekly progress */}
        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-900">پیشرفت این هفته</h3>
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <Flame size={14} />
                <span className="tnum">{toPersianDigits(studentStreakDays)}</span> شب پشت‌سرهم گزارش
              </span>
            </div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-text-700">ساعت مطالعه (از گزارش کارها)</span>
              <span className="tnum text-text-500">
                {formatStudyTime(studiedMinutes)} از {formatHours(plannedHours)} ساعت برنامه
              </span>
            </div>
            <ProgressBar value={plannedHours ? Math.min(100, (studiedMinutes / 60 / plannedHours) * 100) : 0} />
          </CardContent>
        </Card>

        {/* Today's tasks */}
        <h2 className="mb-3 mt-6 flex items-center justify-between text-sm font-bold text-text-900">
          برنامه‌ی امروز
          <Link href="/dashboard/plan" className="text-xs font-normal text-blue-600 hover:underline">
            کل هفته
          </Link>
        </h2>
        {tasks.length === 0 && (
          <p className="rounded-x-md bg-surface-2 p-4 text-center text-sm text-text-500">
            {mentor.name} برای امروز برنامه‌ای ننوشته — استراحت.
          </p>
        )}
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", t.done ? "bg-mint-500" : "bg-border")} />
                <div className="flex-1">
                  <div className={cn("text-sm font-medium", t.done ? "text-text-500 line-through" : "text-text-900")}>
                    {t.subject}
                    {t.topic && <span className="font-normal text-text-500"> — {t.topic}</span>}
                  </div>
                  <div className="tnum text-xs text-text-500">{formatHours(t.hours)} ساعت</div>
                </div>
                {t.done ? (
                  <Badge tone="success">انجام شد</Badge>
                ) : (
                  <Link
                    href={`/dashboard/focustimer?task=${t.id}`}
                    className={buttonVariants({ size: "md", variant: "secondary" })}
                  >
                    <Timer size={15} />
                    شروع
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nightly check-in — replaces the mentor's Telegram group report */}
        <Link
          href="/dashboard/report"
          className="mt-4 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900/10">
            <Moon size={18} className="text-navy-900" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">روتین شب: گزارش کار امشب رو بفرست</div>
            <div className="text-xs text-text-500">یک دقیقه — درس‌ها، غلط‌ها و خواب، یکجا برای {mentor.name}</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        {/* Focus timer — quick access, since it's not in the mobile bottom nav (already full). */}
        <Link
          href="/dashboard/focustimer"
          className="mt-3 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Timer size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">می‌خوای فوکوس کنی؟</div>
            <div className="text-xs text-text-500">تایمر فوکوس و استراحت رو بزن</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        {/* Karnameh upload — the student is the one who gets the exam
            result from Kanoon/Gaj, so they should be able to send it
            straight from here instead of via Telegram. */}
        <Link
          href="/dashboard/karnameh"
          className="mt-3 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">کارنامه‌ی آزمونت رو گرفتی؟</div>
            <div className="text-xs text-text-500">عکسشو بذار، می‌ره برای {mentor.name}</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>
      </div>
    </StudentShell>
  );
}
