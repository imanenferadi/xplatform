"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Coffee, Check, X, Target } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ProgressCircle } from "@/components/ui/Progress";
import { logFocus } from "@/lib/focus-log-store";
import { useTodayTasks } from "@/lib/plan-store";
import { formatClock, useCountdown } from "@/lib/use-countdown";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Mode = "focus" | "rest";

const PRESETS: Record<Mode, { minutes: number; label: string }[]> = {
  focus: [
    { minutes: 25, label: "۲۵ دقیقه" },
    { minutes: 50, label: "۵۰ دقیقه" },
  ],
  rest: [
    { minutes: 5, label: "۵ دقیقه" },
    { minutes: 10, label: "۱۰ دقیقه" },
    { minutes: 15, label: "۱۵ دقیقه" },
  ],
};

const MODE_META = {
  focus: { title: "فوکوس", icon: TimerIcon, ring: "stroke-blue-600", tint: "bg-blue-100 text-blue-600" },
  rest: { title: "استراحت", icon: Coffee, ring: "stroke-mint-500", tint: "bg-mint-500/15 text-mint-500" },
};

const MIN_CUSTOM = 1;
const MAX_CUSTOM = 180;

function FocusTimer() {
  // Opened from a plan task ("شروع" on the dashboard) → preload its duration
  // and log the minutes against that task when the focus session ends.
  const taskParam = useSearchParams().get("task");
  const task = useTodayTasks().find((t) => t.id === taskParam);

  const [mode, setMode] = useState<Mode>("focus");
  const [minutes, setMinutes] = useState(PRESETS.focus[task ? 1 : 0].minutes);
  const [justFinished, setJustFinished] = useState(false);
  const [focusSessionsToday, setFocusSessionsToday] = useState(0);
  const [focusMinutesToday, setFocusMinutesToday] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");

  const {
    remaining,
    running,
    setRunning,
    reset: resetCountdown,
  } = useCountdown(minutes * 60, () => {
    setJustFinished(true);
    if (mode === "focus") {
      setFocusSessionsToday((n) => n + 1);
      setFocusMinutesToday((n) => n + minutes);
      if (task) logFocus(task.id, minutes, task.hours * 60);
    }
  });

  const totalSeconds = minutes * 60;
  const elapsedPercent = ((totalSeconds - remaining) / totalSeconds) * 100;
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  const isPreset = PRESETS[mode].some((p) => p.minutes === minutes);

  function selectDuration(m: number) {
    setJustFinished(false);
    setMinutes(m);
    resetCountdown(m * 60);
  }

  function switchMode(next: Mode) {
    setMode(next);
    selectDuration(PRESETS[next][0].minutes);
  }

  function applyCustom(e: React.FormEvent) {
    e.preventDefault();
    const m = Number(toLatinDigits(customInput));
    if (!Number.isInteger(m) || m < MIN_CUSTOM || m > MAX_CUSTOM) {
      setCustomError(`یه عدد صحیح بین ${toPersianDigits(MIN_CUSTOM)} تا ${toPersianDigits(MAX_CUSTOM)} دقیقه وارد کن.`);
      return;
    }
    setCustomError("");
    setCustomInput("");
    selectDuration(m);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
      <div className="mb-6 flex items-center gap-2">
        <TimerIcon size={18} className="text-blue-600" />
        <h1 className="text-xl font-bold text-text-900">تایمر فوکوس و استراحت</h1>
      </div>

      {task && (
        <div className="mb-5 flex items-center gap-3 rounded-x-md border border-blue-600/30 bg-blue-100 px-4 py-3">
          <Target size={16} className="shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1 text-sm">
            <span className="text-text-500">در حال کار روی: </span>
            <span className="font-medium text-text-900">
              {task.subject}
              {task.topic && ` — ${task.topic}`}
            </span>
          </div>
          <Link href="/dashboard/focustimer" className="text-text-500 hover:text-text-900" aria-label="جدا کردن از تسک">
            <X size={16} />
          </Link>
        </div>
      )}

      {/* Mode tabs */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        {(Object.keys(MODE_META) as Mode[]).map((m) => {
          const ModeIcon = MODE_META[m].icon;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-x-md border-2 py-3 text-sm font-medium transition-colors",
                mode === m
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700 hover:border-blue-300"
              )}
            >
              <ModeIcon size={16} />
              {MODE_META[m].title}
            </button>
          );
        })}
      </div>

      {/* Duration: quick presets + any custom length */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {PRESETS[mode].map((p) => (
          <button
            key={p.minutes}
            onClick={() => selectDuration(p.minutes)}
            className={cn(
              "rounded-x-pill border px-4 py-1.5 text-sm font-medium transition-colors",
              minutes === p.minutes
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border bg-surface text-text-700"
            )}
          >
            {p.label}
          </button>
        ))}
        {!isPreset && (
          <span className="rounded-x-pill border border-blue-600 bg-blue-100 px-4 py-1.5 text-sm font-medium text-text-900">
            {toPersianDigits(minutes)} دقیقه
          </span>
        )}
      </div>
      <form onSubmit={applyCustom} className="mb-6">
        <div className="flex items-center justify-center gap-2">
          <label htmlFor="custom-minutes" className="text-sm text-text-700">
            زمان دلخواه:
          </label>
          <input
            id="custom-minutes"
            inputMode="numeric"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setCustomError("");
            }}
            placeholder="مثلاً ۴۰"
            className="h-9 w-24 rounded-x-md border border-border bg-surface px-3 text-center text-sm text-text-900 outline-none focus:border-blue-600"
          />
          <span className="text-sm text-text-500">دقیقه</span>
          <Button type="submit" size="md" variant="secondary" className="h-9 px-4" disabled={!customInput.trim()}>
            تنظیم
          </Button>
        </div>
        {customError && <p className="mt-2 text-center text-xs text-red-500">{customError}</p>}
      </form>

      {/* Ring */}
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <ProgressCircle
            value={elapsedPercent}
            size={220}
            strokeWidth={12}
            ringClassName={meta.ring}
            transitionMs={950}
          >
            <div className="flex flex-col items-center">
              <Icon size={20} className="mb-1 text-text-500" />
              <span className="tnum text-4xl font-extrabold text-text-900">{formatClock(remaining)}</span>
              <span className="mt-1 text-xs text-text-500">{meta.title}</span>
            </div>
          </ProgressCircle>

          {justFinished ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div
                className={cn("flex items-center gap-1.5 rounded-x-pill px-3 py-1.5 text-sm font-medium", meta.tint)}
              >
                <Check size={14} />
                {mode === "focus"
                  ? task
                    ? `${toPersianDigits(minutes)} دقیقه ${task.subject} ثبت شد`
                    : "یک جلسه‌ی فوکوس تموم شد!"
                  : "استراحت تموم شد"}
              </div>
              <div className="flex gap-2">
                <Button size="lg" onClick={() => switchMode(mode === "focus" ? "rest" : "focus")}>
                  {mode === "focus" ? "شروع استراحت" : "برگرد به فوکوس"}
                </Button>
                {task && mode === "focus" && (
                  <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "secondary" })}>
                    برگرد به امروز
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-3">
              <Button size="lg" onClick={() => setRunning((r) => !r)} className="w-32">
                {running ? (
                  <>
                    <Pause size={16} /> توقف
                  </>
                ) : (
                  <>
                    <Play size={16} /> شروع
                  </>
                )}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => selectDuration(minutes)} aria-label="ریست">
                <RotateCcw size={16} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="text-center">
            <div className="tnum text-2xl font-extrabold text-text-900">{toPersianDigits(focusSessionsToday)}</div>
            <div className="mt-1 text-xs text-text-500">جلسه‌ی فوکوس امروز</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="tnum text-2xl font-extrabold text-text-900">{toPersianDigits(focusMinutesToday)}</div>
            <div className="mt-1 text-xs text-text-500">دقیقه فوکوس امروز</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FocusTimerPage() {
  return (
    <StudentShell>
      <Suspense>
        <FocusTimer />
      </Suspense>
    </StudentShell>
  );
}
