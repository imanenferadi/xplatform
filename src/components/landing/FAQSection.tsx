"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "X برای چه پایه‌ها و رشته‌هایی طراحی شده؟",
    a: "در فاز اول: رشته‌های تجربی و ریاضی، از پایه‌ی دهم تا پشت‌کنکوری. انسانی و هنر در فازهای بعدی اضافه می‌شوند.",
  },
  {
    q: "مشاورها چطور انتخاب و تأیید می‌شوند؟",
    a: "هر مشاور رتبه‌ی خودش در کنکور سال قبل را با کارنامه ثبت‌نام تأیید می‌کند، سپس یک مصاحبه‌ی کوتاه می‌گذراند. نشان «تأییدشده» فقط بعد از این فرایند فعال می‌شود.",
  },
  {
    q: "تطبیق مشاور چه فرقی با یک لیست ساده دارد؟",
    a: "الگوریتم تطبیق، نقاط ضعف نیمرخ تو را با قوت مشاور، سبک شخصیتی، و نزدیکی مسیر (نه فقط رتبه) می‌سنجد و دلیل هر پیشنهاد را به زبان ساده توضیح می‌دهد.",
  },
  {
    q: "آیا تعیین سطح و تست اولیه رایگان است؟",
    a: "بله. تعیین سطح، نیمرخ کامل، و مشاهده‌ی سه مشاور پیشنهادی همیشه رایگان است.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-surface-2/60 py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-text-900 md:text-[32px]">
          سؤالات متداول
        </h2>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-x-md border border-border bg-surface">
                <button
                  className="flex w-full items-center justify-between gap-3 p-4 text-right"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-text-900">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={cn("shrink-0 text-text-500 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-[1.75] text-text-500">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
