"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle, CalendarDays, Wallet, User, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { CapacityNote } from "@/components/app/MentorAvailability";
import { mentors } from "@/lib/mock-data";

const links = [
  { href: "/mentor", label: "داشبورد", icon: LayoutDashboard },
  { href: "/mentor/messages", label: "گفتگوها", icon: MessageCircle },
  { href: "/mentor/library", label: "کتابخونه", icon: Library },
  { href: "/mentor/calendar", label: "تقویم", icon: CalendarDays },
  { href: "/mentor/earnings", label: "درآمد", icon: Wallet },
  { href: "/mentor/profile", label: "پروفایل من", icon: User },
];

export function MentorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-l border-border bg-navy-900 md:flex">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-bold text-white">X · مشاور</span>
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
            <Avatar name="سارا" size="sm" />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">سارا محمدی</div>
              <div className="truncate text-[11px] text-white/50">
                <CapacityNote mentor={mentors[0]} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-navy-900 px-4 py-3 md:hidden">
        <span className="text-sm font-bold text-white">X · مشاور</span>
        <Avatar name="سارا" size="sm" />
      </div>

      <main className="min-w-0 flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
