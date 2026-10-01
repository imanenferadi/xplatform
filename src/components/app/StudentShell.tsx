"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  MessageCircle,
  BarChart3,
  Wrench,
  Home,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { useUnreadTicketCount } from "@/lib/ticket-store";
import { useUnread } from "@/lib/chat-store";
import { SupportViewFrame } from "@/components/app/SupportView";

type NavSection = { href: string; label: string };
type NavGroup = {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  sections: NavSection[];
};

// Five top-level tabs instead of a 15-item sidebar. Each group's sections
// keep their own URLs (so no existing link breaks); the shell just renders
// them as sub-tabs above the page.
const navGroups: NavGroup[] = [
  {
    label: "امروز",
    icon: Home,
    sections: [{ href: "/dashboard", label: "امروز" }],
  },
  {
    label: "برنامه",
    icon: CalendarDays,
    sections: [
      { href: "/dashboard/plan", label: "برنامه" },
      { href: "/dashboard/focustimer", label: "تایمر فوکوس" },
      { href: "/dashboard/exam-sim", label: "شبیه‌ساز آزمون" },
    ],
  },
  {
    label: "گزارش",
    icon: BarChart3,
    sections: [
      { href: "/dashboard/report", label: "گزارش کار" },
      { href: "/dashboard/weekly", label: "جمع هفته و روند" },
      { href: "/dashboard/karnameh", label: "کارنامه" },
    ],
  },
  {
    label: "مشاور من",
    icon: MessageCircle,
    sections: [{ href: "/chat", label: "پیام‌ها" }],
  },
  {
    label: "ابزارها",
    icon: Wrench,
    sections: [
      { href: "/dashboard/ai", label: "معلم AI" },
      { href: "/dashboard/library", label: "کتابخونه" },
      { href: "/dashboard/mistakes", label: "دفترچه" },
    ],
  },
];

// Reached from the avatar, not a top-level tab.
const accountGroup: NavGroup = {
  label: "حساب من",
  icon: Home,
  sections: [
    { href: "/profile", label: "پروفایل" },
    { href: "/dashboard/setup", label: "اطلاعات شروع" },
    { href: "/dashboard/referral", label: "دعوت از دوستان" },
    { href: "/support", label: "پشتیبانی" },
  ],
};

function findGroup(pathname: string): NavGroup | undefined {
  return [...navGroups, accountGroup].find((g) =>
    g.sections.some((s) => s.href === pathname),
  );
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeGroup = findGroup(pathname);
  const showSubTabs = activeGroup && activeGroup.sections.length > 1;
  const unreadSupport = useUnreadTicketCount("ایمان");
  const unreadChat = useUnread("me", "student");
  const hasDot = (g: NavGroup) => g.label === "مشاور من" && unreadChat > 0;

  return (
    <SupportViewFrame userId="me">
      <a href="#main" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-border bg-surface md:flex">
          <div className="flex items-center justify-between p-5">
            <Logo />
            <ThemeToggle />
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {navGroups.map((g) => {
              const active = g === activeGroup;
              const Icon = g.icon;
              return (
                <Link
                  key={g.label}
                  href={g.sections[0].href}
                  className={cn(
                    "flex items-center gap-3 rounded-x-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-100 text-blue-600"
                      : "text-text-700 hover:bg-surface-2",
                  )}
                >
                  <span className="relative">
                    <Icon size={18} />
                    {hasDot(g) && <UnreadDot />}
                  </span>
                  {g.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 rounded-x-md p-1.5 transition-colors",
                activeGroup === accountGroup
                  ? "bg-blue-100"
                  : "hover:bg-surface-2",
              )}
            >
              <span className="relative">
                <Avatar name="ایمان" size="sm" />
                {unreadSupport > 0 && <UnreadDot />}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text-900">
                  ایمان
                </div>
                <div className="truncate text-xs text-text-500">
                  {unreadSupport > 0
                    ? "پاسخ جدید از پشتیبانی"
                    : "پروفایل، دعوت و پشتیبانی"}
                </div>
              </div>
            </Link>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/profile" aria-label="حساب من" className="relative">
              <Avatar name="ایمان" size="sm" />
              {unreadSupport > 0 && <UnreadDot />}
            </Link>
          </div>
        </div>

        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-24 pt-16 md:pb-0 md:pt-0"
        >
          {showSubTabs && (
            // Fixed height (h-14) on purpose: full-height pages like the AI chat
            // subtract it in their calc() so the composer stays on screen.
            <div className="mx-auto flex h-14 max-w-3xl items-end gap-1.5 overflow-x-auto px-4">
              {activeGroup.sections.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "shrink-0 rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    s.href === pathname
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700 hover:border-blue-300",
                  )}
                >
                  {s.label}
                  {s.href === "/support" && unreadSupport > 0 && (
                    <span className="tnum mr-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
                      {toPersianDigits(unreadSupport)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
          {children}
        </main>

        {/* Mobile bottom nav — same five tabs as the sidebar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-surface/95 py-2 backdrop-blur md:hidden">
          {navGroups.map((g) => {
            const active = g === activeGroup;
            const Icon = g.icon;
            return (
              <Link
                key={g.label}
                href={g.sections[0].href}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-1 rounded-x-md px-2 py-1.5 text-xs",
                  active ? "text-blue-600" : "text-text-500",
                )}
              >
                <span className="relative">
                  <Icon size={20} />
                  {hasDot(g) && <UnreadDot />}
                </span>
                {g.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </SupportViewFrame>
  );
}

function UnreadDot() {
  return (
    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-red-500" />
  );
}
