"use client";

import { useState } from "react";
import { Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Ticket } from "@/lib/mock-data";
import {
  VIEW_AS_MINUTES,
  clockOf,
  endViewAs,
  isLive,
  requestViewAs,
  startViewAs,
  useNowMs,
  useViewAsRequests,
} from "@/lib/viewas-store";
import { toPersianDigits } from "@/lib/utils";

// Only accounts with a student panel in this demo can be viewed.
const VIEWABLE: Record<string, string> = { "u-1": "me" };
const TECH_CATEGORIES = ["فنی", "حساب کاربری"];

/** Technical support: ask the user to let you see their account, read-only. */
export function ViewAsControl({ ticket: t }: { ticket: Ticket }) {
  const requests = useViewAsRequests().filter((r) => r.ticketId === t.id);
  const now = useNowMs();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const latest = requests[0];
  const userId = t.requester.userId ? VIEWABLE[t.requester.userId] : undefined;

  if (!TECH_CATEGORIES.includes(t.category)) return null;

  function ask() {
    if (!reason.trim())
      return setError(
        "دلیلش رو بنویس — به کاربر نشون داده می‌شه و در لاگ می‌مونه.",
      );
    requestViewAs(t.id, userId!, t.requester.name, reason.trim());
    setReason("");
    setError("");
  }

  function start() {
    const url = latest && startViewAs(latest.id);
    if (url) window.open(url, "_blank", "noopener");
  }

  return (
    <div className="rounded-x-md border border-border p-3 text-xs">
      <div className="mb-2 flex items-center gap-1.5 font-bold text-text-900">
        <Eye size={13} /> مشاهده‌ی حساب کاربر
      </div>
      {!userId ? (
        <p className="text-text-500">
          برای این کاربر در نسخه‌ی نمایشی پنلی وجود نداره.
        </p>
      ) : latest?.status === "pending" ? (
        <p className="text-orange-500">منتظر اجازه‌ی {t.requester.name}…</p>
      ) : latest?.status === "approved" ? (
        <div className="space-y-2">
          <p className="text-mint-500">{t.requester.name} اجازه داد.</p>
          <Button size="md" onClick={start}>
            <ExternalLink size={13} /> شروع مشاهده (
            {toPersianDigits(VIEW_AS_MINUTES)} دقیقه، فقط‌خواندنی)
          </Button>
        </div>
      ) : latest && isLive(latest, now) ? (
        <div className="space-y-2">
          <p className="text-text-700">
            در حال مشاهده تا ساعت {clockOf(latest.expiresAtMs!)}
          </p>
          <div className="flex gap-2">
            <Button
              size="md"
              variant="secondary"
              onClick={() =>
                window.open(
                  `/dashboard?support-view=${latest.id}`,
                  "_blank",
                  "noopener",
                )
              }
            >
              باز کردن تب
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => endViewAs(latest.id, "support")}
            >
              پایان
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {latest && (
            <p className="text-text-500">
              درخواست قبلی:{" "}
              {latest.status === "declined"
                ? "کاربر رد کرد"
                : `تموم شد (${latest.endedBy})`}
              {latest.pages.length > 0 &&
                ` · دیده شد: ${latest.pages.join("، ")}`}
            </p>
          )}
          <p className="text-text-500">
            فقط با اجازه‌ی کاربر، {toPersianDigits(VIEW_AS_MINUTES)} دقیقه و
            فقط‌خواندنی. گفتگو با مشاور دیده نمی‌شه.
          </p>
          <input
            value={reason}
            onChange={(e) => {
              setReason(e.target.value.slice(0, 120));
              setError("");
            }}
            placeholder="دلیل — مثلاً: تقویم برای کاربر خالی نمایش داده می‌شه"
            aria-label="دلیل مشاهده"
            className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button size="md" variant="secondary" onClick={ask}>
            درخواست اجازه از کاربر
          </Button>
        </div>
      )}
    </div>
  );
}
