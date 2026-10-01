import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/Button";

export const metadata = { title: "صفحه پیدا نشد", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <Link href="/" aria-label="صفحه اصلی" className="mb-10">
        <Logo />
      </Link>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
        <Compass size={26} className="text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-text-900">این صفحه پیدا نشد</h1>
      <p className="mt-2 max-w-sm text-text-500">
        شاید آدرس اشتباه تایپ شده یا صفحه جابه‌جا شده. از اینجا می‌تونی ادامه
        بدی:
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          صفحه‌ی اصلی
        </Link>
        <Link
          href="/mentors"
          className={buttonVariants({ size: "lg", variant: "secondary" })}
        >
          مشاورها رو ببین
        </Link>
      </div>
    </main>
  );
}
