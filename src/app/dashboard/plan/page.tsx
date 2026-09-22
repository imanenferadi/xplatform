"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSubjectDetail, type Subject } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";

type Task = { subject: Subject; topic: string; hours: number; done: boolean; aiGenerated: boolean };

// A rolling 7-day timebox — yesterday, today, and the next 5 days — instead
// of dumping the whole month on the student at once. Only "today" (index 0)
// is expanded by default; the rest are one tap away. Real day names are
// still shown so it reads naturally, but the student always orients from
// "امروز", not from a fixed weekday.
//
// Each task carries `hours` because that's literally how a mentor writes a
// plan — "شنبه: ریاضی ۳، فیزیک ۲، شیمی ۱.۵" — not a vague topic with no
// time budget attached.
const timebox: { relativeLabel: string; dayName: string; tasks: Task[] }[] = [
  {
    relativeLabel: "دیروز",
    dayName: "یکشنبه",
    tasks: [
      { subject: "فیزیک", topic: "حرکت‌شناسی", hours: 2, done: true, aiGenerated: true },
      { subject: "شیمی", topic: "تست‌زنی فصل ۲", hours: 1.5, done: false, aiGenerated: false },
    ],
  },
  {
    relativeLabel: "امروز",
    dayName: "دوشنبه",
    tasks: [
      { subject: "ریاضی", topic: "مشتق و کاربردها", hours: 3, done: false, aiGenerated: false },
      { subject: "فیزیک", topic: "حرکت‌شناسی — تست", hours: 2, done: false, aiGenerated: false },
      { subject: "شیمی", topic: "تعادل شیمیایی", hours: 1.5, done: false, aiGenerated: true },
    ],
  },
  {
    relativeLabel: "فردا",
    dayName: "سه‌شنبه",
    tasks: [
      { subject: "ریاضی", topic: "مرور نکات کنکوری", hours: 2, done: false, aiGenerated: true },
      { subject: "شیمی", topic: "شیمی آلی — جلسه با مشاور", hours: 1, done: false, aiGenerated: false },
    ],
  },
  {
    relativeLabel: "پس‌فردا",
    dayName: "چهارشنبه",
    tasks: [{ subject: "فیزیک", topic: "تست جامع", hours: 2.5, done: false, aiGenerated: true }],
  },
  {
    relativeLabel: "",
    dayName: "پنجشنبه",
    tasks: [{ subject: "ریاضی", topic: "فصل ۴ — انتگرال", hours: 2, done: false, aiGenerated: true }],
  },
  {
    relativeLabel: "",
    dayName: "جمعه",
    tasks: [{ subject: "زیست", topic: "مرور هفته", hours: 1.5, done: false, aiGenerated: false }],
  },
  {
    relativeLabel: "",
    dayName: "شنبه",
    tasks: [{ subject: "شیمی", topic: "آزمون دوهفته‌ای", hours: 3, done: false, aiGenerated: false }],
  },
];

const TODAY_INDEX = 1;

function formatHours(h: number): string {
  return toPersianDigits(Number.isInteger(h) ? h : h.toFixed(1));
}

export default function PlanPage() {
  const [behind, setBehind] = useState(false);
  const [selected, setSelected] = useState(TODAY_INDEX);
  const day = timebox[selected];
  const doneCount = day.tasks.filter((t) => t.done).length;
  const totalHours = day.tasks.reduce((sum, t) => sum + t.hours, 0);

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-900">برنامه</h1>
          <Button variant="secondary" size="md" onClick={() => setBehind((b) => !b)}>
            <RotateCcw size={16} />
            عقب افتادم؛ بازچینی کن
          </Button>
        </div>

        {behind && (
          <Card className="mb-5 border-orange-500/30 bg-orange-500/10">
            <CardContent className="text-sm text-text-700">
              <span className="font-medium text-text-900">بازچینی شد.</span> کارهای انجام‌نشده روی
              روزهای باقی‌مانده‌ی هفته پخش شدند. سبک‌تر شد، نه سنگین‌تر.
            </CardContent>
          </Card>
        )}

        {/* 7-day rolling strip */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {timebox.map((d, i) => {
            const active = i === selected;
            const isToday = i === TODAY_INDEX;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-x-md border-2 px-4 py-2 transition-colors",
                  active
                    ? "border-blue-600 bg-blue-100"
                    : "border-border bg-surface hover:border-blue-300",
                  !isToday && i < TODAY_INDEX && "opacity-70"
                )}
              >
                <span className={cn("text-xs", active ? "text-blue-600" : "text-text-500")}>
                  {d.relativeLabel || d.dayName}
                </span>
                {d.relativeLabel && (
                  <span className="text-[10px] text-text-500">{d.dayName}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-900">
            {day.relativeLabel || day.dayName}
            {day.relativeLabel && <span className="font-normal text-text-500"> · {day.dayName}</span>}
          </h2>
          <span className="tnum text-xs text-text-500">
            {doneCount} از {day.tasks.length} انجام‌شده
          </span>
        </div>

        {/* Compact mentor-style summary line — "ریاضی ۳ · فیزیک ۲ · شیمی ۱.۵"
            exactly how a mentor actually writes the day's plan out. */}
        <p className="mb-4 text-sm text-text-700">
          {day.tasks.map((t, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {t.subject} <span className="tnum font-medium text-text-900">{formatHours(t.hours)}</span>
            </span>
          ))}
          <span className="text-text-500">
            {" "}
            (جمعاً <span className="tnum">{formatHours(totalHours)}</span> ساعت)
          </span>
        </p>

        <div className="space-y-2">
          {day.tasks.map((t, i) => {
            const detail = getSubjectDetail(t.subject);
            return (
              <Card key={i}>
                <CardContent className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        t.done ? "bg-mint-500" : "bg-border"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            t.done ? "text-text-500 line-through" : "text-text-900"
                          )}
                        >
                          {t.subject}
                        </span>
                        <span className="tnum rounded-x-sm bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-text-700">
                          {formatHours(t.hours)} ساعت
                        </span>
                      </div>
                      <div className="text-xs text-text-500">{t.topic}</div>
                    </div>
                    {t.aiGenerated ? (
                      <Badge tone="info">
                        <Sparkles size={11} /> پیشنهاد سیستم
                      </Badge>
                    ) : (
                      <Badge tone="success">تأیید مشاور ✓</Badge>
                    )}
                  </div>

                  {/* Optional فصل/ریز مبحث — فقط وقتی مشاور پرش کرده باشه */}
                  {detail && (
                    <details className="mr-[22px] mt-2 border-t border-border/60 pt-2">
                      <summary className="cursor-pointer text-xs text-blue-600 marker:content-none">
                        جزئیات بیشتر
                      </summary>
                      <div className="mt-1.5 space-y-0.5 text-xs text-text-700">
                        <div>فصل: {detail.chapter}</div>
                        <div>ریز مبحث: {detail.subtopic}</div>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </StudentShell>
  );
}
