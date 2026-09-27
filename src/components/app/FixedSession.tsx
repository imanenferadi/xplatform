"use client";

import { useState } from "react";
import { CalendarClock, Video, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WEEK_DAYS, mentors, type SessionMode } from "@/lib/mock-data";
import { changeSession, heldThisWeek, slotDay, slotTime, useFixedSession, useSlotsFor } from "@/lib/session-store";
import { cn } from "@/lib/utils";

const MODE_LABEL: Record<SessionMode, string> = { video: "تصویری", audio: "صوتی" };

// The one weekly session, picked once from the mentor's free hours. Same
// card for the student (calendar) and the mentor (case file).
export function FixedSessionCard({
  studentId,
  by,
  className,
}: {
  studentId: string;
  by: "student" | "mentor";
  className?: string;
}) {
  const session = useFixedSession(studentId);
  const slots = useSlotsFor(studentId);
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState<SessionMode>(session?.mode ?? "video");
  const [saved, setSaved] = useState<"this" | "next" | null>(null);
  const mentor = mentors[0];

  const current = session ? (session.nextSlot ?? session.slot) : null;

  function save() {
    const target = slot || current;
    if (!target) return;
    setSaved(changeSession(studentId, target, mode, by));
    setOpen(false);
    setSlot("");
  }

  return (
    <div className={cn("rounded-x-lg border border-border bg-surface p-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <CalendarClock size={18} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-text-500">{by === "student" ? `جلسه‌ی ثابت هفتگی با ${mentor.name}` : "وقت ثابت"}</div>
          {session ? (
            <div className="text-sm font-medium text-text-900">
              {slotDay(session.slot)}‌ها ساعت {slotTime(session.slot)} · {MODE_LABEL[session.mode]}
            </div>
          ) : (
            <div className="text-sm font-medium text-orange-500">هنوز وقت ثابت انتخاب نشده</div>
          )}
          {session?.nextSlot && (
            <div className="mt-0.5 text-xs text-blue-600">
              از هفته‌ی بعد: {slotDay(session.nextSlot)}‌ها ساعت {slotTime(session.nextSlot)}
            </div>
          )}
        </div>
        {!open && (
          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              setOpen(true);
              setSaved(null);
            }}
          >
            {session ? "تغییر" : "انتخاب وقت"}
          </Button>
        )}
      </div>

      {saved && !open && (
        <p className="mt-2 flex items-center gap-1 text-xs text-mint-500">
          <Check size={13} />
          {saved === "this"
            ? "ذخیره شد — از همین هفته."
            : "ذخیره شد — جلسه‌ی این هفته برگزار شده، وقت جدید از هفته‌ی بعد."}
        </p>
      )}

      {open && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs text-text-500">
            وقت‌های آزاد {by === "mentor" ? "تو" : mentor.name} که کس دیگه‌ای نگرفته:
          </p>
          {slots.length === 0 ? (
            <p className="text-xs text-orange-500">
              {by === "mentor"
                ? "وقت آزاد دیگه‌ای نداری — از تقویم، وقت آزاد جدید اضافه کن."
                : "فعلاً وقت آزاد دیگه‌ای نیست — توی چت به مشاورت بگو."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.flatMap((d) => slots.filter((s) => slotDay(s) === d)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "tnum rounded-x-pill border px-3 py-1.5 text-xs transition-colors",
                    slot === s
                      ? "border-blue-600 bg-blue-100 font-medium text-text-900"
                      : "border-border bg-surface text-text-700 hover:border-blue-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-text-500">نوع جلسه:</span>
            {(["video", "audio"] as SessionMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-1 rounded-x-pill border px-3 py-1 text-xs",
                  mode === m ? "border-blue-600 bg-blue-100 text-text-900" : "border-border text-text-700"
                )}
              >
                {m === "video" ? <Video size={12} /> : <Phone size={12} />} {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {session && slot && heldThisWeek(session.slot) && (
            <p className="mt-2 text-xs text-text-500">
              جلسه‌ی این هفته برگزار شده؛ وقت جدید از هفته‌ی بعد اعمال می‌شه.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <Button size="md" onClick={save} disabled={!slot && (!session || mode === session.mode)}>
              ذخیره
            </Button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-500">
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
