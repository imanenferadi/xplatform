import { Check, X as XIcon } from "lucide-react";

const traditional = [
  "یک اپ برای تست، یک دفتر برای برنامه، یک نفر برای رفع اشکال",
  "برنامه‌ی ثابت روی کاغذ که بعد از چند روز رها می‌شود",
  "سؤالی که همان شب پیش می‌آید، بی‌پاسخ می‌ماند",
  "هیچ‌کس مشخص، پاسخگوی نتیجه نیست",
];

const withX = [
  "یک نیمرخ واقعی از تو، بعد یک مشاور واقعی که مسیرش شبیه توست",
  "برنامه‌ای که هر هفته با نتیجه‌ی واقعی‌ات بازتنظیم می‌شود",
  "معلم هوشمند ۲۴ ساعته برای لحظه‌ای که گیر می‌کنی",
  "یک آدم با اسم و رتبه، پاسخگوی مسیر توست",
];

export function WhySection() {
  return (
    <section id="features" className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">چرا X؟</h2>
        <p className="mt-3 text-text-500">
          تفاوت مسیر درس‌خواندن سنتی در برابر مسیر شخصی‌سازی‌شده با مشاور واقعی و ابزار هوشمند.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-x-lg border border-border bg-surface-2 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-500">روش سنتی</h3>
          <ul className="space-y-4">
            {traditional.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-text-700">
                <XIcon size={16} className="mt-0.5 shrink-0 text-red-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-x-lg border border-blue-600/30 bg-blue-100 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-900">با X</h3>
          <ul className="space-y-4">
            {withX.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-text-900">
                <Check size={16} className="mt-0.5 shrink-0 text-mint-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
