"use client";

import Link from "next/link";
import { MentorShell } from "@/components/app/MentorShell";
import { ReportFeed } from "@/components/app/MentorFeed";
import { MentorOnboarding, MentorToday } from "@/components/app/MentorToday";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { mentorStudents, getRiskInfo } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";
import { useMentorUnreadCounts } from "@/lib/chat-store";

export default function MentorDashboardPage() {
  const unread = useMentorUnreadCounts();
  return (
    <MentorShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="text-lg font-bold text-text-900">داشبورد مشاور</h1>

        <MentorOnboarding />

        {/* Everything that needs you today, most urgent first */}
        <MentorToday />

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">دانش‌آموزان</h2>
        <div className="space-y-2">
          {mentorStudents
            .slice()
            .sort((a, b) => {
              const order = { danger: 0, warning: 1, success: 2, excellent: 3 };
              return order[getRiskInfo(a).level] - order[getRiskInfo(b).level];
            })
            .map((s) => {
              const risk = getRiskInfo(s);
              return (
                <Link key={s.id} href={`/mentor/students/${s.id}`}>
                  <Card interactive>
                    <CardContent className="flex items-center gap-3 py-3.5">
                      <Avatar name={s.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text-900">{s.name}</span>
                          <Badge tone={risk.level}>{risk.label}</Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-text-500">
                          {risk.reason ?? `${s.grade} · آخرین گزارش کار: ${s.lastCheckIn}`}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="tnum text-sm font-bold text-text-900">{toPersianDigits(s.planCompletion)}٪</div>
                        <div className="text-xs text-text-500">برنامه</div>
                      </div>
                      {(unread[s.id] ?? 0) > 0 && (
                        <span className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                          {toPersianDigits(unread[s.id])}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>

        {/* Nightly reports — this replaces reading the Telegram group */}
        <ReportFeed />
      </div>
    </MentorShell>
  );
}
