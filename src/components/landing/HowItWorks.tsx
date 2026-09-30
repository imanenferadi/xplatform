const steps = [
  {
    n: "۰۱",
    title: "مشاورت رو انتخاب کن",
    body: "از بین رتبه‌برترها، با رتبه، دانشگاه، سبک مشاوره و ظرفیت خالی. می‌تونی دو نفر رو کنار هم مقایسه کنی.",
  },
  {
    n: "۰۲",
    title: "جلسه‌ی آشنایی رایگان",
    body: "۲۰ دقیقه با مشاور حرف بزن تا مطمئن بشی سبکش بهت می‌خوره. تا اینجا هیچ پولی نمی‌دی.",
  },
  {
    n: "۰۳",
    title: "هر هفته، با هم",
    body: "مشاورت برنامه‌ی هفته رو خودش روی وقت آزاد واقعیت می‌نویسه، جلسه‌ی ثابت هفتگی داری و گزارش کار شبانه‌ت رو می‌بینه.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-surface-2/60 py-12 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mb-6 max-w-2xl md:mb-10">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
            چطور کار می‌کنه؟
          </h2>
          <p className="mt-3 text-text-500">سه قدم، بدون آزمون اجباری.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-x-lg border border-border bg-surface p-6"
            >
              <span className="tnum text-3xl font-extrabold text-blue-600">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-bold text-text-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.75] text-text-500">
                {s.body}
              </p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -left-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border md:block"
                />
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-text-500">
          <span className="font-medium text-text-700">تعیین سطح اختیاریه:</span>{" "}
          بعد از ثبت‌نام، اگه خواستی چند دقیقه آزمون بده. نیمرخ سطحت برای مشاورت
          ارسال می‌شه تا دقیق‌تر برنامه بنویسه.
        </p>
      </div>
    </section>
  );
}
