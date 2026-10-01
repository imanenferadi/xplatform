"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { landingFaqs as faqs } from "@/lib/landing-faq";

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
