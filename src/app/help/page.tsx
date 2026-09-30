import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { Logo } from "@/components/brand/Logo";
import { FAQ } from "@/lib/faq";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <BackLink />
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LifeBuoy size={22} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-900">
            راهنما و سؤالات متداول
          </h1>
          <p className="mt-2 text-text-500">
            جواب سریع سؤال‌هایی که تازه‌واردها معمولاً می‌پرسن.
          </p>
        </div>

        <div className="space-y-6">
          {FAQ.map((cat) => (
            <div key={cat.title}>
              <h2 className="mb-2 text-sm font-bold text-text-900">
                {cat.title}
              </h2>
              <div className="divide-y divide-border rounded-x-lg border border-border bg-surface">
                {cat.items.map((item) => (
                  <details key={item.q} className="group p-4">
                    <summary className="cursor-pointer text-sm font-medium text-text-900 marker:content-none">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm leading-[1.8] text-text-700">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-500">
          جواب سؤالتو پیدا نکردی؟{" "}
          <Link href="/support" className="text-blue-600 hover:underline">
            تیکت پشتیبانی ثبت کن
          </Link>{" "}
          یا{" "}
          <Link href="/chat" className="text-blue-600 hover:underline">
            از مشاورت بپرس
          </Link>
        </p>
      </div>
    </div>
  );
}
