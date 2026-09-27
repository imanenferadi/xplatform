import { Bot, GraduationCap } from "lucide-react";

export function HumanAiDistinction() {
  return (
    <section className="bg-navy-900 py-16 text-white md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold md:text-[32px]">AI ابزار مشاور است، نه جایگزین او</h2>
          <p className="mt-3 text-white/70">
            بیشتر پلتفرم‌های این بازار فقط یک چت‌بات به تو می‌دهند. ما یک انسان واقعی را در مرکز
            رابطه نگه می‌داریم و AI را در خدمتش می‌گذاریم.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-x-lg border border-white/10 bg-white/5 p-6">
            <Bot size={22} className="text-cyan-500" />
            <h3 className="mt-3 font-bold">معلم هوشمند AI</h3>
            <p className="mt-2 text-sm leading-[1.75] text-white/70">
              ۲۴ ساعته برای رفع اشکال لحظه‌ای، عکس سؤال، و توضیح گام‌به‌گام. اما هر سؤالی که
              می‌پرسی مستقیم در پرونده‌ات ثبت می‌شود و مشاورت آن را می‌بیند.
            </p>
          </div>
          <div className="rounded-x-lg border border-white/10 bg-white/5 p-6">
            <GraduationCap size={22} className="text-yellow-400" />
            <h3 className="mt-3 font-bold">مشاور رتبه‌برتر</h3>
            <p className="mt-2 text-sm leading-[1.75] text-white/70">
              برنامه‌ی هفتگی را خودش روی وقت آزاد واقعی‌ات می‌نویسد، جلسه‌ی هفتگی برگزار می‌کند، و
              پاسخگوی نتیجه است — چیزی که هیچ چت‌باتی نمی‌تواند باشد.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
