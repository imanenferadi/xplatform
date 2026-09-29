"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { fa, requestPayoutCorrection } from "@/lib/billing-store";

const input =
  "h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

/** «اصلاح مبلغ» on a pending payout — recorded here, applied only after a second person approves. */
export function PayoutCorrection({
  payoutId,
  mentorName,
  gross,
}: {
  payoutId: string;
  mentorName: string;
  gross: number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
      >
        <Pencil size={12} /> اصلاح مبلغ ناخالص
      </button>
    );

  function submit() {
    const err = requestPayoutCorrection(
      payoutId,
      mentorName,
      gross,
      amount,
      reason,
    );
    if (err) return setError(err);
    toast("اصلاح ثبت شد — منتظر تأیید نفر دوم");
    setOpen(false);
  }

  return (
    <div className="space-y-2 rounded-x-sm border border-border p-2.5 text-xs">
      <p className="text-text-500">
        مبلغ فعلی {fa(gross)} تومان. اصلاح بعد از تأیید یک نفر دیگه اعمال می‌شه.
      </p>
      <input
        value={amount}
        onChange={(e) => (setAmount(e.target.value.slice(0, 15)), setError(""))}
        inputMode="numeric"
        placeholder="مبلغ ناخالص درست (تومان)"
        aria-label="مبلغ جدید"
        className={`${input} tnum`}
      />
      <input
        value={reason}
        onChange={(e) => (
          setReason(e.target.value.slice(0, 160)),
          setError("")
        )}
        placeholder="دلیل (اجباری) — مثلاً یک دانش‌آموز ۱۵ مهر بازپرداخت گرفت"
        aria-label="دلیل اصلاح"
        className={input}
      />
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="md" onClick={submit}>
          ثبت برای تأیید
        </Button>
        <button
          type="button"
          onClick={() => (setOpen(false), setError(""))}
          className="text-text-500"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
