"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, Check, X, ArrowLeft, Star } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  mentors,
  mentorResponseHours,
  reassignHistory,
  studentAssignments,
  REASSIGN_REASONS,
  REASSIGN_TRANSFERS,
  type ReassignRecord,
  type StudentAssignment,
} from "@/lib/mock-data";
import {
  Allowed,
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  FollowUpBadges,
} from "@/components/admin/AdminKit";
import { nowClock } from "@/lib/followup-store";
import { currentAdminName, useCan } from "@/lib/staff-store";
import { decideProposal, propose, useProposals, type ReassignProposal } from "@/lib/reassign-proposals";
import { useCapacityOverrides } from "@/lib/capacity-store";
import { logEvent } from "@/lib/admin-log-store";

import { cn, toPersianDigits } from "@/lib/utils";

function mentorName(id: string) {
  return mentors.find((m) => m.id === id)?.name ?? "—";
}

// Slow replies are the most common reason students ask for a new mentor.
function ResponseTime({ mentorId }: { mentorId: string }) {
  const h = mentorResponseHours[mentorId];
  if (h == null) return null;
  return (
    <span className={cn(h > 24 ? "text-red-500" : "text-text-500")}>
      پاسخ حدود <span className="tnum">{toPersianDigits(h)}</span> ساعت
    </span>
  );
}

// Admin-only: the student asks support (or files a complaint), ops decides
// and moves the case file. There's deliberately no button for this in the
// student panel.
function Reassign() {
  const preselect = useSearchParams().get("student") ?? "";
  const remainingSeats = useCapacityOverrides();
  const [assignments, setAssignments] = useState<StudentAssignment[]>(studentAssignments);
  const [userId, setUserId] = useState(studentAssignments.some((a) => a.userId === preselect) ? preselect : "");
  const [newMentorId, setNewMentorId] = useState("");
  const [reason, setReason] = useState("");
  const [handover, setHandover] = useState("");
  const [errors, setErrors] = useState<{ mentor?: string; reason?: string }>({});
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<ReassignRecord[]>(reassignHistory);
  const [openId, setOpenId] = useState<string | null>(null);
  const [lastDone, setLastDone] = useState("");
  const allowed = useCan();
  const canExecute = allowed("reassign.execute");
  const canPropose = !canExecute && allowed("reassign.propose");
  const proposals = useProposals();
  const [fromProposal, setFromProposal] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const student = assignments.find((a) => a.userId === userId);
  const candidates = student ? mentors.filter((m) => m.group === student.group && m.id !== student.mentorId) : [];

  function pickStudent(id: string) {
    setUserId(id);
    setNewMentorId("");
    setErrors({});
    setConfirming(false);
  }

  function review(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!newMentorId) next.mentor = "مشاور جدید رو انتخاب کن.";
    if (!reason) next.reason = "دلیل تعویض رو انتخاب کن — توی لاگ ثبت می‌شه.";
    setErrors(next);
    if (Object.keys(next).length === 0) setConfirming(true);
  }

  function sendProposal() {
    if (!student) return;
    propose({
      userId: student.userId,
      studentName: student.name,
      fromMentor: mentorName(student.mentorId),
      toMentorId: newMentorId,
      toMentor: mentorName(newMentorId),
      reason,
      handover: handover.trim(),
    });
    setLastDone(`پیشنهاد فرستاده شد: ${student.name} ← ${mentorName(newMentorId)} (منتظر مدیر عملیات)`);
    setUserId("");
    setNewMentorId("");
    setReason("");
    setHandover("");
    setConfirming(false);
  }

  function reviewProposal(p: ReassignProposal) {
    setFromProposal(p.id);
    setUserId(p.userId);
    setNewMentorId(p.toMentorId);
    setReason(p.reason);
    setHandover(p.handover);
    setErrors({});
    setConfirming(true);
  }

  function confirm() {
    if (!student) return;
    if (fromProposal) {
      decideProposal(fromProposal, "executed");
      setFromProposal(null);
    }
    logEvent({
      category: "مشاوران",
      action: "تعویض مشاور",
      target: student.name,
      severity: "warning",
      details: [
        { label: "مشاور قبلی", value: mentorName(student.mentorId) },
        { label: "مشاور جدید", value: mentorName(newMentorId) },
        { label: "دلیل", value: reason },
        ...(handover.trim() ? [{ label: "یادداشت تحویل", value: handover.trim() }] : []),
      ],
      href: "/admin/reassign",
    });
    setHistory((h) => [
      {
        id: `ra-${Date.now()}`,
        student: student.name,
        from: mentorName(student.mentorId),
        to: mentorName(newMentorId),
        reason,
        handover: handover.trim(),
        date: `۷ مهر ۱۴۰۵، ${nowClock()}`,
        admin: currentAdminName(),
      },
      ...h,
    ]);
    setLastDone(`${student.name}: ${mentorName(student.mentorId)} ← ${mentorName(newMentorId)}`);
    setAssignments((as) => as.map((a) => (a.userId === student.userId ? { ...a, mentorId: newMentorId } : a)));
    setUserId("");
    setNewMentorId("");
    setReason("");
    setHandover("");
    setConfirming(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-1 flex items-center gap-2">
        <ArrowLeftRight size={18} className="text-blue-600" />
        <h1 className="text-xl font-bold text-text-900">تعویض مشاور</h1>
      </div>
      <p className="mb-6 text-sm text-text-500">
        فقط از اینجا انجام می‌شه — دانش‌آموز از پشتیبانی یا ثبت شکایت درخواست می‌ده، تیم تصمیم می‌گیره.
      </p>

      {lastDone && (
        <div className="mb-5 flex items-center gap-2 rounded-x-md border border-mint-500/30 bg-mint-500/10 p-3 text-sm">
          <Check size={15} className="shrink-0 text-mint-500" />
          <span className="text-text-900">{lastDone}</span>
          <span className="text-xs text-text-500">· به دانش‌آموز و هر دو مشاور اطلاع داده شد</span>
        </div>
      )}

      {proposals.length > 0 && (canExecute || canPropose || allowed("reassign.view")) && (
        <Card className="mb-5">
          <CardContent>
            <h2 className="mb-3 text-sm font-bold text-text-900">پیشنهادهای تعویض از پشتیبانی آموزشی</h2>
            <ul className="space-y-2 text-sm">
              {proposals.map((p) => (
                <li key={p.id} className="rounded-x-md bg-surface-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-text-900">{p.studentName}</span>
                    <span className="text-text-500">
                      {p.fromMentor} ← {p.toMentor}
                    </span>
                    <Badge tone={p.status === "pending" ? "warning" : p.status === "executed" ? "success" : "neutral"}>
                      {p.status === "pending" ? "منتظر بررسی" : p.status === "executed" ? "اجرا شد" : "رد شد"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-text-500">
                    {p.reason} · پیشنهاد: {p.by}، {p.at}
                    {p.decidedBy && ` · تصمیم: ${p.decidedBy}`}
                    {p.rejectNote && ` — «${p.rejectNote}»`}
                  </div>
                  {p.status === "pending" &&
                    canExecute &&
                    (rejecting === p.id ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value.slice(0, 120))}
                          placeholder="دلیل رد (اجباری)"
                          aria-label="دلیل رد پیشنهاد"
                          className="h-9 flex-1 rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
                        />
                        <Button
                          size="md"
                          disabled={!rejectNote.trim()}
                          onClick={() => {
                            decideProposal(p.id, "rejected", rejectNote.trim());
                            setRejecting(null);
                            setRejectNote("");
                          }}
                        >
                          رد
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <Button size="md" onClick={() => reviewProposal(p)}>
                          بررسی و اجرا
                        </Button>
                        <Button size="md" variant="secondary" onClick={() => setRejecting(p.id)}>
                          رد
                        </Button>
                      </div>
                    ))}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <form onSubmit={review} noValidate className="space-y-5">
            <div>
              <label htmlFor="student" className="mb-1.5 block text-sm font-medium text-text-700">
                دانش‌آموز
              </label>
              <select
                id="student"
                value={userId}
                onChange={(e) => pickStudent(e.target.value)}
                className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900"
              >
                <option value="">انتخاب دانش‌آموز</option>
                {assignments.map((a) => (
                  <option key={a.userId} value={a.userId}>
                    {a.name} — {a.group} — مشاور فعلی: {mentorName(a.mentorId)}
                  </option>
                ))}
              </select>
            </div>

            {student && (
              <>
                <div className="rounded-x-md bg-surface-2 p-3 text-xs text-text-700">
                  مشاور فعلی: <span className="font-medium text-text-900">{mentorName(student.mentorId)}</span> ·{" "}
                  <ResponseTime mentorId={student.mentorId} />
                </div>
                <div>
                  <div className="mb-1.5 text-sm font-medium text-text-700">
                    مشاور جدید <span className="font-normal text-text-500">(فقط گروه {student.group})</span>
                  </div>
                  {candidates.length === 0 && <p className="text-xs text-text-500">مشاور دیگه‌ای در این گروه نیست.</p>}
                  <div className="space-y-2">
                    {candidates.map((m) => {
                      const seats = remainingSeats(m);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={seats === 0}
                          onClick={() => {
                            setNewMentorId(m.id);
                            setErrors((er) => ({ ...er, mentor: undefined }));
                            setConfirming(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-x-md border-2 p-3 text-right transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                            newMentorId === m.id ? "border-blue-600 bg-blue-100" : "border-border bg-surface"
                          )}
                        >
                          <Avatar name={m.name} size="sm" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-900">{m.name}</div>
                            <div className="flex items-center gap-1 text-xs text-text-500">
                              {m.rank} · {m.style} ·
                              <Star size={11} className="fill-yellow-400 text-yellow-400" />
                              <span className="tnum">{toPersianDigits(m.rating)}</span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-500">
                              <span>
                                <span className="tnum">{toPersianDigits(m.capacityTotal - m.capacity)}</span> دانش‌آموز
                                فعال
                              </span>
                              · <ResponseTime mentorId={m.id} />
                            </div>
                          </div>
                          <Badge tone={seats === 0 ? "danger" : "success"}>
                            {seats === 0 ? "ظرفیت تکمیل" : `${toPersianDigits(seats)} جای خالی`}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                  {errors.mentor && <p className="mt-1.5 text-xs text-red-500">{errors.mentor}</p>}
                </div>

                <div>
                  <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-text-700">
                    دلیل
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setErrors((er) => ({ ...er, reason: undefined }));
                    }}
                    className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900"
                  >
                    <option value="">انتخاب دلیل</option>
                    {REASSIGN_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.reason && <p className="mt-1.5 text-xs text-red-500">{errors.reason}</p>}
                </div>

                <div>
                  <label htmlFor="handover" className="mb-1.5 block text-sm font-medium text-text-700">
                    یادداشت تحویل برای مشاور جدید <span className="font-normal text-text-500">(اختیاری)</span>
                  </label>
                  <textarea
                    id="handover"
                    value={handover}
                    onChange={(e) => setHandover(e.target.value)}
                    rows={3}
                    placeholder="مثلاً: دو هفته بی‌پاسخ مونده، انگیزه‌اش پایینه؛ جلسه‌ی اول رو زودتر بذار."
                    className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                  />
                </div>

                <div className="grid gap-3 rounded-x-md bg-surface-2 p-3 text-xs sm:grid-cols-2">
                  <div>
                    <div className="mb-1 font-medium text-text-900">منتقل می‌شه</div>
                    <ul className="space-y-1 text-text-700">
                      {REASSIGN_TRANSFERS.moves.map((t) => (
                        <li key={t} className="flex items-start gap-1.5">
                          <Check size={12} className="mt-0.5 shrink-0 text-mint-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 font-medium text-text-900">منتقل نمی‌شه</div>
                    <ul className="space-y-1 text-text-700">
                      {REASSIGN_TRANSFERS.stays.map((t) => (
                        <li key={t} className="flex items-start gap-1.5">
                          <X size={12} className="mt-0.5 shrink-0 text-red-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {confirming ? (
                  <div className="rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm text-text-900">
                      {student.name} از <span className="font-medium">{mentorName(student.mentorId)}</span>
                      <ArrowLeft size={14} />
                      <span className="font-medium">{mentorName(newMentorId)}</span> منتقل بشه؟
                    </p>
                    <div className="mt-3 flex gap-2">
                      {canExecute ? (
                        <Button type="button" size="md" onClick={confirm}>
                          تأیید تعویض
                        </Button>
                      ) : (
                        <Button type="button" size="md" onClick={sendProposal}>
                          ارسال پیشنهاد به مدیر عملیات
                        </Button>
                      )}
                      <Button type="button" size="md" variant="secondary" onClick={() => setConfirming(false)}>
                        برگشت
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Allowed perm={canPropose ? "reassign.propose" : "reassign.execute"}>
                    <Button type="submit" size="md">
                      {canPropose ? "بررسی و پیشنهاد" : "بررسی و تعویض"}
                    </Button>
                  </Allowed>
                )}
              </>
            )}
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-3 mt-8 text-sm font-bold text-text-900">
        سابقه‌ی تعویض‌ها <span className="tnum font-normal text-text-500">({toPersianDigits(history.length)})</span>
      </h2>
      <div className="space-y-2">
        {history.map((h) => {
          const key = `reassign:${h.id}`;
          return (
            <AdminRow
              key={h.id}
              open={openId === h.id}
              onToggle={() => setOpenId(openId === h.id ? null : h.id)}
              summary={
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="font-medium text-text-900">{h.student}</span>
                    <span className="text-text-700">
                      {h.from} ← {h.to}
                    </span>
                    <FollowUpBadges entityKey={key} />
                  </div>
                  <div className="mt-0.5 text-xs text-text-500">
                    {h.reason} · {h.date}
                  </div>
                </div>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <DetailList
                    title="جزئیات تعویض"
                    rows={[
                      ["دانش‌آموز", h.student],
                      ["مشاور قبلی", h.from],
                      ["مشاور جدید", h.to],
                      ["دلیل", h.reason],
                      ["یادداشت تحویل", h.handover || "—"],
                      ["زمان", h.date],
                      ["انجام‌دهنده", h.admin],
                      ["منتقل شد", REASSIGN_TRANSFERS.moves.join("، ")],
                    ]}
                  />
                  <EntityActivity match={h.student} />
                </div>
                <EntityFollowUp entityKey={key} />
              </div>
            </AdminRow>
          );
        })}
      </div>
    </div>
  );
}

export default function ReassignPage() {
  return (
    <AdminShell>
      <Suspense>
        <Reassign />
      </Suspense>
    </AdminShell>
  );
}
