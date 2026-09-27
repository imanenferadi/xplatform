"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  CalendarX,
  Check,
  CheckCircle2,
  FileText,
  ChevronLeft,
  GraduationCap,
  ListChecks,
  MessageCircle,
  Moon,
  PhoneCall,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PendingCall } from "@/components/app/MentorFeed";
import {
  CURRENT_DAY_NAME,
  PLAN_DEADLINE_DAY,
  WEEK_DAYS,
  getRiskInfo,
  mentorStudents,
  mentors,
  nightlyCheckIns,
} from "@/lib/mock-data";
import { useCallRequests } from "@/lib/call-store";
import { useMeetingSetup } from "@/lib/meeting-store";
import { useCapacitySet } from "@/lib/capacity-store";
import { useMyCheckIns } from "@/lib/checkin-store";
import { useReportFeedback } from "@/lib/feedback-store";
import { byRecency } from "@/lib/reports";
import { draftChanges, usePlans } from "@/lib/plan-store";
import { acknowledgeOverride, slotDay, useAvailability, useOverrides, useWeekSessions } from "@/lib/session-store";
import { createLocalStore } from "@/lib/local-store";
import { useMentorUnreadCounts } from "@/lib/chat-store";
import { useAllKarnamehs } from "@/lib/karnameh-store";
import { cn, toPersianDigits } from "@/lib/utils";

type Tone = "urgent" | "today" | "soon";
type Task = {
  key: string;
  tone: Tone;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  detail?: string;
  href?: string;
  external?: boolean;
  action?: string;
  inline?: React.ReactNode;
};

const TONE: Record<Tone, string> = {
  urgent: "text-red-500 bg-red-500/10",
  today: "text-blue-600 bg-blue-100",
  soon: "text-orange-500 bg-orange-500/10",
};

const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
const daysToDeadline = WEEK_DAYS.indexOf(PLAN_DEADLINE_DAY) - todayIndex;

// One prioritized list instead of banners + stat tiles + separate cards.
// Nothing here is ticked by hand: each item disappears once the underlying
// thing is actually done (feedback given, plan sent, call answered…).
export function MentorToday() {
  const calls = useCallRequests();
  const sessions = useWeekSessions();
  const plans = usePlans();
  const feedback = useReportFeedback();
  const mineLatest = byRecency(useMyCheckIns())[0];
  const meeting = useMeetingSetup();
  const unread = useMentorUnreadCounts();
  const overrides = useOverrides();
  const karnamehs = useAllKarnamehs();
  const nameOf = (id: string) => mentorStudents.find((s) => s.id === id)?.name ?? "";

  const tasks: Task[] = [];

  for (const c of calls.filter((x) => x.status === "pending"))
    tasks.push({
      key: `call-${c.id}`,
      tone: "urgent",
      icon: PhoneCall,
      title: `${c.parentName} درخواست تماس داده`,
      detail: `${c.topic} · وقت پیشنهادی ${c.slot}`,
      inline: <PendingCall call={c} />,
    });

  for (const o of overrides.filter((x) => x.by === "student" && !x.seen))
    tasks.push({
      key: `ov-${o.studentId}`,
      tone: "urgent",
      icon: CalendarX,
      title: `${nameOf(o.studentId)} جلسه‌ی ${o.week === "this" ? "این هفته" : "هفته‌ی بعد"} رو ${
        o.cancelled ? "لغو کرد" : `جابه‌جا کرد به ${o.slot}`
      }`,
      detail: o.reason || undefined,
      inline: (
        <button
          type="button"
          onClick={() => acknowledgeOverride(o.studentId)}
          className="flex items-center gap-1 rounded-x-pill border border-border px-3 py-1 text-xs text-text-700 hover:border-blue-300"
        >
          <Check size={12} /> دیدم
        </button>
      ),
    });

  for (const s of sessions.filter((x) => x.day === CURRENT_DAY_NAME && !x.cancelled))
    tasks.push({
      key: `session-${s.studentId}`,
      tone: "today",
      icon: CalendarClock,
      title: `جلسه با ${nameOf(s.studentId)} — ساعت ${s.time}`,
      detail: s.mode === "video" ? "تصویری" : "صوتی",
      href: meeting.url || "/mentor/calendar",
      external: Boolean(meeting.url),
      action: meeting.url ? "ورود به جلسه" : "تقویم",
    });

  for (const c of calls.filter((x) => x.status === "confirmed" && slotDay(x.slot) === CURRENT_DAY_NAME))
    tasks.push({
      key: `callnow-${c.id}`,
      tone: "today",
      icon: PhoneCall,
      title: `تماس با ${c.parentName} — ${c.slot.split(" ")[1]}`,
      detail: c.topic,
    });

  for (const s of mentorStudents) {
    const sp = plans[s.id];
    if (!sp?.next.published)
      tasks.push({
        key: `plan-${s.id}`,
        tone: daysToDeadline <= 1 ? "urgent" : "soon",
        icon: CalendarX,
        title: `برنامه‌ی هفته‌ی بعد ${s.name}`,
        detail:
          daysToDeadline > 0
            ? `مهلت: ${PLAN_DEADLINE_DAY} شب (${toPersianDigits(daysToDeadline)} روز دیگه)`
            : `مهلت: امشب`,
        href: `/mentor/students/${s.id}#plan`,
        action: "نوشتن",
      });
    const unsent = sp ? draftChanges(sp.this) + (sp.next.published ? draftChanges(sp.next) : 0) : 0;
    if (unsent > 0)
      tasks.push({
        key: `draft-${s.id}`,
        tone: "soon",
        icon: CalendarX,
        title: `تغییرات ارسال‌نشده‌ی برنامه‌ی ${s.name}`,
        detail: `${toPersianDigits(unsent)} تغییر — هنوز به دستش نرسیده`,
        href: `/mentor/students/${s.id}#plan`,
        action: "ارسال",
      });
  }

  for (const s of mentorStudents) {
    const risk = getRiskInfo(s);
    if (risk.level === "danger")
      tasks.push({
        key: `risk-${s.id}`,
        tone: "urgent",
        icon: AlertCircle,
        title: `${s.name} نیاز به توجه داره`,
        detail: risk.reason ?? undefined,
        href: `/mentor/students/${s.id}`,
        action: "پرونده",
      });
  }

  for (const ci of [...(mineLatest ? [mineLatest] : []), ...nightlyCheckIns]) {
    if (feedback[ci.id] || ci.mentorSeen) continue;
    tasks.push({
      key: `report-${ci.id}`,
      tone: "today",
      icon: Moon,
      title: `گزارش کار ${ci.date} ${nameOf(ci.studentId)} منتظر بازخوردته`,
      detail: ci.note || undefined,
      href: `/mentor/students/${ci.studentId}#reports`,
      action: "بازخورد",
    });
  }

  for (const k of karnamehs.filter((x) => !x.seenByMentor))
    tasks.push({
      key: `k-${k.id}`,
      tone: "today",
      icon: FileText,
      title: `${nameOf(k.studentId)} کارنامه‌ی جدید فرستاد`,
      detail: `${k.examProvider} — ${k.fileName}`,
      href: `/mentor/students/${k.studentId}#karnameh`,
      action: "مشاهده",
    });

  for (const s of mentorStudents.filter((x) => (unread[x.id] ?? 0) > 0))
    tasks.push({
      key: `msg-${s.id}`,
      tone: "today",
      icon: MessageCircle,
      title: `${toPersianDigits(unread[s.id])} پیام بی‌پاسخ از ${s.name}`,
      href: `/mentor/messages/${s.id}`,
      action: "جواب",
    });

  const order: Record<Tone, number> = { urgent: 0, today: 1, soon: 2 };
  tasks.sort((a, b) => order[a.tone] - order[b.tone]);

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-text-900">
            <ListChecks size={16} className="text-blue-600" /> کارهای امروز
          </h2>
          {tasks.length > 0 && <span className="tnum text-xs text-text-500">{toPersianDigits(tasks.length)} کار</span>}
        </div>
        {tasks.length === 0 ? (
          <p className="flex items-center gap-2 rounded-x-md bg-mint-500/10 p-3 text-sm text-mint-500">
            <CheckCircle2 size={16} /> همه‌ی کارهای امروز انجام شد.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {tasks.map((t) => (
              <li key={t.key} className="py-2.5">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TONE[t.tone])}>
                    <t.icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-900">{t.title}</div>
                    {t.detail && <div className="truncate text-xs text-text-500">{t.detail}</div>}
                  </div>
                  {t.href &&
                    (t.external ? (
                      <a
                        href={t.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center text-xs font-medium text-blue-600 hover:underline"
                      >
                        {t.action}
                        <ChevronLeft size={14} />
                      </a>
                    ) : (
                      <Link
                        href={t.href}
                        className="flex shrink-0 items-center text-xs font-medium text-blue-600 hover:underline"
                      >
                        {t.action}
                        <ChevronLeft size={14} />
                      </Link>
                    ))}
                </div>
                {t.inline && <div className="mr-11 mt-2">{t.inline}</div>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------
// «شروع کار» — a new mentor's first steps, each checked from real data.
// ---------------------------------------------------------------------
type OnboardingState = { guideRead: boolean; hidden: boolean };
const onboarding = createLocalStore<OnboardingState>("x-mentor-onboarding", { guideRead: false, hidden: false });

export const useOnboarding = onboarding.useValue;
export function markGuideRead() {
  onboarding.set({ ...onboarding.get(), guideRead: true });
}

export const MIN_WEEKLY_SLOTS = 4;

export function MentorOnboarding() {
  const state = onboarding.useValue();
  const meeting = useMeetingSetup();
  const capacitySet = useCapacitySet(mentors[0].id);
  const slots = useAvailability();
  const plans = usePlans();
  const anyPlanSent = Object.values(plans).some((p) => p.this.published || p.next.published);

  const steps = [
    { label: "راهنمای ۵ دقیقه‌ای رو بخون", done: state.guideRead, href: "/mentor/guide" },
    { label: "لینک اتاق جلسه (گوگل میت یا اسکای‌روم)", done: Boolean(meeting.url), href: "/mentor/profile#meeting" },
    { label: "ظرفیت پذیرشت رو مشخص کن", done: capacitySet, href: "/mentor/profile#capacity" },
    {
      label: `حداقل ${toPersianDigits(MIN_WEEKLY_SLOTS)} ساعت آزاد در هفته برای جلسه`,
      done: slots.length >= MIN_WEEKLY_SLOTS,
      href: "/mentor/calendar",
    },
    {
      label: "اولین برنامه‌ی هفته رو بفرست",
      done: anyPlanSent,
      href: `/mentor/students/${mentorStudents[0].id}#plan`,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (state.hidden || doneCount === steps.length) return null;

  return (
    <Card className="mt-4 border-blue-600/30">
      <CardContent>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-text-900">
            <GraduationCap size={16} className="text-blue-600" /> شروع کار در X
          </h2>
          <button
            type="button"
            onClick={() => onboarding.set({ ...state, hidden: true })}
            aria-label="پنهان کردن"
            className="text-text-500 hover:text-text-900"
          >
            <X size={15} />
          </button>
        </div>
        <p className="mb-3 text-xs text-text-500">
          <span className="tnum">{toPersianDigits(doneCount)}</span> از{" "}
          <span className="tnum">{toPersianDigits(steps.length)}</span> قدم — هر قدم با انجام دادنش خودش تیک می‌خوره.
        </p>
        <div className="mb-3 flex gap-1">
          {steps.map((s) => (
            <div key={s.label} className={cn("h-1.5 flex-1 rounded-x-pill", s.done ? "bg-mint-500" : "bg-surface-2")} />
          ))}
        </div>
        <ul className="space-y-1.5">
          {steps.map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className={cn(
                  "flex items-center gap-2 rounded-x-sm px-2 py-1.5 text-sm transition-colors hover:bg-surface-2",
                  s.done ? "text-text-500 line-through" : "text-text-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    s.done ? "border-mint-500 bg-mint-500 text-white" : "border-border"
                  )}
                >
                  {s.done && <Check size={11} />}
                </span>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
