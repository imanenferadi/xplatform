"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, RotateCcw, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import { GUARANTEE_DAYS, parentBilling } from "@/lib/mock-data";
import { guaranteeDaysLeft, requestRefund, useSubscription } from "@/lib/subscription-store";
import { cn, toPersianDigits } from "@/lib/utils";

// «اشتراک من» on the student's profile: the package, its installments, and
// the 7-day no-questions money-back guarantee.
export function MySubscription() {
  const sub = useSubscription();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-text-900">اشتراک من</h2>
          </div>
          <Badge tone="brand">
            {sub ? `${sub.planName} · ${sub.durationLabel}` : `${parentBilling.planName} · ماهانه`}
          </Badge>
        </div>

        {!sub ? (
          <>
            <p className="text-sm text-text-700">
              <Toman amount={parentBilling.price} /> در ماه — تمدید بعدی {parentBilling.nextBillingDate}
            </p>
            <p className="mt-2 text-xs leading-[1.8] text-text-500">
              ضمانت {toPersianDigits(GUARANTEE_DAYS)} روزه‌ی بازگشت وجه برای هفته‌ی اول هر پکیج جدیده؛ این اشتراک از تیر
              شروع شده.
            </p>
            <Link href="/checkout" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
              خرید پکیج سه‌ماهه یا تا کنکور (با تخفیف و اقساط)
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-500">مبلغ کل</span>
              <span className="font-medium text-text-900">
                <Toman amount={sub.total} />
              </span>
            </div>

            {sub.installments.length > 1 && (
              <ol className="mt-3 space-y-1.5 border-t border-border pt-3">
                {sub.installments.map((ins, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-text-700">
                      {ins.paid ? (
                        <Check size={12} className="text-mint-500" />
                      ) : (
                        <Clock size={12} className="text-text-500" />
                      )}
                      قسط {toPersianDigits(i + 1)} — {ins.due}
                    </span>
                    <span className={cn(ins.paid ? "text-text-900" : "text-text-500")}>
                      <Toman amount={ins.amount} />
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <Guarantee sub={sub} asking={asking} setAsking={setAsking} reason={reason} setReason={setReason} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Guarantee({
  sub,
  asking,
  setAsking,
  reason,
  setReason,
}: {
  sub: NonNullable<ReturnType<typeof useSubscription>>;
  asking: boolean;
  setAsking: (v: boolean) => void;
  reason: string;
  setReason: (v: string) => void;
}) {
  const daysLeft = guaranteeDaysLeft(sub);

  if (sub.refund) {
    const { status, amount } = sub.refund;
    return (
      <div
        className={cn(
          "mt-4 rounded-x-md p-3 text-xs leading-[1.8]",
          status === "rejected" ? "bg-red-500/10 text-text-700" : "bg-mint-500/10 text-text-700",
        )}
      >
        {status === "pending" && (
          <>
            درخواست بازگشت <Toman amount={amount} /> ثبت شد. حداکثر تا ۴۸ ساعت کاری به کارتت برمی‌گرده.
          </>
        )}
        {status === "approved" && (
          <>
            <Toman amount={amount} /> به کارتت برگشت داده شد و اشتراک لغو شد. امیدواریم دوباره ببینیمت.
          </>
        )}
        {status === "rejected" && "درخواست بازگشت وجه تأیید نشد — برای جزئیات با پشتیبانی تماس بگیر."}
      </div>
    );
  }

  if (daysLeft === 0) {
    return (
      <p className="mt-4 text-xs text-text-500">
        مهلت {toPersianDigits(GUARANTEE_DAYS)} روزه‌ی ضمانت بازگشت وجه این پکیج تموم شده.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-x-md bg-mint-500/10 p-3">
      <div className="flex items-start gap-2 text-xs leading-[1.8] text-text-700">
        <RotateCcw size={14} className="mt-0.5 shrink-0 text-mint-500" />
        <span>
          <span className="font-medium text-text-900">
            ضمانت بازگشت وجه: <span className="tnum">{toPersianDigits(daysLeft)}</span> روز دیگه وقت داری.
          </span>{" "}
          اگه راضی نیستی، کل مبلغی که پرداخت کردی بدون سؤال برمی‌گرده.
        </span>
      </div>
      {asking ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="اگه دوست داری بگو چرا (اختیاری — روی بازگشت پولت اثری نداره)"
            className="w-full rounded-x-sm border border-border bg-surface p-2.5 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
          />
          <div className="flex gap-2">
            <Button size="md" onClick={() => requestRefund(reason.trim())}>
              بله، پولم رو برگردون
            </Button>
            <Button size="md" variant="secondary" onClick={() => setAsking(false)}>
              منصرف شدم
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="mt-2 text-xs font-medium text-mint-500 hover:underline"
        >
          درخواست بازگشت وجه
        </button>
      )}
    </div>
  );
}
