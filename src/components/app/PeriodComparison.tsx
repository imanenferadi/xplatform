"use client";

import { useState } from "react";
import type { WeeklyHistoryPoint } from "@/lib/mock-data";
import { toPersianDigits, cn } from "@/lib/utils";

/**
 * Lets the mentor pick ANY two weeks from history and compare them —
 * not just a fixed rolling window like TrendChart. This is what the real
 * product's "گزارش‌دهی ۳۶۰ درجه" page does: مشاور خودش دو بازه رو انتخاب
 * می‌کنه (مثلاً «قبل و بعد از شروع همکاری»), نه فقط ۳ هفته‌ی ثابت.
 */
export function PeriodComparison({
  history,
}: {
  history: WeeklyHistoryPoint[];
}) {
  const [pastIdx, setPastIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(history.length - 1);

  const past = history[pastIdx];
  const current = history[currentIdx];

  const rows = [
    {
      label: "میانگین ساعت مطالعه‌ی هفتگی",
      past: past.studyHours,
      current: current.studyHours,
      unit: "ساعت",
      higherIsBetter: true,
    },
    {
      label: "درصد اجرای برنامه",
      past: past.planCompletionPercent,
      current: current.planCompletionPercent,
      unit: "٪",
      higherIsBetter: true,
    },
  ];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-text-500">
            بازه‌ی گذشته
          </label>
          <select
            value={pastIdx}
            onChange={(e) => setPastIdx(Number(e.target.value))}
            className="h-10 w-full rounded-x-sm border border-border bg-surface px-2 text-sm text-text-900 outline-none focus:border-blue-600"
          >
            {history.map((w, i) => (
              <option key={w.weekLabel} value={i} disabled={i === currentIdx}>
                هفته‌ی {w.weekLabel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-500">
            بازه‌ی فعلی
          </label>
          <select
            value={currentIdx}
            onChange={(e) => setCurrentIdx(Number(e.target.value))}
            className="h-10 w-full rounded-x-sm border border-border bg-surface px-2 text-sm text-text-900 outline-none focus:border-blue-600"
          >
            {history.map((w, i) => (
              <option key={w.weekLabel} value={i} disabled={i === pastIdx}>
                هفته‌ی {w.weekLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-500">
              <th className="py-2 text-right font-medium">شاخص عملکرد</th>
              <th className="py-2 text-center font-medium">گذشته</th>
              <th className="py-2 text-center font-medium">فعلی</th>
              <th className="py-2 text-center font-medium">تغییر</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const delta = r.current - r.past;
              const improved = r.higherIsBetter ? delta > 0 : delta < 0;
              const unchanged = delta === 0;
              return (
                <tr
                  key={r.label}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-2.5 text-text-900">{r.label}</td>
                  <td className="tnum py-2.5 text-center text-text-500">
                    {toPersianDigits(r.past)}
                    {r.unit === "٪" ? "٪" : ` ${r.unit}`}
                  </td>
                  <td className="tnum py-2.5 text-center font-medium text-text-900">
                    {toPersianDigits(r.current)}
                    {r.unit === "٪" ? "٪" : ` ${r.unit}`}
                  </td>
                  <td className="py-2.5 text-center">
                    <span
                      className={cn(
                        "tnum rounded-x-pill px-2 py-0.5 text-xs font-medium",
                        unchanged
                          ? "bg-surface-2 text-text-500"
                          : improved
                            ? "bg-mint-500/15 text-mint-500"
                            : "bg-orange-500/15 text-orange-500",
                      )}
                    >
                      {/* Signed number LTR so the sign stays in front; a word unit
                          stays outside, in the RTL flow. */}
                      <span dir="ltr">
                        {delta > 0 ? "+" : ""}
                        {toPersianDigits(delta)}
                        {r.unit === "٪" ? "٪" : ""}
                      </span>
                      {r.unit !== "٪" && ` ${r.unit}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
