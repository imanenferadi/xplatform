"use client";

import Link from "next/link";
import { BarChart3, Moon } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { WeeklySummary } from "@/components/app/WeeklySummary";
import { Card, CardContent } from "@/components/ui/Card";
import { useMyCheckIns } from "@/lib/checkin-store";

export default function WeeklyTotalsPage() {
  const checkIns = useMyCheckIns();

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">جمع هفته</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          همه‌ی گزارش کارهای هفته، درس به درس جمع زده شده — همین جدول رو مشاورت هم می‌بینه.
        </p>

        <Card>
          <CardContent>
            <WeeklySummary checkIns={checkIns} audience="student" />
          </CardContent>
        </Card>

        <Link
          href="/dashboard/report"
          className="mt-4 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 text-sm transition-colors hover:bg-surface-2"
        >
          <Moon size={16} className="text-blue-600" />
          <span className="flex-1 text-text-900">گزارش کار امشب رو فرستادی؟</span>
        </Link>
      </div>
    </StudentShell>
  );
}
