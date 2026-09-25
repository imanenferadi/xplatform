import Link from "next/link";
import { LifeBuoy, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type FaqItem = { q: string; a: string };
type FaqCategory = { title: string; items: FaqItem[] };

const categories: FaqCategory[] = [
  {
    title: "شروع کار",
    items: [
      {
        q: "تعیین سطح چقدر طول می‌کشه؟",
        a: "حدود ۲۰ تا ۳۰ دقیقه — ۳۰ سؤال از درس‌های اصلی. نتیجه‌ش نیمرخ سطح توئه که مشاوران پیشنهادی بر اساسش انتخاب می‌شن.",
      },
      {
        q: "چرا فقط ۳ مشاور پیشنهاد می‌دید، نه یه لیست بلند؟",
        a: "چون هدف انتخاب سریع و دقیقه، نه گشتن توی ده‌ها پروفایل. اگه هیچ‌کدوم مناسب نبود، از «گزینه‌های بیشتر» می‌تونی فهرست کامل رو با فیلتر ببینی.",
      },
      {
        q: "جلسه‌ی آشنایی رایگانه؟",
        a: "بله، ۲۰ دقیقه‌ی اول با هر مشاوری کاملاً رایگانه تا مطمئن بشی سبک کارش بهت می‌خوره.",
      },
    ],
  },
  {
    title: "مشاور",
    items: [
      {
        q: "مشاورها چه کسانی هستن؟",
        a: "همه از رتبه‌های برتر یک تا دو سال اخیر کنکورن — کسایی که خودشون تازه همین مسیر رو رفتن.",
      },
      {
        q: "اگه از مشاورم راضی نبودم چیکار کنم؟",
        a: "به پشتیبانی پیام بده. تیم ما بررسی می‌کنه و یه مشاور جایگزین از همون گروه آزمایشی با ظرفیت خالی برات انتخاب می‌کنه؛ برنامه، گزارش کارها و کارنامه‌هات کامل به مشاور جدید منتقل می‌شن.",
      },
      {
        q: "برنامه‌ی هفتگی رو کی می‌نویسه؟",
        a: "همیشه مشاورت، بر اساس کارنامه‌ی آزمون دوهفتگیت و ضرایب رشته‌ی هدفت. ابزارهای هوش مصنوعی فقط کمکش می‌کنن، جای تصمیمش رو نمی‌گیرن.",
      },
    ],
  },
  {
    title: "پرداخت",
    items: [
      {
        q: "پلن‌ها چه فرقی دارن؟",
        a: "از رایگان (فقط تعیین سطح) تا پلن‌های ماهانه با جلسه‌ی اختصاصی و چت مستقیم با مشاور. جدول کامل توی صفحه‌ی پرداخت هست.",
      },
      {
        q: "می‌تونم وسط ماه پلنم رو عوض کنم؟",
        a: "بله، از پروفایلت یا از پنل والدین می‌تونی «تغییر پلن» بزنی.",
      },
      {
        q: "اگه بخوام پول رو پس بگیرم چی؟",
        a: "تا ۷ روز بعد از خرید هر پکیج جدید، از بخش «اشتراک من» در پروفایلت «درخواست بازگشت وجه» بزن؛ کل مبلغی که پرداخت کردی بدون سؤال برمی‌گرده. بعد از ۷ روز، درخواستت رو پشتیبانی بررسی می‌کنه.",
      },
      {
        q: "می‌شه قسطی پرداخت کرد؟",
        a: "بله. پکیج سه‌ماهه رو می‌تونی ۳ قسط و پکیج تا کنکور رو ۴ قسط ماهانه بدون سود بدی. پکیج‌های بلندتر تخفیف هم دارن.",
      },
    ],
  },
  {
    title: "فنی",
    items: [
      {
        q: "جلسه‌ی صوتی/تصویری روی چه چیزی کار می‌کنه؟",
        a: "مستقیم توی مرورگر، بدون نصب اپ جدا. فقط اجازه‌ی دسترسی به دوربین/میکروفون رو بده.",
      },
      {
        q: "اگه اینترنتم قطع بشه، اطلاعاتم از دست می‌ره؟",
        a: "برنامه و گزارش‌هات ذخیره‌شده‌ن؛ فقط باید دوباره وصل بشی تا ادامه بدی.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link href="/dashboard" className="flex items-center gap-1 text-xs text-text-500 hover:text-text-900">
            بازگشت به داشبورد
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LifeBuoy size={22} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-900">راهنما و سؤالات متداول</h1>
          <p className="mt-2 text-text-500">جواب سریع سؤال‌هایی که تازه‌واردها معمولاً می‌پرسن.</p>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h2 className="mb-2 text-sm font-bold text-text-900">{cat.title}</h2>
              <div className="divide-y divide-border rounded-x-lg border border-border bg-surface">
                {cat.items.map((item) => (
                  <details key={item.q} className="group p-4">
                    <summary className="cursor-pointer text-sm font-medium text-text-900 marker:content-none">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm leading-[1.8] text-text-700">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-500">
          جواب سؤالتو پیدا نکردی؟{" "}
          <Link href="/chat" className="text-blue-600 hover:underline">
            از مشاورت بپرس
          </Link>
        </p>
      </div>
    </div>
  );
}
