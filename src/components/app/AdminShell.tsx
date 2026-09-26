"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, UserCheck, Users, ScrollText, Receipt, ArrowLeftRight, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

// Admin is desktop-only in this demo — no mobile bottom nav, since the
// people using it (platform ops) aren't doing this from a phone.
const links = [
  { href: "/admin", label: "داشبورد مالی", icon: Wallet },
  { href: "/admin/mentors", label: "تأیید مشاوران", icon: UserCheck },
  { href: "/admin/payments", label: "تراکنش‌ها", icon: Receipt },
  { href: "/admin/tickets", label: "تیکت‌ها", icon: LifeBuoy },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/reassign", label: "تعویض مشاور", icon: ArrowLeftRight },
  { href: "/admin/logs", label: "لاگ فعالیت‌ها", icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-l border-border bg-navy-900">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-bold text-white">X · ادمین</span>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-x-sm px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name="ادمین" size="sm" />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">ادمین پلتفرم</div>
              <div className="truncate text-[11px] text-white/50">دسترسی کامل</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
