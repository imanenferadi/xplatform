"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Play, Pause, Check, SkipForward, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ProgressCircle } from "@/components/ui/Progress";
import { studentPlan } from "@/lib/mock-data";
import { logFocus, useCompletedTaskIds } from "@/lib/focus-log-store";
import { formatClock, useCountdown } from "@/lib/use-countdown";
import { toPersianDigits } from "@/lib/utils";

type Task = (typeof studentPlan.todayTasks)[number];

// Distraction-free: no sidebar, no nav, no other cards — just the next
// undone task from today's plan and its timer.
export default function FocusModePage() {
  const completed = useCompletedTaskIds();
  const [skipped, setSkipped] = useState<number[]>([]);
  const [finished, setFinished] = useState<Task | null>(null);

  const remaining = studentPlan.todayTasks.filter((t) => t.status !== "done" && !completed.has(t.id));
  const queue = remaining.filter((t) => !skipped.includes(t.id));
  // Once everything left has been skipped, cycle back to the skipped ones.
  const current = queue[0] ?? remaining[0];

  function complete(task: Task, minutes: number) {
    logFocus(task.id, minutes);
    setFinished(task);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-5">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <span className="text-xs text-text-500">حالت «فقط الان»</span>
        <Link href="/dashboard" className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2" aria-label="خروج">
          <X size={20} />
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        {finished ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-500/15">
              <Check size={26} className="text-mint-500" />
            </div>
            <h1 className="text-lg font-bold text-text-900">«{finished.topic}» تموم شد</h1>
            <p className="mt-1 text-sm text-text-500">توی برنامه‌ی امروز ثبت شد. یه نفس بکش.</p>
            <Button size="lg" className="mt-6" onClick={() => setFinished(null)}>
              {current ? "برو سراغ کار بعدی" : "تمام"}
            </Button>
          </>
        ) : current ? (
          <FocusSession
            key={current.id}
            task={current}
            position={studentPlan.todayTasks.length - remaining.length + 1}
            total={studentPlan.todayTasks.length}
            canSkip={remaining.length > 1}
            onComplete={(minutes) => complete(current, minutes)}
            onSkip={() => setSkipped((s) => [...s.filter((id) => id !== current.id), current.id])}
          />
        ) : (
          <>
            <PartyPopper size={40} className="mb-4 text-mint-500" />
            <h1 className="text-lg font-bold text-text-900">همه‌ی کارهای امروز انجام شد</h1>
            <p className="mt-1 text-sm text-text-500">امشب گزارش کارت رو یادت نره.</p>
            <Link href="/dashboard/report" className={buttonVariants({ size: "lg", className: "mt-6" })}>
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
  position,
  total,
  canSkip,
  onComplete,
  onSkip,
}: {
  task: Task;
  position: number;
  total: number;
  canSkip: boolean;
  onComplete: (minutes: number) => void;
  onSkip: () => void;
}) {
  const totalSeconds = task.duration * 60;
  const { remaining, running, setRunning } = useCountdown(totalSeconds, () => onComplete(task.duration));
  const elapsed = totalSeconds - remaining;

  return (
    <>
      <div className="tnum mb-2 text-xs text-text-500">
        کار {toPersianDigits(position)} از {toPersianDigits(total)}
      </div>
      <h1 className="text-2xl font-bold text-text-900">{task.topic}</h1>
      <p className="mt-1 text-sm text-text-500">{task.subject}</p>

      <div className="my-8">
        <ProgressCircle
          value={(elapsed / totalSeconds) * 100}
          size={240}
          strokeWidth={12}
          ringClassName="stroke-blue-600"
          transitionMs={950}
        >
          <span className="tnum text-5xl font-extrabold text-text-900">{formatClock(remaining)}</span>
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
          onClick={() => onComplete(Math.ceil(elapsed / 60))}
          disabled={elapsed === 0}
          className="flex items-center gap-1 text-text-500 hover:text-mint-500 disabled:opacity-40 disabled:hover:text-text-500"
        >
          <Check size={15} /> زودتر تموم شد
        </button>
        {canSkip && (
          <button onClick={onSkip} className="flex items-center gap-1 text-text-500 hover:text-text-900">
            <SkipForward size={15} /> بعداً
          </button>
        )}
      </div>
    </>
  );
}
