"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Moon, Plus, Trash2, BarChart3 } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CHECKIN_SUBJECTS,
  CURRENT_DAY_NAME,
  studentPlan,
  moodLabels,
  type CheckInEntry,
  type NightlyCheckIn,
} from "@/lib/mock-data";
import { saveCheckIn, useMyCheckIns } from "@/lib/checkin-store";
import { useFocusMinutesByTask } from "@/lib/focus-log-store";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Mood = NightlyCheckIn["mood"];
type Row = { key: number; subject: string; topic: string; minutes: string; tests: string };

const MAX_MINUTES = 600;
const MAX_TESTS = 500;

function emptyRow(key: number): Row {
  return { key, subject: "", topic: "", minutes: "", tests: "" };
}

function isBlank(r: Row) {
  return !r.subject && !r.topic.trim() && !r.minutes.trim() && !r.tests.trim();
}

export default function NightlyCheckInPage() {
  const nextKey = useRef(1);
  const [rows, setRows] = useState<Row[]>(() => [emptyRow(0)]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodError, setMoodError] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const alreadyTonight = useMyCheckIns().some((c) => c.week === "this" && c.dayName === CURRENT_DAY_NAME);
  const focusMinutes = useFocusMinutesByTask();
  const planChips = studentPlan.todayTasks.filter((t) => !rows.some((r) => r.topic === t.topic));

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setRowErrors((e) => ({ ...e, [key]: "" }));
  }

  function addRow(prefill?: Partial<Row>) {
    const key = nextKey.current++;
    setRows((rs) => {
      const row = { ...emptyRow(key), ...prefill };
      // Fill the untouched starter row instead of stacking a new one under it.
      if (prefill && rs.length === 1 && isBlank(rs[0])) return [{ ...row, key: rs[0].key }];
      return [...rs, row];
    });
  }

  function removeRow(key: number) {
    setRows((rs) => (rs.length === 1 ? [emptyRow(rs[0].key)] : rs.filter((r) => r.key !== key)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<number, string> = {};
    const entries: CheckInEntry[] = [];

    for (const r of rows) {
      if (isBlank(r)) continue;
      const minutes = Number(toLatinDigits(r.minutes.trim()));
      const tests = r.tests.trim() ? Number(toLatinDigits(r.tests.trim())) : 0;
      if (!r.subject) errors[r.key] = "درس رو انتخاب کن.";
      else if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MINUTES)
        errors[r.key] = `زمان مطالعه رو به دقیقه وارد کن (۱ تا ${toPersianDigits(MAX_MINUTES)}).`;
      else if (!Number.isInteger(tests) || tests < 0 || tests > MAX_TESTS)
        errors[r.key] = `تعداد تست باید عدد صحیح بین ۰ تا ${toPersianDigits(MAX_TESTS)} باشه.`;
      else entries.push({ subject: r.subject, topic: r.topic.trim(), minutes, tests });
    }

    setRowErrors(errors);
    setMoodError(!mood);
    if (Object.keys(errors).length > 0 || !mood) return;

    saveCheckIn({
      id: `me-${CURRENT_DAY_NAME}`,
      date: "امشب",
      week: "this",
      dayName: CURRENT_DAY_NAME,
      studentId: "me",
      entries,
      mood,
      note: note.trim(),
      mentorSeen: false,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <StudentShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
            <Check size={28} className="text-mint-500" />
          </div>
          <h1 className="text-xl font-bold text-text-900">چک‌این امشب ثبت شد</h1>
          <p className="mt-2 max-w-xs text-sm text-text-500">
            سارا محمدی امشب گزارشت رو می‌بینه و توی جمع هفته هم حساب شد. شب بخیر.
          </p>
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/weekly" className={buttonVariants({ size: "lg" })}>
              <BarChart3 size={16} /> جمع این هفته
            </Link>
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              داشبورد
            </Link>
          </div>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <Moon size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">چک‌این امشب</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          هر درسی که امروز خوندی رو با مبحث، زمان و تعداد تستش بنویس — مستقیم می‌ره برای مشاورت و آخر هفته جمع زده
          می‌شه.
        </p>

        {alreadyTonight && (
          <div className="mb-4 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-text-700">
            چک‌این امشب رو قبلاً زدی — ثبت دوباره، جایگزین قبلی می‌شه.
          </div>
        )}

        <form onSubmit={submit} className="space-y-5" noValidate>
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">امروز چی خوندی؟</h2>

              {planChips.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-text-500">از برنامه‌ی امروز:</span>
                  {planChips.map((t) => {
                    const logged = focusMinutes.get(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          addRow({ subject: t.subject, topic: t.topic, minutes: logged ? String(logged) : "" })
                        }
                        className="flex items-center gap-1 rounded-x-pill border border-border bg-surface px-3 py-1 text-xs text-text-700 hover:border-blue-300"
                      >
                        <Plus size={12} /> {t.subject} — {t.topic}
                        {logged ? <span className="text-mint-500"> ({toPersianDigits(logged)} دقیقه با تایمر)</span> : null}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {rows.map((r, i) => (
                  <div key={r.key} className="rounded-x-md border border-border bg-surface-2 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-text-500">درس {toPersianDigits(i + 1)}</span>
                      <button
                        type="button"
                        onClick={() => removeRow(r.key)}
                        className="text-text-500 hover:text-red-500"
                        aria-label={`حذف درس ${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.4fr]">
                      <select
                        value={r.subject}
                        onChange={(e) => update(r.key, { subject: e.target.value })}
                        aria-label="درس"
                        className="h-10 rounded-x-sm border border-border bg-surface px-2 text-sm text-text-900 outline-none focus:border-blue-600"
                      >
                        <option value="">انتخاب درس</option>
                        {CHECKIN_SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <input
                        value={r.topic}
                        onChange={(e) => update(r.key, { topic: e.target.value })}
                        placeholder="مبحث — مثلاً تعادل شیمیایی"
                        aria-label="مبحث"
                        className="h-10 rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                      />
                      <NumberField
                        label="دقیقه"
                        value={r.minutes}
                        onChange={(v) => update(r.key, { minutes: v })}
                      />
                      <NumberField label="تست" value={r.tests} onChange={(v) => update(r.key, { tests: v })} />
                    </div>
                    {rowErrors[r.key] && <p className="mt-2 text-xs text-red-500">{rowErrors[r.key]}</p>}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addRow()}
                className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Plus size={15} /> درس دیگه
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">امروز حالت چطور بود؟</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(moodLabels) as Mood[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMood(m);
                      setMoodError(false);
                    }}
                    className={cn(
                      "rounded-x-md border-2 px-3 py-3 text-sm font-medium transition-colors",
                      mood === m
                        ? "border-blue-600 bg-blue-100 text-text-900"
                        : "border-border bg-surface text-text-700 hover:border-blue-300"
                    )}
                  >
                    {moodLabels[m]}
                  </button>
                ))}
              </div>
              {moodError && <p className="mt-2 text-xs text-red-500">حال‌وهوای امروز رو انتخاب کن.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">
                یه خط برای مشاورت بنویس <span className="font-normal text-text-500">(اختیاری)</span>
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="مثلاً: شیمی امروز خیلی سخت بود، گیر کردم رو تعادل شیمیایی..."
                className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full">
            ثبت چک‌این امشب
          </Button>
        </form>
      </div>
    </StudentShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-x-sm border border-border bg-surface px-3 focus-within:border-blue-600">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="۰"
        className="tnum w-full min-w-0 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
      />
      <span className="shrink-0 text-xs text-text-500">{label}</span>
    </label>
  );
}
