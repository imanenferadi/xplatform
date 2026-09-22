import Link from "next/link";
import { Eye, MessageSquareText, TrendingUp, TrendingDown, Minus, LineChart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { TrendChart } from "@/components/ui/TrendChart";
import { parentWeeklyReport, mentors, studentWeeklyHistory } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <span className="flex items-center gap-1.5 rounded-x-pill bg-surface-2 px-3 py-1 text-xs text-text-500">
            <Eye size={13} /> فقط مشاهده
          </span>
        </div>

        <h1 className="text-xl font-bold text-text-900">
          وضعیت این هفته — {report.studentName}
        </h1>
        <p className="mt-1 text-sm text-text-500">{report.weekLabel}</p>

        {/* Three numbers — no jargon, per the design doc's parent guidance */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="text-center">
              <div className="tnum text-2xl font-extrabold text-text-900">
                {toPersianDigits(report.studyHours)}
              </div>
              <div className="mt-1 text-xs text-text-500">
                از {toPersianDigits(report.studyHoursTarget)} ساعت
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="tnum text-2xl font-extrabold text-text-900">
                {report.planCompletionPercent}٪
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

        {/* Growth trend — parents consistently want to see a trend line,
            not just this week's snapshot */}
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

        {/* Mentor's human note — the only qualitative content a parent gets */}
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

        <p className="mt-6 text-center text-xs text-text-500">
          این پنل فقط خلاصه‌ی وضعیت را نشان می‌دهد — گفتگوهای {report.studentName} با مشاور یا معلم
          هوشمند خصوصی می‌ماند.
        </p>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-text-500 hover:text-text-900">
            بازگشت به صفحه‌ی اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
