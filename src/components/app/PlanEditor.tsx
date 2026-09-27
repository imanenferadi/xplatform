"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  CopyPlus,
  GripVertical,
  FileText,
  LayoutTemplate,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
  Undo2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BooksHint } from "@/components/app/AboutStudent";
import {
  CHECKIN_SUBJECTS,
  PLAN_DEADLINE_DAY,
  PLAN_HOUR_OPTIONS,
  PLAN_WEEK_LABELS,
  WEEK_DAYS,
  weekExams,
  type PlanDays,
  type PlanTask,
  type PlanWeek,
} from "@/lib/mock-data";
import {
  addTask,
  copyDay,
  dayHours,
  discardDraft,
  draftChanges,
  formatHours,
  moveTask,
  publishPlan,
  removeTask,
  replaceDays,
  saveTemplate,
  setPlanNote,
  updateTask,
  useStudentPlans,
  useTemplates,
  weekHours,
  workingCopy,
} from "@/lib/plan-store";
import { useStudentSetup } from "@/lib/setup-store";
import { freeHours } from "@/lib/schedule";
import { slotDay, slotTime, useFixedSession } from "@/lib/session-store";
import { cn, toPersianDigits } from "@/lib/utils";

type Editing = { day: string; id: string | null } | null;

const fieldClass =
  "h-9 rounded-x-sm border border-border bg-surface px-2.5 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

// The mentor writes the whole week by hand — no system suggestions. The
// editor only does arithmetic: hours per day vs the student's real free
// time, the week's total, and which books the student has per subject.
export function PlanEditor({ studentId, studentName }: { studentId: string; studentName: string }) {
  const plans = useStudentPlans(studentId);
  const [week, setWeek] = useState<PlanWeek>(plans.next.published ? "this" : "next");
  const [editing, setEditing] = useState<Editing>(null);
  const [pendingReplace, setPendingReplace] = useState<{ label: string; days: PlanDays } | null>(null);
  const [tplName, setTplName] = useState<string | null>(null);
  const [tplError, setTplError] = useState("");
  const [sent, setSent] = useState<PlanWeek | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [copyTo, setCopyTo] = useState<string[]>([]);
  const [sendError, setSendError] = useState("");
  const templates = useTemplates();
  const { schedule } = useStudentSetup(studentId);
  const session = useFixedSession(studentId);

  const p = plans[week];
  const copy = workingCopy(p);
  const changes = draftChanges(p);
  const total = weekHours(copy.days);
  const hasSchedule = schedule.length > 0;
  const over = WEEK_DAYS.filter((d) => hasSchedule && dayHours(copy.days[d] ?? []) > freeHours(schedule, d));
  const sessionSlot = session ? (week === "next" ? (session.nextSlot ?? session.slot) : session.slot) : null;

  function switchWeek(w: PlanWeek) {
    setWeek(w);
    setEditing(null);
    setPendingReplace(null);
    setSendError("");
  }

  function send() {
    if (total === 0) return setSendError("برنامه خالیه — حداقل یک درس بنویس.");
    publishPlan(studentId, studentName, week);
    setSent(week);
    setSendError("");
  }

  function saveAsTemplate() {
    const name = (tplName ?? "").trim();
    if (!name) return setTplError("یه اسم براش بنویس.");
    if (templates.some((t) => t.name === name)) return setTplError("قالبی با همین اسم داری.");
    if (total === 0) return setTplError("برنامه‌ی خالی رو نمی‌شه قالب کرد.");
    saveTemplate(name, copy.days);
    setTplName(null);
    setTplError("");
  }

  return (
    <div>
      {/* Week tabs, each with where it stands */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["this", "next"] as PlanWeek[]).map((w) => {
          const wp = plans[w];
          const pending = draftChanges(wp);
          return (
            <button
              key={w}
              type="button"
              onClick={() => switchWeek(w)}
              className={cn(
                "flex items-center gap-1.5 rounded-x-pill border px-3.5 py-1.5 text-xs font-medium transition-colors",
                week === w ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
              )}
            >
              {w === "this" ? "این هفته" : "هفته‌ی بعد"}
              {pending > 0 ? (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              ) : wp.published ? (
                <Check size={12} className="text-mint-500" />
              ) : (
                <span className="text-[10px] font-normal text-orange-500">نوشته نشده</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-xs text-text-500">
        {PLAN_WEEK_LABELS[week]} ·{" "}
        {p.published ? (
          <>
            {studentName} نسخه‌ی ارسال‌شده‌ی {p.published.sentAt} رو داره
          </>
        ) : week === "next" ? (
          <span className="text-orange-500">مهلت ارسال: {PLAN_DEADLINE_DAY} شب</span>
        ) : (
          "هنوز ارسال نشده"
        )}
        {changes > 0 && (
          <span className="font-medium text-orange-500"> · {toPersianDigits(changes)} تغییر ارسال‌نشده</span>
        )}
      </p>

      {/* Tools */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {week === "next" && plans.this.published && (
          <Button
            size="md"
            variant="secondary"
            onClick={() => setPendingReplace({ label: "کپی از این هفته", days: plans.this.published!.days })}
          >
            <Copy size={14} /> کپی از این هفته
          </Button>
        )}
        {templates.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-text-500">
            <LayoutTemplate size={14} />
            <select
              value=""
              onChange={(e) => {
                const t = templates.find((x) => x.id === e.target.value);
                if (t) setPendingReplace({ label: `قالب «${t.name}»`, days: t.days });
              }}
              aria-label="اعمال قالب"
              className={cn(fieldClass, "text-xs")}
            >
              <option value="">اعمال قالب…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {tplName === null ? (
          <button
            type="button"
            onClick={() => setTplName("")}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Save size={13} /> ذخیره به‌عنوان قالب
          </button>
        ) : (
          <span className="flex flex-wrap items-center gap-1.5">
            <input
              value={tplName}
              onChange={(e) => {
                setTplName(e.target.value.slice(0, 40));
                setTplError("");
              }}
              placeholder="اسم قالب"
              aria-label="اسم قالب"
              className={cn(fieldClass, "w-40 text-xs")}
            />
            <Button size="md" onClick={saveAsTemplate}>
              ذخیره
            </Button>
            <button
              type="button"
              onClick={() => {
                setTplName(null);
                setTplError("");
              }}
              className="text-xs text-text-500"
            >
              انصراف
            </button>
            {tplError && <span className="text-xs text-red-500">{tplError}</span>}
          </span>
        )}
      </div>

      {pendingReplace && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-text-700">
          <span className="flex-1">
            {pendingReplace.label}:{" "}
            {weekHours(copy.days) > 0
              ? "جایگزین برنامه‌ی فعلی همین هفته می‌شه (فقط در پیش‌نویس)."
              : "توی پیش‌نویس ریخته می‌شه."}
          </span>
          <Button
            size="md"
            onClick={() => {
              replaceDays(studentId, week, pendingReplace.days);
              setPendingReplace(null);
              setEditing(null);
            }}
          >
            انجام بده
          </Button>
          <button type="button" onClick={() => setPendingReplace(null)} className="text-text-500">
            انصراف
          </button>
        </div>
      )}

      {/* Checks — arithmetic only */}
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-x-pill bg-surface-2 px-3 py-1 text-text-700">
          جمع هفته: <span className="tnum font-bold text-text-900">{formatHours(total)}</span> ساعت
        </span>
        {!hasSchedule && (
          <span className="rounded-x-pill bg-surface-2 px-3 py-1 text-text-500">ساعت مدرسه‌اش ثبت نشده</span>
        )}
        {over.length > 0 && (
          <span className="flex items-center gap-1 rounded-x-pill bg-orange-500/10 px-3 py-1 text-orange-500">
            <AlertTriangle size={12} /> بیشتر از وقت آزاد: {over.join("، ")}
          </span>
        )}
      </div>

      {/* Days */}
      <div className="divide-y divide-border/60 rounded-x-md border border-border">
        {WEEK_DAYS.map((d) => {
          const tasks = copy.days[d] ?? [];
          const hours = dayHours(tasks);
          const free = freeHours(schedule, d);
          const isOver = hasSchedule && hours > free;
          const exam = week === "this" ? weekExams[d] : undefined;
          return (
            <div
              key={d}
              className={cn("p-3 transition-colors", dragOver === d && "bg-blue-100/60")}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("application/x-plan-task")) return;
                e.preventDefault();
                setDragOver(d);
              }}
              onDragLeave={() => setDragOver((cur) => (cur === d ? null : cur))}
              onDrop={(e) => {
                const raw = e.dataTransfer.getData("application/x-plan-task");
                setDragOver(null);
                if (!raw) return;
                const { day, id } = JSON.parse(raw) as { day: string; id: string };
                moveTask(studentId, week, day, d, id);
              }}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="w-16 text-sm font-bold text-text-900">{d}</span>
                <span className={cn("tnum text-xs", isOver ? "font-medium text-orange-500" : "text-text-500")}>
                  {formatHours(hours)} ساعت
                  {hasSchedule && <> از ~{formatHours(free)} آزاد</>}
                </span>
                {exam && (
                  <Badge tone="warning">
                    <FileText size={11} /> آزمون {exam.provider}
                  </Badge>
                )}
                {sessionSlot && slotDay(sessionSlot) === d && (
                  <Badge tone="info">
                    <Video size={11} /> جلسه {slotTime(sessionSlot)}
                  </Badge>
                )}
                {tasks.length > 0 && copyFrom !== d && (
                  <button
                    type="button"
                    onClick={() => {
                      setCopyFrom(d);
                      setCopyTo([]);
                    }}
                    className="mr-auto flex items-center gap-1 text-[11px] text-text-500 hover:text-blue-600"
                  >
                    <CopyPlus size={12} /> کپی این روز به…
                  </button>
                )}
              </div>

              {copyFrom === d && (
                <div className="mb-2 rounded-x-sm border border-blue-600/30 bg-blue-100/50 p-2.5 text-xs">
                  <div className="mb-1.5 text-text-700">درس‌های {d} به انتهای این روزها اضافه بشه:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS.filter((x) => x !== d).map((x) => (
                      <label
                        key={x}
                        className="flex cursor-pointer items-center gap-1 rounded-x-pill border border-border bg-surface px-2.5 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={copyTo.includes(x)}
                          onChange={(e) => setCopyTo((c) => (e.target.checked ? [...c, x] : c.filter((y) => y !== x)))}
                        />
                        {x}
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="md"
                      disabled={copyTo.length === 0}
                      onClick={() => {
                        copyDay(studentId, week, d, copyTo);
                        setCopyFrom(null);
                      }}
                    >
                      کپی
                    </Button>
                    <button type="button" onClick={() => setCopyFrom(null)} className="text-text-500">
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {tasks.map((t) =>
                  editing?.day === d && editing.id === t.id ? (
                    <TaskForm
                      key={t.id}
                      initial={t}
                      day={d}
                      onCancel={() => setEditing(null)}
                      onSave={(task, toDay) => {
                        updateTask(studentId, week, d, t.id, task);
                        if (toDay && toDay !== d) moveTask(studentId, week, d, toDay, t.id);
                        setEditing(null);
                      }}
                    />
                  ) : (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/x-plan-task", JSON.stringify({ day: d, id: t.id }));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragOver(null)}
                      className="flex cursor-grab items-start gap-1.5 rounded-x-sm bg-surface-2 px-2 py-2 text-sm active:cursor-grabbing"
                    >
                      <GripVertical size={14} className="mt-0.5 shrink-0 text-text-500/60" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-text-900">{t.subject}</span>{" "}
                        <span className="tnum rounded-x-sm bg-surface px-1.5 py-0.5 text-xs font-medium text-text-700">
                          {formatHours(t.hours)} ساعت
                        </span>
                        {t.topic && <span className="text-text-500"> — {t.topic}</span>}
                        {t.chapter && (
                          <div className="mt-0.5 text-[11px] text-text-500">
                            {t.chapter}
                            {t.subtopic && ` · ${t.subtopic}`}
                          </div>
                        )}
                        <BooksHint studentId={studentId} subject={t.subject} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditing({ day: d, id: t.id })}
                        aria-label={`ویرایش ${t.subject} ${d}`}
                        className="p-1 text-text-500 hover:text-blue-600"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(studentId, week, d, t.id)}
                        aria-label={`حذف ${t.subject} ${d}`}
                        className="p-1 text-text-500 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                )}
                {editing?.day === d && editing.id === null ? (
                  <TaskForm
                    onCancel={() => setEditing(null)}
                    onSave={(task) => {
                      addTask(studentId, week, d, task);
                      setEditing(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing({ day: d, id: null })}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Plus size={13} /> افزودن درس
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-text-700">یادداشت این هفته برای {studentName} (اختیاری)</span>
        <textarea
          value={copy.note}
          onChange={(e) => setPlanNote(studentId, week, e.target.value.slice(0, 300))}
          rows={2}
          placeholder="مثلاً: این هفته تمرکز روی تعادله. جمعه آزمون داری، پنجشنبه زود بخواب."
          className="w-full rounded-x-md border border-border bg-surface p-2.5 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="md" onClick={send} disabled={changes === 0}>
          <Send size={14} /> {p.published ? "ارسال تغییرات" : "ارسال"} برای {studentName}
        </Button>
        {changes > 0 && (
          <Button size="md" variant="secondary" onClick={() => discardDraft(studentId, week)}>
            <Undo2 size={14} /> لغو تغییرات
          </Button>
        )}
        {sendError && <span className="text-xs text-red-500">{sendError}</span>}
        {sent === week && changes === 0 && !sendError && (
          <span className="flex items-center gap-1 text-xs text-mint-500">
            <Check size={13} /> ارسال شد — {studentName} الان توی برنامه و تقویمش می‌بینه.
          </span>
        )}
      </div>
      {week === "this" && changes > 0 && (
        <p className="mt-2 text-[11px] text-text-500">
          تغییر برنامه‌ی وسط هفته: تیک‌هایی که {studentName} زده برای درس‌هایی که عوض نکردی می‌مونن.
        </p>
      )}
    </div>
  );
}

function TaskForm({
  initial,
  day,
  onSave,
  onCancel,
}: {
  initial?: PlanTask;
  day?: string; // set when editing: lets the task move to another day (keyboard/mobile alternative to dragging)
  onSave: (t: Omit<PlanTask, "id">, toDay?: string) => void;
  onCancel: () => void;
}) {
  const [toDay, setToDay] = useState(day ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [hours, setHours] = useState(initial?.hours ?? 0);
  const [chapter, setChapter] = useState(initial?.chapter ?? "");
  const [subtopic, setSubtopic] = useState(initial?.subtopic ?? "");
  const [more, setMore] = useState(Boolean(initial?.chapter));
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return setError("درس رو انتخاب کن.");
    if (!hours) return setError("ساعتش رو انتخاب کن.");
    if (subtopic.trim() && !chapter.trim()) return setError("اول فصل رو بنویس، بعد ریز مبحث.");
    onSave(
      {
        subject,
        topic: topic.trim(),
        hours,
        ...(chapter.trim() ? { chapter: chapter.trim(), subtopic: subtopic.trim() || undefined } : {}),
      },
      toDay || undefined
    );
  }

  return (
    <form onSubmit={submit} className="rounded-x-sm border border-blue-600/30 bg-blue-100/50 p-2.5" noValidate>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_2fr_1fr]">
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setError("");
          }}
          aria-label="درس"
          className={fieldClass}
        >
          <option value="">درس</option>
          {CHECKIN_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={hours || ""}
          onChange={(e) => {
            setHours(Number(e.target.value));
            setError("");
          }}
          aria-label="ساعت"
          className={cn(fieldClass, "sm:order-last")}
        >
          <option value="">ساعت</option>
          {PLAN_HOUR_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {formatHours(h)} ساعت
            </option>
          ))}
        </select>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, 80))}
          placeholder="مبحث — مثلاً تعادل شیمیایی، تست"
          aria-label="مبحث"
          className={cn(fieldClass, "col-span-2 sm:col-span-1")}
        />
      </div>
      {more ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={chapter}
            onChange={(e) => {
              setChapter(e.target.value.slice(0, 60));
              setError("");
            }}
            placeholder="فصل"
            aria-label="فصل"
            className={fieldClass}
          />
          <input
            value={subtopic}
            onChange={(e) => {
              setSubtopic(e.target.value.slice(0, 60));
              setError("");
            }}
            placeholder="ریز مبحث"
            aria-label="ریز مبحث"
            className={fieldClass}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMore(true)}
          className="mt-1.5 text-[11px] text-blue-600 hover:underline"
        >
          + فصل و ریز مبحث
        </button>
      )}
      {day && (
        <label className="mt-2 flex items-center gap-2 text-xs text-text-700">
          روز:
          <select
            value={toDay}
            onChange={(e) => setToDay(e.target.value)}
            aria-label="روز"
            className={cn(fieldClass, "text-xs")}
          >
            {WEEK_DAYS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button type="submit" size="md">
          {initial ? "ذخیره" : "افزودن"}
        </Button>
        <button type="button" onClick={onCancel} className="text-xs text-text-500">
          انصراف
        </button>
      </div>
    </form>
  );
}
