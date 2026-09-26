"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, RotateCcw, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import {
  CHURN_REASONS,
  DEMO_TODAY_ISO,
  GUARANTEE_DAYS,
  PACKAGE_DURATIONS,
  parentBilling,
  type ChurnReason,
} from "@/lib/mock-data";
import { recordChurn, undoMyCancellation, useChurn } from "@/lib/churn-store";
import { createTicket } from "@/lib/ticket-store";
import { guaranteeDaysLeft, requestRefund, useSubscription } from "@/lib/subscription-store";
import { cancelLink, payLinkUrl, usePaymentLinks } from "@/lib/purchase";
import { addDaysIso, cn, formatJalali, toPersianDigits } from "@/lib/utils";

// «اشتراک من» on the student's profile: the package, its installments, and
// the 7-day no-questions money-back guarantee.
export function MySubscription() {
  const sub = useSubscription();
  const pendingLink = usePaymentLinks().find((l) => l.status === "pending");
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
          <span className="flex items-center gap-1.5">
            {sub?.paidBy === "parent" && <Badge tone="success">پرداخت‌شده توسط والد</Badge>}
            <Badge tone="brand">
              {sub ? `${sub.planName} · ${sub.durationLabel}` : `${parentBilling.planName} · ماهانه`}
            </Badge>
          </span>
        </div>

        {pendingLink && (
          <div className="mb-3 rounded-x-md border border-blue-600/30 bg-blue-100 p-3 text-xs leading-[1.8] text-text-700">
            <div className="font-medium text-text-900">
              منتظر پرداخت والد — پلن {pendingLink.order.planName} ({pendingLink.order.durationLabel})،{" "}
              <Toman amount={pendingLink.order.total} />
            </div>
            <div dir="ltr" className="mt-1 truncate text-text-500">
              {payLinkUrl(pendingLink.token)}
            </div>
            <button
              type="button"
              onClick={() => cancelLink(pendingLink.token)}
              className="mt-1 text-text-500 hover:text-red-500"
            >
              لغو این لینک
            </button>
          </div>
        )}

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
            <AutoRenew planName={parentBilling.planName} activeUntil={parentBilling.nextBillingDate} />
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
            {sub.refund?.status !== "approved" && (
              <AutoRenew
                planName={sub.planName}
                activeUntil={formatJalali(
                  addDaysIso(DEMO_TODAY_ISO, (PACKAGE_DURATIONS.find((d) => d.id === sub.durationId)?.months ?? 1) * 30)
                )}
              />
            )}
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
          status === "rejected" ? "bg-red-500/10 text-text-700" : "bg-mint-500/10 text-text-700"
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

// Asked before auto-renew is switched off: one question, then a retention
// offer matched to the answer (see CHURN_REASONS).
function AutoRenew({ planName, activeUntil }: { planName: string; activeUntil: string }) {
  const { mine } = useChurn();
  const [step, setStep] = useState<"idle" | "reason" | "offer">("idle");
  const [reason, setReason] = useState<ChurnReason | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  function finish(outcome: "cancelled" | "retained") {
    if (!reason) return;
    if (outcome === "retained" && reason === "mentor") {
      setTicketId(
        createTicket({
          subject: "درخواست تعویض مشاور (از نظرسنجی لغو)",
          category: "مشاور",
          text: text.trim() || "از مشاورم راضی نیستم و می‌خوام مشاورم عوض بشه.",
          requester: { name: "ایمان", role: "دانش‌آموز", userId: "u-1" },
        })
      );
    }
    recordChurn(
      { student: "ایمان", plan: planName, mentorId: "sara-mohammadi", reason, text: text.trim(), outcome },
      CHURN_REASONS[reason].label
    );
    setStep("idle");
  }

  if (mine) {
    const offer = CHURN_REASONS[mine.reason].offer;
    return (
      <div className="mt-4 rounded-x-md bg-surface-2 p-3 text-xs leading-[1.8] text-text-700">
        {mine.outcome === "cancelled" ? (
          <>
            تمدید خودکار خاموشه — اشتراکت تا {activeUntil} فعاله و بعدش تمدید نمی‌شه.{" "}
            <button type="button" onClick={undoMyCancellation} className="text-blue-600 hover:underline">
              دوباره روشنش کن
            </button>
          </>
        ) : (
          <>
            <span className="font-medium text-mint-500">موندی، ممنون! </span>
            {offer?.done}
            {ticketId && (
              <>
                {" "}
                <Link href="/support" className="text-blue-600 hover:underline">
                  پیگیری تیکت {ticketId}
                </Link>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("reason")}
        className="mt-4 block text-xs text-text-500 hover:text-red-500"
      >
        لغو تمدید خودکار
      </button>
    );
  }

  if (step === "reason") {
    return (
      <div className="mt-4 rounded-x-md border border-border p-3">
        <div className="mb-2 text-sm font-medium text-text-900">قبل از رفتن، چرا می‌خوای لغو کنی؟</div>
        <div className="space-y-1.5">
          {(Object.keys(CHURN_REASONS) as ChurnReason[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-xs text-text-700">
              <input
                type="radio"
                name="churn-reason"
                checked={reason === k}
                onChange={() => {
                  setReason(k);
                  setError("");
                }}
              />
              {CHURN_REASONS[k].label}
            </label>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          rows={2}
          placeholder="اگه دوست داری بیشتر بگو (اختیاری)"
          className="mt-2 w-full rounded-x-sm border border-border bg-surface p-2.5 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <div className="mt-2 flex gap-2">
          <Button
            size="md"
            onClick={() => {
              if (!reason) return setError("یکی از دلیل‌ها رو انتخاب کن.");
              if (CHURN_REASONS[reason].offer) setStep("offer");
              else finish("cancelled");
            }}
          >
            ادامه
          </Button>
          <Button size="md" variant="secondary" onClick={() => setStep("idle")}>
            منصرف شدم
          </Button>
        </div>
      </div>
    );
  }

  const offer = reason ? CHURN_REASONS[reason].offer : undefined;
  return (
    <div className="mt-4 rounded-x-md border border-mint-500/40 bg-mint-500/10 p-3">
      <div className="text-sm font-medium text-text-900">پیشنهاد ما: {offer?.title}</div>
      <p className="mt-1 text-xs leading-[1.8] text-text-700">{offer?.detail}</p>
      <div className="mt-2 flex gap-2">
        <Button size="md" onClick={() => finish("retained")}>
          قبول می‌کنم
        </Button>
        <Button size="md" variant="secondary" onClick={() => finish("cancelled")}>
          نه، لغو کن
        </Button>
      </div>
    </div>
  );
}
