"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Moon,
  Plus,
  Trash2,
  BarChart3,
  BedDouble,
  NotebookPen,
  ArrowRight,
  X,
} from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CHECKIN_SUBJECTS,
  CURRENT_DAY_NAME,
  DEMO_TODAY_ISO,
  MISTAKE_REASONS,
  mentors,
  moodLabels,
  type CheckInEntry,
  type MistakeReason,
  type NightlyCheckIn,
} from "@/lib/mock-data";
import { saveCheckIn, useMyCheckIns } from "@/lib/checkin-store";
import { useFocusMinutesByTask } from "@/lib/focus-log-store";
import {
  formatHours,
  markTasksDone,
  useDoneIds,
  useTodayTasks,
} from "@/lib/plan-store";
import { addMistake } from "@/lib/mistakes-store";
import { formatStudyTime, sleepMinutes } from "@/lib/checkins";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Mood = NightlyCheckIn["mood"];
type Row = {
  key: number;
  subject: string;
  topic: string;
  minutes: string;
  tests: string;
};
type PlanRow = { checked: boolean; minutes: string; tests: string };
type QuickMistake = {
  key: number;
  subject: string;
  reason: MistakeReason;
  topic: string;
};

const MAX_MINUTES = 600;
const MAX_TESTS = 500;
// A bed/wake pair outside this range is almost certainly a typo (AM/PM mix-up).
const MIN_SLEEP = 2 * 60;
const MAX_SLEEP = 14 * 60;
const REASONS = Object.keys(MISTAKE_REASONS) as MistakeReason[];
const STEPS = ["درس‌ها", "غلط‌ها", "خواب و حال"];

function emptyRow(key: number): Row {
  return { key, subject: "", topic: "", minutes: "", tests: "" };
}

function isBlank(r: Row) {
  return !r.subject && !r.topic.trim() && !r.minutes.trim() && !r.tests.trim();
}

/** The number, or an error message to show under the row. */
function parseMinutes(v: string): number | string {
  const n = Number(toLatinDigits(v.trim()));
  if (!Number.isInteger(n) || n < 1 || n > MAX_MINUTES)
    return `زمان مطالعه رو به دقیقه وارد کن (۱ تا ${toPersianDigits(MAX_MINUTES)}).`;
  return n;
}
function parseTests(v: string): number | string {
  const n = v.trim() ? Number(toLatinDigits(v.trim())) : 0;
  if (!Number.isInteger(n) || n < 0 || n > MAX_TESTS)
    return `تعداد تست باید عدد صحیح بین ۰ تا ${toPersianDigits(MAX_TESTS)} باشه.`;
  return n;
}

// Tonight's گزارش کار: one flow instead of three pages — what you studied
// (today's plan is pre-filled, so it's mostly ticks), today's mistakes
// straight into the notebook, then sleep and mood. About a minute.
export default function NightlyReportPage() {
  const mentor = mentors[0];
  const todayTasks = useTodayTasks();
  const doneIds = useDoneIds();
  const focusMinutes = useFocusMinutesByTask();
  const alreadyTonight = useMyCheckIns().some(
    (c) => c.week === "this" && c.dayName === CURRENT_DAY_NAME,
  );

  const [step, setStep] = useState(0);
  const nextKey = useRef(1);

  // Step 1
  const [planRows, setPlanRows] = useState<Record<string, PlanRow>>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Step 2
  const [mistakes, setMistakes] = useState<QuickMistake[]>([]);
  const [mSubject, setMSubject] = useState("");
  const [mReason, setMReason] = useState<MistakeReason | "">("");
  const [mTopic, setMTopic] = useState("");
  const [mError, setMError] = useState("");
  // Step 3
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodError, setMoodError] = useState(false);
  const [note, setNote] = useState("");
  const [bed, setBed] = useState("");
  const [wake, setWake] = useState("");
  const [sleepError, setSleepError] = useState("");
  const [result, setResult] = useState<{
    entries: number;
    minutes: number;
    mistakes: number;
    ticked: number;
  } | null>(null);
  // Parsed step-1 entries, kept for the final save.
  const [entries, setEntries] = useState<{
    list: CheckInEntry[];
    taskIds: string[];
  }>({ list: [], taskIds: [] });

  // A plan task starts ticked if the timer or the student already marked it done.
  const planRow = (id: string, hours: number): PlanRow =>
    planRows[id] ?? {
      checked: doneIds.has(id),
      minutes: toPersianDigits(focusMinutes.get(id) ?? hours * 60),
      tests: "",
    };

  function setPlan(id: string, hours: number, patch: Partial<PlanRow>) {
    setPlanRows((p) => ({ ...p, [id]: { ...planRow(id, hours), ...patch } }));
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setErrors((e) => ({ ...e, [`r${key}`]: "" }));
  }

  function nextFromStudy() {
    const errs: Record<string, string> = {};
    const list: CheckInEntry[] = [];
    const taskIds: string[] = [];

    for (const t of todayTasks) {
      const r = planRow(t.id, t.hours);
      if (!r.checked) continue;
      const minutes = parseMinutes(r.minutes);
      const tests = parseTests(r.tests);
      if (typeof minutes === "string") errs[t.id] = minutes;
      else if (typeof tests === "string") errs[t.id] = tests;
      else {
        list.push({ subject: t.subject, topic: t.topic, minutes, tests });
        taskIds.push(t.id);
      }
    }
    for (const r of rows) {
      if (isBlank(r)) continue;
      const minutes = parseMinutes(r.minutes);
      const tests = parseTests(r.tests);
      if (!r.subject) errs[`r${r.key}`] = "درس رو انتخاب کن.";
      else if (typeof minutes === "string") errs[`r${r.key}`] = minutes;
      else if (typeof tests === "string") errs[`r${r.key}`] = tests;
      else
        list.push({
          subject: r.subject,
          topic: r.topic.trim(),
          minutes,
          tests,
        });
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setEntries({ list, taskIds });
    if (!mSubject && list[0]) setMSubject(list[0].subject);
    setStep(1);
  }

  function addQuickMistake() {
    if (!mSubject) return setMError("درس رو انتخاب کن.");
    if (!mReason) return setMError("دلیلش رو انتخاب کن — اصل دفترچه همینه.");
    setMistakes((m) => [
      ...m,
      {
        key: nextKey.current++,
        subject: mSubject,
        reason: mReason,
        topic: mTopic.trim(),
      },
    ]);
    setMReason("");
    setMTopic("");
    setMError("");
  }

  function submit() {
    let sleepErr = "";
    if (Boolean(bed) !== Boolean(wake))
      sleepErr = "هم ساعت خواب رو بزن هم ساعت بیداری (یا هیچ‌کدوم).";
    else if (bed && wake) {
      const slept = sleepMinutes({ bed, wake });
      if (slept < MIN_SLEEP || slept > MAX_SLEEP)
        sleepErr = `با این ساعت‌ها می‌شه ${formatStudyTime(slept)} خواب — یه بار دیگه چکش کن.`;
    }
    setMoodError(!mood);
    setSleepError(sleepErr);
    if (!mood || sleepErr) return;

    saveCheckIn({
      id: `me-${CURRENT_DAY_NAME}`,
      date: "امشب",
      week: "this",
      dayName: CURRENT_DAY_NAME,
      studentId: "me",
      entries: entries.list,
      mood,
      note: note.trim(),
      mentorSeen: false,
      ...(bed && wake ? { sleep: { bed, wake } } : {}),
    });
    const newlyTicked = entries.taskIds.filter((id) => !doneIds.has(id));
    markTasksDone(entries.taskIds);
    mistakes.forEach((m, i) =>
      addMistake({
        id: `mm-${Date.now()}-${i}`,
        studentId: "me",
        subject: m.subject,
        topic: m.topic,
        source: "تمرین امروز",
        reason: m.reason,
        fix: "",
        date: "امروز",
        resolved: false,
        createdIso: DEMO_TODAY_ISO,
      }),
    );
    setResult({
      entries: entries.list.length,
      minutes: entries.list.reduce((s, e) => s + e.minutes, 0),
      mistakes: mistakes.length,
      ticked: newlyTicked.length,
    });
  }

  if (result) {
    return (
      <StudentShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
            <Check size={28} className="text-mint-500" />
          </div>
          <h1 className="text-xl font-bold text-text-900">
            گزارش کار امشب ثبت شد
          </h1>
          <ul className="mt-3 space-y-1 text-sm text-text-700">
            <li>
              {result.entries > 0
                ? `${toPersianDigits(result.entries)} درس، ${formatStudyTime(result.minutes)}`
                : "امروز درسی ثبت نکردی"}
            </li>
            {result.ticked > 0 && (
              <li>
                {toPersianDigits(result.ticked)} کار برنامه‌ی امروز تیک خورد
              </li>
            )}
            {result.mistakes > 0 && (
              <li>{toPersianDigits(result.mistakes)} غلط به دفترچه اضافه شد</li>
            )}
          </ul>
          <p className="mt-3 max-w-xs text-sm text-text-500">
            {mentor.name} امشب می‌بینه. شب بخیر.
          </p>
          <div className="mt-8 flex gap-2">
            <Link
              href="/dashboard/weekly"
              className={buttonVariants({ size: "lg" })}
            >
              <BarChart3 size={16} /> جمع هفته
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
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
          <h1 className="text-xl font-bold text-text-900">گزارش کار امشب</h1>
        </div>
        <p className="mb-4 text-sm text-text-500">
          سه قدم کوتاه — مستقیم می‌ره برای {mentor.name} و توی جمع هفته حساب
          می‌شه.
        </p>

        <div className="mb-5 flex gap-1.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-x-pill",
                  i <= step ? "bg-blue-600" : "bg-surface-2",
                )}
              />
              <div
                className={cn(
                  "mt-1 text-xs",
                  i === step ? "font-bold text-text-900" : "text-text-500",
                )}
              >
                {toPersianDigits(i + 1)}. {label}
              </div>
            </div>
          ))}
        </div>

        {alreadyTonight && step === 0 && (
          <div className="mb-4 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-text-700">
            گزارش کار امشب رو قبلاً فرستادی — ثبت دوباره، جایگزین قبلی می‌شه.
          </div>
        )}

        {step === 0 && (
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-bold text-text-900">
                امروز چی خوندی؟
              </h2>

              {todayTasks.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="text-xs text-text-500">
                    از برنامه‌ی امروز — هر کدوم رو خوندی تیک بزن:
                  </div>
                  {todayTasks.map((t) => {
                    const r = planRow(t.id, t.hours);
                    return (
                      <div
                        key={t.id}
                        className={cn(
                          "rounded-x-md border p-3 transition-colors",
                          r.checked
                            ? "border-mint-500/40 bg-mint-500/5"
                            : "border-border bg-surface-2",
                        )}
                      >
                        <label className="flex cursor-pointer items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={r.checked}
                            onChange={(e) =>
                              setPlan(t.id, t.hours, {
                                checked: e.target.checked,
                              })
                            }
                            className="h-4 w-4 accent-[var(--x-mint-500)]"
                          />
                          <span className="text-sm font-medium text-text-900">
                            {t.subject}
                          </span>
                          <span className="text-xs text-text-500">
                            {t.topic && `${t.topic} · `}برنامه:{" "}
                            {formatHours(t.hours)} ساعت
                            {focusMinutes.get(t.id)
                              ? ` · تایمر: ${toPersianDigits(focusMinutes.get(t.id)!)} دقیقه`
                              : ""}
                          </span>
                        </label>
                        {r.checked && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <NumberField
                              label="دقیقه"
                              value={r.minutes}
                              onChange={(v) =>
                                setPlan(t.id, t.hours, { minutes: v })
                              }
                            />
                            <NumberField
                              label="تست"
                              value={r.tests}
                              onChange={(v) =>
                                setPlan(t.id, t.hours, { tests: v })
                              }
                            />
                          </div>
                        )}
                        {errors[t.id] && (
                          <p className="mt-2 text-xs text-red-500">
                            {errors[t.id]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {rows.length > 0 && (
                <div className="mb-2 text-xs text-text-500">
                  خارج از برنامه:
                </div>
              )}
              <div className="space-y-3">
                {rows.map((r) => (
                  <div
                    key={r.key}
                    className="rounded-x-md border border-border bg-surface-2 p-3"
                  >
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setRows((rs) => rs.filter((x) => x.key !== r.key))
                        }
                        className="text-text-500 hover:text-red-500"
                        aria-label="حذف درس"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.4fr]">
                      <select
                        value={r.subject}
                        onChange={(e) =>
                          updateRow(r.key, { subject: e.target.value })
                        }
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
                        onChange={(e) =>
                          updateRow(r.key, { topic: e.target.value })
                        }
                        placeholder="مبحث"
                        aria-label="مبحث"
                        className="h-10 rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                      />
                      <NumberField
                        label="دقیقه"
                        value={r.minutes}
                        onChange={(v) => updateRow(r.key, { minutes: v })}
                      />
                      <NumberField
                        label="تست"
                        value={r.tests}
                        onChange={(v) => updateRow(r.key, { tests: v })}
                      />
                    </div>
                    {errors[`r${r.key}`] && (
                      <p className="mt-2 text-xs text-red-500">
                        {errors[`r${r.key}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setRows((rs) => [...rs, emptyRow(nextKey.current++)])
                }
                className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Plus size={15} /> درس خارج از برنامه
              </button>

              <Button size="lg" className="mt-5 w-full" onClick={nextFromStudy}>
                بعدی: غلط‌های امروز
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent>
              <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-text-900">
                <NotebookPen size={15} className="text-blue-600" /> امروز کجا
                غلط زدی؟
                <span className="font-normal text-text-500">(اختیاری)</span>
              </h2>
              <p className="mb-3 text-xs text-text-500">
                درس و دلیلش کافیه — مستقیم می‌ره توی دفترچه‌ی غلط‌ها. جزئیات
                بیشتر رو بعداً همون‌جا اضافه کن.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={mSubject}
                  onChange={(e) => {
                    setMSubject(e.target.value);
                    setMError("");
                  }}
                  aria-label="درس غلط"
                  className="h-10 rounded-x-sm border border-border bg-surface px-2 text-sm text-text-900 outline-none focus:border-blue-600"
                >
                  <option value="">درس</option>
                  {CHECKIN_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={mTopic}
                  onChange={(e) => setMTopic(e.target.value.slice(0, 60))}
                  placeholder="مبحث (اختیاری)"
                  aria-label="مبحث غلط"
                  className="h-10 rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setMReason(r);
                      setMError("");
                    }}
                    title={MISTAKE_REASONS[r].hint}
                    className={cn(
                      "rounded-x-pill border px-3 py-1.5 text-xs transition-colors",
                      mReason === r
                        ? "border-blue-600 bg-blue-100 font-medium text-text-900"
                        : "border-border bg-surface text-text-700 hover:border-blue-300",
                    )}
                  >
                    {MISTAKE_REASONS[r].label}
                  </button>
                ))}
              </div>
              {mError && <p className="mt-2 text-xs text-red-500">{mError}</p>}
              <Button
                size="md"
                variant="secondary"
                className="mt-3"
                onClick={addQuickMistake}
              >
                <Plus size={14} /> افزودن غلط
              </Button>

              {mistakes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mistakes.map((m) => (
                    <span
                      key={m.key}
                      className="flex items-center gap-1 rounded-x-pill bg-surface-2 px-3 py-1 text-xs text-text-700"
                    >
                      {m.subject}
                      {m.topic && ` (${m.topic})`} —{" "}
                      {MISTAKE_REASONS[m.reason].label}
                      <button
                        type="button"
                        onClick={() =>
                          setMistakes((ms) => ms.filter((x) => x.key !== m.key))
                        }
                        aria-label="حذف"
                        className="text-text-500 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setStep(0)}
                  aria-label="قدم قبل"
                >
                  <ArrowRight size={16} />
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(2)}>
                  {mistakes.length > 0
                    ? `بعدی (${toPersianDigits(mistakes.length)} غلط)`
                    : "امروز غلطی ثبت نمی‌کنم، بعدی"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent>
              <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-text-900">
                <BedDouble size={15} className="text-blue-600" /> خواب
                <span className="font-normal text-text-500">(اختیاری)</span>
              </h2>
              <p className="mb-3 text-xs text-text-500">
                ساعت خواب ثابت، مخصوصاً بیدار شدن صبح زود، روی تمرکز و روز کنکور
                اثر مستقیم داره.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <TimeField
                  label="دیشب کی خوابیدی؟"
                  value={bed}
                  onChange={(v) => {
                    setBed(v);
                    setSleepError("");
                  }}
                />
                <TimeField
                  label="امروز کی بیدار شدی؟"
                  value={wake}
                  onChange={(v) => {
                    setWake(v);
                    setSleepError("");
                  }}
                />
              </div>
              {bed && wake && !sleepError && (
                <p className="mt-2 text-xs text-text-500">
                  یعنی حدود {formatStudyTime(sleepMinutes({ bed, wake }))} خواب
                </p>
              )}
              {sleepError && (
                <p className="mt-2 text-xs text-red-500">{sleepError}</p>
              )}

              <h2 className="mb-3 mt-5 text-sm font-bold text-text-900">
                امروز حالت چطور بود؟
              </h2>
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
                        : "border-border bg-surface text-text-700 hover:border-blue-300",
                    )}
                  >
                    {moodLabels[m]}
                  </button>
                ))}
              </div>
              {moodError && (
                <p className="mt-2 text-xs text-red-500">
                  حال‌وهوای امروز رو انتخاب کن.
                </p>
              )}

              <h2 className="mb-2 mt-5 text-sm font-bold text-text-900">
                یه خط برای مشاورت{" "}
                <span className="font-normal text-text-500">(اختیاری)</span>
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="مثلاً: شیمی امروز خیلی سخت بود، گیر کردم رو تعادل شیمیایی..."
                className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
              />

              <div className="mt-5 flex gap-2">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  aria-label="قدم قبل"
                >
                  <ArrowRight size={16} />
                </Button>
                <Button size="lg" className="flex-1" onClick={submit}>
                  ثبت گزارش کار امشب
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentShell>
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
    <label className="flex h-10 items-center gap-2 rounded-x-sm border border-border bg-surface px-3 focus-within:border-blue-600">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="۰"
        aria-label={label}
        className="tnum w-full min-w-0 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
      />
      <span className="shrink-0 text-xs text-text-500">{label}</span>
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-text-700">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="tnum h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none focus:border-blue-600"
      />
    </label>
  );
}
