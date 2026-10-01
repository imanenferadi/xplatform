"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Every answer matches a real flow (see /help for the full list).
const faqs = [
  {
    q: "حتماً باید تعیین سطح بدم؟",
    a: "نه. مستقیم از فهرست مشاورها انتخاب کن. اگه بعد از ثبت‌نام خواستی، چند دقیقه آزمون بده تا نیمرخ سطحت برای مشاورت ارسال بشه و ۳ مشاور نزدیک‌تر به مسیرت هم پیشنهاد بشن.",
  },
  {
    q: "مشاورها چطور انتخاب و تأیید می‌شن؟",
    a: "هر مشاور رتبه‌ش رو با کارنامه‌ی کنکور احراز می‌کنه و پروفایلش قبل از نمایش توسط تیم ماتریس بررسی می‌شه. بعد از شروع کار هم سرعت پاسخ، بررسی گزارش کارها و امتیاز دانش‌آموزها هر هفته سنجیده می‌شه.",
  },
  {
    q: "اگه از مشاورم راضی نبودم چی؟",
    a: "از «پشتیبانی» یه تیکت ثبت کن؛ مشاور جایگزین از همون رشته با ظرفیت خالی برات انتخاب می‌شه و برنامه، گزارش‌ها و کارنامه‌هات کامل منتقل می‌شن.",
  },
  {
    q: "اگه پشیمون شدم، پولم برمی‌گرده؟",
    a: "بله. تا ۷ روز بعد از خرید هر پکیج جدید، بدون سؤال کل مبلغ برمی‌گرده. پکیج‌های سه‌ماهه و تا کنکور رو هم می‌شه قسطی و بدون سود پرداخت کرد.",
  },
  {
    q: "ماتریس برای چه پایه‌ها و رشته‌هایی طراحی شده؟",
    a: "فعلاً رشته‌های تجربی و ریاضی، از پایه‌ی دهم تا پشت‌کنکوری. انسانی و هنر در مراحل بعدی اضافه می‌شن.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-surface-2/60 py-12 md:py-24">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-text-900 md:text-[32px]">
          سؤالات متداول
        </h2>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-x-md border border-border bg-surface"
              >
                <button
                  className="flex w-full items-center justify-between gap-3 p-4 text-right"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-text-900">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "shrink-0 text-text-500 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-[1.75] text-text-500">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
