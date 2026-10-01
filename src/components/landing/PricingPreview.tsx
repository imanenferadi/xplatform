import Link from "next/link";
import { Check, CreditCard, Send, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  GUARANTEE_DAYS,
  PACKAGE_DURATIONS,
  pricingPlans,
} from "@/lib/mock-data";
import { Toman } from "@/components/ui/Toman";
import { toPersianDigits } from "@/lib/utils";

const maxInstallments = Math.max(
  ...PACKAGE_DURATIONS.map((d) => d.maxInstallments),
);
const discounts = PACKAGE_DURATIONS.filter((d) => d.discountPercent > 0);

// Same plans and prices as /checkout — one source (pricingPlans).
export function PricingPreview({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <section
      id="pricing"
      className={`mx-auto max-w-[1200px] scroll-mt-20 px-4 md:px-8 ${standalone ? "py-8 md:py-12" : "py-12 md:py-24"}`}
    >
      {!standalone && (
        <div className="mb-6 max-w-2xl md:mb-10">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
            تعرفه‌ها
          </h2>
          <p className="mt-3 text-text-500">
            دیدن مشاورها و جلسه‌ی آشنایی همیشه رایگانه. پکیج‌های بلندتر
            ارزون‌ترن:{" "}
            {discounts
              .map((d) => `${d.label} ${toPersianDigits(d.discountPercent)}٪`)
              .join("، ")}{" "}
            تخفیف.
          </p>
        </div>
      )}

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 pt-3 sm:grid-cols-2 sm:pt-0 lg:grid-cols-4">
        {pricingPlans.map((p) => {
          const highlight = "highlight" in p && p.highlight;
          return (
            <div
              key={p.id}
              className={
                highlight
                  ? "relative flex w-[78%] shrink-0 snap-start flex-col rounded-x-lg border-2 border-blue-600 bg-surface p-6 shadow-x-md sm:w-auto"
                  : "relative flex w-[78%] shrink-0 snap-start flex-col rounded-x-lg border border-border bg-surface p-6 sm:w-auto"
              }
            >
              {highlight && (
                <Badge
                  tone="brand"
                  className="absolute -top-3 right-6 bg-navy-900 text-white"
                >
                  پیشنهادی
                </Badge>
              )}
              <h3 className="font-bold text-text-900">{p.name}</h3>
              <div className="mt-3 text-2xl font-extrabold text-text-900">
                {p.price === 0 ? "رایگان" : <Toman amount={p.price} />}
              </div>
              {p.period && (
                <div className="text-xs text-text-500">{p.period}</div>
              )}
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-700"
                  >
                    <Check
                      size={15}
                      className="mt-0.5 shrink-0 text-mint-500"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.price === 0 ? "/login" : "/checkout"}
                className={buttonVariants({
                  variant: highlight ? "primary" : "secondary",
                  size: "md",
                  className: "mt-6 w-full",
                })}
              >
                {p.price === 0 ? "ثبت‌نام رایگان" : `انتخاب ${p.name}`}
              </Link>
            </div>
          );
        })}
      </div>

      {!standalone && (
        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="text-sm text-blue-600 hover:underline"
          >
            مقایسه‌ی کامل پلن‌ها، مدت پکیج و اقساط
          </Link>
        </div>
      )}

      {/* What makes paying safe — each backed by a real flow in the app. */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Assurance
          icon={<ShieldCheck size={18} className="text-mint-500" />}
          title={`ضمانت ${toPersianDigits(GUARANTEE_DAYS)} روزه‌ی بازگشت وجه`}
          body={`تا ${toPersianDigits(GUARANTEE_DAYS)} روز بعد از خرید هر پکیج، بدون سؤال کل پولت برمی‌گرده — از «اشتراک من» در پروفایلت.`}
        />
        <Assurance
          icon={<CreditCard size={18} className="text-blue-600" />}
          title="قسطی، بدون سود"
          body={`پکیج سه‌ماهه ۳ قسط و پکیج تا کنکور تا ${toPersianDigits(maxInstallments)} قسط ماهانه.`}
        />
        <Assurance
          icon={<Send size={18} className="text-orange-500" />}
          title="پرداخت توسط والد"
          body="موقع خرید، یه لینک پرداخت برای پدر یا مادرت بفرست؛ بعد از پرداخت اشتراکت خودکار فعال می‌شه."
        />
      </div>
    </section>
  );
}

function Assurance({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-x-lg bg-surface-2 p-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-bold text-text-900">{title}</div>
        <p className="mt-1 text-xs leading-[1.8] text-text-500">{body}</p>
      </div>
    </div>
  );
}
