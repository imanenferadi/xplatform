"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import { mentors, type ExamGroup } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const GROUPS: ExamGroup[] = ["تجربی", "ریاضی", "انسانی"];
const MIN_RATINGS = [0, 4.5, 4.8];

export default function MentorsListPage() {
  const [group, setGroup] = useState<ExamGroup | "همه">("همه");
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(
    () =>
      mentors.filter((m) => {
        if (group !== "همه" && m.group !== group) return false;
        if (m.rating < minRating) return false;
        if (onlyAvailable && m.capacity === 0) return false;
        return true;
      }),
    [group, minRating, onlyAvailable]
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-900 md:text-[32px]">همه‌ی مشاوران</h1>
          <p className="mt-2 text-text-500">فهرست کامل — برای پیشنهاد شخصی‌سازی‌شده به تعیین سطح برو.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {(["همه", ...GROUPS] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={cn(
                  "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  group === g
                    ? "border-blue-600 bg-blue-100 text-text-900"
                    : "border-border bg-surface text-text-700"
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <span className="mx-1 h-4 w-px bg-border" />
          <div className="flex flex-wrap gap-1.5">
            {MIN_RATINGS.map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={cn(
                  "tnum rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  minRating === r
                    ? "border-blue-600 bg-blue-100 text-text-900"
                    : "border-border bg-surface text-text-700"
                )}
              >
                {r === 0 ? "همه‌ی امتیازها" : `${r}+`}
              </button>
            ))}
          </div>
          <span className="mx-1 h-4 w-px bg-border" />
          <button
            onClick={() => setOnlyAvailable((v) => !v)}
            className={cn(
              "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
              onlyAvailable
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border bg-surface text-text-700"
            )}
          >
            فقط با ظرفیت خالی
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-500">با این فیلترها مشاوری پیدا نشد.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {filtered.map((m) => (
              <Card key={m.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-1 font-bold text-text-900">
                        {m.name}
                        {m.verified && (
                          <BadgeCheck size={15} className="text-blue-600" aria-label="مشاور تأییدشده" />
                        )}
                      </div>
                      <div className="text-xs text-text-500">
                        {m.major}، {m.school}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="brand">{m.rank}</Badge>
                    <Badge tone="neutral">{m.group}</Badge>
                    <Badge tone="info">{m.style}</Badge>
                  </div>

                  <div className="mt-4 flex flex-1 items-end justify-between text-xs text-text-500">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-yellow-400 text-yellow-400" />
                      <span className="tnum">{m.rating}</span> ({m.reviewCount} نظر)
                    </span>
                    <span className="tnum">
                      {m.capacity === 0 ? "ظرفیت تکمیل" : `${m.capacity} ظرفیت باقی‌مانده`}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/mentors/${m.id}`} className={buttonVariants({ size: "md", className: "w-full" })}>
                    مشاهده پروفایل
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
