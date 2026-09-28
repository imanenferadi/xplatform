"use client";

import { useState } from "react";
import { Check, CornerUpLeft, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import type { Ticket, TicketReferral } from "@/lib/mock-data";
import { REFERRAL_TARGETS, ROLE_META, type StaffRole } from "@/lib/permissions";
import { useCan, useMe } from "@/lib/staff-store";
import { answerReferral, cancelReferral, referTicket } from "@/lib/ticket-store";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-x-sm border border-border bg-surface px-3 py-2 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";
const roleLabel = (r: string) => ROLE_META[r as StaffRole].label;

const STATUS: Record<TicketReferral["status"], { label: string; tone: "warning" | "success" | "neutral" | "danger" }> =
  {
    open: { label: "منتظر", tone: "warning" },
    done: { label: "انجام شد", tone: "success" },
    returned: { label: "برگشت خورد", tone: "danger" },
    cancelled: { label: "لغو شد", tone: "neutral" },
  };

// Hand a ticket to the role that can actually do the work, and bring the
// answer back — so nothing stalls between two teams.
export function ReferralPanel({ ticket: t }: { ticket: Ticket }) {
  const me = useMe();
  const canAct = useCan()("tickets.act");
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState<StaffRole | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const referrals = t.referrals ?? [];
  const targets = REFERRAL_TARGETS.filter((r) => r !== me.role);

  function send() {
    if (!to) return setError("نقش مقصد رو انتخاب کن.");
    const err = referTicket(t.id, me.role, to, note);
    if (err) return setError(err);
    toast(`به ${ROLE_META[to].label} ارجاع شد`);
    setOpen(false);
    setTo("");
    setNote("");
    setError("");
  }

  return (
    <div className="rounded-x-md border border-border p-3 text-xs">
      <div className="mb-2 flex items-center gap-1.5 font-bold text-text-900">
        <CornerUpLeft size={13} /> ارجاع
      </div>

      {referrals.length > 0 && (
        <ul className="mb-2 space-y-2">
          {referrals.map((r) => (
            <ReferralItem key={r.id} ticketId={t.id} r={r} myRole={me.role} canAct={canAct} />
          ))}
        </ul>
      )}

      {!canAct ? (
        referrals.length === 0 && <p className="text-text-500">ارجاعی نداره.</p>
      ) : open ? (
        <div className="space-y-2">
          <select
            value={to}
            onChange={(e) => {
              setTo(e.target.value as StaffRole);
              setError("");
            }}
            aria-label="ارجاع به"
            className={cn(fieldClass, "h-9 py-0")}
          >
            <option value="">ارجاع به…</option>
            {targets.map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label} — {ROLE_META[r].desc}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value.slice(0, 300));
              setError("");
            }}
            rows={2}
            aria-label="یادداشت ارجاع"
            placeholder="دقیقاً چیکار کنن؟ مثلاً: شبای جدید پیوست تیکته؛ بعد از تأیید مالکیت، برای تسویه‌ی شهریور ثبتش کنید."
            className={fieldClass}
          />
          {error && (
            <p role="alert" className="text-red-500">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="md" onClick={send}>
              ارجاع
            </Button>
            <button type="button" onClick={() => setOpen(false)} className="text-text-500">
              انصراف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <CornerUpLeft size={12} /> ارجاع به نقش دیگه
        </button>
      )}
    </div>
  );
}

function ReferralItem({
  ticketId,
  r,
  myRole,
  canAct,
}: {
  ticketId: string;
  r: TicketReferral;
  myRole: StaffRole;
  canAct: boolean;
}) {
  const [mode, setMode] = useState<"done" | "returned" | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const forMe = r.status === "open" && r.toRole === myRole && canAct;
  const mine = r.status === "open" && r.fromRole === myRole && canAct;

  function submit() {
    if (!mode) return;
    const err = answerReferral(ticketId, r.id, mode, answer);
    if (err) return setError(err);
    toast(mode === "done" ? "ثبت شد — برگشت به ارجاع‌دهنده" : "برگشت داده شد");
    setMode(null);
    setAnswer("");
  }

  return (
    <li className={cn("rounded-x-sm p-2.5", forMe ? "bg-orange-500/10" : "bg-surface-2")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium text-text-900">
          {roleLabel(r.fromRole)} ← {roleLabel(r.toRole)}
        </span>
        <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
      </div>
      <p className="mt-1 text-text-700">«{r.note}»</p>
      <p className="mt-0.5 text-text-500">
        {r.by} · {r.at}
      </p>
      {r.answer && (
        <p className="mt-1 border-t border-border pt-1 text-text-700">
          {r.status === "done" ? "✓ " : "↩ "}
          {r.answer} <span className="text-text-500">— {r.answeredBy}</span>
        </p>
      )}

      {forMe &&
        (mode ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value.slice(0, 300));
                setError("");
              }}
              rows={2}
              aria-label={mode === "done" ? "چه کاری انجام شد" : "دلیل برگردوندن"}
              placeholder={mode === "done" ? "چی انجام دادی؟" : "چرا برمی‌گردونی؟ مثلاً اطلاعات کافی نیست"}
              className={fieldClass}
            />
            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="md" onClick={submit}>
                ثبت
              </Button>
              <button type="button" onClick={() => setMode(null)} className="text-text-500">
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Button size="md" onClick={() => setMode("done")}>
              <Check size={13} /> انجام شد
            </Button>
            <Button size="md" variant="secondary" onClick={() => setMode("returned")}>
              <Undo2 size={13} /> برگردون
            </Button>
          </div>
        ))}

      {mine && (
        <button
          type="button"
          onClick={() => {
            cancelReferral(ticketId, r.id);
            toast("ارجاع لغو شد");
          }}
          className="mt-1.5 flex items-center gap-1 text-text-500 hover:text-red-500"
        >
          <X size={12} /> لغو این ارجاع
        </button>
      )}
    </li>
  );
}
