"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { PlanReadOnly, SupervisorNoteBox, SupervisorShell } from "@/components/app/Supervisor";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AboutStudent } from "@/components/app/AboutStudent";
import { KarnamehFiles } from "@/components/app/KarnamehFiles";
import { StudentMistakes, StudentNightlyReports, StudentWeekly } from "@/components/app/StudentReports";
import { getRiskInfo, mentorStudents, mentors } from "@/lib/mock-data";
import { useSupervisor } from "@/lib/staff-store";
import { useFixedSession } from "@/lib/session-store";

const MENTOR_OF_STUDENTS = "sara-mohammadi";

// Read-only case file for the supervisor. Left out on purpose: the chat,
// the mentor's private notes, payments, and every editing control.
export default function SupervisorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const me = useSupervisor();
  const student = mentorStudents.find((s) => s.id === id);
  const mentor = mentors.find((m) => m.id === MENTOR_OF_STUDENTS)!;
  const session = useFixedSession(id);
  const inScope = Boolean(student && me?.mentorIds?.includes(MENTOR_OF_STUDENTS));

  if (!student || !inScope)
    return (
      <SupervisorShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <Lock size={22} className="mx-auto text-text-500" />
          <h1 className="mt-3 font-bold text-text-900">این پرونده در حوزه‌ی تو نیست</h1>
          <p className="mt-1 text-sm text-text-500">فقط دانش‌آموزهای مشاورهایی رو می‌بینی که مدیر کل بهت سپرده.</p>
          <Link href="/supervisor" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            برگرد
          </Link>
        </div>
      </SupervisorShell>
    );

  const risk = getRiskInfo(student);

  return (
    <SupervisorShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <Link href="/supervisor" className="mb-4 flex items-center gap-1 text-xs text-text-500 hover:text-text-900">
          <ArrowRight size={13} /> مشاورهای زیر نظر
        </Link>
        <div className="flex items-center gap-3">
          <Avatar name={student.name} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-text-900">{student.name}</h1>
            <p className="text-xs text-text-500">
              {student.grade} · مشاور: {mentor.name}
              {session && ` · جلسه‌ی ثابت: ${session.slot}`}
            </p>
          </div>
          <div className="mr-auto text-left">
            <Badge tone={risk.level}>{risk.label}</Badge>
            {risk.reason && <p className="mt-1 text-xs text-text-500">{risk.reason}</p>}
          </div>
        </div>

        <Section title={`یادداشت برای ${mentor.name}`}>
          <SupervisorNoteBox
            studentId={student.id}
            studentName={student.name}
            mentorId={mentor.id}
            mentorName={mentor.name}
          />
        </Section>
        <Section title="برنامه‌ی هفته">
          <PlanReadOnly studentId={student.id} />
        </Section>
        <Section title="درباره‌ی این دانش‌آموز">
          <AboutStudent studentId={student.id} />
        </Section>
        <Section title="جمع هفته از گزارش کارها">
          <StudentWeekly studentId={student.id} />
        </Section>
        <Section title="گزارش کارهای اخیر و بازخورد مشاور">
          <StudentNightlyReports studentId={student.id} readOnly />
        </Section>
        <Section title="الگوی غلط‌ها">
          <StudentMistakes studentId={student.id} />
        </Section>
        <Section title="کارنامه‌ها">
          <KarnamehFiles studentId={student.id} studentName={student.name} readOnly />
        </Section>
        <p className="mt-4 flex items-center gap-1 text-xs text-text-500">
          <Lock size={12} /> گفتگو با مشاور، یادداشت‌های خصوصی مشاور و پرداخت‌ها برای سرپرست نمایش داده نمی‌شن.
        </p>
      </div>
    </SupervisorShell>
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
