"use client";

import { useState } from "react";
import { Moon, Check, BedDouble } from "lucide-react";
import { WeeklySummary } from "@/components/app/WeeklySummary";
import { MistakePattern } from "@/components/app/MistakePattern";
import { Button } from "@/components/ui/Button";
import { REPORT_REACTIONS, moodLabels, studentMistakes, type ReportReaction } from "@/lib/mock-data";
import { useStudentReports } from "@/lib/checkin-store";
import { useMyMistakes } from "@/lib/mistakes-store";
import { giveFeedback, useReportFeedback } from "@/lib/feedback-store";
import { formatStudyTime, sleepMinutes } from "@/lib/checkins";
import { byRecency } from "@/lib/reports";
import { cn, toPersianDigits } from "@/lib/utils";

export function StudentWeekly({ studentId }: { studentId: string }) {
  return <WeeklySummary checkIns={useStudentReports(studentId)} audience="mentor" />;
}

export function StudentMistakes({ studentId }: { studentId: string }) {
  const mine = useMyMistakes();
  const entries = studentId === "me" ? mine : studentMistakes.filter((m) => m.studentId === studentId);
  return <MistakePattern entries={entries} audience="mentor" />;
}

/** Recent nightly reports, each with the mentor's quick feedback. */
export function StudentNightlyReports({
  studentId,
  limit = 3,
  readOnly = false,
}: {
  studentId: string;
  limit?: number;
  readOnly?: boolean; // supervisor: sees the mentor's feedback, can't give any
}) {
  const reports = byRecency(useStudentReports(studentId)).slice(0, limit);
  const feedback = useReportFeedback();

  if (reports.length === 0) return <p className="text-sm text-text-500">هنوز گزارش کاری ثبت نشده.</p>;

  return (
    <div className="space-y-2">
      {reports.map((c) => (
        <div key={c.id} className="rounded-x-md border border-border bg-surface-2 p-3">
          <div className="flex items-start gap-3">
            <Moon size={15} className="mt-0.5 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-500">
                <span className="font-medium text-text-900">{c.date}</span>
                <span>{moodLabels[c.mood]}</span>
                {c.sleep && (
                  <span className="flex items-center gap-1">
                    <BedDouble size={11} />
                    <span className="tnum">
                      {toPersianDigits(c.sleep.bed)}–{toPersianDigits(c.sleep.wake)}
                    </span>{" "}
                    ({formatStudyTime(sleepMinutes(c.sleep))})
                  </span>
                )}
              </div>
              {c.entries.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs text-text-700">
                  {c.entries.map((e, i) => (
                    <li key={i}>
                      <span className="font-medium text-text-900">{e.subject}</span>
                      {e.topic && ` — ${e.topic}`} · {formatStudyTime(e.minutes)} · {toPersianDigits(e.tests)} تست
                    </li>
                  ))}
                </ul>
              )}
              {c.note && <p className="mt-1 text-sm text-text-900">«{c.note}»</p>}
            </div>
          </div>
          {readOnly ? (
            <p className="mt-2 border-t border-border pt-2 text-xs text-text-500">
              {feedback[c.id]
                ? `بازخورد مشاور: ${REPORT_REACTIONS[feedback[c.id].reaction].emoji} ${REPORT_REACTIONS[feedback[c.id].reaction].label}${feedback[c.id].comment ? ` — «${feedback[c.id].comment}»` : ""}`
                : "مشاور هنوز بازخورد نداده."}
            </p>
          ) : (
            <FeedbackBox reportId={c.id} existing={feedback[c.id]} />
          )}
        </div>
      ))}
    </div>
  );
}

function FeedbackBox({
  reportId,
  existing,
}: {
  reportId: string;
  existing?: { reaction: ReportReaction; comment: string; at: string };
}) {
  const [editing, setEditing] = useState(false);
  const [reaction, setReaction] = useState<ReportReaction | null>(existing?.reaction ?? null);
  const [comment, setComment] = useState(existing?.comment ?? "");

  if (existing && !editing) {
    return (
      <div className="mt-2 flex items-start gap-2 border-t border-border pt-2 text-xs">
        <Check size={13} className="mt-0.5 shrink-0 text-mint-500" />
        <div className="flex-1 text-text-700">
          <span className="text-base leading-none">{REPORT_REACTIONS[existing.reaction].emoji}</span>{" "}
          {REPORT_REACTIONS[existing.reaction].label}
          {existing.comment && <> — «{existing.comment}»</>}
          <span className="text-text-500"> · {existing.at}</span>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-blue-600 hover:underline">
          ویرایش
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {(Object.keys(REPORT_REACTIONS) as ReportReaction[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReaction(r)}
            aria-pressed={reaction === r}
            className={cn(
              "rounded-x-pill border px-2.5 py-1 text-xs transition-colors",
              reaction === r ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
            )}
          >
            {REPORT_REACTIONS[r].emoji} {REPORT_REACTIONS[r].label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 200))}
          placeholder="یه جمله برای دانش‌آموز (اختیاری)"
          aria-label="بازخورد"
          className="h-9 flex-1 rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
        />
        <Button
          size="md"
          className="h-9"
          disabled={!reaction}
          onClick={() => {
            if (!reaction) return;
            giveFeedback(reportId, reaction, comment.trim());
            setEditing(false);
          }}
        >
          ارسال بازخورد
        </Button>
      </div>
    </div>
  );
}
