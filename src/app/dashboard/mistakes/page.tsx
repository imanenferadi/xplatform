"use client";

import { useState } from "react";
import { NotebookPen, Plus, Trash2, RotateCcw, CheckCircle2, X } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { MistakePattern } from "@/components/app/MistakePattern";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CHECKIN_SUBJECTS, MISTAKE_REASONS, type MistakeReason } from "@/lib/mock-data";
import { addMistake, deleteMistake, toggleResolved, useMyMistakes } from "@/lib/mistakes-store";
import { cn, toPersianDigits } from "@/lib/utils";

const REASONS = Object.keys(MISTAKE_REASONS) as MistakeReason[];
const EMPTY_FORM = { subject: "", topic: "", source: "", questionNo: "", reason: "" as MistakeReason | "", fix: "" };

const fieldClass =
  "h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

export default function MistakesPage() {
  const mistakes = useMyMistakes();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<"subject" | "source" | "reason", string>>>({});
  const [subjectFilter, setSubjectFilter] = useState("همه");
  const [reasonFilter, setReasonFilter] = useState<MistakeReason | "همه">("همه");
  const [hideResolved, setHideResolved] = useState(false);

  const open = mistakes.filter((m) => !m.resolved);
  const subjects = ["همه", ...CHECKIN_SUBJECTS.filter((s) => mistakes.some((m) => m.subject === s))];
  const visible = mistakes.filter(
    (m) =>
      (subjectFilter === "همه" || m.subject === subjectFilter) &&
      (reasonFilter === "همه" || m.reason === reasonFilter) &&
      !(hideResolved && m.resolved),
  );

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.subject) next.subject = "درس رو انتخاب کن.";
    if (!form.source.trim()) next.source = "بنویس از کجا بود — آزمون یا کتاب.";
    if (!form.reason) next.reason = "دلیل غلط رو انتخاب کن — اصل این دفترچه همینه.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !form.reason) return;

    addMistake({
      id: `mm-${Date.now()}`,
      studentId: "me",
      subject: form.subject,
      topic: form.topic.trim(),
      source: form.source.trim(),
      questionNo: form.questionNo.trim() || undefined,
      reason: form.reason,
      fix: form.fix.trim(),
      date: "امروز",
      resolved: false,
    });
    // Keep subject + source: students usually log several from one exam in a row.
    setForm({ ...EMPTY_FORM, subject: form.subject, source: form.source });
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <NotebookPen size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">دفترچه‌ی غلط‌ها</h1>
        </div>
        <p className="mb-5 text-sm text-text-500">
          هر تستی که غلط زدی رو با <span className="font-medium text-text-700">دلیلش</span> ثبت کن. مهم‌تر از تعداد غلط،
          اینه که بدونی چرا غلط می‌زنی — مشاورت هم همین الگو رو می‌بینه.
        </p>

        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-900">چرا غلط می‌زنم؟</h2>
              <span className="text-xs text-text-500">
                <span className="tnum">{toPersianDigits(open.length)}</span> غلط حل‌نشده از{" "}
                <span className="tnum">{toPersianDigits(mistakes.length)}</span>
              </span>
            </div>
            <MistakePattern entries={mistakes} audience="student" />
          </CardContent>
        </Card>

        {formOpen ? (
          <Card className="mt-4">
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-900">ثبت غلط جدید</h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-text-500 hover:text-text-900"
                  aria-label="بستن فرم"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={submit} noValidate className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <select
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      aria-label="درس"
                      className={fieldClass}
                    >
                      <option value="">انتخاب درس</option>
                      {CHECKIN_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                  </div>
                  <input
                    value={form.topic}
                    onChange={(e) => update("topic", e.target.value)}
                    placeholder="مبحث (اختیاری)"
                    aria-label="مبحث"
                    className={fieldClass}
                  />
                  <div>
                    <input
                      value={form.source}
                      onChange={(e) => update("source", e.target.value)}
                      placeholder="منبع — مثلاً آزمون قلم‌چی ۴ مهر"
                      aria-label="منبع"
                      className={fieldClass}
                    />
                    {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
                  </div>
                  <input
                    value={form.questionNo}
                    onChange={(e) => update("questionNo", e.target.value)}
                    placeholder="شماره‌ی سؤال (اختیاری)"
                    aria-label="شماره‌ی سؤال"
                    inputMode="numeric"
                    className={cn(fieldClass, "tnum")}
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-text-700">دلیل غلط</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => update("reason", r)}
                        title={MISTAKE_REASONS[r].hint}
                        className={cn(
                          "rounded-x-md border-2 px-2.5 py-2 text-right transition-colors",
                          form.reason === r
                            ? "border-blue-600 bg-blue-100"
                            : "border-border bg-surface hover:border-blue-300",
                        )}
                      >
                        <div className="text-xs font-medium text-text-900">{MISTAKE_REASONS[r].label}</div>
                        <div className="mt-0.5 text-[10px] leading-snug text-text-500">{MISTAKE_REASONS[r].hint}</div>
                      </button>
                    ))}
                  </div>
                  {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                </div>

                <textarea
                  value={form.fix}
                  onChange={(e) => update("fix", e.target.value)}
                  rows={2}
                  placeholder="درستش چی بود / دفعه‌ی بعد چیکار کنم؟ (اختیاری)"
                  className="w-full rounded-x-sm border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                />
                <Button type="submit" size="md" className="w-full">
                  ثبت در دفترچه
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button size="lg" className="mt-4 w-full" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> ثبت غلط جدید
          </Button>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="فیلتر درس"
            className="h-9 rounded-x-pill border border-border bg-surface px-3 text-xs text-text-900"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === "همه" ? "همه‌ی درس‌ها" : s}
              </option>
            ))}
          </select>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value as MistakeReason | "همه")}
            aria-label="فیلتر دلیل"
            className="h-9 rounded-x-pill border border-border bg-surface px-3 text-xs text-text-900"
          >
            <option value="همه">همه‌ی دلیل‌ها</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {MISTAKE_REASONS[r].label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-text-700">
            <input type="checkbox" checked={hideResolved} onChange={(e) => setHideResolved(e.target.checked)} />
            فقط حل‌نشده‌ها
          </label>
        </div>

        <div className="mt-3 space-y-2">
          {visible.map((m) => (
            <Card key={m.id} className={cn(m.resolved && "opacity-60")}>
              <CardContent className="py-3.5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-text-900">{m.subject}</span>
                      {m.topic && <span className="text-sm text-text-700">— {m.topic}</span>}
                      <Badge tone={m.reason === "careless" || m.reason === "calculation" ? "warning" : "neutral"}>
                        {MISTAKE_REASONS[m.reason].label}
                      </Badge>
                      {m.resolved && <Badge tone="success">دوباره حلش کردم</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-text-500">
                      {m.source}
                      {m.questionNo && (
                        <>
                          {" "}
                          · سؤال <span className="tnum">{toPersianDigits(m.questionNo)}</span>
                        </>
                      )}{" "}
                      · {m.date}
                    </div>
                    {m.fix && <p className="mt-1.5 text-xs leading-[1.8] text-text-700">💡 {m.fix}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleResolved(m.id)}
                      className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2 hover:text-mint-500"
                      aria-label={m.resolved ? "برگردوندن به حل‌نشده" : "دوباره حلش کردم"}
                      title={m.resolved ? "برگردوندن به حل‌نشده" : "دوباره حلش کردم"}
                    >
                      {m.resolved ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMistake(m.id)}
                      className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2 hover:text-red-500"
                      aria-label="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">با این فیلترها غلطی پیدا نشد.</p>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
