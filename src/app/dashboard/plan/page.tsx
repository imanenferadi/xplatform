"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const week = [
  { day: "شنبه", tasks: [{ subject: "ریاضی", topic: "فصل ۳ — مشتق", done: true, aiGenerated: true }] },
  {
    day: "یکشنبه",
    tasks: [
      { subject: "فیزیک", topic: "حرکت‌شناسی", done: true, aiGenerated: true },
      { subject: "شیمی", topic: "تست‌زنی فصل ۲", done: false, aiGenerated: false },
    ],
  },
  { day: "دوشنبه", tasks: [{ subject: "زیست", topic: "فیزیولوژی گیاهی", done: false, aiGenerated: true }] },
  {
    day: "سه‌شنبه",
    tasks: [
      { subject: "ریاضی", topic: "مرور نکات کنکوری", done: false, aiGenerated: true },
      { subject: "شیمی", topic: "شیمی آلی — جلسه با مشاور", done: false, aiGenerated: false },
    ],
  },
  { day: "چهارشنبه", tasks: [{ subject: "فیزیک", topic: "تست جامع", done: false, aiGenerated: true }] },
];

export default function PlanPage() {
  const [behind, setBehind] = useState(false);

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-900">برنامه‌ی هفتگی</h1>
          <Button variant="secondary" size="md" onClick={() => setBehind((b) => !b)}>
            <RotateCcw size={16} />
            عقب افتادم؛ بازچینی کن
          </Button>
        </div>

        {behind && (
          <Card className="mb-5 border-orange-500/30 bg-orange-500/10">
            <CardContent className="text-sm text-text-700">
              <span className="font-medium text-text-900">بازچینی شد.</span> کارهای انجام‌نشده روی
              روزهای باقی‌مانده‌ی هفته پخش شدند. سبک‌تر شد، نه سنگین‌تر.
            </CardContent>
          </Card>
        )}

        <div className="space-y-5">
          {week.map((d) => (
            <div key={d.day}>
              <h2 className="mb-2 text-sm font-bold text-text-900">{d.day}</h2>
              <div className="space-y-2">
                {d.tasks.map((t, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-center gap-3 py-3.5">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          t.done ? "bg-mint-500" : "bg-border"
                        )}
                      />
                      <div className="flex-1">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            t.done ? "text-text-500 line-through" : "text-text-900"
                          )}
                        >
                          {t.topic}
                        </div>
                        <div className="text-xs text-text-500">{t.subject}</div>
                      </div>
                      {t.aiGenerated ? (
                        <Badge tone="info">
                          <Sparkles size={11} /> پیشنهاد سیستم
                        </Badge>
                      ) : (
                        <Badge tone="success">تأیید مشاور ✓</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
