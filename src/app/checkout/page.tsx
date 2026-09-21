"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { pricingPlans } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("companion");
  const [paying, setPaying] = useState(false);

  const plan = pricingPlans.find((p) => p.id === selected)!;

  function pay() {
    setPaying(true);
    setTimeout(() => router.push("/dashboard"), 1400);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-900">انتخاب پلن</h1>
        <p className="mt-1 text-text-500">تعیین سطح و مشاهده‌ی مشاوران همیشه رایگان بود؛ این مرحله فقط برای ادامه‌ی مسیر است.</p>

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
              <div className="tnum text-left text-sm font-bold text-text-900">
                {p.price === 0 ? "رایگان" : `${toPersianDigits(p.price.toLocaleString("en-US"))} تومان`}
                {p.period && <div className="text-xs font-normal text-text-500">{p.period}</div>}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-x-lg border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-500">جمع پرداختی</span>
            <span className="tnum font-bold text-text-900">
              {plan.price === 0 ? "رایگان" : `${toPersianDigits(plan.price.toLocaleString("en-US"))} تومان`}
            </span>
          </div>
          <Button size="lg" className="mt-4 w-full" onClick={pay} disabled={paying}>
            {paying ? "در حال پرداخت..." : plan.price === 0 ? "شروع رایگان" : "پرداخت و شروع"}
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
