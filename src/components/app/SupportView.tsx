"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Eye, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { READ_ONLY_EVENT } from "@/lib/local-store";
import {
  VIEW_AS_MINUTES,
  answerViewAs,
  bootViewAsTab,
  clockOf,
  endViewAs,
  isLive,
  recordPage,
  useNowMs,
  useViewAsRequests,
  useViewAsTab,
} from "@/lib/viewas-store";
import { toPersianDigits } from "@/lib/utils";

/** Mounted once in the root layout: turns `?support-view=` tabs into support views. */
export function ViewAsBoot() {
  useEffect(() => bootViewAsTab(), []);
  return null;
}

/**
 * Wraps the student app. In a support view tab: red read-only bar, page
 * logging, auto-stop at 30 minutes, nothing shown once it's over. In the
 * user's own tab: the consent prompt and the «end it now» control.
 */
export function SupportViewFrame({ userId, children }: { userId: string; children: React.ReactNode }) {
  const session = useViewAsTab();
  const now = useNowMs();
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);
  const live = isLive(session, now);

  useEffect(() => {
    if (session && live) recordPage(session.id, pathname);
  }, [session, live, pathname]);

  useEffect(() => {
    if (session?.status === "active" && session.expiresAtMs && now >= session.expiresAtMs)
      endViewAs(session.id, "timeout");
  }, [session, now]);

  useEffect(() => {
    if (!session) return;
    let t: ReturnType<typeof setTimeout>;
    const onBlocked = () => {
      setBlocked(true);
      clearTimeout(t);
      t = setTimeout(() => setBlocked(false), 3000);
    };
    window.addEventListener(READ_ONLY_EVENT, onBlocked);
    return () => {
      window.removeEventListener(READ_ONLY_EVENT, onBlocked);
      clearTimeout(t);
    };
  }, [session]);

  if (session) {
    if (!live)
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <ShieldAlert size={28} className="text-text-500" />
          <h1 className="mt-3 font-bold text-text-900">مشاهده‌ی حساب تموم شد</h1>
          <p className="mt-1 max-w-sm text-sm text-text-500">
            دسترسی فقط‌خواندنی به حساب {session.userName} بسته شد. این تب رو ببند و در تیکت {session.ticketId} ادامه
            بده.
          </p>
        </div>
      );
    return (
      <>
        <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-2 bg-red-500 px-4 py-1.5 text-xs text-white">
          <Eye size={13} />
          حالت مشاهده‌ی پشتیبانی — {session.by} — فقط‌خواندنی، تا ساعت {clockOf(session.expiresAtMs!)} · تیکت{" "}
          {session.ticketId}
          <button
            type="button"
            onClick={() => endViewAs(session.id, "support")}
            className="rounded-x-pill bg-white/20 px-2.5 py-0.5 hover:bg-white/30"
          >
            پایان مشاهده
          </button>
        </div>
        {blocked && (
          <div className="fixed inset-x-0 top-8 z-50 mx-auto w-fit rounded-x-pill bg-navy-900 px-4 py-1.5 text-xs text-white">
            در حالت مشاهده هیچ تغییری ذخیره نمی‌شه.
          </div>
        )}
        <div className="pt-7">{children}</div>
      </>
    );
  }

  return (
    <>
      <ViewAsConsent userId={userId} />
      {children}
    </>
  );
}

function ViewAsConsent({ userId }: { userId: string }) {
  const requests = useViewAsRequests().filter((r) => r.userId === userId);
  const now = useNowMs();
  const pending = requests.find((r) => r.status === "pending");
  const active = requests.find((r) => r.status === "approved" || isLive(r, now));
  if (!pending && !active) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-[calc(100%-2rem)] max-w-lg rounded-x-lg border border-orange-500/40 bg-surface p-4 shadow-x-lg md:bottom-6">
      {pending ? (
        <>
          <div className="flex items-start gap-2">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-orange-500" />
            <div className="text-sm leading-[1.8] text-text-700">
              <span className="font-medium text-text-900">{pending.by}</span> برای بررسی تیکت {pending.ticketId} می‌خواد{" "}
              {toPersianDigits(VIEW_AS_MINUTES)} دقیقه حسابت رو <strong>فقط ببینه</strong> (بدون هیچ تغییری). گفتگوهات
              با مشاور نشون داده نمی‌شه و هر صفحه‌ای که ببینه ثبت می‌شه.
              <div className="mt-1 text-xs text-text-500">دلیل: «{pending.reason}»</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="md" onClick={() => answerViewAs(pending.id, true)}>
              اجازه می‌دم
            </Button>
            <Button size="md" variant="secondary" onClick={() => answerViewAs(pending.id, false)}>
              نه
            </Button>
          </div>
        </>
      ) : (
        active && (
          <div className="flex items-center gap-2 text-sm text-text-700">
            <Eye size={16} className="shrink-0 text-orange-500" />
            <span className="flex-1">
              {active.status === "approved"
                ? `به ${active.by} اجازه‌ی مشاهده دادی (هنوز شروع نکرده).`
                : `${active.by} الان حسابت رو می‌بینه — تا ساعت ${clockOf(active.expiresAtMs!)}.`}
            </span>
            <button
              type="button"
              onClick={() => endViewAs(active.id, "user")}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <X size={12} /> همین الان تمومش کن
            </button>
          </div>
        )
      )}
    </div>
  );
}

/** «دسترسی‌های پشتیبانی به حسابم» — for the support page. */
export function ViewAsHistory({ userId }: { userId: string }) {
  const requests = useViewAsRequests().filter((r) => r.userId === userId);
  if (requests.length === 0) return null;
  const label: Record<string, string> = {
    pending: "منتظر جواب تو",
    approved: "اجازه دادی",
    declined: "رد کردی",
    active: "در حال مشاهده",
    ended: "تموم شد",
  };
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-bold text-text-900">دسترسی پشتیبانی به حسابم</h2>
      <ul className="space-y-2 text-xs">
        {requests.map((r) => (
          <li key={r.id} className="rounded-x-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-900">
                {r.by} · تیکت {r.ticketId}
              </span>
              <span className="text-text-500">{label[r.status]}</span>
            </div>
            <div className="mt-1 text-text-500">
              درخواست: {r.requestedAt}
              {r.endedAt && ` · پایان: ${r.endedAt} (${r.endedBy})`}
            </div>
            {r.pages.length > 0 && <div className="mt-1 text-text-500">صفحه‌های دیده‌شده: {r.pages.join("، ")}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
