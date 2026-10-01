"use client";

import { useState } from "react";
import { PhoneCall, Check, X, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CALL_TOPICS } from "@/lib/mock-data";
import { requestCall, useCallRequests, useOpenSlots } from "@/lib/call-store";
import { cn, toLatinDigits } from "@/lib/utils";

const PARENT = {
  parentName: "والد ایمان",
  studentName: "ایمان",
  studentId: "me",
};

// A short call with the mentor, on one of the mentor's free slots.
export function ParentCallRequest({ mentorName }: { mentorName: string }) {
  const mine = useCallRequests().filter(
    (c) => c.parentName === PARENT.parentName,
  );
  const latest = mine[0];
  const openSlots = useOpenSlots();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [slot, setSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing: string[] = [];
    if (!topic) missing.push("موضوع");
    if (!slot) missing.push("زمان");
    if (!/^09\d{9}$/.test(toLatinDigits(phone).replace(/\D/g, "")))
      missing.push("شماره‌ی موبایل درست (۱۱ رقم، با ۰۹)");
    setErrors(missing);
    if (missing.length) return;
    requestCall({
      ...PARENT,
      topic,
      slot,
      phone: phone.trim(),
      note: note.trim(),
    });
    setOpen(false);
  }

  const status = latest ?? null;

  return (
    <Card className="mt-4 print:hidden">
      <CardContent>
        <div className="mb-2 flex items-center gap-2">
          <PhoneCall size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-text-900">
            تماس کوتاه با {mentorName}
          </h2>
        </div>

        {status && !open && (
          <div
            className={cn(
              "mb-3 rounded-x-md p-3 text-xs leading-[1.8]",
              status.status === "confirmed" && "bg-mint-500/10 text-text-700",
              status.status === "pending" && "bg-surface-2 text-text-700",
              status.status === "declined" && "bg-red-500/10 text-text-700",
            )}
          >
            {status.status === "pending" && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> درخواستتون برای {status.slot} ثبت شد — منتظر
                تأیید مشاور.
              </span>
            )}
            {status.status === "confirmed" && (
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-mint-500" /> تأیید شد:{" "}
                {mentorName} {status.slot} با شماره‌ی{" "}
                <span dir="ltr" className="tnum">
                  {status.phone}
                </span>{" "}
                تماس می‌گیره.
              </span>
            )}
            {status.status === "declined" && (
              <span className="flex items-center gap-1.5">
                <X size={13} className="text-red-500" /> این بار ممکن نشد.
              </span>
            )}
            {status.mentorNote && (
              <div className="mt-1">پیام مشاور: «{status.mentorNote}»</div>
            )}
          </div>
        )}

        {!open ? (
          (!status || status.status === "declined") && (
            <>
              <p className="mb-3 text-xs text-text-500">
                یه تماس ۱۵ دقیقه‌ای درباره‌ی روند فرزندتون، توی یکی از وقت‌های
                آزاد مشاور.
              </p>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setOpen(true)}
              >
                درخواست تماس
              </Button>
            </>
          )
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs text-text-700">موضوع</div>
              <div className="flex flex-wrap gap-1.5">
                {CALL_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={cn(
                      "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                      topic === t
                        ? "border-blue-600 bg-blue-100 text-text-900"
                        : "border-border bg-surface text-text-700",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs text-text-700">
                زمان (از وقت‌های آزاد مشاور)
              </div>
              {openSlots.length === 0 ? (
                <p className="text-xs text-text-500">
                  این هفته وقت آزادی نمونده؛ از طریق پشتیبانی هماهنگ کنید.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {openSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                        slot === s
                          ? "border-blue-600 bg-blue-100 text-text-900"
                          : "border-border bg-surface text-text-700",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              dir="ltr"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="شماره‌ی موبایل شما"
              aria-label="شماره‌ی موبایل"
              className="tnum h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-right text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              placeholder="چیزی که مشاور بهتره قبلش بدونه (اختیاری)"
              aria-label="توضیح"
              className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            {errors.length > 0 && (
              <p className="text-xs text-red-500">
                لطفاً کامل کنید: {errors.join("، ")}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="md">
                ثبت درخواست
              </Button>
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                انصراف
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
