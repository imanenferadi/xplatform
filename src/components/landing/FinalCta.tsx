import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-x-xl bg-navy-900 px-6 py-14 text-center text-white md:px-16">
        <h2 className="text-2xl font-bold md:text-[32px]">مشاورت منتظرته</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          پروفایل‌ها رو ببین و یه جلسه‌ی آشنایی رایگان بگیر. بدون نصب برنامه و
          بدون کارت بانکی.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#mentors"
            className={buttonVariants({
              size: "lg",
              variant: "secondary",
              className: "bg-white text-navy-900 hover:bg-blue-100",
            })}
          >
            مشاورها رو ببین
            <ArrowLeft size={18} />
          </a>
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              variant: "ghost",
              className: "text-white hover:bg-white/10",
            })}
          >
            ثبت‌نام رایگان
          </Link>
        </div>
      </div>
    </section>
  );
}
