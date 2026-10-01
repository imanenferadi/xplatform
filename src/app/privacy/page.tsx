import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GUARANTEE_DAYS } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

export const metadata = { title: "قوانین و حریم خصوصی" };

// Plain-language summary of who sees what — the same rules the product
// enforces (parent access toggles, school aggregates, private notes).
const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "چه اطلاعاتی ازت داریم",
    items: [
      "شماره‌ی موبایل (برای ورود)، نام، پایه و شهر.",
      "هر چیزی که خودت ثبت می‌کنی: گزارش کار، ساعت خواب (اختیاری)، دفترچه‌ی غلط‌ها، یادداشت‌ها، پرسشنامه‌ی شروع، کتاب‌ها و ساعت مدرسه.",
      "کارنامه‌هایی که آپلود می‌کنی و پیام‌هات با مشاور و پشتیبانی.",
    ],
  },
  {
    title: "کی چی می‌بینه",
    items: [
      "مشاورت: همه‌ی اطلاعات درسی‌ات، تا بتونه برنامه‌ی درست بنویسه.",
      "والدینت: فقط بخش‌هایی که خودت در «والدینم چی ببینن» روشن کردی، به‌علاوه‌ی وضعیت پرداخت. گفتگوهات با مشاور هیچ‌وقت به والدین نشون داده نمی‌شه.",
      "مدرسه یا آموزشگاه (اگه از طریقشون عضو شدی): فقط شاخص‌های کلی مثل ساعت مطالعه و نرخ گزارش کار — نه گفتگو، نه یادداشت، نه خواب، نه دفترچه‌ی غلط‌ها.",
      "یادداشت‌های خصوصی مشاور فقط برای خود مشاوره و حتی با تعویض مشاور منتقل نمی‌شه.",
      "تیم پشتیبانی فقط برای رسیدگی به تیکت یا شکایت، و هر دسترسی‌اش در لاگ ثبت می‌شه.",
    ],
  },
  {
    title: "پرداخت و بازگشت وجه",
    items: [
      `ضمانت ${toPersianDigits(GUARANTEE_DAYS)} روزه: تا ${toPersianDigits(GUARANTEE_DAYS)} روز بعد از خرید هر پکیج جدید، کل مبلغ پرداختی بدون سؤال برمی‌گرده.`,
      "پرداخت اقساطی بدون سوده و هر وقت بخوای می‌تونی تمدید خودکار رو خاموش کنی.",
      "اطلاعات کارت بانکی رو ما نگه نمی‌داریم؛ پرداخت در درگاه بانکی انجام می‌شه.",
    ],
  },
  {
    title: "حقوق تو",
    items: [
      "هر وقت بخوای می‌تونی اطلاعاتت رو ببینی، اصلاح کنی یا درخواست حذف حسابت رو از پشتیبانی ثبت کنی.",
      "هیچ اطلاعاتی برای تبلیغات به کسی فروخته یا داده نمی‌شه.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link href="/" className="flex items-center gap-1 text-xs text-text-500 hover:text-text-900">
            صفحه‌ی اصلی <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck size={22} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-900">قوانین و حریم خصوصی</h1>
          <p className="mt-2 text-sm text-text-500">خلاصه‌ی ساده‌ی اینکه چه چیزی رو نگه می‌داریم و کی می‌بینه.</p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title} className="rounded-x-lg border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-bold text-text-900">{s.title}</h2>
              <ul className="list-inside list-disc space-y-2 text-sm leading-[1.9] text-text-700">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-[1.8] text-text-500">
          سؤالی داری؟{" "}
          <Link href="/support" className="text-blue-600 hover:underline">
            از پشتیبانی بپرس
          </Link>
          . این نسخه‌ی نمایشیه؛ متن حقوقی نهایی باید پیش از انتشار توسط مشاور حقوقی تأیید بشه.
        </p>
      </div>
    </div>
  );
}
