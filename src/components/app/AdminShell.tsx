"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Wallet,
  UserCheck,
  Users,
  ScrollText,
  Receipt,
  ArrowLeftRight,
  LifeBuoy,
  Gauge,
  TicketPercent,
  UserMinus,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { useInboxCounts } from "@/lib/admin-inbox";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

// Admin is desktop-only in this demo — no mobile bottom nav, since the
// people using it (platform ops) aren't doing this from a phone.
// «امروز» first (the queue of everything waiting), then three groups.
type NavLink = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };
const groups: { label: string | null; links: NavLink[] }[] = [
  { label: null, links: [{ href: "/admin", label: "امروز", icon: Inbox }] },
  {
    label: "پول",
    links: [
      { href: "/admin/finance", label: "داشبورد مالی", icon: Wallet },
      { href: "/admin/payments", label: "تراکنش‌ها", icon: Receipt },
      { href: "/admin/discounts", label: "کد تخفیف", icon: TicketPercent },
    ],
  },
  {
    label: "مشاورها و کاربران",
    links: [
      { href: "/admin/mentors", label: "تأیید مشاوران", icon: UserCheck },
      { href: "/admin/quality", label: "کیفیت مشاورها", icon: Gauge },
      { href: "/admin/users", label: "کاربران", icon: Users },
      { href: "/admin/reassign", label: "تعویض مشاور", icon: ArrowLeftRight },
    ],
  },
  {
    label: "پشتیبانی",
    links: [
      { href: "/admin/tickets", label: "تیکت‌ها", icon: LifeBuoy },
      { href: "/admin/churn", label: "دلایل لغو", icon: UserMinus },
      { href: "/admin/logs", label: "لاگ فعالیت‌ها", icon: ScrollText },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const counts = useInboxCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-l border-border bg-navy-900">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-bold text-white">X · ادمین</span>
          <ThemeToggle />
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {groups.map((g) => (
            <div key={g.label ?? "today"} className="mb-3">
              {g.label && <div className="px-3 pb-1 pt-1 text-[11px] font-medium text-white/40">{g.label}</div>}
              <div className="space-y-0.5">
                {g.links.map((l) => {
                  const active = pathname === l.href;
                  const Icon = l.icon;
                  const n = l.href === "/admin" ? total : (counts[l.href] ?? 0);
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
                      <span className="flex-1">{l.label}</span>
                      {n > 0 && (
                        <span
                          className={cn(
                            "tnum rounded-full px-1.5 text-[10px] font-bold",
                            l.href === "/admin" ? "bg-red-500 text-white" : "bg-white/15 text-white"
                          )}
                        >
                          {toPersianDigits(n)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
