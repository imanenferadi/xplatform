"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import { mentors, type Mentor, type Subject } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";
import { useApprovedMentors } from "@/lib/mentor-applications-store";

const ALL_SUBJECTS: Subject[] = ["ریاضی", "فیزیک", "شیمی", "زیست"];

function strengthScore(mentor: Mentor, subject: Subject): number | null {
  return mentor.strengths.find((s) => s.subject === subject)?.score ?? null;
}

function ComparePageInner() {
  const params = useSearchParams();
  const approved = useApprovedMentors();
  const all = [...mentors, ...approved];
  const a = all.find((m) => m.id === params.get("a"));
  const b = all.find((m) => m.id === params.get("b"));

  if (!a || !b) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <p className="text-text-500">برای مقایسه، دو مشاور را از فهرست انتخاب کن.</p>
        <Link href="/mentors" className={buttonVariants({ size: "lg", className: "mt-4" })}>
          بازگشت به فهرست مشاوران
        </Link>
      </div>
    );
  }

  const pair = [a, b];

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-900">مقایسه‌ی دو مشاور</h1>

        <div className="grid grid-cols-2 gap-4">
          {pair.map((m) => (
            <div key={m.id} className="flex flex-col items-center rounded-x-lg border border-border bg-surface p-5 text-center">
              <Avatar name={m.name} size="xl" />
              <div className="mt-3 flex items-center gap-1 font-bold text-text-900">
                {m.name}
                {m.verified && <BadgeCheck size={15} className="text-blue-600" aria-label="مشاور تأییدشده" />}
              </div>
              <div className="mt-1 text-xs text-text-500">
                {m.major}، {m.school}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 divide-y divide-border rounded-x-lg border border-border bg-surface">
          <CompareRow label="رتبه">{pair.map((m) => m.rank)}</CompareRow>
          <CompareRow label="سال کنکور">{pair.map((m) => m.year)}</CompareRow>
          <CompareRow label="گروه آزمایشی">{pair.map((m) => m.group)}</CompareRow>
          <CompareRow label="سبک تدریس">{pair.map((m) => m.style)}</CompareRow>
          <CompareRow label="امتیاز">
            {pair.map((m) => (
              <span key={m.id} className="flex items-center justify-center gap-1">
                <Star size={13} className="fill-yellow-400 text-yellow-400" />
                <span className="tnum">{toPersianDigits(m.rating)}</span>
                <span className="text-text-500">({toPersianDigits(m.reviewCount)})</span>
              </span>
            ))}
          </CompareRow>
          <CompareRow label="ظرفیت باقی‌مانده">
            {pair.map((m) => (m.capacity === 0 ? "تکمیل" : <span key={m.id} className="tnum">{toPersianDigits(m.capacity)}</span>))}
          </CompareRow>
          {ALL_SUBJECTS.map((subject) => (
            <CompareRow key={subject} label={`نقطه‌قوت — ${subject}`}>
              {pair.map((m) => {
                const score = strengthScore(m, subject);
                return score !== null ? (
                  <span key={m.id} className="tnum">
                    {toPersianDigits(score)}٪
                  </span>
                ) : (
                  <span key={m.id} className="text-text-500">
                    —
                  </span>
                );
              })}
            </CompareRow>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {pair.map((m) => (
            <Link key={m.id} href={`/mentors/${m.id}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
              پروفایل {m.name.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  const cells = Array.isArray(children) ? children : [children];
  return (
    <div className="grid grid-cols-[120px_1fr_1fr] items-center gap-2 px-4 py-3 text-sm sm:grid-cols-[160px_1fr_1fr]">
      <span className="text-xs text-text-500">{label}</span>
      {cells.map((c, i) => (
        <span key={i} className="text-center font-medium text-text-900">
          {c}
        </span>
      ))}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}
