import Link from "next/link";
import { AlertCircle, MessageCircle, CalendarClock, Moon, CalendarX } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { mentorStudents, nightlyCheckIns, moodLabels, getRiskInfo } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

export default function MentorDashboardPage() {
  const needAttention = mentorStudents.filter((s) => getRiskInfo(s).level === "danger").length;
  const planNotReady = mentorStudents.filter((s) => !s.nextWeekPlanReady);

  return (
    <MentorShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="text-lg font-bold text-text-900">داشبورد مشاور</h1>

        <div className="mt-4 flex items-center gap-2 rounded-x-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span className="font-medium text-text-900">
            {toPersianDigits(needAttention)} دانش‌آموز نیاز به توجه دارند
          </span>
        </div>

        {/* Nudge to build next week's plan on time — per the research,
            "۹۰٪+ دانش‌آموزان روز شنبه عصر برنامه دارند" is the mark of a
            reliable mentor; a Monday-morning plan is the warning sign. */}
        {planNotReady.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-sm">
            <CalendarX size={16} className="shrink-0 text-orange-500" />
            <span className="text-text-900">
              <span className="font-medium">{toPersianDigits(planNotReady.length)} نفر</span> هنوز برنامه‌ی هفته‌ی
              بعد آماده ندارن:{" "}
              <span className="text-text-700">{planNotReady.map((s) => s.name).join("، ")}</span>
            </span>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SmallStat icon={CalendarClock} label="جلسات امروز" value="۲" />
          <SmallStat icon={MessageCircle} label="پیام بی‌پاسخ" value="۳" />
          <SmallStat
            icon={AlertCircle}
            label="نیاز به بازبینی برنامه"
            value={toPersianDigits(planNotReady.length)}
          />
        </div>

        {/* Nightly check-ins — this replaces reading the Telegram group */}
        <h2 className="mb-3 mt-6 flex items-center gap-1.5 text-sm font-bold text-text-900">
          <Moon size={15} className="text-blue-600" />
          گزارش کارهای دیشب
        </h2>
        <div className="space-y-2">
          {nightlyCheckIns.map((ci) => {
            const student = mentorStudents.find((s) => s.id === ci.studentId);
            if (!student) return null;
            return (
              <Link key={ci.id} href={`/mentor/students/${ci.studentId}`}>
                <Card interactive className={!ci.mentorSeen ? "border-blue-600/30" : undefined}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <Avatar name={student.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-text-900">
                          {student.name}
                        </span>
                        <span className="text-xs text-text-500">{ci.date}</span>
                        {!ci.mentorSeen && <Badge tone="info">جدید</Badge>}
                      </div>
                      <div className="truncate text-xs text-text-500">
                        {ci.note || (ci.entries.length === 0 ? "یادداشتی ننوشته" : "بدون یادداشت")}
                      </div>
                    </div>
                    <span className="shrink-0 text-lg" title={moodLabels[ci.mood]}>
                      {moodLabels[ci.mood].split(" ").pop()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">دانش‌آموزان</h2>
        <div className="space-y-2">
          {mentorStudents
            .slice()
            .sort((a, b) => {
              const order = { danger: 0, warning: 1, success: 2, excellent: 3 };
              return order[getRiskInfo(a).level] - order[getRiskInfo(b).level];
            })
            .map((s) => {
              const risk = getRiskInfo(s);
              return (
                <Link key={s.id} href={`/mentor/students/${s.id}`}>
                  <Card interactive>
                    <CardContent className="flex items-center gap-3 py-3.5">
                      <Avatar name={s.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text-900">{s.name}</span>
                          <Badge tone={risk.level}>{risk.label}</Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-text-500">
                          {risk.reason ?? `${s.grade} · آخرین گزارش کار: ${s.lastCheckIn}`}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="tnum text-sm font-bold text-text-900">{s.planCompletion}٪</div>
                        <div className="text-[11px] text-text-500">برنامه</div>
                      </div>
                      {s.unreadMessages > 0 && (
                        <span className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                          {s.unreadMessages}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </MentorShell>
  );
}

function SmallStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3.5">
        <Icon size={18} className="text-blue-600" />
        <div>
          <div className="tnum font-bold text-text-900">{value}</div>
          <div className="text-xs text-text-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
