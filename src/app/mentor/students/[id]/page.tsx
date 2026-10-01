import { notFound } from "next/navigation";
import { MentorShell } from "@/components/app/MentorShell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import {
  mentorStudents,
  levelProfile,
  examResults,
  rootCauseAnalysis,
  mentorPrivateNotes,
  getRiskInfo,
} from "@/lib/mock-data";
import { EyeOff, LineChart, GitCompare } from "lucide-react";
import { TrendChart } from "@/components/ui/TrendChart";
import { PeriodComparison } from "@/components/app/PeriodComparison";
import { PrivateNotes } from "@/components/app/PrivateNotes";
import {
  StudentMistakes,
  StudentNightlyReports,
  StudentWeekly,
} from "@/components/app/StudentReports";
import { AboutStudent } from "@/components/app/AboutStudent";
import { PlanEditor } from "@/components/app/PlanEditor";
import { FixedSessionCard } from "@/components/app/FixedSession";
import { CopyWeeklyReport } from "@/components/app/CopyWeeklyReport";
import { KarnamehFiles } from "@/components/app/KarnamehFiles";
import { CaseTabs } from "@/components/app/CaseTabs";
import { SupervisorNotesForMentor } from "@/components/app/Supervisor";
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
            {risk.reason && (
              <p className="mt-1 text-xs text-text-500">{risk.reason}</p>
            )}
          </div>
        </div>

        <SupervisorNotesForMentor studentId={student.id} />

        {/* Four tabs instead of one very long page. The URL hash picks the tab
            (#plan, #reports, #karnameh), so links from «کارهای امروز» land
            on the right one. */}
        <CaseTabs
          tabs={[
            {
              key: "summary",
              label: "خلاصه",
              content: (
                <>
                  {/* What the student told us at start-up: goals, free time, books */}
                  <Section title="درباره‌ی این دانش‌آموز">
                    <AboutStudent studentId={student.id} />
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
                      points={student.weeklyHistory.map((w) => ({
                        label: w.weekLabel,
                        value: w.planCompletionPercent,
                      }))}
                    />
                  </Section>

                  {/* Period comparison — the mentor picks ANY two weeks, not just a
                fixed rolling window. Matches the real product's most powerful
                reporting tool ("۳۶۰ درجه"). */}
                  <Section
                    title="مقایسه‌ی دو بازه"
                    badge={
                      <span className="flex items-center gap-1 text-xs text-text-500">
                        <GitCompare size={12} /> دلخواه
                      </span>
                    }
                  >
                    <PeriodComparison history={student.weeklyHistory} />
                  </Section>

                  {/* Level profile snapshot */}
                  <Section title="نیمرخ سطح">
                    <div className="space-y-3">
                      {levelProfile.subjects.map((s) => (
                        <div key={s.name}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-text-700">{s.name}</span>
                            <span className="tnum text-text-500">
                              {toPersianDigits(s.value)}٪
                            </span>
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
                      بیشترین اثر منفی روی رتبه از{" "}
                      <span className="font-medium text-text-900">
                        {rootCause.subject}
                      </span>{" "}
                      می‌آید (درصد {toPersianDigits(rootCause.percentage)}٪ ×
                      ضریب {toPersianDigits(rootCause.coefficient)}). با توجه به
                      نیمرخ سطح، ریشه‌ش احتمالاً این مباحث‌اند:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rootCause.likelyTopics.map((t) => (
                        <Badge key={t} tone="danger">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </Section>
                </>
              ),
            },
            {
              key: "plan",
              label: "برنامه",
              content: (
                <>
                  {/* The week's plan — written entirely by the mentor, no system suggestions */}
                  <Section title="برنامه‌ی هفته" id="plan">
                    <PlanEditor
                      studentId={student.id}
                      studentName={student.name}
                    />
                  </Section>

                  <Section title="جلسه‌ی ثابت هفتگی">
                    <FixedSessionCard
                      studentId={student.id}
                      by="mentor"
                      className="border-0 p-0"
                    />
                  </Section>
                </>
              ),
            },
            {
              key: "reports",
              label: "گزارش‌ها",
              content: (
                <>
                  {/* Weekly roll-up of every nightly report, subject by subject */}
                  <Section title="جمع هفته از گزارش کارها">
                    <StudentWeekly studentId={student.id} />
                    <div className="mt-4 border-t border-border pt-3">
                      <CopyWeeklyReport
                        studentId={student.id}
                        name={student.name}
                        includeSleep={false}
                      />
                    </div>
                  </Section>

                  {/* Why this student gets tests wrong, from their own mistake notebook */}
                  <Section title="الگوی غلط‌ها">
                    <StudentMistakes studentId={student.id} />
                  </Section>

                  {/* Nightly reports + the mentor's quick feedback on each */}
                  <Section title="گزارش کارهای اخیر" id="reports">
                    <StudentNightlyReports studentId={student.id} />
                  </Section>
                </>
              ),
            },
            {
              key: "karnameh",
              label: "کارنامه و یادداشت",
              content: (
                <>
                  {/* Karnameh files the student (or mentor) attached — shown as-is, never re-analysed. */}
                  <Section title="کارنامه‌ها" id="karnameh">
                    <p className="tnum mb-3 text-xs text-text-500">
                      آخرین نتیجه‌ی ثبت‌شده: {examResults[0].examProvider} —{" "}
                      {examResults[0].examName} ({examResults[0].date}) · درصد
                      کل {toPersianDigits(examResults[0].overallPercentage)}٪
                    </p>
                    <KarnamehFiles
                      studentId={student.id}
                      studentName={student.name}
                    />
                  </Section>

                  {/* Private notes */}
                  <Section title="یادداشت‌های خصوصی">
                    <PrivateNotes
                      studentId={student.id}
                      initialNotes={mentorPrivateNotes.filter(
                        (n) => n.studentId === student.id,
                      )}
                    />
                  </Section>
                </>
              ),
            },
          ]}
        />
      </div>
    </MentorShell>
  );
}

function Section({
  title,
  badge,
  id,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-4 scroll-mt-20" id={id}>
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
