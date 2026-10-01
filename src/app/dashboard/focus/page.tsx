"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Play, Pause, Check, SkipForward, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ProgressCircle } from "@/components/ui/Progress";
import type { PlanTask } from "@/lib/mock-data";
import { logFocus, useFocusMinutesByTask } from "@/lib/focus-log-store";
import { formatHours, useDoneIds, useTodayTasks } from "@/lib/plan-store";
import { formatClock, useCountdown } from "@/lib/use-countdown";
import { toPersianDigits } from "@/lib/utils";

type Task = PlanTask;
// A 3-hour block is several focus rounds, not one 180-minute countdown.
const ROUND_MINUTES = 50;

// Distraction-free: no sidebar, no nav, no other cards — just the next
// undone task from today's plan and its timer.
export default function FocusModePage() {
  const todayTasks = useTodayTasks();
  const completed = useDoneIds();
  const logged = useFocusMinutesByTask();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [finished, setFinished] = useState<{
    task: Task;
    minutes: number;
    blockDone: boolean;
  } | null>(null);

  const remaining = todayTasks.filter((t) => !completed.has(t.id));
  const queue = remaining.filter((t) => !skipped.includes(t.id));
  // Once everything left has been skipped, cycle back to the skipped ones.
  const current = queue[0] ?? remaining[0];

  function complete(task: Task, minutes: number, early: boolean) {
    const block = task.hours * 60;
    logFocus(task.id, minutes, block, early);
    setFinished({
      task,
      minutes,
      blockDone: early || (logged.get(task.id) ?? 0) + minutes >= block,
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-5">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <span className="text-xs text-text-500">حالت «فقط الان»</span>
        <Link
          href="/dashboard"
          className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2"
          aria-label="خروج"
        >
          <X size={20} />
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        {finished ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-500/15">
              <Check size={26} className="text-mint-500" />
            </div>
            <h1 className="text-lg font-bold text-text-900">
              {finished.blockDone
                ? `${finished.task.subject} امروز تموم شد`
                : `${toPersianDigits(finished.minutes)} دقیقه ${finished.task.subject} ثبت شد`}
            </h1>
            <p className="mt-1 text-sm text-text-500">
              {finished.blockDone
                ? "توی برنامه‌ی امروز تیک خورد. یه نفس بکش."
                : `از ${formatHours(finished.task.hours)} ساعتش. ۱۰ دقیقه استراحت کن، بعد دور بعدی.`}
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => setFinished(null)}
            >
              {finished.blockDone
                ? current
                  ? "برو سراغ کار بعدی"
                  : "تمام"
                : "دور بعدی"}
            </Button>
          </>
        ) : current ? (
          <FocusSession
            key={`${current.id}-${logged.get(current.id) ?? 0}`}
            task={current}
            roundMinutes={Math.min(
              ROUND_MINUTES,
              Math.max(1, current.hours * 60 - (logged.get(current.id) ?? 0)),
            )}
            loggedMinutes={logged.get(current.id) ?? 0}
            position={todayTasks.length - remaining.length + 1}
            total={todayTasks.length}
            canSkip={remaining.length > 1}
            onComplete={(minutes, early) => complete(current, minutes, early)}
            onSkip={() =>
              setSkipped((s) => [
                ...s.filter((id) => id !== current.id),
                current.id,
              ])
            }
          />
        ) : (
          <>
            <PartyPopper size={40} className="mb-4 text-mint-500" />
            <h1 className="text-lg font-bold text-text-900">
              همه‌ی کارهای امروز انجام شد
            </h1>
            <p className="mt-1 text-sm text-text-500">
              امشب گزارش کارت رو یادت نره.
            </p>
            <Link
              href="/dashboard/report"
              className={buttonVariants({ size: "lg", className: "mt-6" })}
            >
              گزارش کار امشب
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function FocusSession({
  task,
  roundMinutes,
  loggedMinutes,
  position,
  total,
  canSkip,
  onComplete,
  onSkip,
}: {
  task: Task;
  roundMinutes: number;
  loggedMinutes: number;
  position: number;
  total: number;
  canSkip: boolean;
  onComplete: (minutes: number, early: boolean) => void;
  onSkip: () => void;
}) {
  const totalSeconds = roundMinutes * 60;
  const { remaining, running, setRunning } = useCountdown(totalSeconds, () =>
    onComplete(roundMinutes, false),
  );
  const elapsed = totalSeconds - remaining;

  return (
    <>
      <div className="tnum mb-2 text-xs text-text-500">
        کار {toPersianDigits(position)} از {toPersianDigits(total)}
      </div>
      <h1 className="text-2xl font-bold text-text-900">
        {task.topic || task.subject}
      </h1>
      <p className="mt-1 text-sm text-text-500">
        {task.subject} · {formatHours(task.hours)} ساعت
        {loggedMinutes > 0 && (
          <>
            {" "}
            · <span className="tnum">
              {toPersianDigits(loggedMinutes)}
            </span>{" "}
            دقیقه‌اش رو خوندی
          </>
        )}
      </p>

      <div className="my-8">
        <ProgressCircle
          value={(elapsed / totalSeconds) * 100}
          size={240}
          strokeWidth={12}
          ringClassName="stroke-blue-600"
          transitionMs={950}
        >
          <span className="tnum text-5xl font-extrabold text-text-900">
            {formatClock(remaining)}
          </span>
        </ProgressCircle>
      </div>

      <Button size="lg" className="w-40" onClick={() => setRunning((r) => !r)}>
        {running ? (
          <>
            <Pause size={16} /> توقف
          </>
        ) : (
          <>
            <Play size={16} /> {elapsed > 0 ? "ادامه" : "شروع"}
          </>
        )}
      </Button>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <button
          onClick={() => onComplete(Math.ceil(elapsed / 60), true)}
          disabled={elapsed === 0 && loggedMinutes === 0}
          className="flex items-center gap-1 text-text-500 hover:text-mint-500 disabled:opacity-40 disabled:hover:text-text-500"
        >
          <Check size={15} /> زودتر تموم شد
        </button>
        {canSkip && (
          <button
            onClick={onSkip}
            className="flex items-center gap-1 text-text-500 hover:text-text-900"
          >
            <SkipForward size={15} /> بعداً
          </button>
        )}
      </div>
    </>
  );
}
