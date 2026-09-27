"use client";

import { FormActions, SaveStatus } from "@/components/ui/Form";
import { toast } from "@/components/ui/Toaster";
import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, School, BookOpen, Check, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BOOK_STATUS_LABEL,
  BOOK_SUGGESTIONS,
  CHECKIN_SUBJECTS,
  DAILY_HOURS_OPTIONS,
  FINALS_STATUS,
  MOCK_EXAM_PROVIDERS,
  QUOTAS,
  STUDY_CHALLENGES,
  TARGET_MAJORS,
  WEEK_DAYS,
  type BookKind,
  type BookStatus,
  type Commitment,
  type Intake,
} from "@/lib/mock-data";
import {
  addBook,
  addCommitment,
  removeBook,
  removeCommitment,
  saveIntake,
  setupSteps,
  updateBook,
  useMySetup,
} from "@/lib/setup-store";
import { clockMinutes, freeHours } from "@/lib/schedule";
import { cn, toPersianDigits } from "@/lib/utils";

const field =
  "h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";
const chip = (on: boolean) =>
  cn(
    "rounded-x-pill border px-3 py-1.5 text-xs transition-colors",
    on ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700 hover:border-blue-300"
  );

// «اطلاعات شروع»: everything the mentor needs to know before planning —
// one page, three short sections, no new tab in the menu.
export default function SetupPage() {
  const setup = useMySetup();
  const steps = setupSteps(setup);
  const done = steps.filter((s) => s.done).length;

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">اطلاعات شروع</h1>
        </div>
        <p className="mb-4 text-sm text-text-500">
          سه بخش کوتاه که مشاورت قبل از نوشتن برنامه لازم داره. هر وقت هم چیزی عوض شد، همین‌جا به‌روزش کن.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {steps.map((s) => (
            <a
              key={s.key}
              href={`#${s.key}`}
              className={cn(
                "flex items-center gap-1.5 rounded-x-pill border px-3 py-1.5 text-xs",
                s.done ? "border-mint-500/40 bg-mint-500/10 text-mint-500" : "border-border bg-surface text-text-700"
              )}
            >
              {s.done ? <CheckCircle2 size={13} /> : <Circle size={13} />} {s.label}
            </a>
          ))}
          <span className="mr-auto self-center text-xs text-text-500">
            <span className="tnum">{toPersianDigits(done)}</span> از ۳
          </span>
        </div>

        <IntakeSection saved={setup.intake} />
        <ScheduleSection schedule={setup.schedule} />
        <BooksSection books={setup.books} />

        {done === 3 && (
          <Link
            href="/dashboard"
            className="mt-6 flex items-center justify-center gap-2 rounded-x-lg border border-mint-500/40 bg-mint-500/10 p-4 text-sm font-medium text-mint-500"
          >
            <Check size={16} /> همه‌چی آماده‌ست — برگرد به امروز
          </Link>
        )}
      </div>
    </StudentShell>
  );
}

// ------------------------------------------------------------ intake

function IntakeSection({ saved }: { saved: Intake | null }) {
  // Kept outside the form: the first save remounts it (key changes).
  const [justSaved, setJustSaved] = useState(false);
  // Remount when the stored answers arrive so the form starts from them.
  return <IntakeForm key={saved ? "saved" : "empty"} saved={saved} justSaved={justSaved} setJustSaved={setJustSaved} />;
}

function IntakeForm({
  saved,
  justSaved,
  setJustSaved,
}: {
  saved: Intake | null;
  justSaved: boolean;
  setJustSaved: (v: boolean) => void;
}) {
  const [form, setForm] = useState<Intake>(
    saved ?? { targetMajor: "", quota: "", exams: [], dailyHours: "", challenges: [], finals: "", expectation: "" }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Intake, string>>>({});

  function set<K extends keyof Intake>(k: K, v: Intake[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setJustSaved(false);
  }
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Each error sits under its own question (same pattern as every form).
    const next: Partial<Record<keyof Intake, string>> = {};
    if (!form.targetMajor) next.targetMajor = "رشته‌ی هدفت رو انتخاب کن.";
    if (!form.quota) next.quota = "سهمیه رو انتخاب کن (اگه نمی‌دونی: «نمی‌دونم»).";
    if (!form.dailyHours) next.dailyHours = "ساعت مطالعه‌ی الانت رو انتخاب کن.";
    if (form.challenges.length === 0) next.challenges = "حداقل یک چالش رو انتخاب کن.";
    if (!form.finals) next.finals = "وضعیت امتحانات نهایی رو انتخاب کن.";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveIntake({ ...form, expectation: form.expectation.trim() });
    setJustSaved(true);
  }

  return (
    <Card id="intake" className="scroll-mt-20">
      <CardContent>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-900">
          <ClipboardCheck size={16} className="text-blue-600" /> پرسشنامه‌ی شروع
        </h2>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Question label="رشته‌ی هدفت چیه؟" error={errors.targetMajor}>
            {TARGET_MAJORS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("targetMajor", m)}
                aria-pressed={form.targetMajor === m}
                className={chip(form.targetMajor === m)}
              >
                {m}
              </button>
            ))}
          </Question>
          <Question label="سهمیه‌ی منطقه‌ات؟" error={errors.quota}>
            {QUOTAS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => set("quota", q)}
                aria-pressed={form.quota === q}
                className={chip(form.quota === q)}
              >
                {q}
              </button>
            ))}
          </Question>
          <Question label="توی کدوم آزمون‌های آزمایشی شرکت می‌کنی؟" hint="چندتایی">
            {MOCK_EXAM_PROVIDERS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() =>
                  set(
                    "exams",
                    x === "هیچ‌کدوم"
                      ? ["هیچ‌کدوم"]
                      : toggle(
                          form.exams.filter((e) => e !== "هیچ‌کدوم"),
                          x
                        )
                  )
                }
                aria-pressed={form.exams.includes(x)}
                className={chip(form.exams.includes(x))}
              >
                {x}
              </button>
            ))}
          </Question>
          <Question label="الان روزی چقدر درس می‌خونی؟" error={errors.dailyHours}>
            {DAILY_HOURS_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => set("dailyHours", h)}
                aria-pressed={form.dailyHours === h}
                className={chip(form.dailyHours === h)}
              >
                {h}
              </button>
            ))}
          </Question>
          <Question label="سخت‌ترین چالشت چیه؟" hint="چندتایی" error={errors.challenges}>
            {STUDY_CHALLENGES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("challenges", toggle(form.challenges, c))}
                aria-pressed={form.challenges.includes(c)}
                className={chip(form.challenges.includes(c))}
              >
                {c}
              </button>
            ))}
          </Question>
          <Question label="امتحانات نهایی؟" error={errors.finals}>
            {FINALS_STATUS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => set("finals", f)}
                aria-pressed={form.finals === f}
                className={chip(form.finals === f)}
              >
                {f}
              </button>
            ))}
          </Question>
          <div>
            <label htmlFor="expectation" className="mb-1.5 block text-sm font-medium text-text-700">
              از مشاورت چی می‌خوای؟ <span className="font-normal text-text-500">(اختیاری)</span>
            </label>
            <textarea
              id="expectation"
              value={form.expectation}
              onChange={(e) => set("expectation", e.target.value.slice(0, 400))}
              rows={2}
              placeholder="مثلاً: یکی که وقتی آزمون بد می‌دم نذاره جا بزنم"
              className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
          </div>
          <FormActions status={<SaveStatus show={justSaved} text="ذخیره شد و برای مشاورت فرستاده شد" />}>
            <Button type="submit" size="md">
              {saved ? "به‌روزرسانی" : "ثبت پرسشنامه"}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

function Question({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset aria-invalid={error ? true : undefined}>
      <legend className="mb-2 text-sm font-medium text-text-700">
        {label} {hint && <span className="text-xs font-normal text-text-500">({hint})</span>}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------- schedule

function ScheduleSection({ schedule }: { schedule: Commitment[] }) {
  const [draft, setDraft] = useState({ day: "", title: "", start: "", end: "", kind: "class" as Commitment["kind"] });
  const [error, setError] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.day || !draft.title.trim() || !draft.start || !draft.end)
      return setError("روز، عنوان و ساعت شروع و پایان رو کامل کن.");
    const s = clockMinutes(draft.start);
    const en = clockMinutes(draft.end);
    if (en <= s) return setError("ساعت پایان باید بعد از شروع باشه.");
    const clash = schedule.find((c) => c.day === draft.day && s < clockMinutes(c.end) && en > clockMinutes(c.start));
    if (clash)
      return setError(
        `با «${clash.title}» (${toPersianDigits(clash.start)} تا ${toPersianDigits(clash.end)}) هم‌پوشانی داره.`
      );
    addCommitment({
      id: `cm-${Date.now()}`,
      day: draft.day,
      title: draft.title.trim(),
      start: draft.start,
      end: draft.end,
      kind: draft.kind,
    });
    setDraft({ day: draft.day, title: "", start: "", end: "", kind: draft.kind });
    setError("");
  }

  return (
    <Card id="schedule" className="mt-4 scroll-mt-20">
      <CardContent>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-text-900">
          <School size={16} className="text-blue-600" /> ساعت مدرسه و کلاس‌ها
        </h2>
        <p className="mb-4 text-xs text-text-500">
          تقویمت از روی این‌ها «وقت آزاد» هر روز رو حساب می‌کنه و اگه برنامه از وقتت بیشتر بود، هشدار می‌ده.
        </p>

        <div className="space-y-2">
          {WEEK_DAYS.map((day) => {
            const items = schedule
              .filter((c) => c.day === day)
              .sort((a, b) => clockMinutes(a.start) - clockMinutes(b.start));
            return (
              <div key={day} className="flex items-start gap-3 rounded-x-md bg-surface-2 px-3 py-2">
                <div className="w-16 shrink-0 pt-1 text-sm font-medium text-text-900">{day}</div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {items.length === 0 && <span className="pt-1 text-xs text-text-500">آزاد</span>}
                  {items.map((c) => (
                    <span
                      key={c.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-x-pill px-2.5 py-1 text-xs",
                        c.kind === "school" ? "bg-surface text-text-700" : "bg-blue-100 text-blue-600"
                      )}
                    >
                      {c.title} <span className="tnum">{toPersianDigits(`${c.start}–${c.end}`)}</span>
                      <button
                        type="button"
                        onClick={() => toast(`«${c.title}» حذف شد`, removeCommitment(c.id))}
                        aria-label={`حذف ${c.title} ${day}`}
                        className="text-text-500 hover:text-red-500"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="shrink-0 pt-1 text-xs text-text-500">
                  وقت آزاد ~<span className="tnum">{toPersianDigits(freeHours(schedule, day))}</span> ساعت
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={add} noValidate className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.4fr_1fr_1fr_auto]">
          <select
            value={draft.day}
            onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}
            aria-label="روز"
            className={field}
          >
            <option value="">روز</option>
            {WEEK_DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 40) }))}
            placeholder="مثلاً: کلاس تقویتی شیمی"
            aria-label="عنوان"
            className={field}
          />
          <input
            type="time"
            dir="ltr"
            value={draft.start}
            onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
            aria-label="شروع"
            className={cn(field, "tnum")}
          />
          <input
            type="time"
            dir="ltr"
            value={draft.end}
            onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
            aria-label="پایان"
            className={cn(field, "tnum")}
          />
          <Button type="submit" size="md" variant="secondary" className="h-10">
            <Plus size={14} /> افزودن
          </Button>
        </form>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------- books

function BooksSection({
  books,
}: {
  books: { id: string; subject: string; title: string; kind: BookKind; status: BookStatus }[];
}) {
  const [draft, setDraft] = useState({ subject: "", title: "", kind: "تست" as BookKind });
  const [error, setError] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.subject || !draft.title.trim()) return setError("درس و اسم کتاب رو وارد کن.");
    if (books.some((b) => b.subject === draft.subject && b.title === draft.title.trim() && b.kind === draft.kind))
      return setError("این کتاب رو قبلاً اضافه کردی.");
    addBook({
      id: `bk-${Date.now()}`,
      subject: draft.subject,
      title: draft.title.trim(),
      kind: draft.kind,
      status: "have",
    });
    setDraft({ subject: draft.subject, title: "", kind: draft.kind });
    setError("");
  }

  const bySubject = CHECKIN_SUBJECTS.map((s) => ({ s, items: books.filter((b) => b.subject === s) })).filter(
    (x) => x.items.length
  );

  return (
    <Card id="books" className="mt-4 scroll-mt-20">
      <CardContent>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-text-900">
          <BookOpen size={16} className="text-blue-600" /> کتاب‌ها و منابع
        </h2>
        <p className="mb-4 text-xs text-text-500">مشاورت برنامه رو با همین کتاب‌ها می‌نویسه، نه با کتابی که نداری.</p>

        {bySubject.length === 0 && <p className="mb-3 text-sm text-text-500">هنوز کتابی اضافه نکردی.</p>}
        <div className="space-y-2">
          {bySubject.map(({ s, items }) => (
            <div key={s}>
              <div className="mb-1 text-xs font-bold text-text-900">{s}</div>
              <div className="space-y-1">
                {items.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 rounded-x-md bg-surface-2 px-3 py-2 text-sm">
                    <span className="flex-1 text-text-900">
                      {b.title} <span className="text-xs text-text-500">· {b.kind}</span>
                    </span>
                    <select
                      value={b.status}
                      onChange={(e) => updateBook(b.id, { status: e.target.value as BookStatus })}
                      aria-label={`وضعیت ${b.title}`}
                      className="h-8 rounded-x-sm border border-border bg-surface px-2 text-xs text-text-900"
                    >
                      {(Object.keys(BOOK_STATUS_LABEL) as BookStatus[]).map((st) => (
                        <option key={st} value={st}>
                          {BOOK_STATUS_LABEL[st]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toast(`«${b.title}» حذف شد`, removeBook(b.id))}
                      aria-label={`حذف ${b.title}`}
                      className="text-text-500 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={add} noValidate className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.6fr_1fr_auto]">
          <select
            value={draft.subject}
            onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            aria-label="درس"
            className={field}
          >
            <option value="">درس</option>
            {CHECKIN_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            list="book-suggestions"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 40) }))}
            placeholder="کتاب یا ناشر — مثلاً خیلی سبز"
            aria-label="کتاب"
            className={field}
          />
          <datalist id="book-suggestions">
            {BOOK_SUGGESTIONS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <select
            value={draft.kind}
            onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as BookKind }))}
            aria-label="نوع"
            className={field}
          >
            {(["درسنامه", "تست", "جمع‌بندی"] as BookKind[]).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <Button type="submit" size="md" variant="secondary" className="h-10">
            <Plus size={14} /> افزودن
          </Button>
        </form>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
