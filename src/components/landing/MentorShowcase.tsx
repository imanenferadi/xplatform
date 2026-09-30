"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { mentors, type ExamGroup } from "@/lib/mock-data";
import { useApprovedMentors } from "@/lib/mentor-applications-store";
import { useCapacityOverrides } from "@/lib/capacity-store";
import { cn, toPersianDigits } from "@/lib/utils";
import { mentorsByRank } from "./mentor-ranking";

const TABS: (ExamGroup | "همه")[] = ["همه", "تجربی", "ریاضی"];
const SHOWN = 6;

/** The mentor list is the landing page's main content: pick first, placement is optional. */
export function MentorShowcase() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("همه");
  const approved = useApprovedMentors();
  const seats = useCapacityOverrides();
  const all = useMemo(
    () =>
      mentorsByRank([...mentors, ...approved])
        .map((m) => ({ ...m, capacity: seats(m) }))
        // Open seats first; a full mentor still shows, after the rest.
        .sort((a, b) => Number(a.capacity === 0) - Number(b.capacity === 0)),
    [approved, seats],
  );
  const list = all.filter((m) => tab === "همه" || m.group === tab);

  return (
    <section
      id="mentors"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
            مشاورهای رتبه‌برتر
          </h2>
          <p className="mt-3 text-text-500">
            رتبه‌ی همه با کارنامه‌ی کنکور احراز شده. پروفایل هر کدوم رو باز کن،
            داستان مسیرش رو بخون و جلسه‌ی آشنایی رایگان بگیر.
          </p>
        </div>
        <div role="tablist" aria-label="رشته" className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-x-pill border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Phones: one swipeable row instead of a 2000px stack. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, SHOWN).map((m) => (
          <Card
            key={m.id}
            interactive
            className="flex w-[82%] shrink-0 snap-start flex-col sm:w-auto"
          >
            <CardContent className="flex flex-1 flex-col">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-text-900"
                >
                  {m.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-bold text-text-900">
                    {m.name}
                    {m.verified && (
                      <BadgeCheck
                        size={15}
                        className="text-blue-600"
                        aria-label="رتبه احراز شده"
                      />
                    )}
                  </div>
                  <div className="text-xs text-text-500">{m.school}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="brand">{m.rank}</Badge>
                <Badge tone="neutral">{m.year}</Badge>
                <Badge tone="neutral">{m.group}</Badge>
                <Badge tone="info">{m.style}</Badge>
              </div>

              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-[1.8] text-text-700">
                {m.story}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-text-500">
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  <span className="tnum">{toPersianDigits(m.rating)}</span> (
                  {toPersianDigits(m.reviewCount)} نظر)
                </span>
                <span
                  className={m.capacity === 0 ? "text-orange-500" : undefined}
                >
                  {m.capacity === 0
                    ? "ظرفیت تکمیل — لیست انتظار"
                    : `${toPersianDigits(m.capacity)} ظرفیت خالی`}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`/mentors/${m.id}`}
                className={buttonVariants({ className: "w-full", size: "md" })}
              >
                پروفایل و جلسه‌ی آشنایی
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-sm text-text-500">
        <Link
          href="/mentors"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          همه‌ی مشاورها ({toPersianDigits(all.length)} نفر) — با فیلتر و مقایسه
          <ArrowLeft size={16} />
        </Link>
        <span>
          نمی‌دونی کدوم؟ بعد از ثبت‌نام می‌تونی تعیین سطح بدی تا ۳ مشاور
          نزدیک‌تر به مسیرت پیشنهاد بشه.
        </span>
      </div>
    </section>
  );
}
