"use client";

import Link from "next/link";
import { CalendarRange, ClipboardList, Moon, AlertTriangle, Lock, Gauge, Check } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { markGuideRead, useOnboarding } from "@/components/app/MentorToday";
import { PLAN_DEADLINE_DAY, PLATFORM_COMMISSION_PERCENT, QUALITY_FLAGS, QUALITY_WEIGHTS } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

const fa = toPersianDigits;

// Six short cards for a newly approved mentor. Every number here comes
// from the same constants the product enforces, so the guide can't drift.
const CARDS = [
  {
    icon: CalendarRange,
    title: "هفته‌ی کاری تو",
    points: [
      `برنامه‌ی هفته‌ی بعد هر دانش‌آموز تا ${PLAN_DEADLINE_DAY} شب — دانش‌آموزی که شنبه صبح برنامه نداره، شنبه رو از دست داده.`,
      "یک جلسه‌ی ثابت هفتگی با هر نفر؛ وقتش رو از ساعت‌های آزادت در تقویم انتخاب می‌کنه.",
      "هر شب گزارش کارها رو ببین؛ «کارهای امروز» داشبورد همه‌ی این‌ها رو به ترتیب فوریت جلوت می‌ذاره.",
    ],
  },
  {
    icon: ClipboardList,
    title: "نوشتن برنامه",
    points: [
      "برنامه رو کامل خودت می‌نویسی — سیستم پیشنهادی نمی‌ده، فقط حساب می‌کنه.",
      "بلوک ساعتی برای هر درس («ریاضی ۳، فیزیک ۲»)، نه برنامه‌ی دقیقه‌ای. فصل و ریز مبحث اختیاریه.",
      "قبلش ببین: آخرین کارنامه و ضرایب رشته‌اش، وقت آزاد هر روز (از ساعت مدرسه) و کتاب‌هایی که داره. اگه روزی از وقت آزادش بیشتر بشه، ویرایشگر نارنجی نشونش می‌ده.",
      "«کپی از این هفته» و «قالب‌ها» برای سرعت؛ تا «ارسال» رو نزنی، دانش‌آموز چیزی نمی‌بینه.",
    ],
  },
  {
    icon: Moon,
    title: "بازخورد روی گزارش کار",
    points: [
      "یک واکنش (👏 / 💪 / 💬) و یک جمله کافیه؛ دانش‌آموز صبح توی داشبوردش می‌بینه.",
      "«بیا صحبت کنیم» یعنی امروز توی چت پیگیرش باش.",
      `هدف: حداقل ${fa(QUALITY_FLAGS.minReportRate)}٪ دانش‌آموزهات هر شب گزارش بدن — بازخورد منظم خودش این عدد رو بالا نگه می‌داره.`,
    ],
  },
  {
    icon: AlertTriangle,
    title: "علائم هشدار",
    points: [
      "۳ شب یا بیشتر بدون گزارش کار.",
      "افت محسوس یک درس بین دو آزمون.",
      "روند نزولی اجرای برنامه در چند هفته، حتی وقتی عدد این هفته هنوز «قابل قبول» به نظر می‌رسه.",
      "این‌ها خودکار علامت می‌خورن؛ کار تو یک تماس یا پیام همون روزه، نه صبر تا جلسه‌ی بعد.",
    ],
  },
  {
    icon: Lock,
    title: "حریم خصوصی",
    points: [
      "یادداشت‌های خصوصی فقط برای خودته و با تعویض مشاور منتقل نمی‌شه.",
      "والدین فقط چیزهایی رو می‌بینن که خود دانش‌آموز اجازه داده؛ گفتگوهای شما هرگز.",
      "هیچ‌وقت گفتگو یا اطلاعات دانش‌آموز رو بیرون از پلتفرم (تلگرام، اسکرین‌شات) پخش نکن.",
    ],
  },
  {
    icon: Gauge,
    title: "کیفیت و درآمد",
    points: [
      `پیام‌ها رو زیر ${fa(QUALITY_FLAGS.maxResponseHours)} ساعت جواب بده؛ بیشتر از این، در امتیاز کیفیتت علامت می‌خوره.`,
      `امتیاز کیفیت: سرعت پاسخ (${fa(QUALITY_WEIGHTS.response)}٪)، گزارش کار (${fa(QUALITY_WEIGHTS.reports)}٪)، ماندگاری (${fa(QUALITY_WEIGHTS.retention)}٪)، امتیاز جلسه (${fa(QUALITY_WEIGHTS.rating)}٪)، برنامه‌ی به‌موقع (${fa(QUALITY_WEIGHTS.planOnTime)}٪) و شکایت (${fa(QUALITY_WEIGHTS.complaints)}٪).`,
      `کارمزد پلتفرم ${fa(PLATFORM_COMMISSION_PERCENT)}٪ است و تسویه ماهانه به شبای خودت انجام می‌شه.`,
      "هر مشکلی داشتی از «پشتیبانی» تیکت بزن؛ تعویض مشاور فقط از طرف تیم پلتفرم انجام می‌شه.",
    ],
  },
];

export default function MentorGuidePage() {
  const { guideRead } = useOnboarding();

  return (
    <MentorShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
        <h1 className="text-lg font-bold text-text-900">راهنمای مشاور</h1>
        <p className="mt-1 text-sm text-text-500">پنج دقیقه — همه‌ی چیزی که برای هفته‌ی اول لازم داری.</p>

        <div className="mt-5 space-y-3">
          {CARDS.map((c, i) => (
            <Card key={c.title}>
              <CardContent>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-text-900">
                  <span className="tnum flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600">
                    {fa(i + 1)}
                  </span>
                  <c.icon size={15} className="text-blue-600" />
                  {c.title}
                </h2>
                <ul className="list-inside list-disc space-y-1.5 text-sm leading-[1.9] text-text-700">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {guideRead ? (
            <span className="flex items-center gap-1 text-sm text-mint-500">
              <Check size={15} /> خوندی
            </span>
          ) : (
            <Button size="lg" onClick={markGuideRead}>
              <Check size={16} /> خوندم
            </Button>
          )}
          <Link href="/mentor" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            برگرد به داشبورد
          </Link>
        </div>
      </div>
    </MentorShell>
  );
}
