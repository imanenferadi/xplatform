# Matriss — پلتفرم مشاوره و مطالعه‌ی کنکور

هسته‌ی محصول: **انتخاب مشاور رتبه‌برتر → جلسه‌ی آشنایی → رابطه‌ی مستمر هفتگی**.
تعیین سطح اختیاریه: بعد از ثبت‌نام، هر کس خواست برای تحلیل دقیق‌تر آزمون می‌ده.

جزئیات کامل وضعیت پروژه، تصمیمات معماری، باگ‌های رفع‌شده و نقشه‌ی راه ادامه‌ی کار در
[PROJECT_STATUS.md](./PROJECT_STATUS.md) است — قبل از هر تغییری آن را بخوان.

سند محصول کامل در [platform-x-product-spec.md](./platform-x-product-spec.md).

## اجرا

```bash
npm install
npm run dev
```

روی `http://localhost:3000` باز می‌شود.

```bash
npm run lint      # قبل از هر commit
npm run build     # بررسی build تولید
npm run contrast  # کنتراست AA همه‌ی جفت‌رنگ‌های پالت (از globals.css)
npm run brand     # ساخت دوباره‌ی لوگو، آیکون‌ها و تصویر اشتراک‌گذاری
```

## داده و سرور

داده‌ها در `localStorage` کار می‌کنن و خودکار با سرور (SQLite در `data/matriss.db`، از
طریق `/api/state`) هم‌گام می‌شن؛ اگه سرور نباشه برنامه مثل قبل روی مرورگر کار می‌کنه.
Node ۲۲٫۵ یا بالاتر لازمه. هنوز ورود و دسترسی نداره، پس تا آماده شدنش فقط روی شبکه‌ی خصوصی
بالا بیار. جزئیات: بخش «بک‌اند» در [PROJECT_STATUS.md](./PROJECT_STATUS.md).

متغیرهای محیطی: `NEXT_PUBLIC_SITE_URL` (آدرس نهایی سایت، برای لینک‌ها و sitemap)،
`MATRISS_DB` (مسیر فایل پایگاه داده، اختیاری).

## استک

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · RTL کامل · حالت تاریک/روشن ·
فونت Vazirmatn · lucide-react
