"use client";

import { useMemo, useState } from "react";
import { ScrollText, UserCheck, Users, Wallet, ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { platformLogs, type LogCategory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<LogCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  مشاوران: UserCheck,
  کاربران: Users,
  مالی: Wallet,
  شکایات: ShieldAlert,
};

const CATEGORIES: LogCategory[] = ["مشاوران", "کاربران", "مالی", "شکایات"];

export default function AdminLogsPage() {
  const [category, setCategory] = useState<LogCategory | "همه">("همه");

  const filtered = useMemo(
    () => (category === "همه" ? platformLogs : platformLogs.filter((l) => l.category === category)),
    [category]
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <ScrollText size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">لاگ فعالیت‌ها</h1>
        </div>
        <p className="mb-4 text-sm text-text-500">
          تاریخچه‌ی رویدادهای پلتفرم — برای بررسی شکایت‌ها و ردیابی تراکنش‌ها.
        </p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {(["همه", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((log) => {
            const Icon = CATEGORY_ICON[log.category];
            return (
              <Card key={log.id}>
                <CardContent className="flex items-center gap-3 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <Icon size={15} className="text-text-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-text-900">
                      <span className="font-medium">{log.actor}</span> — {log.action}
                    </div>
                    <div className="truncate text-xs text-text-500">{log.target}</div>
                  </div>
                  <div className="shrink-0 text-xs text-text-500">{log.timestamp}</div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">رویدادی در این دسته ثبت نشده.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
