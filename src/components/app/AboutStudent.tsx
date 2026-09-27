"use client";

import { BookOpen } from "lucide-react";
import { BOOK_STATUS_LABEL, CHECKIN_SUBJECTS, WEEK_DAYS } from "@/lib/mock-data";
import { useStudentSetup } from "@/lib/setup-store";
import { freeHours } from "@/lib/schedule";
import { cn, toPersianDigits } from "@/lib/utils";

// What the student told us at start-up: goals, real free time, own books.
export function AboutStudent({ studentId }: { studentId: string }) {
  const { intake, schedule, books } = useStudentSetup(studentId);

  return (
    <div className="space-y-4">
      {intake ? (
        <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
          <Item label="رشته‌ی هدف" value={intake.targetMajor} />
          <Item label="سهمیه" value={intake.quota} />
          <Item label="آزمون‌ها" value={intake.exams.join("، ") || "—"} />
          <Item label="مطالعه‌ی فعلی" value={intake.dailyHours} />
          <Item label="سخت‌ترین چالش" value={intake.challenges.join("، ")} />
          <Item label="نهایی" value={intake.finals} />
          {intake.expectation && (
            <div className="sm:col-span-2">
              <dt className="inline text-text-500">از مشاورش می‌خواد: </dt>
              <dd className="inline text-text-900">«{intake.expectation}»</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="text-xs text-text-500">هنوز پرسشنامه‌ی شروع رو پر نکرده.</p>
      )}

      <div>
        <div className="mb-1.5 text-xs font-bold text-text-900">وقت آزاد تقریبی هر روز (بعد از مدرسه و کلاس)</div>
        {schedule.length === 0 ? (
          <p className="text-xs text-text-500">ساعت مدرسه و کلاس‌هاش ثبت نشده.</p>
        ) : (
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {WEEK_DAYS.map((d) => {
              const h = freeHours(schedule, d);
              return (
                <div key={d} className="rounded-x-sm bg-surface-2 px-1 py-1.5">
                  <div className="text-text-500">{d.slice(0, 2)}</div>
                  <div className={cn("font-bold", h < 6 ? "text-orange-500" : "text-text-900")}>
                    <span className="tnum">{toPersianDigits(h)}</span>س
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {schedule.some((c) => c.kind === "class") && (
          <p className="mt-1 text-xs text-text-500">
            کلاس‌ها:{" "}
            {schedule
              .filter((c) => c.kind === "class")
              .map((c) => `${c.title} (${c.day} ${toPersianDigits(c.start)}–${toPersianDigits(c.end)})`)
              .join("، ")}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 text-xs font-bold text-text-900">کتاب‌ها و منابع</div>
        {books.length === 0 ? (
          <p className="text-xs text-text-500">هنوز کتابی ثبت نکرده.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {CHECKIN_SUBJECTS.flatMap((s) => books.filter((b) => b.subject === s)).map((b) => (
              <span key={b.id} className="rounded-x-pill bg-surface-2 px-2.5 py-1 text-xs text-text-700">
                <span className="font-medium text-text-900">{b.subject}:</span> {b.title} ({b.kind}،{" "}
                {BOOK_STATUS_LABEL[b.status]})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="inline text-text-500">{label}: </dt>
      <dd className="inline text-text-900">{value}</dd>
    </div>
  );
}

/** The student's own books for one subject, next to a plan row. */
export function BooksHint({ studentId, subject }: { studentId: string; subject: string }) {
  const { books } = useStudentSetup(studentId);
  const list = books.filter((b) => b.subject === subject && b.status !== "done");
  if (list.length === 0) return null;
  return (
    <div className="mt-1 flex items-center gap-1 text-xs text-text-500">
      <BookOpen size={11} /> منابعش: {list.map((b) => `${b.title} (${b.kind})`).join("، ")}
    </div>
  );
}
