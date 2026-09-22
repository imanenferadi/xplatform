import { notFound } from "next/navigation";
import { MentorShell } from "@/components/app/MentorShell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import {
  mentorStudents,
  levelProfile,
  examResults,
  targetMajor,
  examDrivenPriorities,
  rootCauseAnalysis,
  nightlyCheckIns,
  moodLabels,
  getRiskInfo,
} from "@/lib/mock-data";
import { Sparkles, FileText, Upload, Moon, EyeOff, LineChart } from "lucide-react";
import { TrendChart } from "@/components/ui/TrendChart";
import { toPersianDigits } from "@/lib/utils";

export function generateStaticParams() {
  return mentorStudents.map((s) => ({ id: s.id }));
}

export default async function StudentCaseFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = mentorStudents.find((s) => s.id === id);
  if (!student) notFound();
  const risk = getRiskInfo(student);
  const rootCause = rootCauseAnalysis();

  return (
    <MentorShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-text-900">{student.name}</h1>
            <p className="text-xs text-text-500">{student.grade}</p>
          </div>
          <div className="mr-auto text-left">
            <Badge tone={risk.level}>{risk.label}</Badge>
            {risk.reason && <p className="mt-1 text-xs text-text-500">{risk.reason}</p>}
          </div>
        </div>

        {/* Latest Kanoon/Gaj report card — arrives from the exam provider itself,
            the platform only holds a reference + lets the mentor attach the file. */}
        <Section title="آخرین کارنامه‌ی دریافتی">
          <div className="flex items-center gap-3 rounded-x-md border border-border bg-surface-2 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-900">
                {examResults[0].examProvider} — {examResults[0].examName}
              </div>
              <div className="tnum text-xs text-text-500">
                {examResults[0].date} · درصد کل: {examResults[0].overallPercentage}٪
              </div>
            </div>
            <Button size="md" variant="secondary">
              <FileText size={14} /> مشاهده فایل
            </Button>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-x-md border border-dashed border-border py-2.5 text-sm text-text-500 hover:border-blue-600 hover:text-blue-600">
            <Upload size={15} /> آپلود کارنامه‌ی جدید
          </button>
        </Section>

        {/* Growth trend — the "is this a one-off or a pattern?" signal that
            a single-point status color can't answer. */}
        <Section
          title="روند اجرای برنامه"
          badge={
            <span className="flex items-center gap-1 text-xs text-text-500">
              <LineChart size={12} /> ۳ هفته‌ی اخیر
            </span>
          }
        >
          <TrendChart
            points={student.weeklyHistory.map((w) => ({ label: w.weekLabel, value: w.planCompletionPercent }))}
          />
        </Section>

        {/* Level profile snapshot */}
        <Section title="نیمرخ سطح">
          <div className="space-y-3">
            {levelProfile.subjects.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-text-700">{s.name}</span>
                  <span className="tnum text-text-500">{s.value}٪</span>
                </div>
                <ProgressBar value={s.value} />
              </div>
            ))}
          </div>
        </Section>

        {/* Root-cause analysis ("مستر هوشمند") — mentor-only. Never surface
            this reasoning on a student-facing page; the student only sees
            the resulting plan, not the diagnosis behind it. */}
        <Section
          title="ریشه‌یابی ضعف"
          badge={
            <span className="flex items-center gap-1 text-xs text-text-500">
              <EyeOff size={12} /> فقط مشاور
            </span>
          }
        >
          <p className="text-sm leading-[1.9] text-text-700">
            بیشترین اثر منفی روی رتبه از <span className="font-medium text-text-900">{rootCause.subject}</span>{" "}
            می‌آید (درصد {rootCause.percentage}٪ × ضریب {rootCause.coefficient}). با توجه به نیمرخ سطح، ریشه‌ش
            احتمالاً این مباحث‌اند:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {rootCause.likelyTopics.map((t) => (
              <Badge key={t} tone="danger">
                {t}
              </Badge>
            ))}
          </div>
        </Section>

        {/* Current plan — mentor edit view (M-03), reasoning tied to the
            report card above × the student's target-major coefficients */}
        <Section title="برنامه‌ی این هفته">
          <p className="mb-3 text-xs text-text-500">
            بر اساس کارنامه‌ی {examResults[0].examProvider} ({examResults[0].date}) و ضرایب رشته‌ی{" "}
            {targetMajor.name}:
          </p>
          <div className="space-y-2">
            {examDrivenPriorities()
              .slice(0, 3)
              .map((p) => (
                <PlanRow
                  key={p.subject}
                  subject={p.subject}
                  topic={`درصد ${p.percentage}٪ × ضریب ${p.coefficient}`}
                  hours={p.hours}
                  aiGenerated
                />
              ))}
            <PlanRow subject="—" topic="جلسه‌ی رفع اشکال با من" hours={1} aiGenerated={false} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="md">تأیید برنامه</Button>
            <Button size="md" variant="secondary">تغییر بده</Button>
          </div>
        </Section>

        {/* Nightly check-ins — replaces reading the Telegram group report */}
        <Section title="چک‌این‌های شب">
          <div className="space-y-2">
            {nightlyCheckIns
              .filter((c) => c.studentId === student.id)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 rounded-x-md border border-border bg-surface-2 p-3"
                >
                  <Moon size={15} className="mt-0.5 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-text-500">
                      <span>{c.date}</span>
                      <span>{moodLabels[c.mood]}</span>
                    </div>
                    {c.entries.length > 0 && (
                      <div className="tnum mt-1 text-xs text-text-700">
                        {c.entries.map((e) => `${e.subject} (${e.minutes} دقیقه)`).join(" · ")}
                      </div>
                    )}
                    {c.note && <p className="mt-1 text-sm text-text-900">{c.note}</p>}
                  </div>
                </div>
              ))}
            {nightlyCheckIns.filter((c) => c.studentId === student.id).length === 0 && (
              <p className="text-sm text-text-500">هنوز چک‌اینی ثبت نشده.</p>
            )}
          </div>
        </Section>

        {/* AI questions */}
        <Section title="سؤالات اخیر از معلم AI">
          <div className="flex items-start gap-2 rounded-x-md bg-surface-2 p-3 text-sm text-text-700">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-blue-600" />
            «چرا گزینه‌ی ۳ درست نیست؟» — فیزیک، حرکت‌شناسی — دیروز
          </div>
        </Section>

        {/* Private notes */}
        <Section title="یادداشت‌های خصوصی">
          <textarea
            className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
            rows={3}
            placeholder="یادداشتی برای خودت بنویس..."
            defaultValue="بعد از جلسه‌ی قبل انگیزه‌اش کم شده بود؛ حواسم به این باشه."
          />
        </Section>
      </div>
    </MentorShell>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-4">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-900">{title}</h2>
          {badge}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function PlanRow({
  subject,
  topic,
  hours,
  aiGenerated,
}: {
  subject: string;
  topic: string;
  hours?: number;
  aiGenerated: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-x-sm p-2.5 text-sm ${
        aiGenerated ? "bg-blue-100" : "border border-border bg-surface"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          {subject !== "—" && <span className="font-medium text-text-900">{subject}</span>}
          {hours != null && (
            <span className="tnum rounded-x-sm bg-surface px-1.5 py-0.5 text-xs font-medium text-text-700">
              {toPersianDigits(hours)} ساعت
            </span>
          )}
        </div>
        <span className="text-text-500">{topic}</span>
      </div>
      {aiGenerated && (
        <Badge tone="info">
          <Sparkles size={11} /> پیشنهاد سیستم
        </Badge>
      )}
    </div>
  );
}
