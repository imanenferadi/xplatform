"use client";

import { useState } from "react";
import { CalendarClock, Video, Phone, Check, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WEEK_DAYS, mentors, type SessionMode } from "@/lib/mock-data";
import {
  changeSession,
  clearOverride,
  heldThisWeek,
  setOverride,
  slotDay,
  slotTime,
  useFixedSession,
  useOneOffSlots,
  useSlotsFor,
  useUpcoming,
} from "@/lib/session-store";
import { useCallRequests } from "@/lib/call-store";
import { cn } from "@/lib/utils";

const MODE_LABEL: Record<SessionMode, string> = {
  video: "تصویری",
  audio: "صوتی",
};

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
  const [oneOff, setOneOff] = useState(false);
  const mentor = mentors[0];
  const upcoming = useUpcoming(studentId);
  const ov = upcoming?.override;
  const otherSide = by === "student" ? mentor.name : "دانش‌آموز";

  const current = session ? (session.nextSlot ?? session.slot) : null;

  function save() {
    const target = slot || current;
    if (!target) return;
    setSaved(changeSession(studentId, target, mode, by));
    setOpen(false);
    setSlot("");
  }

  return (
    <div
      className={cn(
        "rounded-x-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <CalendarClock size={18} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-text-500">
            {by === "student"
              ? `جلسه‌ی ثابت هفتگی با ${mentor.name}`
              : "وقت ثابت"}
          </div>
          {session ? (
            <div className="text-sm font-medium text-text-900">
              {slotDay(session.slot)}‌ها ساعت {slotTime(session.slot)} ·{" "}
              {MODE_LABEL[session.mode]}
            </div>
          ) : (
            <div className="text-sm font-medium text-orange-500">
              هنوز وقت ثابت انتخاب نشده
            </div>
          )}
          {session?.nextSlot && (
            <div className="mt-0.5 text-xs text-blue-600">
              از هفته‌ی بعد: {slotDay(session.nextSlot)}‌ها ساعت{" "}
              {slotTime(session.nextSlot)}
            </div>
          )}
        </div>
        {!open && !oneOff && (
          <div className="flex flex-wrap gap-2">
            {session && !ov && (
              <Button
                size="md"
                variant="secondary"
                onClick={() => setOneOff(true)}
              >
                فقط جلسه‌ی بعدی…
              </Button>
            )}
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                setOpen(true);
                setSaved(null);
              }}
            >
              {session ? "تغییر وقت ثابت" : "انتخاب وقت"}
            </Button>
          </div>
        )}
      </div>

      {ov && upcoming && (
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center gap-2 rounded-x-md p-2.5 text-xs",
            ov.cancelled
              ? "bg-red-500/10 text-text-700"
              : "bg-orange-500/10 text-text-700",
          )}
        >
          <span className="flex-1">
            جلسه‌ی {upcoming.week === "this" ? "این هفته" : "هفته‌ی بعد"} (
            {upcoming.slot}){" "}
            {ov.cancelled ? (
              <strong className="text-red-500">لغو شد</strong>
            ) : (
              <>
                فقط یک‌بار رفت به <strong>{ov.slot}</strong>
              </>
            )}
            {" — "}
            {ov.by === by
              ? "به درخواست خودت"
              : `به درخواست ${ov.by === "mentor" ? mentor.name : "دانش‌آموز"}`}
            {ov.reason && ` · «${ov.reason}»`}
            {ov.by === "student" && by === "student" && !ov.seen && (
              <span className="text-text-500"> · {otherSide} هنوز ندیده</span>
            )}
          </span>
          {ov.by === by && (
            <button
              type="button"
              onClick={() => clearOverride(studentId)}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Undo2 size={12} /> برگردون به وقت همیشگی
            </button>
          )}
        </div>
      )}

      {oneOff && upcoming && (
        <OneOffPanel
          studentId={studentId}
          by={by}
          upcoming={upcoming}
          onClose={() => setOneOff(false)}
        />
      )}

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
            وقت‌های آزاد {by === "mentor" ? "تو" : mentor.name} که کس دیگه‌ای
            نگرفته:
          </p>
          {slots.length === 0 ? (
            <p className="text-xs text-orange-500">
              {by === "mentor"
                ? "وقت آزاد دیگه‌ای نداری — از تقویم، وقت آزاد جدید اضافه کن."
                : "فعلاً وقت آزاد دیگه‌ای نیست — توی چت به مشاورت بگو."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.flatMap((d) =>
                slots.filter((s) => slotDay(s) === d),
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "tnum rounded-x-pill border px-3 py-1.5 text-xs transition-colors",
                    slot === s
                      ? "border-blue-600 bg-blue-100 font-medium text-text-900"
                      : "border-border bg-surface text-text-700 hover:border-blue-300",
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
                  mode === m
                    ? "border-blue-600 bg-blue-100 text-text-900"
                    : "border-border text-text-700",
                )}
              >
                {m === "video" ? <Video size={12} /> : <Phone size={12} />}{" "}
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {session && slot && heldThisWeek(session.slot) && (
            <p className="mt-2 text-xs text-text-500">
              جلسه‌ی این هفته برگزار شده؛ وقت جدید از هفته‌ی بعد اعمال می‌شه.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <Button
              size="md"
              onClick={save}
              disabled={!slot && (!session || mode === session.mode)}
            >
              ذخیره
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-text-500"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OneOffPanel({
  studentId,
  by,
  upcoming,
  onClose,
}: {
  studentId: string;
  by: "student" | "mentor";
  upcoming: { week: "this" | "next"; slot: string };
  onClose: () => void;
}) {
  const confirmed = useCallRequests()
    .filter((c) => c.status === "confirmed")
    .map((c) => c.slot);
  const slots = useOneOffSlots(studentId, confirmed);
  const [action, setAction] = useState<"move" | "cancel">("move");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function save() {
    if (action === "move" && !slot) return setError("یه وقت جدید انتخاب کن.");
    if (action === "cancel" && !reason.trim())
      return setError("برای لغو یه دلیل کوتاه بنویس.");
    setOverride({
      studentId,
      week: upcoming.week,
      cancelled: action === "cancel",
      ...(action === "move" ? { slot } : {}),
      reason: reason.trim(),
      by,
    });
    onClose();
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-xs text-text-500">
        فقط جلسه‌ی {upcoming.week === "this" ? "این هفته" : "هفته‌ی بعد"} (
        {upcoming.slot}) — وقت ثابت عوض نمی‌شه.
      </p>
      <div className="mb-3 flex gap-1.5">
        {(["move", "cancel"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setAction(a);
              setError("");
            }}
            className={cn(
              "rounded-x-pill border px-3 py-1 text-xs",
              action === a
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border text-text-700",
            )}
          >
            {a === "move" ? "جابه‌جا کن" : "لغو کن"}
          </button>
        ))}
      </div>
      {action === "move" &&
        (slots.length === 0 ? (
          <p className="text-xs text-orange-500">
            توی این هفته وقت آزاد دیگه‌ای نمونده — می‌تونی لغوش کنی.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {slots.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => {
                  setSlot(x);
                  setError("");
                }}
                className={cn(
                  "tnum rounded-x-pill border px-3 py-1.5 text-xs transition-colors",
                  slot === x
                    ? "border-blue-600 bg-blue-100 font-medium text-text-900"
                    : "border-border bg-surface text-text-700 hover:border-blue-300",
                )}
              >
                {x}
              </button>
            ))}
          </div>
        ))}
      <input
        value={reason}
        onChange={(e) => {
          setReason(e.target.value.slice(0, 120));
          setError("");
        }}
        placeholder={
          action === "cancel"
            ? "دلیل (اجباری) — مثلاً امتحان مدرسه"
            : "دلیل (اختیاری)"
        }
        aria-label="دلیل"
        className="mt-3 h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="md" onClick={save}>
          {action === "move" ? "جابه‌جا کن" : "لغو جلسه"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-text-500"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
