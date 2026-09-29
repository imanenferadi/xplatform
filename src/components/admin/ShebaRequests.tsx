"use client";

import { useState } from "react";
import { Landmark, Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { Allowed } from "@/components/admin/AdminKit";
import { bankOf, formatIban, maskIban } from "@/lib/iban";
import {
  SHEBA_HOLD_HOURS,
  decideSheba,
  holderMatches,
  useShebaRequests,
  type ShebaRequest,
} from "@/lib/payout-account-store";
import { cn, toPersianDigits } from "@/lib/utils";

export const SHEBA_REJECT_REASONS = [
  "حساب به نام خود مشاور نیست",
  "استعلام بانکی تأیید نکرد",
  "شماره‌ی شبا با مدرک پیوست‌شده یکی نیست",
  "درخواست مشکوک — با مشاور تماس گرفته شد و تأیید نکرد",
];

/** Finance reviews IBAN change requests: full new IBAN, holder check, verify, decide. */
export function ShebaRequests() {
  const requests = useShebaRequests();
  const pending = requests.filter((r) => r.status === "pending");
  const recent = requests.filter((r) => r.status === "approved" || r.status === "rejected").slice(0, 3);
  if (pending.length === 0 && recent.length === 0) return null;

  return (
    <Card className={cn("mb-6", pending.length > 0 && "border-orange-500/40")}>
      <CardContent>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text-900">
          <Landmark size={15} className="text-blue-600" /> تغییر شبا
          {pending.length > 0 && <Badge tone="warning">{toPersianDigits(pending.length)} منتظر</Badge>}
        </h2>
        <div className="space-y-3">
          {pending.map((r) => (
            <PendingSheba key={r.id} r={r} />
          ))}
        </div>
        {recent.length > 0 && (
          <ul
            className={cn("space-y-1 text-xs text-text-500", pending.length > 0 && "mt-3 border-t border-border pt-3")}
          >
            {recent.map((r) => (
              <li key={r.id}>
                {r.mentorName}: <span dir="ltr">{maskIban(r.newSheba)}</span> —{" "}
                {r.status === "approved" ? "تأیید شد" : `رد شد («${r.decisionNote}»)`} · {r.decidedBy} · {r.decidedAt}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PendingSheba({ r }: { r: ShebaRequest }) {
  const [verified, setVerified] = useState(false);
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const match = holderMatches(r.holder, r.mentorName);

  function decide(approve: boolean) {
    const text = approve ? note : [reason, note.trim()].filter(Boolean).join(" — ");
    // Date.now() lives in the handler, not in render.
    const err = decideSheba(r.id, approve, text, Date.now());
    if (err) return setError(err);
    toast(
      approve
        ? `شبای ${r.mentorName} تأیید شد — تسویه‌ی بعدی ${toPersianDigits(SHEBA_HOLD_HOURS)} ساعت صبر می‌کنه`
        : "درخواست رد شد"
    );
  }

  return (
    <div className="rounded-x-md bg-surface-2 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-text-900">{r.mentorName}</span>
        <span className="text-xs text-text-500">· درخواست {r.requestedAt}</span>
      </div>
      <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-[auto_1fr]">
        <dt className="text-text-500">شبای فعلی</dt>
        <dd dir="ltr" className="text-right font-mono text-text-700">
          {r.oldSheba ? `${maskIban(r.oldSheba)} (${bankOf(r.oldSheba)})` : "—"}
        </dd>
        <dt className="text-text-500">شبای جدید</dt>
        <dd className="text-text-900">
          <span dir="ltr" className="font-mono font-medium">
            {formatIban(r.newSheba)}
          </span>{" "}
          · بانک {bankOf(r.newSheba)}
        </dd>
        <dt className="text-text-500">صاحب حساب</dt>
        <dd className={match ? "text-mint-500" : "font-medium text-red-500"}>
          {r.holder} {match ? "✓ با اسم مشاور یکیه" : "✗ با اسم مشاور یکی نیست"}
        </dd>
        {r.note && (
          <>
            <dt className="text-text-500">توضیح مشاور</dt>
            <dd className="text-text-700">«{r.note}»</dd>
          </>
        )}
      </dl>

      <Allowed perm="sheba.decide">
        {mode === null ? (
          <div className="mt-3 space-y-2">
            <label className="flex items-start gap-2 text-xs text-text-700">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
              مالکیت این حساب رو با استعلام بانکی تأیید کردم (نام صاحب حساب در استعلام = {r.mentorName}).
              <span className="text-text-500"> در نسخه‌ی نمایشی استعلام دستیه.</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button size="md" disabled={!verified} onClick={() => (match ? decide(true) : setMode("approve"))}>
                <Check size={14} /> تأیید تغییر
              </Button>
              <Button size="md" variant="secondary" onClick={() => setMode("reject")}>
                <X size={14} /> رد
              </Button>
            </div>
          </div>
        ) : mode === "approve" ? (
          <div className="mt-3 space-y-2">
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle size={13} /> اسم صاحب حساب با مشاور یکی نیست — برای تأیید، دلیلش رو بنویس.
            </p>
            <input
              value={note}
              onChange={(e) => {
                setNote(e.target.value.slice(0, 160));
                setError("");
              }}
              placeholder="مثلاً: حساب مشترک با همسر؛ با مشاور تلفنی تأیید شد"
              aria-label="دلیل تأیید با اسم متفاوت"
              className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
            />
            {error && (
              <p role="alert" className="text-xs text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="md" onClick={() => decide(true)}>
                تأیید با این دلیل
              </Button>
              <button type="button" onClick={() => setMode(null)} className="text-xs text-text-500">
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {SHEBA_REJECT_REASONS.map((x) => (
                <button
                  key={x}
                  type="button"
                  aria-pressed={reason === x}
                  onClick={() => {
                    setReason(x);
                    setError("");
                  }}
                  className={cn(
                    "rounded-x-pill border px-3 py-1 text-xs",
                    reason === x ? "border-blue-600 bg-blue-100 text-text-900" : "border-border text-text-700"
                  )}
                >
                  {x}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => {
                setNote(e.target.value.slice(0, 160));
                setError("");
              }}
              placeholder="توضیح بیشتر (اگه دلیل بالا نیست، اجباری)"
              aria-label="توضیح رد"
              className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
            />
            {error && (
              <p role="alert" className="text-xs text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="md" onClick={() => decide(false)}>
                رد درخواست
              </Button>
              <button type="button" onClick={() => setMode(null)} className="text-xs text-text-500">
                انصراف
              </button>
            </div>
          </div>
        )}
      </Allowed>
    </div>
  );
}
