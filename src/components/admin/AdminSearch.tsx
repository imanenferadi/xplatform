"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import {
  adminUsers,
  mentorApplications,
  mentors,
  transactions,
} from "@/lib/mock-data";
import { useTickets } from "@/lib/ticket-store";
import { useStoredApplications } from "@/lib/mentor-applications-store";
import { useDiscountCodes } from "@/lib/discount-store";
import { useLogs } from "@/lib/admin-log-store";
import { PAGE_PERM, can, seesLogCategory, seesTicket } from "@/lib/permissions";
import { useMe } from "@/lib/staff-store";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Hit = {
  group: string;
  title: string;
  sub: string;
  href: string;
  haystack: string;
};

/** Arabic/Persian letter variants, digits and spacing all compare equal. */
export function normalize(s: string): string {
  return toLatinDigits(s)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\s‌‌-]/g, "")
    .toLowerCase();
}

const PER_GROUP = 5;
const q = (v: string) => encodeURIComponent(v);

// Ctrl/⌘+K from any admin page: people, mentors, tickets, payments, codes
// and log events in one box. Opens the item's page, pre-filtered where the
// page understands ?q= (or ?t= for a ticket).
export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const stored = useStoredApplications();
  const codes = useDiscountCodes();
  const me = useMe();
  const tickets_ = useTickets();
  const logs_ = useLogs();
  // Search only what this role may open.
  const logs = useMemo(
    () => logs_.filter((l) => seesLogCategory(me.role, l.category)),
    [logs_, me],
  );
  const tickets = useMemo(
    () => tickets_.filter((t) => seesTicket(me.role, t)),
    [tickets_, me],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const index = useMemo<Hit[]>(() => {
    const userNames = new Set(adminUsers.map((u) => u.name));
    return [
      ...adminUsers.map((u) => ({
        group: u.role === "مشاور" ? "مشاورها" : "کاربران",
        title: u.name,
        sub: `${u.role} · ${u.phone} · ${u.city}`,
        href: `/admin/users?q=${q(u.name)}`,
        haystack: `${u.name} ${u.phone} ${u.id} ${u.city}`,
      })),
      ...mentors
        .filter((m) => !userNames.has(m.name))
        .map((m) => ({
          group: "مشاورها",
          title: m.name,
          sub: `${m.rank} · ${m.major}`,
          href: "/admin/quality",
          haystack: `${m.name} ${m.id} ${m.major}`,
        })),
      ...[
        ...mentorApplications.map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
        })),
        ...stored.map((a) => ({
          id: a.id,
          name: a.mentor.name,
          status: a.status,
        })),
      ].map((a) => ({
        group: "درخواست همکاری",
        title: a.name,
        sub:
          a.status === "pending"
            ? "در انتظار بررسی"
            : a.status === "approved"
              ? "تأییدشده"
              : "ردشده",
        href: `/admin/mentors?q=${q(a.name)}`,
        haystack: `${a.name} ${a.id}`,
      })),
      ...tickets.map((t) => ({
        group: "تیکت‌ها",
        title: `${t.id} — ${t.subject}`,
        sub: `${t.requester.name} · ${t.category}`,
        href: `/admin/tickets?t=${q(t.id)}`,
        haystack: `${t.id} ${t.subject} ${t.requester.name} ${t.category}`,
      })),
      ...transactions.map((t) => ({
        group: "تراکنش‌ها",
        title: `${t.studentName} — ${t.planName}`,
        sub: `${toPersianDigits(t.amount.toLocaleString("en-US"))} تومان · ${t.code} · ${t.date}`,
        href: `/admin/payments?q=${q(t.studentName)}`,
        haystack: `${t.studentName} ${t.code} ${t.gatewayRef} ${t.planName}`,
      })),
      ...codes.map((c) => ({
        group: "کد تخفیف",
        title: c.code,
        sub:
          c.kind === "percent"
            ? `${toPersianDigits(c.value)}٪`
            : `${toPersianDigits(c.value.toLocaleString("en-US"))} تومان`,
        href: "/admin/discounts",
        haystack: c.code,
      })),
      ...logs.map((l) => ({
        group: "لاگ‌ها",
        title: `${l.action} — ${l.target}`,
        sub: `${l.actor} · ${l.date} ${l.time}`,
        href: `/admin/logs?q=${q(l.target)}`,
        haystack: `${l.action} ${l.target} ${l.actor}`,
      })),
    ]
      .filter((h) => {
        const perm = PAGE_PERM[h.href.split("?")[0]];
        return perm !== undefined && can(me.role, perm);
      })
      .map((h) => ({ ...h, haystack: normalize(h.haystack) }));
  }, [tickets, stored, codes, logs, me]);

  const results = useMemo(() => {
    const needle = normalize(text);
    if (!needle) return [];
    const byGroup = new Map<string, Hit[]>();
    for (const h of index) {
      if (!h.haystack.includes(needle)) continue;
      const list = byGroup.get(h.group) ?? [];
      if (list.length < PER_GROUP) byGroup.set(h.group, [...list, h]);
    }
    return [...byGroup.values()].flat();
  }, [index, text]);

  function go(h: Hit) {
    setOpen(false);
    setText("");
    router.push(h.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-2 mb-3 flex items-center gap-2 rounded-x-sm border border-white/15 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
      >
        <Search size={14} />
        <span className="flex-1 text-right">جستجو</span>
        <kbd dir="ltr" className="rounded bg-white/10 px-1.5 font-sans text-xs">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="جستجوی سراسری"
            className="w-full max-w-xl overflow-hidden rounded-x-lg bg-surface shadow-x-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search size={16} className="text-text-500" />
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="اسم، شماره، کد تیکت، کد تخفیف، کد پیگیری…"
                aria-label="جستجو"
                className="h-12 flex-1 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!text.trim() ? (
                <p className="p-4 text-center text-xs text-text-500">
                  ↑↓ برای جابه‌جایی، Enter برای باز کردن، Esc برای بستن
                </p>
              ) : results.length === 0 ? (
                <p className="p-4 text-center text-sm text-text-500">
                  چیزی پیدا نشد.
                </p>
              ) : (
                results.map((h, i) => (
                  <div key={`${h.group}-${h.href}-${h.title}`}>
                    {(i === 0 || results[i - 1].group !== h.group) && (
                      <div className="px-3 pb-1 pt-2 text-xs font-medium text-text-500">
                        {h.group}
                      </div>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(h)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-x-sm px-3 py-2 text-right",
                        i === active ? "bg-blue-100" : "hover:bg-surface-2",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-text-900">
                          {h.title}
                        </span>
                        <span className="block truncate text-xs text-text-500">
                          {h.sub}
                        </span>
                      </span>
                      {i === active && (
                        <CornerDownLeft
                          size={14}
                          className="shrink-0 text-text-500"
                        />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
