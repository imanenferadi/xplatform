"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, GraduationCap, MessageSquareQuote, Send } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PLAN_WEEK_LABELS, WEEK_DAYS, type PlanWeek } from "@/lib/mock-data";
import { dayHours, formatHours, usePublishedWeek, weekHours } from "@/lib/plan-store";
import { addSupervisorNote, markNoteSeen, useNotesFor } from "@/lib/supervisor-store";
import { useSupervisor } from "@/lib/staff-store";
import { cn } from "@/lib/utils";

export function SupervisorShell({ children }: { children: React.ReactNode }) {
  const me = useSupervisor();
  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-navy-900 px-4 py-3">
        <Link href="/supervisor" className="text-sm font-bold text-white">
          X · سرپرست آموزشی
        </Link>
        <span className="flex items-center gap-1 rounded-x-pill bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
          <Eye size={11} /> فقط‌خواندنی
        </span>
        <span className="flex-1" />
        <ThemeToggle />
        {me && (
          <span className="flex items-center gap-2 text-xs text-white/80">
            <Avatar name={me.name} size="sm" /> {me.name}
          </span>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

/** The week as the student received it — no editor. */
export function PlanReadOnly({ studentId }: { studentId: string }) {
  const [week, setWeek] = useState<PlanWeek>("this");
  const plan = usePublishedWeek(studentId, week);
  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {(["this", "next"] as PlanWeek[]).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeek(w)}
            className={cn(
              "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium",
              week === w ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
            )}
          >
            {w === "this" ? "این هفته" : "هفته‌ی بعد"}
          </button>
        ))}
      </div>
      {!plan ? (
        <p className="rounded-x-md bg-orange-500/10 p-3 text-sm text-orange-500">
          مشاور هنوز برنامه‌ی {PLAN_WEEK_LABELS[week]} رو نفرستاده.
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-text-500">
            ارسال: {plan.sentAt} · جمعاً <span className="tnum">{formatHours(weekHours(plan.days))}</span> ساعت
            {plan.note && ` · یادداشت مشاور: «${plan.note}»`}
          </p>
          <ul className="divide-y divide-border/60 rounded-x-md border border-border text-sm">
            {WEEK_DAYS.map((d) => (
              <li key={d} className="flex gap-3 p-2.5">
                <span className="w-16 shrink-0 font-medium text-text-900">{d}</span>
                <span className="flex-1 text-text-700">
                  {(plan.days[d] ?? []).length === 0
                    ? "—"
                    : plan.days[d]
                        .map((t) => `${t.subject} ${formatHours(t.hours)}${t.topic ? ` (${t.topic})` : ""}`)
                        .join(" · ")}
                </span>
                <span className="tnum shrink-0 text-xs text-text-500">
                  {formatHours(dayHours(plan.days[d] ?? []))} س
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Supervisor → mentor, about one student. */
export function SupervisorNoteBox({
  studentId,
  studentName,
  mentorId,
  mentorName,
}: {
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
}) {
  const me = useSupervisor();
  const notes = useNotesFor(studentId);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function send() {
    if (!text.trim()) return setError("متن یادداشت رو بنویس.");
    addSupervisorNote({ studentId, studentName, mentorId, by: me?.name ?? "سرپرست آموزشی", text: text.trim() });
    setText("");
    setError("");
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, 400));
          setError("");
        }}
        rows={2}
        aria-label="یادداشت برای مشاور"
        placeholder={`مثلاً: برنامه‌ی دوشنبه‌ی ${studentName} از وقت آزادش بیشتره؛ سبک‌ترش کن.`}
        className="w-full rounded-x-md border border-border bg-surface p-2.5 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <Button size="md" className="mt-2" onClick={send}>
        <Send size={14} /> ارسال برای {mentorName}
      </Button>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs">
          {notes.map((n) => (
            <li key={n.id} className="rounded-x-md bg-surface-2 p-2.5">
              <p className="text-text-700">«{n.text}»</p>
              <p className="mt-1 text-text-500">
                {n.at} · {n.seen ? <span className="text-mint-500">مشاور دید ✓</span> : "مشاور هنوز ندیده"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** On the mentor's case file: what the supervisor said about this student. */
export function SupervisorNotesForMentor({ studentId }: { studentId: string }) {
  const notes = useNotesFor(studentId);
  if (notes.length === 0) return null;
  return (
    <div className="mt-4 rounded-x-lg border border-blue-600/30 bg-blue-100/40 p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-text-900">
        <GraduationCap size={15} className="text-blue-600" /> یادداشت سرپرست آموزشی
      </h2>
      <ul className="space-y-2 text-sm">
        {notes.map((n) => (
          <li key={n.id} className="flex items-start gap-2">
            <MessageSquareQuote size={14} className="mt-1 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="text-text-700">«{n.text}»</p>
              <p className="text-xs text-text-500">
                {n.by} · {n.at}
              </p>
            </div>
            {!n.seen && (
              <button
                type="button"
                onClick={() => markNoteSeen(n.id)}
                className="flex shrink-0 items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Check size={12} /> دیدم
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
