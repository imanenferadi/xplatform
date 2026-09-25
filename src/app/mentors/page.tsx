"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Star, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonVariants } from "@/components/ui/Button";
import { mentors, type ExamGroup } from "@/lib/mock-data";
import { useApprovedMentors } from "@/lib/mentor-applications-store";
import { useCapacityOverrides } from "@/lib/capacity-store";
import { cn, toPersianDigits } from "@/lib/utils";

const GROUPS: ExamGroup[] = ["تجربی", "ریاضی", "انسانی"];
const MIN_RATINGS = [0, 4.5, 4.8];
const MAX_COMPARE = 2;

export default function MentorsListPage() {
  const router = useRouter();
  const [group, setGroup] = useState<ExamGroup | "همه">("همه");
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= MAX_COMPARE) return s;
      return [...s, id];
    });
  }

  function exitCompareMode() {
    setCompareMode(false);
    setSelected([]);
  }

  const approved = useApprovedMentors();
  const remainingSeats = useCapacityOverrides();
  const allMentors = useMemo(
    () => [...mentors, ...approved].map((m) => ({ ...m, capacity: remainingSeats(m) })),
    [approved, remainingSeats]
  );

  const filtered = useMemo(
    () =>
      allMentors.filter((m) => {
        if (group !== "همه" && m.group !== group) return false;
        if (m.rating < minRating) return false;
        if (onlyAvailable && m.capacity === 0) return false;
        return true;
      }),
    [allMentors, group, minRating, onlyAvailable]
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div>
            <h1 className="text-2xl font-bold text-text-900 md:text-[32px]">همه‌ی مشاوران</h1>
            <p className="mt-2 text-text-500">فهرست کامل — برای پیشنهاد شخصی‌سازی‌شده به تعیین سطح برو.</p>
          </div>
          <button
            onClick={() => (compareMode ? exitCompareMode() : setCompareMode(true))}
            className={cn(
              "flex items-center gap-1.5 rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
              compareMode
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border bg-surface text-text-700"
            )}
          >
            <Scale size={14} />
            {compareMode ? "خروج از حالت مقایسه" : "مقایسه‌ی دو مشاور"}
          </button>
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
            {filtered.map((m) => {
              const isSelected = selected.includes(m.id);
              return (
                <Card
                  key={m.id}
                  className={cn("flex flex-col", compareMode && isSelected && "border-blue-600 ring-2 ring-blue-600/20")}
                >
                  <CardContent className="flex flex-1 flex-col">
                    <div className="flex items-center gap-3">
                      {compareMode && (
                        <button
                          onClick={() => toggleSelect(m.id)}
                          disabled={!isSelected && selected.length >= MAX_COMPARE}
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-x-sm border-2 transition-colors disabled:opacity-30",
                            isSelected ? "border-blue-600 bg-blue-600" : "border-border"
                          )}
                          aria-label={`انتخاب ${m.name} برای مقایسه`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-x-sm bg-white" />}
                        </button>
                      )}
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
                      {m.reviewCount === 0 ? (
                        <Badge tone="success">مشاور تازه‌وارد</Badge>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Star size={13} className="fill-yellow-400 text-yellow-400" />
                          <span className="tnum">{m.rating}</span> ({m.reviewCount} نظر)
                        </span>
                      )}
                      <span>
                        {m.capacity === 0 ? (
                          "ظرفیت تکمیل"
                        ) : (
                          <>
                            <span className="tnum">{toPersianDigits(m.capacity)}</span> ظرفیت باقی‌مانده
                          </>
                        )}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/mentors/${m.id}`} className={buttonVariants({ size: "md", className: "w-full" })}>
                      مشاهده پروفایل
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {compareMode && selected.length === MAX_COMPARE && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-x-lg border border-border bg-surface px-4 py-3 shadow-x-md">
            <span className="text-sm text-text-700">
              {selected.map((id) => allMentors.find((m) => m.id === id)?.name).join(" و ")}
            </span>
            <Button size="md" onClick={() => router.push(`/mentors/compare?a=${selected[0]}&b=${selected[1]}`)}>
              مقایسه کن
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
