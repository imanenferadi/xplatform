import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Deliberately asymmetric background shape — not a centered gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl md:-left-10"
      />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-24">
        <div>
          <Badge tone="brand" className="mb-5">
            <Sparkles size={14} /> تعیین سطح + مشاور رتبه‌برتر + ابزار هوشمند
          </Badge>

          <h1 className="text-[32px] font-extrabold leading-[1.25] text-text-900 md:text-[44px]">
            اول بفهم کجایی،
            <br />
            بعد برس به کسی که این مسیر رو رفته.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-[1.75] text-text-700">
            یک تعیین‌سطح هوشمند، نیمرخ واقعی تو را می‌سازد و از بین مشاورهای
            تأییدشده، آدم‌هایی را پیشنهاد می‌دهد که مسیرشان به تو نزدیک‌تر است.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg">
              تعیین سطح رایگان
              <ArrowLeft size={18} />
            </Button>
            <Button size="lg" variant="secondary">
              مشاورها را ببین
            </Button>
          </div>

          <p className="mt-4 text-sm text-text-500">
            بدون کارت بانکی · فقط با شماره موبایل · ۳۰ تا ۴۵ دقیقه
          </p>
        </div>

        <HeroLevelProfileCard />
      </div>
    </section>
  );
}

/**
 * A compact live-looking preview of the placement result — the product's
 * visual flagship (design doc §12, T-06). Shown here at reduced fidelity
 * as a hero teaser; the full page lives at /placement/result.
 */
function HeroLevelProfileCard() {
  const subjects = [
    { name: "ریاضی", value: 85 },
    { name: "فیزیک", value: 72 },
    { name: "شیمی", value: 48 },
    { name: "زیست", value: 66 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-sm rotate-1 rounded-x-xl border border-border bg-surface p-6 shadow-x-lg md:rotate-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-500">نیمرخ سطح تو</span>
        <Badge tone="info">در حال شکل‌گیری</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="tnum text-5xl font-extrabold text-text-900">۷۸</div>
        <div className="text-sm text-text-500">
          از ۱۰۰
          <br />
          بازه رتبه: ۸,۰۰۰ تا ۱۵,۰۰۰
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {subjects.map((s) => (
          <div key={s.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-700">{s.name}</span>
              <span className="tnum text-text-500">{s.value}٪</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-x-pill bg-surface-2">
              <div
                className="h-full rounded-x-pill bg-blue-600"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-x-md bg-blue-100 p-3 text-xs text-text-900">
        <Sparkles size={14} className="shrink-0" />
        شیمی نقطه‌ضعف توئه — بر همین اساس ۳ مشاور پیشنهاد دادیم.
      </div>
    </div>
  );
}
