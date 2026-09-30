"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  CalendarClock,
  Flame,
  Moon,
  Timer,
  Hourglass,
  ClipboardCheck,
  Repeat,
  Sparkles,
} from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  KONKUR_DATE,
  REPORT_REACTIONS,
  daysUntilKonkur,
  mentors,
  studentStreakDays,
} from "@/lib/mock-data";
import {
  formatHours,
  useDoneIds,
  usePublishedWeek,
  useTodayTasks,
  weekHours,
} from "@/lib/plan-store";
import {
  nextSessionLabel,
  useFixedSession,
  useUpcoming,
} from "@/lib/session-store";
import { aggregateWeek, formatStudyTime } from "@/lib/checkins";
import { useUnread } from "@/lib/chat-store";
import { useDueMistakes } from "@/lib/mistakes-store";
import { useProfile } from "@/lib/profile-store";
import { usePlacementDone } from "@/lib/placement-store";
import { setupSteps, useMySetup } from "@/lib/setup-store";
import { useMyCheckIns } from "@/lib/checkin-store";
import { useReportFeedback } from "@/lib/feedback-store";
import { byRecency } from "@/lib/reports";
import { toPersianDigits, cn } from "@/lib/utils";

export default function DashboardPage() {
  const mentor = mentors[0];
  const completed = useDoneIds();
  const tasks = useTodayTasks().map((t) => ({
    ...t,
    done: completed.has(t.id),
  }));
  const week = usePublishedWeek("me", "this");
  const plannedHours = week ? weekHours(week.days) : 0;
  const checkIns = useMyCheckIns();
  const studiedMinutes = aggregateWeek(checkIns, "this").totalMinutes;
  const session = useFixedSession("me");
  const upcoming = useUpcoming("me");
  const dueMistakes = useDueMistakes();
  const profile = useProfile();
  const unread = useUnread("me", "student");
  const nextTask = tasks.find((t) => !t.done);
  const steps = setupSteps(useMySetup());
  const stepsDone = steps.filter((st) => st.done).length;
  // The most recent report the mentor reacted to.
  const feedbackMap = useReportFeedback();
  const lastWithFeedback = byRecency(checkIns).find((c) => feedbackMap[c.id]);
  const feedback = lastWithFeedback ? feedbackMap[lastWithFeedback.id] : null;
  const placementDone = usePlacementDone();
  const todoCount = tasks.filter((t) => !t.done).length;

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-900">
              سلام {profile.name} 👋
            </h1>
            <p className="mt-1 text-sm text-text-500">
              {todoCount > 0
                ? `امروز ${toPersianDigits(todoCount)} کار داری`
                : "همه‌ی کارهای امروز انجام شد"}
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
                <span className="tnum">
                  {toPersianDigits(daysUntilKonkur())}
                </span>{" "}
                روز تا کنکور
              </div>
              <div className="text-xs text-text-500">
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
                  <span className="tnum">
                    {toPersianDigits(steps.length - stepsDone)}
                  </span>{" "}
                  قدم تا شروع کامل
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
                  className={cn(
                    "h-1.5 flex-1 rounded-x-pill",
                    st.done ? "bg-mint-500" : "bg-surface-2",
                  )}
                />
              ))}
            </div>
          </Link>
        )}

        {/* 1. Today — the one thing that matters most, with the week's progress under it. */}
        <Card className="mt-5">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-900">
                برنامه‌ی امروز
              </h2>
              <Link
                href="/dashboard/plan"
                className="text-xs text-blue-600 hover:underline"
              >
                کل هفته
              </Link>
            </div>
            {tasks.length === 0 && (
              <p className="rounded-x-md bg-surface-2 p-4 text-center text-sm text-text-500">
                {mentor.name} برای امروز برنامه‌ای ننوشته — استراحت.
              </p>
            )}
            <ul className="space-y-2">
              {tasks.map((t) => {
                const isNext = t.id === nextTask?.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "flex items-center gap-3 rounded-x-md p-3",
                      isNext
                        ? "border border-blue-600/30 bg-blue-100"
                        : "bg-surface-2/60",
                    )}
                  >
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        t.done
                          ? "bg-mint-500"
                          : isNext
                            ? "bg-blue-600"
                            : "bg-border",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          t.done
                            ? "text-text-500 line-through"
                            : "text-text-900",
                        )}
                      >
                        {t.subject}
                        {t.topic && (
                          <span className="font-normal text-text-500">
                            {" "}
                            — {t.topic}
                          </span>
                        )}
                      </div>
                      <div className="tnum text-xs text-text-500">
                        {formatHours(t.hours)} ساعت{isNext && " · کار بعدی"}
                      </div>
                    </div>
                    {t.done ? (
                      <Badge tone="success">انجام شد</Badge>
                    ) : (
                      <Link
                        href={`/dashboard/focustimer?task=${t.id}`}
                        className={buttonVariants({
                          size: "md",
                          variant: isNext ? "primary" : "secondary",
                        })}
                      >
                        <Timer size={15} />
                        شروع
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-text-700">
                  این هفته:{" "}
                  <span className="tnum">
                    {formatStudyTime(studiedMinutes)} از{" "}
                    {formatHours(plannedHours)} ساعت
                  </span>
                </span>
                <span className="flex items-center gap-1 text-orange-500">
                  <Flame size={13} />
                  <span className="tnum">
                    {toPersianDigits(studentStreakDays)}
                  </span>{" "}
                  شب پشت‌سرهم گزارش
                </span>
              </div>
              <ProgressBar
                value={
                  plannedHours
                    ? Math.min(100, (studiedMinutes / 60 / plannedHours) * 100)
                    : 0
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. «برای تو» — everything else, one row each, only when it's relevant. */}
        <Card className="mt-4">
          <CardContent className="py-2">
            <ul className="divide-y divide-border/60">
              {feedback && lastWithFeedback && (
                <Row
                  href={feedback.reaction === "lets_talk" ? "/chat" : undefined}
                  icon={
                    <span className="text-lg leading-none">
                      {REPORT_REACTIONS[feedback.reaction].emoji}
                    </span>
                  }
                  title={`${mentor.name}: ${REPORT_REACTIONS[feedback.reaction].label}`}
                  sub={
                    feedback.comment
                      ? `«${feedback.comment}»`
                      : `روی گزارش کار ${lastWithFeedback.date}`
                  }
                  action={
                    feedback.reaction === "lets_talk" ? "جواب بده" : undefined
                  }
                />
              )}
              <Row
                href={`/session/${mentor.id}`}
                icon={<CalendarClock size={16} className="text-blue-600" />}
                title={
                  session
                    ? `جلسه: ${nextSessionLabel(session, upcoming?.override)}`
                    : "هنوز وقت ثابت جلسه نداری"
                }
                sub={
                  <Link
                    href="/dashboard/plan?view=week"
                    className="text-blue-600 hover:underline"
                  >
                    تغییر یا جابه‌جایی
                  </Link>
                }
                action="ورود"
              />
              {unread > 0 && (
                <Row
                  href="/chat"
                  icon={<MessageCircle size={16} className="text-orange-500" />}
                  title={`${toPersianDigits(unread)} پیام خوانده‌نشده از ${mentor.name}`}
                />
              )}
              {dueMistakes.length > 0 && (
                <Row
                  href="/dashboard/mistakes?review=1"
                  icon={<Repeat size={16} className="text-blue-600" />}
                  title={`مرور غلط‌ها: ${toPersianDigits(dueMistakes.length)} تست امروز`}
                  sub="همون تست‌هایی که چند روز پیش غلط زدی"
                />
              )}
              <Row
                href="/dashboard/report"
                icon={<Moon size={16} className="text-text-700" />}
                title="گزارش کار امشب"
                sub={`یک دقیقه — برای ${mentor.name}`}
              />
              {!placementDone && (
                <Row
                  href="/placement"
                  icon={<Sparkles size={16} className="text-blue-600" />}
                  title="تعیین سطح (اختیاری)"
                  sub={`چند دقیقه — نیمرخ سطحت برای ${mentor.name} ارسال می‌شه`}
                />
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}

// One line in «برای تو»: the whole row opens the thing; `sub` may hold its own link.
function Row({
  href,
  icon,
  title,
  sub,
  action,
}: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  sub?: React.ReactNode;
  action?: string;
}) {
  return (
    <li className="relative flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        {href ? (
          <Link
            href={href}
            className="block truncate text-sm font-medium text-text-900 after:absolute after:inset-0"
          >
            {title}
          </Link>
        ) : (
          <div className="text-sm font-medium text-text-900">{title}</div>
        )}
        {sub && (
          <div
            className={cn(
              "relative z-10 text-xs text-text-500",
              href ? "truncate" : "leading-[1.8]",
            )}
          >
            {sub}
          </div>
        )}
      </div>
      {action ? (
        <span className={buttonVariants({ size: "md", variant: "secondary" })}>
          {action}
        </span>
      ) : (
        href && <ArrowLeft size={16} className="shrink-0 text-text-500" />
      )}
    </li>
  );
}
