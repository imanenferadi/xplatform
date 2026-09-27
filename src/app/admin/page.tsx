"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, ChevronLeft, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExportButton, FilterSelect } from "@/components/admin/AdminKit";
import { useAdminInbox, type InboxPriority } from "@/lib/admin-inbox";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn, toPersianDigits } from "@/lib/utils";

const PRIORITY: Record<InboxPriority, { label: string; tone: "danger" | "warning" | "neutral"; dot: string }> = {
  urgent: { label: "فوری", tone: "danger", dot: "bg-red-500" },
  high: { label: "امروز", tone: "warning", dot: "bg-orange-500" },
  normal: { label: "این هفته", tone: "neutral", dot: "bg-text-500/40" },
};

// The admin home: one queue of everything waiting on someone, most urgent
// first, each item one click from the page that resolves it.
export default function AdminTodayPage() {
  const items = useAdminInbox();
  const [kind, setKind] = useState<string>("همه");
  const kinds = [...new Set(items.map((i) => i.kind))];
  const visible = items.filter((i) => kind === "همه" || i.kind === kind);
  const count = (p: InboxPriority) => items.filter((i) => i.priority === p).length;

  function exportCsv() {
    downloadCsv(
      "x-admin-today.csv",
      toCsv(
        ["اولویت", "نوع", "عنوان", "جزئیات", "صفحه"],
        visible.map((i) => [PRIORITY[i.priority].label, i.kind, i.title, i.detail, i.href])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <Inbox size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">امروز</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          همه‌ی کارهای منتظر، از همه‌ی بخش‌ها، به ترتیب فوریت. هر مورد با رسیدگی در صفحه‌ی خودش از اینجا برمی‌داره.
        </p>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {(Object.keys(PRIORITY) as InboxPriority[]).map((p) => (
            <Card key={p}>
              <CardContent className="py-3.5">
                <div className="flex items-center gap-1.5 text-xs text-text-500">
                  <span className={cn("h-2 w-2 rounded-full", PRIORITY[p].dot)} /> {PRIORITY[p].label}
                </div>
                <div className="tnum mt-1 text-xl font-bold text-text-900">{toPersianDigits(count(p))}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <FilterSelect
            value={kind}
            onChange={setKind}
            label="نوع"
            options={kinds.map((k) => ({ value: k, label: k }))}
          />
          <span className="flex-1" />
          <ExportButton count={visible.length} onExport={exportCsv} />
        </div>

        {visible.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-mint-500">
              <CheckCircle2 size={18} /> کاری منتظر نیست.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-border/60">
              {visible.map((i) => (
                <li key={i.key}>
                  <Link
                    href={i.href}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY[i.priority].dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={PRIORITY[i.priority].tone}>{i.kind}</Badge>
                        <span className="text-sm font-medium text-text-900">{i.title}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-text-500">{i.detail}</div>
                    </div>
                    <span className="flex shrink-0 items-center text-xs text-blue-600">
                      رسیدگی <ChevronLeft size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
