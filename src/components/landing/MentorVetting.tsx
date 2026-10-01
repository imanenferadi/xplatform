import { ArrowLeftRight, BadgeCheck, FileCheck2, Gauge } from "lucide-react";

// Only what the platform actually does — see /mentor/apply, /admin/mentors,
// /admin/quality and /admin/reassign. No claims we can't back.
const steps = [
  {
    icon: FileCheck2,
    title: "رتبه با کارنامه احراز می‌شه",
    body: "هر مشاور موقع ثبت‌نام کارنامه‌ی کنکورش رو بارگذاری می‌کنه. نشان «احرازشده» فقط بعد از بررسی همین کارنامه فعال می‌شه.",
  },
  {
    icon: BadgeCheck,
    title: "تیم ماتریس تأییدش می‌کنه",
    body: "پروفایل، داستان مسیر و سبک مشاوره قبل از نمایش در سایت بررسی می‌شه. درخواست‌های ناقص رد می‌شن.",
  },
  {
    icon: Gauge,
    title: "کیفیتش هر هفته سنجیده می‌شه",
    body: "سرعت جواب دادن به پیام‌ها، بررسی گزارش کارها و امتیاز دانش‌آموزها. مشاوری که افت کنه، پیگیری می‌شه.",
  },
  {
    icon: ArrowLeftRight,
    title: "راضی نبودی؟ عوضش کن",
    body: "با یه تیکت، مشاور جایگزین از همون رشته برات انتخاب می‌شه و برنامه، گزارش‌ها و کارنامه‌هات کامل منتقل می‌شن.",
  },
];

export function MentorVetting() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="mb-6 max-w-2xl md:mb-10">
        <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
          مشاورها چطور انتخاب می‌شن؟
        </h2>
        <p className="mt-3 text-text-500">
          هر کسی نمی‌تونه مشاور ماتریس بشه — و بعد از قبول شدن هم رها نمی‌شه.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="flex gap-3 rounded-x-lg border border-border bg-surface p-4 sm:block sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-text-900 sm:mt-3">{s.title}</h3>
                <p className="mt-1 text-sm leading-[1.75] text-text-500 sm:mt-2">
                  {s.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
