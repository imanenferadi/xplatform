import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GUARANTEE_DAYS } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";
import { spotlightMentors } from "./mentor-ranking";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Deliberately asymmetric background shape — not a centered gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl md:-left-10"
      />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-24">
        <div>
          <Badge tone="brand" className="mb-5">
            <BadgeCheck size={14} /> مشاورهای رتبه‌برتر کنکور، با رتبه‌ی
            احرازشده
          </Badge>

          <h1 className="text-[32px] font-extrabold leading-[1.25] text-text-900 md:text-[44px]">
            مشاورت رو خودت انتخاب کن،
            <br />
            از بین رتبه‌برترهای کنکور.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-[1.75] text-text-700">
            رتبه، دانشگاه، سبک مشاوره و ظرفیت خالی هر مشاور رو ببین. یه جلسه‌ی
            آشنایی رایگان بگیر، بعد تصمیم بگیر. مشاورت هر هفته برنامه‌ت رو خودش
            می‌نویسه.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#mentors" className={buttonVariants({ size: "lg" })}>
              مشاورها رو ببین
              <ArrowLeft size={18} />
            </a>
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              ثبت‌نام رایگان
            </Link>
          </div>

          <p className="mt-4 text-sm text-text-500">
            بدون کارت بانکی · جلسه‌ی آشنایی رایگان · ضمانت{" "}
            {toPersianDigits(GUARANTEE_DAYS)} روزه‌ی بازگشت وجه
          </p>
        </div>

        <HeroMentorStack />
      </div>
    </section>
  );
}

/** Three real mentors, best rank first — the product in one glance. */
function HeroMentorStack() {
  const top = spotlightMentors(3);
  return (
    <div className="relative mx-auto w-full max-w-sm rotate-1 rounded-x-xl border border-border bg-surface p-5 shadow-x-lg md:rotate-2">
      <div className="mb-3 text-sm font-medium text-text-500">
        چند نفر از مشاورهای ماتریس
      </div>
      <ul className="space-y-2.5">
        {top.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-x-md bg-surface-2 p-3"
          >
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-text-900"
            >
              {m.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-bold text-text-900">
                {m.name}
                <BadgeCheck
                  size={13}
                  className="shrink-0 text-blue-600"
                  aria-label="رتبه احراز شده"
                />
              </div>
              <div className="truncate text-xs text-text-500">{m.school}</div>
            </div>
            <div className="text-left">
              <Badge tone="brand">{m.rank}</Badge>
              <div className="mt-1 flex items-center justify-end gap-0.5 text-xs text-text-500">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                <span className="tnum">{toPersianDigits(m.rating)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
