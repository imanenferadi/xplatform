"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  MessageCircle,
  Bot,
  BarChart3,
  Moon as MoonIcon,
  Library,
  Calculator,
  User,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

const sidebarLinks = [
  { href: "/dashboard", label: "امروز", icon: Home },
  { href: "/dashboard/plan", label: "برنامه", icon: CalendarDays },
  { href: "/dashboard/checkin", label: "چک‌این شب", icon: MoonIcon },
  { href: "/mentors/sara-mohammadi", label: "مشاور من", icon: User },
  { href: "/chat", label: "پیام‌ها", icon: MessageCircle },
  { href: "/dashboard/ai", label: "معلم AI", icon: Bot },
  { href: "/dashboard/library", label: "کتابخونه", icon: Library },
  { href: "/dashboard/calculator", label: "ماشین‌حساب درصد", icon: Calculator },
  { href: "/dashboard/reports", label: "گزارش‌ها", icon: BarChart3 },
];

const bottomNavLinks = [
  { href: "/dashboard", label: "امروز", icon: Home },
  { href: "/dashboard/plan", label: "برنامه", icon: CalendarDays },
  { href: "/dashboard/checkin", label: "چک‌این", icon: MoonIcon },
  { href: "/mentors/sara-mohammadi", label: "مشاور", icon: User },
  { href: "/chat", label: "پیام‌ها", icon: MessageCircle },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-border bg-surface md:flex">
        <div className="flex items-center justify-between p-5">
          <Logo />
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sidebarLinks.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-x-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-100 text-blue-600"
                    : "text-text-700 hover:bg-surface-2"
                )}
              >
                <Icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link href="/profile" className="flex items-center gap-3">
            <Avatar name="ایمان" size="sm" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-text-900">ایمان</div>
              <div className="truncate text-xs text-text-500">پروفایل من</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Avatar name="ایمان" size="sm" />
        </div>
      </div>

      <main className="min-w-0 flex-1 pb-24 pt-16 md:pb-0 md:pt-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-surface/95 py-2 backdrop-blur md:hidden">
        {bottomNavLinks.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-1 rounded-x-md px-2 py-1.5 text-[11px]",
                active ? "text-blue-600" : "text-text-500"
              )}
            >
              <Icon size={20} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
