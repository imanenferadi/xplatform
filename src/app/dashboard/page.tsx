import Link from "next/link";
import { ArrowLeft, MessageCircle, CalendarClock, Flame, Moon, FileText, Timer } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { mentors, studentPlan } from "@/lib/mock-data";
import { toPersianDigits, cn } from "@/lib/utils";

export default function DashboardPage() {
  const mentor = mentors[0];
  const todoCount = studentPlan.todayTasks.filter((t) => t.status === "todo").length;

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 className="text-xl font-bold text-text-900">سلام ایمان 👋</h1>
        <p className="mt-1 text-sm text-text-500">امروز {toPersianDigits(todoCount)} کار داری</p>

        {/* Hero task card */}
        <Card className="mt-5 border-blue-600/20 bg-blue-100">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-text-500">شروع کن با</div>
              <div className="font-bold text-text-900">{studentPlan.todayTasks[0].topic}</div>
              <div className="tnum mt-1 text-xs text-text-500">
                {studentPlan.todayTasks[0].duration} دقیقه · {studentPlan.todayTasks[0].subject}
              </div>
            </div>
            <Link href="/dashboard/plan" className={buttonVariants({ size: "md" })}>
              شروع کن
              <ArrowLeft size={16} />
            </Link>
          </CardContent>
        </Card>

        {/* Secondary cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarClock size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-500">جلسه‌ی بعدی با {mentor.name}</div>
                <div className="text-sm font-medium text-text-900">شنبه، ساعت ۱۸:۰۰</div>
              </div>
              <Link href={`/session/${mentor.id}`} className={buttonVariants({ size: "md" })}>
                شروع جلسه
              </Link>
            </CardContent>
          </Card>
          <Link href="/chat">
            <Card interactive>
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                  <MessageCircle size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-xs text-text-500">پیام خوانده‌نشده</div>
                  <div className="text-sm font-medium text-text-900">۱ پیام از {mentor.name}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Weekly progress */}
        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-900">پیشرفت این هفته</h3>
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <Flame size={14} />
                <span className="tnum">{studentPlan.streakDays}</span> روز پشت‌سرهم
              </span>
            </div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-text-700">ساعت مطالعه</span>
              <span className="tnum text-text-500">
                {studentPlan.weekCompletedHours} از {studentPlan.weekHours} ساعت
              </span>
            </div>
            <ProgressBar value={(studentPlan.weekCompletedHours / studentPlan.weekHours) * 100} />
          </CardContent>
        </Card>

        {/* Today's tasks */}
        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">برنامه‌ی امروز</h2>
        <div className="space-y-3">
          {studentPlan.todayTasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <div
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    t.status === "done" ? "bg-mint-500" : "bg-border"
                  )}
                />
                <div className="flex-1">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      t.status === "done" ? "text-text-500 line-through" : "text-text-900"
                    )}
                  >
                    {t.topic}
                  </div>
                  <div className="tnum text-xs text-text-500">
                    {t.subject} · {t.duration} دقیقه
                  </div>
                </div>
                {t.status === "todo" ? (
                  <Button size="md" variant="secondary">
                    شروع
                  </Button>
                ) : (
                  <Badge tone="success">انجام شد</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nightly check-in — replaces the mentor's Telegram group report */}
        <Link
          href="/dashboard/checkin"
          className="mt-4 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900/10">
            <Moon size={18} className="text-navy-900" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">چک‌این امشب رو بزن</div>
            <div className="text-xs text-text-500">۳۰ ثانیه — می‌ره مستقیم برای {mentor.name}</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        {/* Focus timer — quick access, since it's not in the mobile bottom nav (already full). */}
        <Link
          href="/dashboard/focustimer"
          className="mt-3 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Timer size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">می‌خوای فوکوس کنی؟</div>
            <div className="text-xs text-text-500">تایمر فوکوس و استراحت رو بزن</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        {/* Karnameh upload — the student is the one who gets the exam
            result from Kanoon/Gaj, so they should be able to send it
            straight from here instead of via Telegram. */}
        <Link
          href="/dashboard/karnameh"
          className="mt-3 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">کارنامه‌ی آزمونت رو گرفتی؟</div>
            <div className="text-xs text-text-500">عکسشو بذار، می‌ره برای {mentor.name}</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>
      </div>
    </StudentShell>
  );
}
