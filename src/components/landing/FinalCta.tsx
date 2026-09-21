import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-x-xl bg-navy-900 px-6 py-14 text-center text-white md:px-16">
        <h2 className="text-2xl font-bold md:text-[32px]">آماده‌ای مسیر درس‌خواندنت را متحول کنی؟</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          همین امروز، بدون نیاز به نصب برنامه یا پرداخت هزینه، با شماره موبایلت وارد شو.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" className="bg-white text-navy-900 hover:bg-blue-100">
            ورود به حساب کاربری
            <ArrowLeft size={18} />
          </Button>
          <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
            مشاهده‌ی تعرفه‌ها
          </Button>
        </div>
      </div>
    </section>
  );
}
