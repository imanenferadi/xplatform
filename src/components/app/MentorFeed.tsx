"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { mentorStudents, moodLabels, nightlyCheckIns, type CallRequest } from "@/lib/mock-data";
import { useMyCheckIns } from "@/lib/checkin-store";
import { useReportFeedback } from "@/lib/feedback-store";
import { answerCall, useOpenSlots } from "@/lib/call-store";
import { byRecency } from "@/lib/reports";

/** Latest nightly reports; «جدید» until the mentor gives feedback. */
export function ReportFeed() {
  const feedback = useReportFeedback();
  const mineLatest = byRecency(useMyCheckIns())[0];
  const items = [...(mineLatest ? [mineLatest] : []), ...nightlyCheckIns];

  return (
    <>
      <h2 className="mb-3 mt-6 flex items-center gap-1.5 text-sm font-bold text-text-900">
        <Moon size={15} className="text-blue-600" />
        گزارش کارهای اخیر
      </h2>
      <div className="space-y-2">
        {items.map((ci) => {
          const student = mentorStudents.find((s) => s.id === ci.studentId);
          if (!student) return null;
          const answered = Boolean(feedback[ci.id]);
          const isNew = !answered && !ci.mentorSeen;
          return (
            <Link key={ci.id} href={`/mentor/students/${ci.studentId}`}>
              <Card interactive className={isNew ? "border-blue-600/30" : undefined}>
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar name={student.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-text-900">{student.name}</span>
                      <span className="text-xs text-text-500">{ci.date}</span>
                      {isNew && <Badge tone="info">جدید</Badge>}
                      {answered && <span className="text-[11px] text-mint-500">✓ بازخورد دادی</span>}
                    </div>
                    <div className="truncate text-xs text-text-500">
                      {ci.note ||
                        (ci.entries.length === 0 ? "درسی ثبت نکرده" : ci.entries.map((e) => e.subject).join("، "))}
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
    </>
  );
}

/** One parent call request with confirm / other time / decline, inline. */
export function PendingCall({ call: c }: { call: CallRequest }) {
  const openSlots = useOpenSlots();
  const [mode, setMode] = useState<"idle" | "other" | "decline">("idle");
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const alternatives = openSlots.filter((s) => s !== c.slot);

  return (
    // Name, topic and slot are already in the «کارهای امروز» row above this.
    <div className="rounded-x-md bg-surface-2 p-3 text-sm">
      {c.note && <p className="text-xs leading-[1.8] text-text-700">«{c.note}»</p>}
      <div className="mt-1 text-xs text-text-500">
        {c.createdAt} · تلفن:{" "}
        <span dir="ltr" className="tnum">
          {c.phone}
        </span>
      </div>

      {mode === "idle" && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="md" onClick={() => answerCall(c.id, "confirmed", c.slot, "")}>
            <Check size={14} /> تأیید {c.slot}
          </Button>
          {alternatives.length > 0 && (
            <Button size="md" variant="secondary" onClick={() => setMode("other")}>
              وقت دیگه
            </Button>
          )}
          <Button size="md" variant="secondary" onClick={() => setMode("decline")}>
            <X size={14} /> رد
          </Button>
        </div>
      )}

      {mode === "other" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            aria-label="وقت جایگزین"
            className="h-9 rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
          >
            <option value="">یکی از وقت‌های آزادت</option>
            {alternatives.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            size="md"
            disabled={!slot}
            onClick={() => answerCall(c.id, "confirmed", slot, `وقت ${c.slot} نمی‌تونستم؛ ${slot} تماس می‌گیرم.`)}
          >
            تأیید این وقت
          </Button>
          <button type="button" onClick={() => setMode("idle")} className="text-xs text-text-500">
            انصراف
          </button>
        </div>
      )}

      {mode === "decline" && (
        <div className="mt-2 space-y-2">
          <input
            value={note}
            onChange={(e) => {
              setNote(e.target.value.slice(0, 200));
              setError("");
            }}
            placeholder="یه پیام کوتاه برای والد (اجباری) — مثلاً «از طریق تیکت هماهنگ کنیم»"
            aria-label="پیام رد"
            className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="md"
              onClick={() => {
                if (!note.trim()) return setError("برای رد کردن یه پیام بنویس.");
                answerCall(c.id, "declined", c.slot, note.trim());
              }}
            >
              رد و ارسال پیام
            </Button>
            <button type="button" onClick={() => setMode("idle")} className="text-xs text-text-500">
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
