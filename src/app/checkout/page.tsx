"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, RotateCcw, TicketPercent, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toman } from "@/components/ui/Toman";
import { GUARANTEE_DAYS, PACKAGE_DURATIONS, pricingPlans, type PackageDuration } from "@/lib/mock-data";
import { packageTotal, saveSubscription, splitInstallments } from "@/lib/subscription-store";
import { checkCode, discountAmount, redeemCode, useDiscountCodes } from "@/lib/discount-store";
import { cn, toPersianDigits } from "@/lib/utils";

function toman(n: number) {
  return `${toPersianDigits(n.toLocaleString("en-US"))} تومان`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("companion");
  const [durationId, setDurationId] = useState<PackageDuration["id"]>("1m");
  const [installmentCount, setInstallmentCount] = useState(1);
  const [paying, setPaying] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState("");
  const codes = useDiscountCodes();

  const plan = pricingPlans.find((p) => p.id === selected)!;
  const duration = PACKAGE_DURATIONS.find((d) => d.id === durationId)!;
  const isFree = plan.price === 0;
  const listTotal = isFree ? 0 : packageTotal(plan.price, duration);
  // The demo student has paid before, so «first purchase only» codes don't apply.
  const codeContext = { planId: plan.id, durationId: duration.id, firstPurchase: false };
  // Re-checked on every change of plan/duration: a code valid for one
  // package may not be for another.
  const applied = appliedCode && !isFree ? checkCode(codes, appliedCode, codeContext) : null;
  const discount = applied?.ok ? discountAmount(applied.code, listTotal) : 0;
  const total = listTotal - discount;
  const count = Math.min(installmentCount, duration.maxInstallments);
  const schedule = splitInstallments(total, count);

  function chooseDuration(d: PackageDuration) {
    setDurationId(d.id);
    setInstallmentCount(1);
  }

  function applyCode(e: React.FormEvent) {
    e.preventDefault();
    const check = checkCode(codes, codeInput, codeContext);
    if (!check.ok) {
      setCodeError(check.error);
      return;
    }
    setCodeError("");
    setAppliedCode(check.code.code);
    setCodeInput("");
  }

  function pay() {
    setPaying(true);
    if (!isFree) {
      saveSubscription({
        planId: plan.id,
        planName: plan.name,
        durationId: duration.id,
        durationLabel: duration.label,
        total,
        installments: schedule,
        purchasedDaysAgo: 0,
        refund: null,
        ...(discount > 0 && applied?.ok ? { discountCode: applied.code.code } : {}),
      });
      if (discount > 0 && applied?.ok) redeemCode(applied.code.code, total, discount, "ایمان");
    }
    setTimeout(() => router.push("/dashboard"), 1400);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-900">انتخاب پلن</h1>
        <p className="mt-1 text-text-500">
          تعیین سطح و مشاهده‌ی مشاوران همیشه رایگان بود؛ این مرحله فقط برای ادامه‌ی مسیر است.
        </p>

        <div className="mt-6 space-y-3">
          {pricingPlans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-x-lg border-2 p-4 text-right transition-colors",
                selected === p.id ? "border-blue-600 bg-blue-100" : "border-border bg-surface"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected === p.id ? "border-blue-600 bg-blue-600" : "border-border"
                  )}
                >
                  {selected === p.id && <Check size={12} className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-text-900">
                    {p.name}
                    {p.highlight && <Badge tone="brand">پیشنهادی</Badge>}
                  </div>
                  <div className="text-xs text-text-500">{p.features[0]}</div>
                </div>
              </div>
              <div className="text-left text-sm font-bold text-text-900">
                {p.price === 0 ? "رایگان" : <Toman amount={p.price} />}
                {p.period && <div className="text-xs font-normal text-text-500">{p.period}</div>}
              </div>
            </button>
          ))}
        </div>

        {!isFree && (
          <>
            <h2 className="mb-3 mt-8 text-sm font-bold text-text-900">مدت اشتراک</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {PACKAGE_DURATIONS.map((d) => {
                const t = packageTotal(plan.price, d);
                return (
                  <button
                    key={d.id}
                    onClick={() => chooseDuration(d)}
                    className={cn(
                      "rounded-x-lg border-2 p-3.5 text-right transition-colors",
                      durationId === d.id ? "border-blue-600 bg-blue-100" : "border-border bg-surface"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text-900">{d.label}</span>
                      {d.discountPercent > 0 && (
                        <Badge tone="success">{toPersianDigits(d.discountPercent)}٪ تخفیف</Badge>
                      )}
                    </div>
                    <div className="mt-1.5 text-sm text-text-900">
                      <Toman amount={t} />
                    </div>
                    <div className="mt-0.5 text-xs text-text-500">
                      {d.months > 1 ? (
                        <>
                          ماهی <Toman amount={Math.round(t / d.months / 1000) * 1000} />
                        </>
                      ) : (
                        "ماه‌به‌ماه، هر وقت خواستی لغو کن"
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {duration.maxInstallments > 1 && (
              <>
                <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">نحوه‌ی پرداخت</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[1, duration.maxInstallments].map((n) => (
                    <button
                      key={n}
                      onClick={() => setInstallmentCount(n)}
                      className={cn(
                        "rounded-x-md border-2 px-3 py-3 text-sm font-medium transition-colors",
                        count === n
                          ? "border-blue-600 bg-blue-100 text-text-900"
                          : "border-border bg-surface text-text-700 hover:border-blue-300"
                      )}
                    >
                      {n === 1 ? "یک‌جا" : `${toPersianDigits(n)} قسط ماهانه، بدون سود`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!isFree && (
          <div className="mt-6">
            {appliedCode ? (
              <div className="flex items-center justify-between gap-2 rounded-x-md border border-border bg-surface px-4 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <TicketPercent size={16} className={applied?.ok ? "text-mint-500" : "text-red-500"} />
                  <span dir="ltr" className="font-mono font-bold text-text-900">
                    {appliedCode}
                  </span>
                  {applied?.ok ? (
                    <span className="text-mint-500">
                      — <Toman amount={discount} /> تخفیف
                    </span>
                  ) : (
                    <span className="text-xs text-red-500">— {applied && !applied.ok ? applied.error : ""}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCode(null)}
                  aria-label="حذف کد تخفیف"
                  className="text-text-500 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={applyCode} className="flex gap-2">
                <input
                  dir="ltr"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase());
                    setCodeError("");
                  }}
                  placeholder="کد تخفیف"
                  aria-label="کد تخفیف"
                  className="h-10 flex-1 rounded-x-md border border-border bg-surface px-3 text-right font-mono text-sm text-text-900 outline-none placeholder:font-sans placeholder:text-text-500 focus:border-blue-600"
                />
                <Button type="submit" size="md" variant="secondary" disabled={!codeInput.trim()}>
                  اعمال
                </Button>
              </form>
            )}
            {codeError && <p className="mt-1.5 text-xs text-red-500">{codeError}</p>}
          </div>
        )}

        <div className="mt-6 rounded-x-lg border border-border bg-surface p-5">
          {discount > 0 && (
            <div className="mb-2 space-y-1 border-b border-border pb-2 text-sm">
              <div className="flex items-center justify-between text-text-500">
                <span>قیمت {duration.label}</span>
                <span className="line-through">
                  <Toman amount={listTotal} />
                </span>
              </div>
              <div className="flex items-center justify-between text-mint-500">
                <span>کد تخفیف</span>
                <span>
                  − <Toman amount={discount} />
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-500">
              {isFree ? "جمع پرداختی" : `جمع ${duration.label}${count > 1 ? ` (${toPersianDigits(count)} قسط)` : ""}`}
            </span>
            <span className="font-bold text-text-900">{isFree ? "رایگان" : <Toman amount={total} />}</span>
          </div>

          {count > 1 && (
            <ol className="mt-3 space-y-1.5 border-t border-border pt-3">
              {schedule.map((ins, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-700">
                    قسط {toPersianDigits(i + 1)} — {ins.due}
                  </span>
                  <span className={cn(i === 0 ? "font-bold text-text-900" : "text-text-500")}>
                    <Toman amount={ins.amount} />
                  </span>
                </li>
              ))}
            </ol>
          )}

          {!isFree && (
            <div className="mt-4 flex items-start gap-2 rounded-x-md bg-mint-500/10 p-3 text-xs leading-[1.8] text-text-700">
              <RotateCcw size={14} className="mt-0.5 shrink-0 text-mint-500" />
              <span>
                <span className="font-medium text-text-900">ضمانت {toPersianDigits(GUARANTEE_DAYS)} روزه:</span> اگه تا{" "}
                {toPersianDigits(GUARANTEE_DAYS)} روز بعد از پرداخت راضی نبودی، کل مبلغی که دادی بدون هیچ سؤالی
                برمی‌گرده — از بخش «اشتراک من» در پروفایلت.
              </span>
            </div>
          )}

          <Button size="lg" className="mt-4 w-full" onClick={pay} disabled={paying}>
            {paying ? "در حال پرداخت..." : isFree ? "شروع رایگان" : `پرداخت ${toman(schedule[0].amount)} و شروع`}
          </Button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-500">
            <ShieldCheck size={13} />
            پرداخت امن؛ هر زمان قابل لغو
          </div>
        </div>
      </div>
    </div>
  );
}
