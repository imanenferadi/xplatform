"use client";

import Link from "next/link";
import { Video, Phone, CalendarDays, FileText, AlarmClock, Check, PhoneCall } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card } from "@/components/ui/Card";
import {
  CURRENT_DAY_NAME,
  DEFAULT_AVAILABILITY,
  WEEK_DAYS,
  mentorStudents,
  mentorWeekNotes,
  mentors,
  upcomingSessions,
} from "@/lib/mock-data";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";
import { useCallRequests } from "@/lib/call-store";

const HOURS = [16, 17, 18, 19, 20];

function hourOf(time: string) {
  return Number(toLatinDigits(time).split(":")[0]);
}

// Same idea as the student's week table: days are columns. For a mentor the
// rows are hours, since the question is "when am I busy / free?".
export default function MentorCalendarPage() {
  const me = mentors[0]; // سارا محمدی — the logged-in mentor of this demo
  const availability = me.availability?.length ? me.availability : DEFAULT_AVAILABILITY;
  const todayIndex = WEEK_DAYS.indexOf(CURRENT_DAY_NAME);

  const freeSlot = (day: string, hour: number) =>
    availability.some((a) => {
      const [d, t] = a.split(" ");
      return d === day && hourOf(t) === hour;
    });
  const sessionsAt = (day: string, hour: number) =>
    upcomingSessions.filter((s) => s.dayName === day && hourOf(s.time) === hour);
  // Confirmed parent calls take their slot too.
  const confirmedCalls = useCallRequests().filter((c) => c.status === "confirmed");
  const callsAt = (day: string, hour: number) =>
    confirmedCalls.filter((c) => {
      const [d, t] = c.slot.split(" ");
      return d === day && hourOf(t) === hour;
    });

  const remaining = upcomingSessions.filter((s) => !s.done).length;
  const openSlots = availability.filter((a) => {
    const [d, t] = a.split(" ");
    return (
      WEEK_DAYS.indexOf(d) >= todayIndex && sessionsAt(d, hourOf(t)).length === 0 && callsAt(d, hourOf(t)).length === 0
    );
  }).length;

  return (
    <MentorShell>
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <div className="mb-1 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h1 className="text-lg font-bold text-text-900">تقویم هفته</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(remaining)}</span> جلسه‌ی پیش‌رو ·{" "}
          <span className="tnum">{toPersianDigits(openSlots)}</span> وقت آزاد رزرونشده تا آخر هفته
        </p>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed border-collapse text-right">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky right-0 z-10 w-24 bg-surface p-4 text-sm font-normal text-text-500">ساعت</th>
                  {WEEK_DAYS.map((d, i) => {
                    const isToday = d === CURRENT_DAY_NAME;
                    return (
                      <th
                        key={d}
                        className={cn(
                          "border-r border-border/60 p-4 text-sm font-bold",
                          isToday ? "bg-blue-100 text-blue-600" : i < todayIndex ? "text-text-500" : "text-text-900"
                        )}
                      >
                        {d}
                        {isToday && <div className="mt-0.5 text-xs font-normal">امروز</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h} className="border-b border-border/60">
                    <th
                      scope="row"
                      className="tnum sticky right-0 z-10 whitespace-nowrap bg-surface p-4 align-top text-sm font-medium text-text-700"
                    >
                      {toPersianDigits(`${h}:00`)}
                    </th>
                    {WEEK_DAYS.map((d, i) => {
                      const sessions = sessionsAt(d, h);
                      const past = i < todayIndex;
                      return (
                        <td
                          key={d}
                          className={cn(
                            "h-20 border-r border-border/60 p-2.5 align-top",
                            d === CURRENT_DAY_NAME && "bg-blue-100/40",
                            past && "opacity-60"
                          )}
                        >
                          {sessions.map((s) => {
                            const student = mentorStudents.find((st) => st.id === s.studentId);
                            if (!student) return null;
                            return (
                              <Link
                                key={s.id}
                                href={`/mentor/students/${student.id}`}
                                className="block rounded-x-md bg-blue-100 px-2.5 py-2 text-blue-600 transition-colors hover:bg-blue-600/20"
                              >
                                <div className="truncate text-sm font-medium text-text-900">{student.name}</div>
                                <div className="mt-0.5 flex items-center gap-1 text-xs">
                                  {s.mode === "video" ? <Video size={12} /> : <Phone size={12} />}
                                  <span className="tnum">{s.time}</span>
                                  {s.done && (
                                    <span className="flex items-center gap-0.5 text-mint-500">
                                      <Check size={11} /> برگزار شد
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                          {callsAt(d, h).map((c) => (
                            <div
                              key={c.id}
                              className="mt-1 rounded-x-md bg-mint-500/15 px-2.5 py-2 text-mint-500"
                              title={`${c.topic} — ${c.phone}`}
                            >
                              <div className="truncate text-sm font-medium text-text-900">{c.parentName}</div>
                              <div className="mt-0.5 flex items-center gap-1 text-xs">
                                <PhoneCall size={12} /> تماس ۱۵ دقیقه‌ای
                              </div>
                            </div>
                          ))}
                          {sessions.length === 0 && callsAt(d, h).length === 0 && freeSlot(d, h) && !past && (
                            <div className="rounded-x-md border border-dashed border-mint-500/50 px-2.5 py-2 text-xs text-mint-500">
                              وقت آزاد
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <th
                    scope="row"
                    className="sticky right-0 z-10 whitespace-nowrap bg-surface p-4 align-top text-sm font-medium text-text-700"
                  >
                    یادآوری‌ها
                  </th>
                  {WEEK_DAYS.map((d) => (
                    <td
                      key={d}
                      className={cn(
                        "border-r border-border/60 p-2.5 align-top",
                        d === CURRENT_DAY_NAME && "bg-blue-100/40"
                      )}
                    >
                      <div className="space-y-1.5">
                        {mentorWeekNotes
                          .filter((n) => n.dayName === d)
                          .map((n) => (
                            <div
                              key={n.text}
                              className={cn(
                                "flex items-start gap-1 rounded-x-md px-2.5 py-1.5 text-xs leading-snug",
                                n.tone === "exam" ? "bg-orange-500/15 text-orange-500" : "bg-red-500/10 text-red-500"
                              )}
                            >
                              {n.tone === "exam" ? (
                                <FileText size={12} className="mt-px shrink-0" />
                              ) : (
                                <AlarmClock size={12} className="mt-px shrink-0" />
                              )}
                              {n.text}
                            </div>
                          ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-blue-100" /> جلسه (کلیک ← پرونده‌ی دانش‌آموز)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-dashed border-mint-500" /> وقت آزاد از پروفایلت
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-mint-500/30" /> تماس با والد
          </span>
        </div>
      </div>
    </MentorShell>
  );
}
