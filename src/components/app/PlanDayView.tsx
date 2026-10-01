"use client";

import Link from "next/link";
import { Check, MessageSquareQuote, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CURRENT_DAY_NAME,
  WEEK_DAYS,
  mentors,
  type PlanDays,
  type PlanWeek,
} from "@/lib/mock-data";
import { dayHours, formatHours, setTaskDone } from "@/lib/plan-store";
import { cn, toPersianDigits } from "@/lib/utils";

const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);
const SHORT_DAY = ["ش", "۱ش", "۲ش", "۳ش", "۴ش", "۵ش", "ج"];
const NO_TICKS = new Set<string>();

/**
 * One week of the plan as the student sees it: the mentor's note, a Sat→Fri
 * strip, and the chosen day's blocks. Shared by the student's «برنامه» and
 * the mentor's «دانش‌آموز چی می‌بینه؟» preview, so the two can't drift.
 */
export function PlanDayView({
  plan,
  week,
  selected,
  onSelect,
  doneIds = NO_TICKS,
  preview = false,
}: {
  plan: { days: PlanDays; note: string };
  week: PlanWeek;
  selected: string;
  onSelect: (day: string) => void;
  doneIds?: Set<string>;
  preview?: boolean; // mentor preview: nothing is clickable except the days
}) {
  const mentor = mentors[0];
  const tasks = plan.days[selected] ?? [];
  const doneCount = tasks.filter((t) => doneIds.has(t.id)).length;
  const dayIndex = WEEK_DAYS.indexOf(selected);
  // Ticks only for this week's days up to today — you can't have done tomorrow yet.
  const tickable = !preview && week === "this" && dayIndex <= todayIndex;
  const setSelected = onSelect;

  return (
    <>
      {plan.note && (
        <div className="mb-4 flex items-start gap-2 rounded-x-md border border-border bg-surface p-3 text-sm leading-[1.8] text-text-700">
          <MessageSquareQuote
            size={16}
            className="mt-0.5 shrink-0 text-blue-600"
          />
          <span>
            <span className="font-medium text-text-900">{mentor.name}: </span>
            {plan.note}
          </span>
        </div>
      )}

      {/* Sat → Fri strip */}
      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((d, i) => {
          const active = d === selected;
          const isToday = week === "this" && i === todayIndex;
          const hours = dayHours(plan.days[d] ?? []);
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelected(d)}
              className={cn(
                "flex flex-col items-center rounded-x-md border-2 px-1 py-2 transition-colors",
                active
                  ? "border-blue-600 bg-blue-100"
                  : "border-border bg-surface hover:border-blue-300",
                week === "this" && i < todayIndex && !active && "opacity-70",
              )}
            >
              <span
                className={cn(
                  "text-xs",
                  active || isToday
                    ? "font-bold text-blue-600"
                    : "text-text-700",
                )}
              >
                {isToday ? (
                  "امروز"
                ) : (
                  <>
                    <span className="sm:hidden">{SHORT_DAY[i]}</span>
                    <span className="hidden sm:inline">{d}</span>
                  </>
                )}
              </span>
              <span className="tnum text-xs text-text-500">
                {hours ? `${formatHours(hours)} س` : "—"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-900">
          {selected}
          {week === "this" && dayIndex === todayIndex && (
            <span className="font-normal text-text-500"> · امروز</span>
          )}
        </h2>
        {tasks.length > 0 && week === "this" && !preview && (
          <span className="tnum text-xs text-text-500">
            {toPersianDigits(doneCount)} از {toPersianDigits(tasks.length)}{" "}
            انجام‌شده
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-x-md bg-surface-2 p-4 text-center text-sm text-text-500">
          برای این روز برنامه‌ای نوشته نشده — استراحت.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-text-700">
            {tasks.map((t, i) => (
              <span key={t.id}>
                {i > 0 && " · "}
                {t.subject}{" "}
                <span className="tnum font-medium text-text-900">
                  {formatHours(t.hours)}
                </span>
              </span>
            ))}
            <span className="text-text-500">
              {" "}
              (جمعاً{" "}
              <span className="tnum">{formatHours(dayHours(tasks))}</span> ساعت)
            </span>
          </p>

          <div className="space-y-2">
            {tasks.map((t) => {
              const isDone = doneIds.has(t.id);
              return (
                <Card key={t.id}>
                  <CardContent className="py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!tickable}
                        onClick={() => setTaskDone(t.id, !isDone)}
                        aria-label={
                          isDone
                            ? `برداشتن تیک ${t.subject}`
                            : `انجام شد: ${t.subject}`
                        }
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isDone
                            ? "border-mint-500 bg-mint-500 text-white"
                            : "border-border",
                          tickable
                            ? "hover:border-mint-500"
                            : "cursor-default opacity-60",
                        )}
                      >
                        {isDone && <Check size={13} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isDone
                                ? "text-text-500 line-through"
                                : "text-text-900",
                            )}
                          >
                            {t.subject}
                          </span>
                          <span className="tnum rounded-x-sm bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-text-700">
                            {formatHours(t.hours)} ساعت
                          </span>
                        </div>
                        {t.topic && (
                          <div className="text-xs text-text-500">{t.topic}</div>
                        )}
                      </div>
                      {!preview &&
                        week === "this" &&
                        dayIndex === todayIndex &&
                        !isDone && (
                          <Link
                            href={`/dashboard/focustimer?task=${t.id}`}
                            aria-label={`تایمر ${t.subject}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-500 hover:bg-surface-2 hover:text-blue-600"
                          >
                            <Timer size={16} />
                          </Link>
                        )}
                    </div>

                    {t.chapter && (
                      <details className="mr-9 mt-2 border-t border-border/60 pt-2">
                        <summary className="cursor-pointer text-xs text-blue-600 marker:content-none">
                          جزئیات بیشتر
                        </summary>
                        <div className="mt-1.5 space-y-0.5 text-xs text-text-700">
                          <div>فصل: {t.chapter}</div>
                          {t.subtopic && <div>ریز مبحث: {t.subtopic}</div>}
                        </div>
                      </details>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
