"use client";

import { useState } from "react";
import { Users, Hourglass, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Mentor } from "@/lib/mock-data";
import {
  leaveWaitlist,
  setCapacity,
  useMentorCapacity,
} from "@/lib/capacity-store";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

const MAX_CAPACITY = 40;

// The mentor decides how many students they can really carry, and can
// pause intake entirely; anyone who wants in meanwhile joins a waitlist.
export function CapacitySettings({ mentor }: { mentor: Mentor }) {
  const cap = useMentorCapacity(mentor);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [notified, setNotified] = useState("");

  function saveTotal(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(toLatinDigits(draft.trim()));
    if (!Number.isInteger(n) || n < cap.active || n > MAX_CAPACITY) {
      setError(
        `یه عدد بین ${toPersianDigits(cap.active)} (دانش‌آموزهای فعلی‌ات) و ${toPersianDigits(MAX_CAPACITY)} وارد کن.`,
      );
      return;
    }
    setCapacity(mentor.id, { capacityTotal: n, accepting: cap.accepting });
    setDraft("");
    setError("");
  }

  function notify(studentId: string, name: string) {
    leaveWaitlist(mentor.id, studentId);
    setNotified(`به ${name} خبر دادیم که ظرفیتت باز شده.`);
  }

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-text-900">ظرفیت و پذیرش</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="دانش‌آموز فعال" value={cap.active} />
          <Stat label="ظرفیت کل" value={cap.capacityTotal} />
          <Stat label="جای خالی" value={cap.remaining} highlight={cap.full} />
        </div>

        <form
          onSubmit={saveTotal}
          noValidate
          className="mt-4 flex items-center gap-2"
        >
          <label
            htmlFor="capacity-total"
            className="shrink-0 text-sm text-text-700"
          >
            ظرفیت کل:
          </label>
          <input
            id="capacity-total"
            inputMode="numeric"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError("");
            }}
            placeholder={toPersianDigits(cap.capacityTotal)}
            className="tnum h-9 w-20 rounded-x-md border border-border bg-surface px-3 text-center text-sm text-text-900 outline-none focus:border-blue-600"
          />
          <Button
            type="submit"
            size="md"
            variant="secondary"
            className="h-9"
            disabled={!draft.trim()}
          >
            ذخیره
          </Button>
        </form>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

        <label className="mt-4 flex items-center justify-between gap-3 rounded-x-md bg-surface-2 p-3">
          <span>
            <span className="block text-sm font-medium text-text-900">
              پذیرش دانش‌آموز جدید
            </span>
            <span className="block text-xs text-text-500">
              {cap.accepting
                ? "روشنه — تا وقتی جای خالی داری، دانش‌آموزها می‌تونن رزرو کنن."
                : "بسته‌ست — دانش‌آموزهای فعلی‌ات دست نمی‌خورن؛ بقیه فقط می‌تونن عضو لیست انتظار بشن."}
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="پذیرش دانش‌آموز جدید"
            checked={cap.accepting}
            onChange={(e) =>
              setCapacity(mentor.id, {
                capacityTotal: cap.capacityTotal,
                accepting: e.target.checked,
              })
            }
            className="h-5 w-5 shrink-0 accent-blue-600"
          />
        </label>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-900">
            <Hourglass size={14} className="text-blue-600" />
            لیست انتظار
            <span className="tnum text-xs font-normal text-text-500">
              ({toPersianDigits(cap.waitlist.length)} نفر)
            </span>
          </div>
          {cap.waitlist.length === 0 ? (
            <p className="text-xs text-text-500">کسی توی لیست انتظارت نیست.</p>
          ) : (
            <ol className="space-y-1.5">
              {cap.waitlist.map((w, i) => (
                <li
                  key={w.studentId}
                  className="flex items-center gap-2 rounded-x-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="tnum w-5 text-text-500">
                    {toPersianDigits(i + 1)}
                  </span>
                  <span className="flex-1 text-text-900">{w.name}</span>
                  <span className="text-xs text-text-500">{w.joinedAt}</span>
                  <button
                    type="button"
                    disabled={cap.full}
                    onClick={() => notify(w.studentId, w.name)}
                    title={cap.full ? "اول ظرفیت رو باز کن" : undefined}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-text-500 disabled:no-underline"
                  >
                    <BellRing size={12} /> ظرفیت باز شد، خبرش کن
                  </button>
                </li>
              ))}
            </ol>
          )}
          {notified && <p className="mt-2 text-xs text-mint-500">{notified}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-x-md bg-surface-2 p-2.5">
      <div
        className={cn(
          "tnum text-lg font-bold",
          highlight ? "text-orange-500" : "text-text-900",
        )}
      >
        {toPersianDigits(value)}
      </div>
      <div className="text-xs text-text-500">{label}</div>
    </div>
  );
}
