import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const plans = [
  {
    name: "رایگان",
    price: "۰",
    desc: "برای شروع و شناخت مسیر",
    features: ["تعیین سطح کامل", "نیمرخ سطح", "مشاهده‌ی ۳ مشاور پیشنهادی"],
    cta: "شروع رایگان",
    highlight: false,
  },
  {
    name: "پایه",
    price: "—",
    desc: "ابزارهای هوشمند، بدون مشاور",
    features: ["برنامه‌ریز تطبیقی", "معلم هوشمند AI", "بانک تست و گزارش"],
    cta: "انتخاب پلن",
    highlight: false,
  },
  {
    name: "همراه",
    price: "—",
    desc: "همه‌چیز + مشاور اختصاصی",
    features: [
      "همه‌ی امکانات پایه",
      "مشاور اختصاصی از رتبه‌برترها",
      "جلسه‌ی هفتگی + چت مستقیم",
    ],
    cta: "شروع با همراه",
    highlight: true,
  },
  {
    name: "ویژه",
    price: "—",
    desc: "برای مسیر فشرده‌تر",
    features: ["همه‌ی امکانات همراه", "جلسات بیشتر در هفته", "پاسخ‌گویی سریع‌تر مشاور"],
    cta: "انتخاب پلن",
    highlight: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">تعرفه‌ها</h2>
        <p className="mt-3 text-text-500">
          تعیین سطح همیشه رایگان است. اعداد این پلن‌ها placeholder‌اند و در نسخه‌ی نهایی جایگزین می‌شوند.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              p.highlight
                ? "relative rounded-x-lg border-2 border-blue-600 bg-surface p-6 shadow-x-md"
                : "relative rounded-x-lg border border-border bg-surface p-6"
            }
          >
            {p.highlight && (
              <Badge tone="brand" className="absolute -top-3 right-6 bg-navy-900 text-white">
                پیشنهادی
              </Badge>
            )}
            <h3 className="font-bold text-text-900">{p.name}</h3>
            <p className="mt-1 text-xs text-text-500">{p.desc}</p>
            <div className="tnum mt-4 text-2xl font-extrabold text-text-900">
              {p.price === "۰" ? "رایگان" : p.price}
            </div>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-700">
                  <Check size={15} className="mt-0.5 shrink-0 text-mint-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={p.highlight ? "primary" : "secondary"}
              className="mt-6 w-full"
              size="md"
            >
              {p.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
