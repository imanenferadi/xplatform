"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CURRENT_DAY_NAME,
  WEEK_DAYS,
  WEEK_LABELS,
  mentors,
  type NightlyCheckIn,
  type WeekPlan,
} from "@/lib/mock-data";
import { useStudentReports } from "@/lib/checkin-store";
import {
  formatHours,
  planProgress,
  useDoneIds,
  usePublishedWeek,
} from "@/lib/plan-store";
import {
  aggregateWeek,
  formatClockTime,
  formatStudyTime,
} from "@/lib/checkins";
import { useHydrated } from "@/lib/local-store";
import { toPersianDigits } from "@/lib/utils";

/** Plain text for WhatsApp/Bale — no markdown, one fact per line. */
export function weeklyReportText(opts: {
  name: string;
  checkIns: NightlyCheckIn[];
  plan: WeekPlan | null;
  doneIds: Set<string>;
  includeSleep: boolean;
}): string {
  const w = aggregateWeek(opts.checkIns, "this");
  const progress = planProgress(opts.plan, opts.doneIds, CURRENT_DAY_NAME);
  const nights = WEEK_DAYS.indexOf(CURRENT_DAY_NAME) + 1;
  const lines = [
    `📊 گزارش هفته‌ی ${opts.name} — ${WEEK_LABELS.this}`,
    `⏱ مطالعه: ${formatStudyTime(w.totalMinutes)}`,
  ];
  if (opts.plan)
    lines.push(
      `✅ اجرای برنامه تا امروز: ${toPersianDigits(progress.percent)}٪ (${formatHours(progress.ticked)} از ${formatHours(progress.planned)} ساعت)`,
    );
  lines.push(
    `📝 تست: ${toPersianDigits(w.totalTests)}`,
    `🌙 گزارش کار: ${toPersianDigits(w.checkedInDays.size)} از ${toPersianDigits(nights)} شب`,
  );
  if (w.subjects.length) {
    lines.push("", "📚 درس به درس:");
    for (const s of w.subjects)
      lines.push(
        `• ${s.subject}: ${formatStudyTime(s.minutes)}${s.tests ? `، ${toPersianDigits(s.tests)} تست` : ""}`,
      );
  }
  if (opts.includeSleep && w.sleep.nights)
    lines.push(
      "",
      `😴 میانگین خواب: ${formatStudyTime(w.sleep.avgMinutes)} · بیداری حدود ${formatClockTime(w.sleep.avgWake)}`,
    );
  lines.push("", `مشاور: ${mentors[0].name}`);
  return lines.join("\n");
}

// «کپی گزارش هفته» — for pasting into a family group or sending a parent.
export function CopyWeeklyReport({
  studentId,
  name,
  includeSleep,
}: {
  studentId: string;
  name: string;
  includeSleep: boolean;
}) {
  const checkIns = useStudentReports(studentId);
  const plan = usePublishedWeek(studentId, "this");
  const doneIds = useDoneIds();
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const text = weeklyReportText({
    name,
    checkIns,
    plan,
    doneIds,
    includeSleep,
  });
  const canShare =
    hydrated &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard blocked (non-secure context) — show the text so it can be copied by hand.
      setPreview(true);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="md" variant="secondary" onClick={copy}>
          {copied ? (
            <Check size={14} className="text-mint-500" />
          ) : (
            <ClipboardCopy size={14} />
          )}
          {copied ? "کپی شد" : "کپی گزارش هفته"}
        </Button>
        {canShare && (
          <Button
            size="md"
            variant="secondary"
            onClick={() => navigator.share({ text }).catch(() => {})}
          >
            <Share2 size={14} /> اشتراک
          </Button>
        )}
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {preview ? "بستن متن" : "دیدن متن"}
        </button>
      </div>
      {preview && (
        <pre className="mt-2 whitespace-pre-wrap rounded-x-md bg-surface-2 p-3 font-sans text-xs leading-[1.9] text-text-700">
          {text}
        </pre>
      )}
    </div>
  );
}
