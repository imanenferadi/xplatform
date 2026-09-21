"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Moon } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { studentPlan, moodLabels, type NightlyCheckIn } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Mood = NightlyCheckIn["mood"];

export default function NightlyCheckInPage() {
  const router = useRouter();
  const [minutesBySubject, setMinutesBySubject] = useState<Record<number, string>>({});
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) return;
    // Mock submit — in the real product this becomes a row the mentor sees
    // in their nightly check-in feed, replacing the Telegram group report.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <StudentShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
            <Check size={28} className="text-mint-500" />
          </div>
          <h1 className="text-xl font-bold text-text-900">چک‌این امشب ثبت شد ✓</h1>
          <p className="mt-2 max-w-xs text-sm text-text-500">
            سارا محمدی امشب گزارشت رو می‌بینه. شب بخیر، فردا ادامه می‌دیم.
          </p>
          <Button size="lg" className="mt-8" onClick={() => router.push("/dashboard")}>
            برو به داشبورد
          </Button>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <Moon size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">چک‌این امشب</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          ۳۰ ثانیه وقت بذار — همینی که هر شب توی گروه تلگرام می‌نوشتی، الان اینجا می‌ره مستقیم برای مشاورت.
        </p>

        <form onSubmit={submit} className="space-y-5">
          {/* Per-subject minutes, seeded from today's plan */}
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">امروز چقدر خوندی؟</h2>
              <div className="space-y-3">
                {studentPlan.todayTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-900">{t.topic}</div>
                      <div className="text-xs text-text-500">{t.subject}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder={String(t.duration)}
                        value={minutesBySubject[t.id] ?? ""}
                        onChange={(e) =>
                          setMinutesBySubject((m) => ({ ...m, [t.id]: e.target.value }))
                        }
                        className="tnum h-10 w-16 rounded-x-sm border border-border bg-surface text-center text-sm text-text-900 outline-none focus:border-blue-600"
                      />
                      <span className="text-xs text-text-500">دقیقه</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">امروز حالت چطور بود؟</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(moodLabels) as Mood[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={cn(
                      "rounded-x-md border-2 px-3 py-3 text-sm font-medium transition-colors",
                      mood === m
                        ? "border-blue-600 bg-blue-100 text-text-900"
                        : "border-border bg-surface text-text-700 hover:border-blue-300"
                    )}
                  >
                    {moodLabels[m]}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Free-text note */}
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">
                یه خط برای مشاورت بنویس <span className="font-normal text-text-500">(اختیاری)</span>
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="مثلاً: شیمی امروز خیلی سخت بود، گیر کردم رو تعادل شیمیایی..."
                className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={!mood}>
            ثبت چک‌این امشب
          </Button>
        </form>
      </div>
    </StudentShell>
  );
}
