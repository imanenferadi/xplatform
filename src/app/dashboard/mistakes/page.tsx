"use client";

import { toast } from "@/components/ui/Toaster";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NotebookPen, Plus, Trash2, RotateCcw, CheckCircle2, X, Repeat, Eye, ThumbsUp } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { NotesPanel } from "@/components/app/NotesPanel";
import { MistakePattern } from "@/components/app/MistakePattern";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  CHECKIN_SUBJECTS,
  DEMO_TODAY_ISO,
  MISTAKE_REASONS,
  type MistakeEntry,
  type MistakeReason,
} from "@/lib/mock-data";
import {
  addMistake,
  daysUntilReview,
  deleteMistake,
  reviewMistake,
  toggleResolved,
  useDueMistakes,
  useMyMistakes,
} from "@/lib/mistakes-store";
import { cn, toPersianDigits } from "@/lib/utils";

const REASONS = Object.keys(MISTAKE_REASONS) as MistakeReason[];
const EMPTY_FORM = { subject: "", topic: "", source: "", questionNo: "", reason: "" as MistakeReason | "", fix: "" };

const fieldClass =
  "h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

export default function MistakesPageRoute() {
  return (
    <StudentShell>
      <Suspense>
        <MistakesPage />
      </Suspense>
    </StudentShell>
  );
}

function MistakesPage() {
  const mistakes = useMyMistakes();
  const due = useDueMistakes();
  const params = useSearchParams();
  const [reviewing, setReviewing] = useState(params.get("review") === "1");
  const [tab, setTab] = useState<"mistakes" | "notes">(params.get("tab") === "notes" ? "notes" : "mistakes");
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
      !(hideResolved && m.resolved)
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
      createdIso: DEMO_TODAY_ISO,
    });
    // Keep subject + source: students usually log several from one exam in a row.
    setForm({ ...EMPTY_FORM, subject: form.subject, source: form.source });
    toast("به دفترچه اضافه شد — درس و منبع برای غلط بعدی مونده");
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-3 flex items-center gap-2">
          <NotebookPen size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">دفترچه</h1>
        </div>
        <div role="tablist" aria-label="بخش‌های دفترچه" className="mb-5 flex gap-1.5">
          {(["mistakes", "notes"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-x-pill border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
              )}
            >
              {t === "mistakes" ? `غلط‌ها (${toPersianDigits(open.length)})` : "یادداشت‌ها"}
            </button>
          ))}
        </div>

        {tab === "notes" ? (
          <NotesPanel />
        ) : (
          <>
            <p className="mb-5 text-sm text-text-500">
              هر تستی که غلط زدی رو با <span className="font-medium text-text-700">دلیلش</span> ثبت کن. مهم‌تر از تعداد
              غلط، اینه که بدونی چرا غلط می‌زنی — مشاورت هم همین الگو رو می‌بینه.
            </p>

            {reviewing ? (
              <ReviewSession due={due} onClose={() => setReviewing(false)} />
            ) : (
              due.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReviewing(true)}
                  className="mb-4 flex w-full items-center gap-3 rounded-x-lg border border-blue-600/30 bg-blue-100 p-4 text-right transition-colors hover:bg-blue-100/70"
                >
                  <Repeat size={18} className="shrink-0 text-blue-600" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-text-900">
                      مرور امروز: <span className="tnum">{toPersianDigits(due.length)}</span> تست رو دوباره حل کن
                    </span>
                    <span className="text-xs text-text-500">
                      حل دوباره بعد از چند روز، بهترین راه برای تکرار نشدن غلطه.
                    </span>
                  </span>
                </button>
              )
            )}

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
                        {errors.subject && (
                          <p role="alert" className="mt-1 text-xs text-red-500">
                            {errors.subject}
                          </p>
                        )}
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
                        {errors.source && (
                          <p role="alert" className="mt-1 text-xs text-red-500">
                            {errors.source}
                          </p>
                        )}
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
                                : "border-border bg-surface hover:border-blue-300"
                            )}
                          >
                            <div className="text-xs font-medium text-text-900">{MISTAKE_REASONS[r].label}</div>
                            <div className="mt-0.5 text-xs leading-snug text-text-500">{MISTAKE_REASONS[r].hint}</div>
                          </button>
                        ))}
                      </div>
                      {errors.reason && (
                        <p role="alert" className="mt-1 text-xs text-red-500">
                          {errors.reason}
                        </p>
                      )}
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
                          {m.resolved ? <Badge tone="success">دوباره حلش کردم</Badge> : <ReviewBadge m={m} />}
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
                          onClick={() => toast(m.resolved ? "برگشت به حل‌نشده‌ها" : "حل شد 👏", toggleResolved(m.id))}
                          className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2 hover:text-mint-500"
                          aria-label={m.resolved ? "برگردوندن به حل‌نشده" : "دوباره حلش کردم"}
                          title={m.resolved ? "برگردوندن به حل‌نشده" : "دوباره حلش کردم"}
                        >
                          {m.resolved ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toast("غلط حذف شد", deleteMistake(m.id))}
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
          </>
        )}
      </div>
    </>
  );
}

function ReviewBadge({ m }: { m: MistakeEntry }) {
  const days = daysUntilReview(m);
  const stage = m.reviewStage ?? 0;
  return (
    <Badge tone={days <= 0 ? "info" : "neutral"}>
      <Repeat size={10} /> مرور {toPersianDigits(stage + 1)} از ۲:{" "}
      {days <= 0 ? "امروز" : `${toPersianDigits(days)} روز دیگه`}
    </Badge>
  );
}

// One due mistake at a time: re-solve the original question, then say how it went.
function ReviewSession({ due, onClose }: { due: MistakeEntry[]; onClose: () => void }) {
  const [total] = useState(due.length);
  const [results, setResults] = useState({ right: 0, wrong: 0 });
  const [showFix, setShowFix] = useState(false);
  const current = due[0];
  const doneCount = results.right + results.wrong;

  function answer(correct: boolean) {
    reviewMistake(current.id, correct);
    setResults((r) => (correct ? { ...r, right: r.right + 1 } : { ...r, wrong: r.wrong + 1 }));
    setShowFix(false);
  }

  return (
    <Card className="mb-4 border-blue-600/30">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-text-900">
            <Repeat size={15} className="text-blue-600" /> مرور امروز
          </h2>
          <button type="button" onClick={onClose} aria-label="بستن مرور" className="text-text-500 hover:text-text-900">
            <X size={16} />
          </button>
        </div>

        {!current ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={28} className="mx-auto text-mint-500" />
            <p className="mt-2 text-sm font-medium text-text-900">مرور امروز تموم شد</p>
            {doneCount > 0 && (
              <p className="mt-1 text-xs text-text-500">
                {toPersianDigits(results.right)} درست · {toPersianDigits(results.wrong)} دوباره غلط (سه روز دیگه
                برمی‌گردن)
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="tnum mb-2 text-xs text-text-500">
              {toPersianDigits(doneCount + 1)} از {toPersianDigits(total)}
            </div>
            <div className="rounded-x-md bg-surface-2 p-4">
              <div className="text-sm font-medium text-text-900">
                {current.subject}
                {current.topic && ` — ${current.topic}`}
              </div>
              <div className="mt-1 text-xs text-text-500">
                {current.source}
                {current.questionNo && (
                  <>
                    {" "}
                    · سؤال <span className="tnum">{toPersianDigits(current.questionNo)}</span>
                  </>
                )}{" "}
                · دفعه‌ی قبل: {MISTAKE_REASONS[current.reason].label}
              </div>
              <p className="mt-3 text-sm text-text-700">همین سؤال رو بدون نگاه به جواب دوباره حل کن.</p>
              {current.fix &&
                (showFix ? (
                  <p className="mt-2 text-xs leading-[1.8] text-text-700">💡 {current.fix}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFix(true)}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Eye size={12} /> یادداشت «درستش چی بود»
                  </button>
                ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="md" onClick={() => answer(true)}>
                <ThumbsUp size={14} /> این بار درست زدم
              </Button>
              <Button size="md" variant="secondary" onClick={() => answer(false)}>
                <RotateCcw size={14} /> باز غلط زدم
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
