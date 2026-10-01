"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ShieldCheck,
  Lock,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { useInboxCounts } from "@/lib/admin-inbox";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { PAGE_PERM, ROLE_HOME, ROLE_META, can } from "@/lib/permissions";
import { signInAs, useMe, useStaff } from "@/lib/staff-store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

// Admin is desktop-only in this demo — no mobile bottom nav, since the
// people using it (platform ops) aren't doing this from a phone.
// Daily work always visible; the rest folds under «بیشتر» — it opens by
// itself when you're on one of its pages.
type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};
const MAIN: NavLink[] = [
  { href: "/admin", label: "امروز", icon: Inbox },
  { href: "/admin/tickets", label: "تیکت‌ها", icon: LifeBuoy },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/mentors", label: "تأیید مشاوران", icon: UserCheck },
  { href: "/admin/finance", label: "داشبورد مالی", icon: Wallet },
  { href: "/admin/payments", label: "تراکنش‌ها", icon: Receipt },
];
const MORE: NavLink[] = [
  { href: "/admin/quality", label: "کیفیت مشاورها", icon: Gauge },
  { href: "/admin/reassign", label: "تعویض مشاور", icon: ArrowLeftRight },
  { href: "/admin/discounts", label: "کد تخفیف", icon: TicketPercent },
  { href: "/admin/churn", label: "دلایل لغو", icon: UserMinus },
  { href: "/admin/logs", label: "لاگ فعالیت‌ها", icon: ScrollText },
  { href: "/admin/staff", label: "کارکنان و نقش‌ها", icon: ShieldCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const counts = useInboxCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const me = useMe();
  const staff = useStaff();
  // Deny by default: a page with no rule, or one this role lacks, isn't shown.
  const pagePerm = PAGE_PERM[pathname];
  const allowed = pagePerm !== undefined && can(me.role, pagePerm);
  const visible = (links: NavLink[]) =>
    links.filter((l) => can(me.role, PAGE_PERM[l.href]));
  const main = visible(MAIN);
  const more = visible(MORE);
  const moreCount = more.reduce((a, l) => a + (counts[l.href] ?? 0), 0);
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || more.some((l) => l.href === pathname);

  const navLink = (l: NavLink) => {
    const active = pathname === l.href;
    const Icon = l.icon;
    const n = l.href === "/admin" ? total : (counts[l.href] ?? 0);
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "flex items-center gap-2.5 rounded-x-sm px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon size={16} />
        <span className="flex-1">{l.label}</span>
        {n > 0 && (
          <span
            className={cn(
              "tnum rounded-full px-1.5 text-xs font-bold",
              l.href === "/admin"
                ? "bg-red-500 text-white"
                : "bg-white/15 text-white",
            )}
          >
            {toPersianDigits(n)}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-l border-border bg-navy-900">
        <div className="flex items-center justify-between p-4">
          <Link
            href={ROLE_HOME[me.role]}
            className="text-sm font-bold text-white"
          >
            Matriss · ادمین
          </Link>
          <ThemeToggle />
        </div>

        <AdminSearch />

        <nav className="flex-1 overflow-y-auto px-2">
          <div className="space-y-0.5">{main.map(navLink)}</div>
          {more.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setMoreOpen(!showMore)}
                aria-expanded={showMore}
                className="flex w-full items-center gap-2.5 rounded-x-sm px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <MoreHorizontal size={16} />
                <span className="flex-1 text-right">بیشتر</span>
                {!showMore && moreCount > 0 && (
                  <span className="tnum rounded-full bg-white/15 px-1.5 text-xs font-bold text-white">
                    {toPersianDigits(moreCount)}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform",
                    showMore && "rotate-180",
                  )}
                />
              </button>
              {showMore && (
                <div className="mt-0.5 space-y-0.5">{more.map(navLink)}</div>
              )}
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name={me.name} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">
                {me.name}
              </div>
              <div className="truncate text-xs text-white/60">
                {ROLE_META[me.role].label}
              </div>
            </div>
          </div>
          {/* Demo stand-in for staff login: see the panel as each role. */}
          <label className="mt-2 block text-xs text-white/60">
            ورود به‌عنوان (دمو)
            <select
              value={me.id}
              onChange={(e) => {
                const next = staff.find((m) => m.id === e.target.value);
                signInAs(e.target.value);
                if (next) router.push(ROLE_HOME[next.role]);
              }}
              aria-label="ورود به‌عنوان"
              className="mt-1 h-8 w-full rounded-x-sm border border-white/15 bg-navy-900 px-2 text-xs text-white"
            >
              {staff
                .filter((m) => m.active && m.role !== "supervisor")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {ROLE_META[m.role].short}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="min-w-0 flex-1">
        {me.role === "auditor" && allowed && (
          <div className="bg-orange-500/10 px-6 py-2 text-xs text-orange-500">
            حسابرس: همه‌چیز فقط‌خواندنیه و دکمه‌های عملیاتی غیرفعال‌اند.
          </div>
        )}
        {allowed ? (
          children
        ) : (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
              <Lock size={20} className="text-text-500" />
            </div>
            <h1 className="mt-3 font-bold text-text-900">
              به این بخش دسترسی نداری
            </h1>
            <p className="mt-1 text-sm text-text-500">
              نقش تو «{ROLE_META[me.role].label}» است ({ROLE_META[me.role].desc}
              ). اگه لازمش داری، از مدیر کل بخواه.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              برگرد به «امروز»
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
