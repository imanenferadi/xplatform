"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Subject } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

type Row = { subject: Subject; correct: string; wrong: string; total: string };

const initialRows: Row[] = [
  { subject: "ریاضی", correct: "", wrong: "", total: "" },
  { subject: "فیزیک", correct: "", wrong: "", total: "" },
  { subject: "شیمی", correct: "", wrong: "", total: "" },
  { subject: "زیست", correct: "", wrong: "", total: "" },
];

// Standard Iranian konkur negative-marking formula: each wrong answer
// costs 1/3 of a correct one (4-choice questions).
function computePercentage(
  correct: number,
  wrong: number,
  total: number,
): number | null {
  if (!total || total <= 0) return null;
  const raw = correct - wrong / 3;
  return Math.max(0, (raw / total) * 100);
}

/** Konkur percentage with negative marking — lives on the «کارنامه» page. */
export function PercentCalculator() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  function updateRow(
    i: number,
    field: keyof Omit<Row, "subject">,
    value: string,
  ) {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
  }

  function reset() {
    setRows(initialRows);
  }

  const results = rows.map((r) => {
    const correct = Number(r.correct) || 0;
    const wrong = Number(r.wrong) || 0;
    const total = Number(r.total) || 0;
    return { ...r, percentage: computePercentage(correct, wrong, total) };
  });

  const validResults = results.filter((r) => r.percentage !== null);
  const average =
    validResults.length > 0
      ? validResults.reduce((sum, r) => sum + (r.percentage ?? 0), 0) /
        validResults.length
      : null;

  return (
    <section id="calculator" className="scroll-mt-20">
      <div className="mb-1 flex items-center gap-2">
        <Calculator size={18} className="text-blue-600" />
        <h2 className="text-lg font-bold text-text-900">
          ماشین‌حساب درصد آزمون
        </h2>
      </div>
      <p className="mb-5 text-sm text-text-500">
        تعداد درست، غلط و کل سؤال‌های هر درس رو بزن — درصد رو با فرمول نمره‌ی
        منفی (هر ۳ غلط، یک درست کم می‌کنه) حساب می‌کنیم.
      </p>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <Card key={row.subject}>
            <CardContent className="py-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-text-900">
                  {row.subject}
                </span>
                {results[i].percentage !== null && (
                  <span className="tnum text-lg font-extrabold text-blue-600">
                    {toPersianDigits(
                      Math.round((results[i].percentage as number) * 10) / 10,
                    )}
                    ٪
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumberField
                  label="درست"
                  value={row.correct}
                  onChange={(v) => updateRow(i, "correct", v)}
                />
                <NumberField
                  label="غلط"
                  value={row.wrong}
                  onChange={(v) => updateRow(i, "wrong", v)}
                />
                <NumberField
                  label="کل سؤال"
                  value={row.total}
                  onChange={(v) => updateRow(i, "total", v)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {average !== null && (
        <Card className="mt-4 border-blue-600/20 bg-blue-100">
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-900">
              میانگین دروس واردشده
            </span>
            <span className="tnum text-2xl font-extrabold text-text-900">
              {toPersianDigits(Math.round(average * 10) / 10)}٪
            </span>
          </CardContent>
        </Card>
      )}

      <Button variant="secondary" size="md" className="mt-4" onClick={reset}>
        <RotateCcw size={15} /> پاک کردن همه
      </Button>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-text-500">{label}</label>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tnum h-11 w-full rounded-x-sm border border-border bg-surface text-center text-sm text-text-900 outline-none focus:border-blue-600"
      />
    </div>
  );
}
