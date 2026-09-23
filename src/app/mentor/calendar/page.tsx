import Link from "next/link";
import { Video, Phone, CalendarDays } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { upcomingSessions, mentorStudents } from "@/lib/mock-data";

export default function MentorCalendarPage() {
  return (
    <MentorShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h1 className="text-lg font-bold text-text-900">تقویم جلسات</h1>
        </div>

        <div className="space-y-2">
          {upcomingSessions.map((s) => {
            const student = mentorStudents.find((st) => st.id === s.studentId);
            if (!student) return null;
            return (
              <Link key={s.id} href={`/mentor/students/${student.id}`}>
                <Card interactive>
                  <CardContent className="flex items-center gap-3 py-3.5">
                    <Avatar name={student.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text-900">{student.name}</div>
                      <div className="text-xs text-text-500">{student.grade}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-text-900">{s.dayLabel}</div>
                      <div className="tnum text-xs text-text-500">{s.time}</div>
                    </div>
                    <Badge tone="neutral">
                      {s.mode === "video" ? <Video size={12} /> : <Phone size={12} />}
                      {s.mode === "video" ? "تصویری" : "صوتی"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {upcomingSessions.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">جلسه‌ای برنامه‌ریزی نشده.</p>
          )}
        </div>
      </div>
    </MentorShell>
  );
}
