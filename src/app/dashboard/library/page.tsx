"use client";

import { useState } from "react";
import { FileText, Headphones, Video } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  contentLibrary,
  type ContentItem,
  type Subject,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  ContentItem["type"],
  { icon: typeof FileText; label: string }
> = {
  pdf: { icon: FileText, label: "PDF" },
  audio: { icon: Headphones, label: "صوتی" },
  video: { icon: Video, label: "ویدیو" },
};

const subjects: (Subject | "همه")[] = ["همه", "ریاضی", "فیزیک", "شیمی", "زیست"];

export default function StudentLibraryPage() {
  const [filter, setFilter] = useState<Subject | "همه">("همه");
  const items =
    filter === "همه"
      ? contentLibrary
      : contentLibrary.filter((i) => i.subject === filter);

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 className="text-xl font-bold text-text-900">کتابخونه‌ی مشاورت</h1>
        <p className="mt-1 text-sm text-text-500">
          جزوه، ویس و ویدیوهایی که سارا محمدی برات گذاشته.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 rounded-x-pill border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === s
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {items.map((item) => {
            const meta = typeMeta[item.type];
            const Icon = meta.icon;
            return (
              <Card key={item.id} interactive>
                <CardContent className="flex items-center gap-3 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-500">
                      {item.topic} · {item.uploadedAt}
                    </div>
                  </div>
                  <Badge tone="neutral">{meta.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">
              هنوز محتوایی برای این درس نیست.
            </p>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
