import { notFound } from "next/navigation";
import { MentorShell } from "@/components/app/MentorShell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { mentorStudents, levelProfile } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";

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

  return (
    <MentorShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-text-900">{student.name}</h1>
            <p className="text-xs text-text-500">{student.grade}</p>
          </div>
          <Badge
            tone={student.status === "danger" ? "danger" : student.status === "warning" ? "warning" : "success"}
            className="mr-auto"
          >
            آخرین چک‌این: {student.lastCheckIn}
          </Badge>
        </div>

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

        {/* Current plan — mentor edit view (M-03) */}
        <Section title="برنامه‌ی این هفته">
          <div className="space-y-2">
            <PlanRow subject="ریاضی" topic="مرور فصل ۳" aiGenerated />
            <PlanRow subject="شیمی" topic="تست‌زنی و حل نکات" aiGenerated />
            <PlanRow subject="زیست" topic="جلسه‌ی رفع اشکال با من" aiGenerated={false} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="md">تأیید برنامه</Button>
            <Button size="md" variant="secondary">تغییر بده</Button>
          </div>
        </Section>

        {/* Check-ins */}
        <Section title="چک‌این‌های اخیر">
          <div className="tnum grid grid-cols-7 gap-1.5">
            {[1, 1, 0, 1, 1, 0, 0].map((v, i) => (
              <div
                key={i}
                className={`h-8 rounded-x-sm ${v ? "bg-mint-500/60" : "bg-surface-2"}`}
                title={v ? "چک‌این شده" : "چک‌این نشده"}
              />
            ))}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mt-4">
      <CardContent>
        <h2 className="mb-3 text-sm font-bold text-text-900">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function PlanRow({
  subject,
  topic,
  aiGenerated,
}: {
  subject: string;
  topic: string;
  aiGenerated: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-x-sm p-2.5 text-sm ${
        aiGenerated ? "bg-blue-100" : "border border-border bg-surface"
      }`}
    >
      <div>
        <span className="font-medium text-text-900">{topic}</span>
        <span className="text-text-500"> — {subject}</span>
      </div>
      {aiGenerated && (
        <Badge tone="info">
          <Sparkles size={11} /> پیشنهاد سیستم
        </Badge>
      )}
    </div>
  );
}
