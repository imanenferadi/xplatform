import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Absolute (/#…) so the header works from /mentors too.
const links = [
  { href: "/#mentors", label: "مشاوران" },
  { href: "/#how", label: "چطور کار می‌کنه" },
  { href: "/#pricing", label: "تعرفه‌ها" },
  { href: "/news", label: "اخبار کنکور" },
  { href: "/mentor/apply", label: "مشاور شو" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" aria-label="صفحه اصلی ماتریس">
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
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              className: "hidden sm:inline-flex",
            })}
          >
            ورود
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "primary" })}
          >
            ثبت‌نام رایگان
          </Link>
        </div>
      </div>
    </header>
  );
}
