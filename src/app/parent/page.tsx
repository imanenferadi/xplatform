"use client";

import Link from "next/link";
import {
  Eye,
  MessageSquareText,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart,
  CreditCard,
  Check,
  X as XIcon,
  Download,
  Lock,
  BarChart3,
  BedDouble,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { TrendChart } from "@/components/ui/TrendChart";
import { parentWeeklyReport, parentBilling, mentors, studentWeeklyHistory } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";
import { Toman } from "@/components/ui/Toman";
import { WeeklySummary } from "@/components/app/WeeklySummary";
import { useMyCheckIns } from "@/lib/checkin-store";
import { aggregateWeek, formatClockTime, formatStudyTime } from "@/lib/checkins";
import { PARENT_ACCESS_LABELS, useParentAccess, type ParentAccess } from "@/lib/parent-access-store";
import { useSubscription } from "@/lib/subscription-store";
import { ParentCallRequest } from "@/components/app/ParentCallRequest";

const trendMeta = {
  improving: { icon: TrendingUp, label: "رو به بهبود", tone: "text-mint-500" },
  steady: { icon: Minus, label: "پایدار", tone: "text-text-500" },
  declining: { icon: TrendingDown, label: "نیاز به توجه", tone: "text-orange-500" },
};

export default function ParentPage() {
  const report = parentWeeklyReport;
  const mentor = mentors.find((m) => m.name === report.mentorName) ?? mentors[0];
  const trend = trendMeta[report.trend];
  const TrendIcon = trend.icon;
  const access = useParentAccess();
  const checkIns = useMyCheckIns();
  const sleep = aggregateWeek(checkIns, "this").sleep;
  const sub = useSubscription();
  const hidden = (Object.keys(PARENT_ACCESS_LABELS) as (keyof ParentAccess)[]).filter((k) => !access[k]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Logo />
          <span className="flex items-center gap-1.5 rounded-x-pill bg-surface-2 px-3 py-1 text-xs text-text-500">
            <Eye size={13} /> فقط مشاهده
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-900">وضعیت این هفته — {report.studentName}</h1>
            <p className="mt-1 text-sm text-text-500">{report.weekLabel}</p>
          </div>
          <Button size="md" variant="secondary" className="shrink-0 print:hidden" onClick={() => window.print()}>
            <Download size={15} />
            دانلود PDF
          </Button>
        </div>

        {/* Three numbers — no jargon, per the design doc's parent guidance */}
        {access.summary && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="text-center">
                  <div className="tnum text-2xl font-extrabold text-text-900">{toPersianDigits(report.studyHours)}</div>
                  <div className="mt-1 text-xs text-text-500">از {toPersianDigits(report.studyHoursTarget)} ساعت</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="tnum text-2xl font-extrabold text-text-900">
                    {toPersianDigits(report.planCompletionPercent)}٪
                  </div>
                  <div className="mt-1 text-xs text-text-500">اجرای برنامه</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <TrendIcon size={20} className={trend.tone} />
                  <div className="mt-1 text-xs text-text-500">{trend.label}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardContent>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-text-700">ساعت مطالعه نسبت به هدف هفته</span>
                </div>
                <ProgressBar value={(report.studyHours / report.studyHoursTarget) * 100} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Growth trend — parents consistently want to see a trend line,
            not just this week's snapshot */}
        {access.trend && (
          <Card className="mt-4">
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <LineChart size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">روند اجرای برنامه — ۵ هفته‌ی اخیر</h2>
              </div>
              <TrendChart
                points={studentWeeklyHistory.map((w) => ({ label: w.weekLabel, value: w.planCompletionPercent }))}
              />
            </CardContent>
          </Card>
        )}

        {access.subjects && (
          <Card className="mt-4">
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">درس‌به‌درس از گزارش کارهای {report.studentName}</h2>
              </div>
              <WeeklySummary checkIns={checkIns} audience="parent" showSleep={access.sleep} />
            </CardContent>
          </Card>
        )}

        {access.sleep && !access.subjects && sleep.nights > 0 && (
          <Card className="mt-4">
            <CardContent>
              <div className="mb-2 flex items-center gap-2">
                <BedDouble size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">خواب این هفته</h2>
              </div>
              <p className="text-sm text-text-700">
                میانگین {formatStudyTime(sleep.avgMinutes)} · بیداری حدود{" "}
                <span className="tnum">{formatClockTime(sleep.avgWake)}</span>
                {sleep.shortNights > 0 && (
                  <span className="text-orange-500"> · {toPersianDigits(sleep.shortNights)} شب زیر ۶ ساعت</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mentor's human note — the only qualitative content a parent gets */}
        {access.mentorNote && (
          <Card className="mt-4">
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">یادداشت مشاور</h2>
              </div>
              <div className="flex items-start gap-3">
                <Avatar name={mentor.name} size="sm" />
                <div>
                  <div className="text-sm font-medium text-text-900">{mentor.name}</div>
                  <p className="mt-1 text-sm leading-[1.8] text-text-700">{report.mentorNote}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hidden.length > 0 && (
          <div className="mt-4 rounded-x-lg border border-dashed border-border p-4 text-xs leading-[1.9] text-text-500">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-text-700">
              <Lock size={13} /> {report.studentName} این بخش‌ها رو خصوصی نگه داشته:
            </div>
            {hidden.map((k) => PARENT_ACCESS_LABELS[k].label).join("، ")}
          </div>
        )}

        <ParentCallRequest mentorName={mentor.name} />

        {/* Billing — the parent is usually who actually pays for the subscription */}
        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">اشتراک و پرداخت</h2>
              </div>
              <Badge tone="brand">{sub ? `${sub.planName} · ${sub.durationLabel}` : parentBilling.planName}</Badge>
            </div>

            {sub ? (
              <div className="rounded-x-md bg-surface-2 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-700">
                    پکیج {sub.durationLabel}
                    {sub.installments.length > 1 && ` — ${toPersianDigits(sub.installments.length)} قسط بدون سود`}
                  </span>
                  <span className="font-medium text-text-900">
                    <Toman amount={sub.total} />
                  </span>
                </div>
                {sub.installments.length > 1 && (
                  <ol className="mt-2 space-y-1 text-xs">
                    {sub.installments.map((ins, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-text-700">
                          {ins.paid ? <Check size={11} className="text-mint-500" /> : <span className="w-[11px]" />}
                          قسط {toPersianDigits(i + 1)} — {ins.due}
                          {ins.paid && <span className="text-mint-500">(پرداخت شد)</span>}
                        </span>
                        <span className={ins.paid ? "text-text-900" : "text-text-500"}>
                          <Toman amount={ins.amount} />
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {sub.refund?.status === "approved" && (
                  <p className="mt-2 text-xs text-orange-500">این پکیج با ضمانت ۷ روزه لغو و مبلغش برگشت داده شد.</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-x-md bg-surface-2 p-3">
                <div>
                  <div className="text-sm font-medium text-text-900">
                    <Toman amount={parentBilling.price} /> <span className="font-normal text-text-500">در ماه</span>
                  </div>
                  <div className="mt-0.5 text-xs text-text-500">
                    تمدید بعدی: {parentBilling.nextBillingDate} — کارت ****{toPersianDigits(parentBilling.cardLast4)}
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className={buttonVariants({ size: "md", variant: "secondary", className: "print:hidden" })}
                >
                  تغییر پلن
                </Link>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {parentBilling.history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        h.status === "paid" ? "bg-mint-500/15 text-mint-500" : "bg-red-500/15 text-red-500"
                      )}
                    >
                      {h.status === "paid" ? <Check size={12} /> : <XIcon size={12} />}
                    </div>
                    <span className="text-text-700">{h.date}</span>
                    <span className="text-text-500">— پلن {h.planName}</span>
                  </div>
                  <span className="text-text-900">
                    <Toman amount={h.amount} />
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-text-500">
          این پنل فقط خلاصه‌ی وضعیت را نشان می‌دهد — گفتگوهای {report.studentName} با مشاور یا معلم هوشمند خصوصی
          می‌ماند.
        </p>

        <div className="mt-6 text-center print:hidden">
          <Link href="/parent/support" className="text-sm text-blue-600 hover:underline">
            سؤال یا مشکلی دارید؟ تیکت پشتیبانی ثبت کنید
          </Link>
        </div>

        <div className="mt-6 text-center print:hidden">
          <Link href="/" className="text-xs text-text-500 hover:text-text-900">
            بازگشت به صفحه‌ی اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
