import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";

const mentors = [
  {
    id: "sara-mohammadi",
    name: "سارا محمدی",
    rank: "رتبه ۴۴۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشجوی پزشکی، دانشگاه تهران",
    style: "همراه و آرام",
    capacity: "۳ ظرفیت باقی‌مانده",
    reason:
      "شیمی نقطه‌ضعف توئه و شیمیِ سارا در کنکور ۹۲٪ بوده. او هم سال دهم از صفر شروع کرد.",
  },
  {
    id: "amirhossein-rezaei",
    name: "امیرحسین رضایی",
    rank: "رتبه ۱۲۰",
    year: "کنکور ۱۴۰۴",
    school: "مهندسی برق، شریف",
    style: "داده‌محور",
    capacity: "۵ ظرفیت باقی‌مانده",
    reason:
      "الگوی تست‌زنی تو «سریع ولی نامطمئن» است. امیرحسین دقیقاً همین مشکل را با تحلیل زمان‌بندی حل کرد.",
  },
  {
    id: "negar-ahmadi",
    name: "نگار احمدی",
    rank: "رتبه ۳۱۰",
    year: "کنکور ۱۴۰۳",
    school: "دندان‌پزشکی، شهید بهشتی",
    style: "انگیزشی",
    capacity: "۲ ظرفیت باقی‌مانده",
    reason: "هدف تو دندان‌پزشکی است؛ نگار همین رشته را با یک جهش رتبه در دوازدهم گرفت.",
  },
];

export function MatchingPreview() {
  return (
    <section id="demo" className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-text-900 md:text-[32px]">
            بر اساس نیمرخ تو، ۳ نفر رو پیدا کردیم
          </h2>
          <p className="mt-3 text-text-500">
            نه یک لیست ۵۰ نفره — سه مشاور تأییدشده که مسیرشان به مسیر تو نزدیک‌تر است.
          </p>
        </div>
        <span className="text-sm text-text-500 md:shrink-0">نمونه‌ی واقعی خروجی، بعد از تعیین سطح</span>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {mentors.map((m) => (
          <Card key={m.id} interactive className="flex flex-col">
            <CardContent className="flex flex-1 flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-text-900"
                  >
                    {m.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-text-900">
                      {m.name}
                      <BadgeCheck size={15} className="text-blue-600" aria-label="مشاور تأییدشده" />
                    </div>
                    <div className="text-xs text-text-500">{m.school}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="brand">{m.rank}</Badge>
                <Badge tone="neutral">{m.year}</Badge>
                <Badge tone="info">{m.style}</Badge>
              </div>

              <div className="mt-4 flex-1 rounded-x-md bg-surface-2 p-3 text-sm leading-[1.75] text-text-700">
                {m.reason}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-text-500">
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" /> ۴.۹ (۳۳ نظر)
                </span>
                <span>{m.capacity}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/mentors/${m.id}`} className={buttonVariants({ className: "w-full", size: "md" })}>
                مشاهده پروفایل
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-text-500">
        هیچ‌کدام مناسب نبود؟{" "}
        <a href="#" className="text-blue-600 hover:underline">
          گزینه‌های بیشتر را ببین
        </a>
      </p>
    </section>
  );
}
