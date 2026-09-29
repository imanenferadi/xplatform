"use client";

import { useState } from "react";
import { Check, UserCheck, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { can, rolesWith } from "@/lib/permissions";
import { useMe } from "@/lib/staff-store";
import {
  PERM_FOR,
  decideApproval,
  fa,
  usePendingApprovals,
  type Approval,
  type ApprovalKind,
} from "@/lib/billing-store";
import { formatJalali, toPersianDigits } from "@/lib/utils";

const TITLE: Record<ApprovalKind, string> = {
  manual_payment: "ثبت دستی پرداخت",
  payout_correction: "اصلاح مبلغ تسویه",
  gift: "هدیه‌ی تمدید",
};

/** «منتظر تأیید نفر دوم» — the person who asked sees it waiting; someone else decides. */
export function BillingApprovals({ kinds }: { kinds: ApprovalKind[] }) {
  const pending = usePendingApprovals(kinds);
  if (pending.length === 0) return null;
  return (
    <Card className="mb-6 border-orange-500/40">
      <CardContent>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text-900">
          <UserCheck size={15} className="text-orange-500" /> منتظر تأیید نفر
          دوم
          <Badge tone="warning">{toPersianDigits(pending.length)}</Badge>
        </h2>
        <p className="mb-3 text-xs text-text-500">
          هر ثبتی که پول ثبت می‌کنه یا مبلغ رو عوض می‌کنه، باید یک نفر دیگه
          تأییدش کنه — کسی که ثبتش کرده نمی‌تونه.
        </p>
        <div className="space-y-2">
          {pending.map((a) => (
            <ApprovalItem key={a.id} a={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalItem({ a }: { a: Approval }) {
  const me = useMe();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const mine = a.createdBy === me.name;
  const allowed = can(me.role, PERM_FOR[a.kind]);

  function decide(approve: boolean) {
    const err = decideApproval(a.id, approve, reason);
    if (err) return setError(err);
    toast(approve ? `${TITLE[a.kind]} تأیید و اعمال شد` : "رد شد");
  }

  return (
    <div className="rounded-x-md bg-surface-2 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="warning">{TITLE[a.kind]}</Badge>
        <span className="font-medium text-text-900">
          {a.manual?.userName ?? a.payout?.mentorName ?? a.gift?.userName}
        </span>
        <span className="text-xs text-text-500">
          · ثبت: {a.createdBy} · {a.createdAt}
        </span>
      </div>
      <div className="mt-1.5 text-xs leading-[1.9] text-text-700">
        {a.manual && (
          <>
            {fa(a.manual.amount)} تومان · کد پیگیری{" "}
            <span dir="ltr">{a.manual.ref}</span> · پرداخت{" "}
            {formatJalali(a.manual.paidIso)} — «{a.manual.note}»
          </>
        )}
        {a.payout && (
          <>
            {fa(a.payout.fromGross)} ← <strong>{fa(a.payout.toGross)}</strong>{" "}
            تومان — «{a.payout.reason}»
          </>
        )}
        {a.gift && (
          <>
            {toPersianDigits(a.gift.days)} روز تمدید — «{a.gift.reason}»
          </>
        )}
      </div>

      {mine ? (
        <p className="mt-2 text-xs text-text-500">
          خودت ثبتش کردی — منتظر نفر دوم ({rolesWith(PERM_FOR[a.kind])}).
        </p>
      ) : !allowed ? (
        <p className="mt-2 text-xs text-text-500">
          تأیید فقط با نقش {rolesWith(PERM_FOR[a.kind])}.
        </p>
      ) : rejecting ? (
        <div className="mt-2 space-y-2">
          <input
            value={reason}
            onChange={(e) => {
              setReason(e.target.value.slice(0, 160));
              setError("");
            }}
            placeholder="دلیل رد (اجباری)"
            aria-label="دلیل رد"
            className="h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900"
          />
          {error && (
            <p role="alert" className="text-xs text-red-500">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="md" onClick={() => decide(false)}>
              رد
            </Button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="text-xs text-text-500"
            >
              انصراف
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {error}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Button size="md" onClick={() => decide(true)}>
              <Check size={14} /> تأیید و اعمال
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => setRejecting(true)}
            >
              <X size={14} /> رد
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
