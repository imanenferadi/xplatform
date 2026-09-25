"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Play, Pause, SkipForward, Flag, Calculator, NotebookPen, AlertTriangle } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { CHECKIN_SUBJECTS } from "@/lib/mock-data";
import { formatClock, useCountdown } from "@/lib/use-countdown";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Section = { name: string; questions: number; minutes: number };

// سنجش's 1405 announcement for گروه تجربی: 155 questions in 180 minutes,
// in three specialized booklets (ana.ir/fa/news/1076547).
const KONKUR_TAJROBI: Section[] = [
  { name: "زیست‌شناسی", questions: 45, minutes: 45 },
  { name: "فیزیک و شیمی", questions: 65, minutes: 75 },
  { name: "ریاضی و زمین‌شناسی", questions: 45, minutes: 60 },
];

const MAX_QUESTIONS = 100;
const MAX_MINUTES = 180;

type Phase = "setup" | "running" | "done";

function totalMinutes(sections: Section[]) {
  return sections.reduce((s, x) => s + x.minutes, 0);
}

// 75 → "۱:۱۵" style durations for the results table.
function formatSpent(seconds: number) {
  return formatClock(Math.max(0, seconds));
}

export default function ExamSimPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [template, setTemplate] = useState<"konkur" | "custom">("konkur");
  const [custom, setCustom] = useState({ subject: "", questions: "", minutes: "" });
  const [customError, setCustomError] = useState("");
  const [sections, setSections] = useState<Section[]>(KONKUR_TAJROBI);
  const [current, setCurrent] = useState(0);
  const [sectionStart, setSectionStart] = useState(0); // countdown value when this section began
  const [spent, setSpent] = useState<number[]>([]); // seconds used per finished section

  const { remaining, running, setRunning, reset } = useCountdown(totalMinutes(KONKUR_TAJROBI) * 60, () => {
    // Time's up: whatever section we're in ends here; later ones were never reached.
    setSpent((s) => [...s, sectionStart]);
    setPhase("done");
  });

  function start() {
    let chosen = KONKUR_TAJROBI;
    if (template === "custom") {
      const q = Number(toLatinDigits(custom.questions.trim()));
      const m = Number(toLatinDigits(custom.minutes.trim()));
      if (!custom.subject) return setCustomError("درس رو انتخاب کن.");
      if (!Number.isInteger(q) || q < 1 || q > MAX_QUESTIONS)
        return setCustomError(`تعداد سؤال باید بین ۱ تا ${toPersianDigits(MAX_QUESTIONS)} باشه.`);
      if (!Number.isInteger(m) || m < 1 || m > MAX_MINUTES)
        return setCustomError(`زمان باید بین ۱ تا ${toPersianDigits(MAX_MINUTES)} دقیقه باشه.`);
      chosen = [{ name: custom.subject, questions: q, minutes: m }];
    }
    const total = totalMinutes(chosen) * 60;
    setCustomError("");
    setSections(chosen);
    setCurrent(0);
    setSpent([]);
    setSectionStart(total);
    reset(total);
    setRunning(true);
    setPhase("running");
  }

  function nextSection() {
    const used = sectionStart - remaining;
    setSpent((s) => [...s, used]);
    if (current === sections.length - 1) {
      setRunning(false);
      setPhase("done");
      return;
    }
    setCurrent((c) => c + 1);
    setSectionStart(remaining);
  }

  const section = sections[current];
  const sectionUsed = sectionStart - remaining;
  const sectionBudget = section ? section.minutes * 60 : 0;
  const overBudget = sectionUsed > sectionBudget;

  return (
    <StudentShell>
      <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <ClipboardList size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">شبیه‌ساز آزمون</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          آزمون رو با همون زمان‌بندی جلسه‌ی واقعی تمرین کن و ببین کدوم بخش وقتت رو می‌خوره.
        </p>

        {phase === "setup" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["konkur", "custom"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={cn(
                    "rounded-x-md border-2 px-3 py-3 text-sm font-medium transition-colors",
                    template === t
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700 hover:border-blue-300",
                  )}
                >
                  {t === "konkur" ? "کنکور تجربی کامل" : "آزمون تک‌درس"}
                </button>
              ))}
            </div>

            <Card>
              <CardContent>
                {template === "konkur" ? (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-text-500">
                          <th className="py-2 text-right font-normal">دفترچه</th>
                          <th className="py-2 text-center font-normal">سؤال</th>
                          <th className="py-2 text-center font-normal">زمان</th>
                        </tr>
                      </thead>
                      <tbody>
                        {KONKUR_TAJROBI.map((s) => (
                          <tr key={s.name} className="border-b border-border/60">
                            <td className="py-2.5 text-text-900">{s.name}</td>
                            <td className="tnum py-2.5 text-center text-text-700">{toPersianDigits(s.questions)}</td>
                            <td className="py-2.5 text-center text-text-700">
                              <span className="tnum">{toPersianDigits(s.minutes)}</span> دقیقه
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold text-text-900">
                          <td className="py-2.5">جمع</td>
                          <td className="tnum py-2.5 text-center">
                            {toPersianDigits(KONKUR_TAJROBI.reduce((s, x) => s + x.questions, 0))}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="tnum">{toPersianDigits(totalMinutes(KONKUR_TAJROBI))}</span> دقیقه
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="mt-2 text-xs text-text-500">طبق اطلاعیه‌ی سنجش برای کنکور ۱۴۰۵.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={custom.subject}
                      onChange={(e) => {
                        setCustom((c) => ({ ...c, subject: e.target.value }));
                        setCustomError("");
                      }}
                      aria-label="درس"
                      className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900"
                    >
                      <option value="">انتخاب درس</option>
                      {CHECKIN_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      {(["questions", "minutes"] as const).map((k) => (
                        <label
                          key={k}
                          className="flex h-10 items-center gap-2 rounded-x-sm border border-border bg-surface px-3 focus-within:border-blue-600"
                        >
                          <input
                            inputMode="numeric"
                            value={custom[k]}
                            onChange={(e) => {
                              setCustom((c) => ({ ...c, [k]: e.target.value }));
                              setCustomError("");
                            }}
                            placeholder={k === "questions" ? "۲۰" : "۲۵"}
                            aria-label={k === "questions" ? "تعداد سؤال" : "زمان به دقیقه"}
                            className="tnum w-full min-w-0 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
                          />
                          <span className="shrink-0 text-xs text-text-500">{k === "questions" ? "سؤال" : "دقیقه"}</span>
                        </label>
                      ))}
                    </div>
                    {customError && <p className="text-xs text-red-500">{customError}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button size="lg" className="mt-4 w-full" onClick={start}>
              <Play size={16} /> شروع آزمون
            </Button>
          </>
        )}

        {phase === "running" && section && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between text-xs text-text-500">
                <span>
                  بخش {toPersianDigits(current + 1)} از {toPersianDigits(sections.length)}
                </span>
                <span>
                  زمان کل باقی‌مانده: <span className="tnum font-medium text-text-900">{formatClock(remaining)}</span>
                </span>
              </div>

              <div className="mt-5 text-center">
                <div className="text-lg font-bold text-text-900">{section.name}</div>
                <div className="mt-1 text-xs text-text-500">
                  {toPersianDigits(section.questions)} سؤال · حدود{" "}
                  {toPersianDigits(Math.round(sectionBudget / section.questions))} ثانیه برای هر سؤال
                </div>
                <div
                  className={cn("tnum mt-5 text-5xl font-extrabold", overBudget ? "text-orange-500" : "text-text-900")}
                >
                  {formatClock(sectionUsed)}
                </div>
                <div className="mt-1 text-xs text-text-500">از {toPersianDigits(section.minutes)} دقیقه‌ی این بخش</div>
              </div>

              <div className="mt-4">
                <ProgressBar value={Math.min(100, (sectionUsed / sectionBudget) * 100)} />
              </div>

              {overBudget && (
                <div className="mt-3 flex items-center gap-2 rounded-x-md bg-orange-500/10 p-2.5 text-xs text-orange-500">
                  <AlertTriangle size={14} />
                  از بودجه‌ی این بخش رد شدی — داری از وقت بخش‌های بعد می‌خوری.
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button size="lg" className="flex-1" onClick={nextSection}>
                  {current === sections.length - 1 ? (
                    <>
                      <Flag size={16} /> پایان آزمون
                    </>
                  ) : (
                    <>
                      <SkipForward size={16} /> بخش بعد
                    </>
                  )}
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setRunning((r) => !r)} aria-label="توقف">
                  {running ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </div>
              {!running && (
                <p className="mt-2 text-center text-xs text-text-500">متوقف شده — سر جلسه‌ی واقعی توقف نداری!</p>
              )}
            </CardContent>
          </Card>
        )}

        {phase === "done" && <Results sections={sections} spent={spent} onRestart={() => setPhase("setup")} />}
      </div>
    </StudentShell>
  );
}

function Results({ sections, spent, onRestart }: { sections: Section[]; spent: number[]; onRestart: () => void }) {
  const worst = sections
    .map((s, i) => ({ name: s.name, over: (spent[i] ?? 0) - s.minutes * 60 }))
    .filter((x) => x.over > 0)
    .sort((a, b) => b.over - a.over)[0];
  const unreached = sections.slice(spent.length).map((s) => s.name);

  return (
    <>
      <Card>
        <CardContent>
          <h2 className="mb-3 text-sm font-bold text-text-900">زمان هر بخش</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-500">
                <th className="py-2 text-right font-normal">بخش</th>
                <th className="py-2 text-center font-normal">بودجه</th>
                <th className="py-2 text-center font-normal">واقعی</th>
                <th className="py-2 text-center font-normal">اختلاف</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s, i) => {
                const used = spent[i];
                const diff = used == null ? null : used - s.minutes * 60;
                return (
                  <tr key={s.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 text-text-900">{s.name}</td>
                    <td className="tnum py-2.5 text-center text-text-500">{formatSpent(s.minutes * 60)}</td>
                    <td className="tnum py-2.5 text-center text-text-700">{used == null ? "—" : formatSpent(used)}</td>
                    <td
                      className={cn(
                        "tnum py-2.5 text-center",
                        diff == null ? "text-text-500" : diff > 0 ? "text-orange-500" : "text-mint-500",
                      )}
                    >
                      {diff == null
                        ? "نرسیدی"
                        : `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${formatSpent(Math.abs(diff))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(worst || unreached.length > 0) && (
            <div className="mt-3 rounded-x-md bg-surface-2 p-3 text-xs leading-[1.8] text-text-700">
              {worst && (
                <p>
                  بیشترین زمان اضافه رو توی <span className="font-medium text-text-900">{worst.name}</span> گذاشتی.
                  دفعه‌ی بعد سؤال‌های سخت این بخش رو برای دور دوم نگه دار.
                </p>
              )}
              {unreached.length > 0 && <p>وقت تموم شد و به {unreached.join("، ")} نرسیدی.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href="/dashboard/calculator" className={buttonVariants({ size: "lg", variant: "secondary" })}>
          <Calculator size={16} /> درصدت رو حساب کن
        </Link>
        <Link href="/dashboard/mistakes" className={buttonVariants({ size: "lg", variant: "secondary" })}>
          <NotebookPen size={16} /> غلط‌ها رو ثبت کن
        </Link>
      </div>
      <Button size="lg" className="mt-2 w-full" onClick={onRestart}>
        آزمون جدید
      </Button>
    </>
  );
}
