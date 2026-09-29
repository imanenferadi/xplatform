"use client";

import { use } from "react";
import { Printer } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { fa, useInvoice } from "@/lib/billing-store";
import { useHydrated } from "@/lib/local-store";
import { formatJalali } from "@/lib/utils";

// Prices are VAT-inclusive; the official invoice shows the split (10%).
const VAT_PERCENT = 10;

/** «صورت‌حساب فروش» — printable, one per payment, issued from /admin/payments. */
export default function InvoicePage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = use(params);
  const inv = useInvoice(decodeURIComponent(no));
  const hydrated = useHydrated();

  if (!hydrated) return null;
  if (!inv)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-text-500">
        فاکتوری با این شماره پیدا نشد.
      </div>
    );

  const base = Math.round((inv.amount * 100) / (100 + VAT_PERCENT));
  const vat = inv.amount - base;
  const b = inv.buyer;

  return (
    <div className="min-h-screen bg-background px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl rounded-x-md border border-border bg-surface p-8 print:border-0">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-text-900">
              صورت‌حساب فروش کالا و خدمات
            </h1>
            <p className="mt-1 text-xs text-text-500">
              شماره{" "}
              <span dir="ltr" className="tnum">
                {inv.no}
              </span>{" "}
              · تاریخ {formatJalali(inv.issuedIso)}
            </p>
          </div>
          <Logo />
        </div>

        <section className="mb-4 rounded-x-sm border border-border p-3 text-xs leading-[1.9]">
          <h2 className="mb-1 font-bold text-text-900">فروشنده</h2>
          <p className="text-text-700">
            پلتفرم مشاوره‌ی X — شناسه‌ی ملی و کد اقتصادی در نسخه‌ی واقعی درج
            می‌شه.
          </p>
        </section>

        <section className="mb-4 rounded-x-sm border border-border p-3 text-xs leading-[1.9]">
          <h2 className="mb-1 font-bold text-text-900">
            خریدار ({b.kind === "person" ? "شخص حقیقی" : "شخص حقوقی"})
          </h2>
          <p className="text-text-700">
            {b.name} · {b.kind === "person" ? "کد ملی" : "شناسه‌ی ملی"}{" "}
            <span dir="ltr" className="tnum">
              {b.nationalId}
            </span>
            {b.economicCode && (
              <>
                {" "}
                · کد اقتصادی{" "}
                <span dir="ltr" className="tnum">
                  {b.economicCode}
                </span>
              </>
            )}
          </p>
          {b.address && <p className="text-text-700">نشانی: {b.address}</p>}
          <p className="text-text-500">دانش‌آموز: {inv.studentName}</p>
        </section>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-surface-2 text-text-700">
              <th className="border border-border p-2 text-right font-medium">
                شرح خدمات
              </th>
              <th className="border border-border p-2 text-left font-medium">
                مبلغ (تومان)
              </th>
            </tr>
          </thead>
          <tbody className="text-text-900">
            <tr>
              <td className="border border-border p-2">{inv.description}</td>
              <td className="tnum border border-border p-2 text-left">
                {fa(base)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 text-text-700">
                مالیات بر ارزش افزوده ({fa(VAT_PERCENT)}٪)
              </td>
              <td className="tnum border border-border p-2 text-left">
                {fa(vat)}
              </td>
            </tr>
            <tr className="font-bold">
              <td className="border border-border p-2">جمع کل پرداخت‌شده</td>
              <td className="tnum border border-border p-2 text-left">
                {fa(inv.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4 text-xs text-text-500">صادرکننده: {inv.issuedBy}</p>

        <div className="mt-6 print:hidden">
          <Button size="md" onClick={() => window.print()}>
            <Printer size={14} /> چاپ / ذخیره‌ی PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
