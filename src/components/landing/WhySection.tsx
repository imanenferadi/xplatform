import { Check, X as XIcon } from "lucide-react";

const traditional = [
  "یک اپ برای تست، یک دفتر برای برنامه، یک نفر برای رفع اشکال",
  "برنامه‌ی ثابت روی کاغذ که بعد از چند روز رها می‌شه",
  "سؤالی که همون شب پیش میاد، بی‌جواب می‌مونه",
  "هیچ‌کس مشخصی پاسخگوی نتیجه نیست",
];

const withX = [
  "یک مشاور با اسم و رتبه، که پاسخگوی مسیر توئه",
  "برنامه‌ای که مشاورت هر هفته با نتیجه‌ی واقعیت از نو می‌نویسه",
  "گزارش کار شبانه، جلسه‌ی هفتگی و چت — همه یکجا",
  "دفترچه‌ی غلط‌ها که خودش مرورت می‌ده تا یادت نره",
];

/** «چرا ماتریس» — a real person at the center, plus the tools around them. */
export function WhySection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-surface-2/60 py-12 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mb-6 max-w-2xl md:mb-10">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
            چرا ماتریس؟
          </h2>
          <p className="mt-3 text-text-500">
            یک آدم واقعی در مرکز، و ابزارهایی که کار رو براش راحت‌تر می‌کنن.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-x-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-500">
              روش سنتی
            </h3>
            <ul className="space-y-4">
              {traditional.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm text-text-700"
                >
                  <XIcon size={16} className="mt-0.5 shrink-0 text-red-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-x-lg border border-blue-600/30 bg-blue-100 p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-900">
              با ماتریس
            </h3>
            <ul className="space-y-4">
              {withX.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm text-text-900"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-mint-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
