const steps = [
  {
    n: "۰۱",
    title: "تعیین سطح",
    body: "۳۰ تا ۴۵ دقیقه، ۲۵ تا ۳۵ سؤال تطبیقی. نتیجه یک نیمرخ دقیق از نقاط قوت و ضعف توست.",
  },
  {
    n: "۰۲",
    title: "تطبیق با مشاور",
    body: "۳ مشاور از میان رتبه‌برترهای سال قبل که مسیرشان به نیمرخ تو نزدیک‌تر است.",
  },
  {
    n: "۰۳",
    title: "مسیر مشترک",
    body: "برنامه‌ی هفتگی که مشاورت خودش می‌نویسد، جلسه‌ی ثابت هفتگی، و رفع اشکال لحظه‌ای با AI.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-surface-2/60 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">چگونه کار می‌کند؟</h2>
          <p className="mt-3 text-text-500">یک حلقه‌ی ساده که هر هفته دقیق‌تر می‌شود.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-x-lg border border-border bg-surface p-6">
              <span className="tnum text-3xl font-extrabold text-blue-300">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold text-text-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-[1.75] text-text-500">{s.body}</p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -left-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border md:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
