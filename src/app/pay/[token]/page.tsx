"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ShieldCheck, RotateCcw, Check, Link2Off } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import { GUARANTEE_DAYS } from "@/lib/mock-data";
import { LINK_VALID_HOURS, payLink, usePaymentLinks } from "@/lib/purchase";
import { toPersianDigits } from "@/lib/utils";
import { useHydrated } from "@/lib/local-store";

// What a parent opens from the link their child sent: the exact order,
// the guarantee, and one pay button. No sign-in needed to pay.
export default function ParentPayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const link = usePaymentLinks().find((l) => l.token === token);
  const [paying, setPaying] = useState(false);
  const hydrated = useHydrated();

  function pay() {
    setPaying(true);
    setTimeout(() => {
      payLink(token);
      setPaying(false);
    }, 900);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {!hydrated ? null : !link || link.status === "cancelled" ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Link2Off size={28} className="mx-auto text-text-500" />
              <h1 className="mt-3 font-bold text-text-900">این لینک پرداخت معتبر نیست</h1>
              <p className="mt-1 text-sm text-text-500">
                ممکنه منقضی شده باشه یا یه لینک جدیدتر ساخته شده. از فرزندتون بخواید دوباره بفرسته.
              </p>
            </CardContent>
          </Card>
        ) : link.status === "paid" ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-500/15">
                <Check size={26} className="text-mint-500" />
              </div>
              <h1 className="mt-3 text-lg font-bold text-text-900">پرداخت انجام شد</h1>
              <p className="mt-1 text-sm text-text-500">
                اشتراک ایمان فعال شد. گزارش هفتگی و وضعیت پرداخت رو از پنل والد می‌بینید.
              </p>
              <Link href="/parent" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                رفتن به پنل والد
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <h1 className="text-lg font-bold text-text-900">پرداخت اشتراک ایمان</h1>
              <p className="mt-1 text-sm text-text-500">
                ایمان این پلن رو انتخاب کرده و لینک پرداختش رو برای شما فرستاده ({link.createdAt}، اعتبار{" "}
                {toPersianDigits(LINK_VALID_HOURS)} ساعت).
              </p>

              <dl className="mt-4 space-y-2 rounded-x-md bg-surface-2 p-4 text-sm">
                <Row label="پلن" value={`${link.order.planName} — ${link.order.durationLabel}`} />
                <Row label="قیمت" value={<Toman amount={link.order.listTotal} />} />
                {link.order.discount > 0 && (
                  <Row
                    label={`کد تخفیف ${link.order.discountCode ?? ""}`}
                    value={
                      <span className="text-mint-500">
                        − <Toman amount={link.order.discount} />
                      </span>
                    }
                  />
                )}
                {link.order.walletUse > 0 && (
                  <Row
                    label="اعتبار کیف پول ایمان"
                    value={
                      <span className="text-mint-500">
                        − <Toman amount={link.order.walletUse} />
                      </span>
                    }
                  />
                )}
                <Row
                  label="جمع"
                  value={
                    <strong>
                      <Toman amount={link.order.total} />
                    </strong>
                  }
                />
              </dl>

              {link.order.installments.length > 1 && (
                <ol className="mt-3 space-y-1 text-xs text-text-700">
                  {link.order.installments.map((ins, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>
                        قسط {toPersianDigits(i + 1)} — {ins.due}
                      </span>
                      <span className={i === 0 ? "font-bold text-text-900" : ""}>
                        <Toman amount={ins.amount} />
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-x-md bg-mint-500/10 p-3 text-xs leading-[1.8] text-text-700">
                <RotateCcw size={14} className="mt-0.5 shrink-0 text-mint-500" />
                ضمانت {toPersianDigits(GUARANTEE_DAYS)} روزه: اگه تا {toPersianDigits(GUARANTEE_DAYS)} روز راضی نبودید،
                کل مبلغ پرداختی بدون سؤال برمی‌گرده.
              </div>

              <Button size="lg" className="mt-4 w-full" onClick={pay} disabled={paying}>
                {paying ? (
                  "در حال پرداخت..."
                ) : (
                  <>
                    پرداخت <Toman amount={link.order.installments[0]?.amount ?? link.order.total} />
                  </>
                )}
              </Button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-500">
                <ShieldCheck size={13} /> پرداخت امن از درگاه بانکی
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-500">{label}</dt>
      <dd className="text-text-900">{value}</dd>
    </div>
  );
}
