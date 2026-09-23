import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "#features", label: "امکانات" },
  { href: "#demo", label: "دمو و پیش‌نمایش" },
  { href: "#how", label: "چگونه کار می‌کند" },
  { href: "#pricing", label: "تعرفه‌ها" },
  { href: "/news", label: "اخبار" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" aria-label="صفحه اصلی X">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) =>
            l.href.startsWith("/") ? (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-text-700 transition-colors hover:text-text-900"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-text-700 transition-colors hover:text-text-900"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden sm:inline-flex" })}>
            ورود
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "primary" })}>
            تعیین سطح رایگان
          </Link>
        </div>
      </div>
    </header>
  );
}
