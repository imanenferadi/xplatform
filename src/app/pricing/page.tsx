import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import {
  GUARANTEE_DAYS,
  PACKAGE_DURATIONS,
  pricingPlans,
} from "@/lib/mock-data";
import { packageTotal, round1000 } from "@/lib/package-pricing";
import { FAQ } from "@/lib/faq";
import { BRAND } from "@/lib/brand";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import { toPersianDigits } from "@/lib/utils";

export const metadata = pageMetadata(
  "تعرفه‌ها",
  `قیمت پلن‌های ${BRAND}: پایه، همراه و ویژه. پکیج یک‌ماهه، سه‌ماهه و تا کنکور با تخفیف، پرداخت قسطی بدون سود و ضمانت ${GUARANTEE_DAYS} روزه‌ی بازگشت وجه.`,
  "/pricing",
);

// Which plan includes what — a plan lists only what it adds, so each row
// reads «from this plan up».
const ROWS: {
  label: string;
  from: "free" | "basic" | "companion" | "premium";
}[] = [
  { label: "دیدن همه‌ی مشاورها و پروفایلشون", from: "free" },
  { label: "جلسه‌ی آشنایی ۲۰ دقیقه‌ای رایگان", from: "free" },
  { label: "تعیین سطح (اختیاری)", from: "free" },
  { label: "برنامه‌ی هفتگی و تقویم", from: "basic" },
  { label: "گزارش کار شبانه و روند هفته", from: "basic" },
  { label: "دفترچه‌ی غلط‌ها، تایمر فوکوس و ماشین‌حساب درصد", from: "basic" },
  { label: "مشاور اختصاصی از رتبه‌برترها", from: "companion" },
  { label: "جلسه‌ی هفتگی و چت مستقیم با مشاور", from: "companion" },
  { label: "جلسات بیشتر در هفته", from: "premium" },
  { label: "پاسخ‌گویی سریع‌تر مشاور", from: "premium" },
];
const ORDER = ["free", "basic", "companion", "premium"] as const;
const paid = pricingPlans.filter((p) => p.price > 0);
const payFaq = FAQ.find((c) => c.title === "پرداخت")?.items ?? [];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            ...paid.map((p) => ({
              "@type": "Product",
              name: `${BRAND} — پلن ${p.name}`,
              description: p.features.join("، "),
              offers: {
                "@type": "Offer",
                price: p.price,
                priceCurrency: "IRT",
                url: `${SITE_URL}/checkout`,
              },
            })),
            {
              "@type": "FAQPage",
              mainEntity: payFaq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 pt-10 md:px-8 md:pt-16">
          <h1 className="text-3xl font-extrabold text-text-900 md:text-[40px]">
            تعرفه‌ها
          </h1>
          <p className="mt-3 max-w-2xl text-text-500">
            قیمت‌ها ماهانه‌ست. هر چی پکیجت بلندتر باشه، ماهانه‌ش ارزون‌تره. تا{" "}
            {toPersianDigits(GUARANTEE_DAYS)} روز بعد از خرید می‌تونی بدون سؤال
            پولت رو پس بگیری.
          </p>
        </div>

        <PricingPreview standalone />

        {/* Plan comparison */}
        <section className="mx-auto max-w-[1200px] px-4 pb-12 md:px-8 md:pb-20">
          <h2 className="mb-4 text-xl font-bold text-text-900 md:text-2xl">
            مقایسه‌ی پلن‌ها
          </h2>
          <div className="overflow-x-auto rounded-x-lg border border-border bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-text-900">
                  <th scope="col" className="p-3 text-right font-medium">
                    امکانات
                  </th>
                  {pricingPlans.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="p-3 text-center font-bold"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.label}
                    className="border-b border-border/60 last:border-0"
                  >
                    <th
                      scope="row"
                      className="p-3 text-right font-normal text-text-700"
                    >
                      {r.label}
                    </th>
                    {pricingPlans.map((p) => {
                      const has =
                        ORDER.indexOf(p.id as (typeof ORDER)[number]) >=
                        ORDER.indexOf(r.from);
                      return (
                        <td key={p.id} className="p-3 text-center">
                          {has ? (
                            <Check
                              size={16}
                              className="mx-auto text-mint-500"
                              aria-label="دارد"
                            />
                          ) : (
                            <Minus
                              size={16}
                              className="mx-auto text-text-500"
                              aria-label="ندارد"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Duration / installments */}
        <section className="bg-surface-2/60 py-12 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <h2 className="mb-2 text-xl font-bold text-text-900 md:text-2xl">
              مدت پکیج و اقساط
            </h2>
            <p className="mb-4 text-text-500">
              مبلغ کل هر پکیج و معادل ماهانه‌ش. قسط‌ها ماهانه‌ست و سود ندارد.
            </p>
            <div className="overflow-x-auto rounded-x-lg border border-border bg-surface">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-text-900">
                    <th scope="col" className="p-3 text-right font-medium">
                      پکیج
                    </th>
                    {paid.map((p) => (
                      <th
                        key={p.id}
                        scope="col"
                        className="p-3 text-center font-bold"
                      >
                        {p.name}
                      </th>
                    ))}
                    <th scope="col" className="p-3 text-center font-medium">
                      پرداخت
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PACKAGE_DURATIONS.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <th
                        scope="row"
                        className="p-3 text-right font-normal text-text-900"
                      >
                        {d.label}
                        {d.discountPercent > 0 && (
                          <span className="mr-2 text-xs text-mint-500">
                            {toPersianDigits(d.discountPercent)}٪ تخفیف
                          </span>
                        )}
                      </th>
                      {paid.map((p) => {
                        const total = packageTotal(p.price, d);
                        return (
                          <td key={p.id} className="p-3 text-center">
                            <div className="text-text-900">
                              <Toman amount={total} />
                            </div>
                            {d.months > 1 && (
                              <div className="text-xs text-text-500">
                                ماهی{" "}
                                <Toman amount={round1000(total / d.months)} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center text-text-700">
                        {d.maxInstallments > 1
                          ? `تا ${toPersianDigits(d.maxInstallments)} قسط`
                          : "یک‌جا"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Payment FAQ */}
        <section className="mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-20">
          <h2 className="mb-6 text-xl font-bold text-text-900 md:text-2xl">
            سؤال‌های پرداخت
          </h2>
          <div className="divide-y divide-border rounded-x-lg border border-border bg-surface">
            {payFaq.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none font-medium text-text-900">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-[1.8] text-text-500">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/mentors" className={buttonVariants({ size: "lg" })}>
              اول مشاورها رو ببین
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
