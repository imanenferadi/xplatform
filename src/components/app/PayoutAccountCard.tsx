"use client";

import { useEffect, useState } from "react";
import { Landmark, ShieldCheck, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, FormActions, fieldClass } from "@/components/ui/Form";
import { toast } from "@/components/ui/Toaster";
import { bankOf, checkIban, maskIban } from "@/lib/iban";
import {
  SHEBA_HOLD_HOURS,
  cancelShebaRequest,
  holderMatches,
  markShebaDecisionSeen,
  requestShebaChange,
  useMyShebaRequests,
  usePayoutAccounts,
} from "@/lib/payout-account-store";
import { toPersianDigits } from "@/lib/utils";

/** «حساب تسویه» — the mentor sees where payouts go and asks to change it. */
export function PayoutAccountCard({ mentorId, mentorName }: { mentorId: string; mentorName: string }) {
  const account = usePayoutAccounts()[mentorId];
  const requests = useMyShebaRequests(mentorId);
  const pending = requests.find((r) => r.status === "pending");
  const lastDecided = requests.find((r) => r.status === "approved" || r.status === "rejected");
  const [open, setOpen] = useState(false);
  const [sheba, setSheba] = useState("");
  const [holder, setHolder] = useState(mentorName);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ sheba?: string; holder?: string; form?: string }>({});

  // Seeing this card is how a decision reaches the mentor; clear «کارهای امروز».
  useEffect(() => markShebaDecisionSeen(mentorId), [mentorId, lastDecided?.id]);

  const check = sheba.trim() ? checkIban(sheba) : null;
  const nameMismatch = holder.trim() !== "" && !holderMatches(holder, mentorName);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = checkIban(sheba);
    const next: typeof errors = {};
    if (!c.ok) next.sheba = c.error;
    if (!holder.trim()) next.holder = "اسم صاحب حساب رو بنویس.";
    if (next.sheba || next.holder) return setErrors(next);
    const err = requestShebaChange(mentorId, (c as { iban: string }).iban, holder, note);
    if (err) return setErrors({ form: err });
    toast("درخواست تغییر شبا برای تیم مالی فرستاده شد");
    setOpen(false);
    setSheba("");
    setNote("");
    setErrors({});
  }

  return (
    <Card className="mt-4">
      <CardContent>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text-900">
          <Landmark size={15} className="text-blue-600" /> حساب تسویه
        </h2>

        {account ? (
          <div className="rounded-x-md bg-surface-2 p-3 text-sm">
            <div dir="ltr" className="tnum text-right font-medium text-text-900">
              {maskIban(account.sheba)}
            </div>
            <div className="mt-0.5 text-xs text-text-500">
              بانک {bankOf(account.sheba)} · به نام {account.holder} · از {account.since}
            </div>
          </div>
        ) : (
          <p className="text-sm text-orange-500">هنوز شبایی ثبت نکردی — تسویه بدون شبا انجام نمی‌شه.</p>
        )}

        {lastDecided && !pending && (
          <p
            className={`mt-3 rounded-x-md p-3 text-xs leading-[1.8] ${
              lastDecided.status === "approved" ? "bg-mint-500/10 text-text-700" : "bg-red-500/10 text-text-700"
            }`}
          >
            {lastDecided.status === "approved" ? (
              <>
                ✓ شبای جدیدت ({maskIban(lastDecided.newSheba)}) تأیید شد ({lastDecided.decidedAt}). برای امنیت، اولین
                تسویه به این حساب تا {toPersianDigits(SHEBA_HOLD_HOURS)} ساعت بعد از تأیید انجام نمی‌شه. اگه این تغییر
                کار تو نبوده، همین الان به پشتیبانی خبر بده.
              </>
            ) : (
              <>
                درخواست تغییر شبا ({maskIban(lastDecided.newSheba)}) رد شد: «{lastDecided.decisionNote}»
              </>
            )}
          </p>
        )}

        {pending ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-x-md border border-orange-500/30 bg-orange-500/10 p-3 text-xs">
            <Badge tone="warning">منتظر بررسی مالی</Badge>
            <span className="flex-1 text-text-700">
              درخواست تغییر به <span dir="ltr">{maskIban(pending.newSheba)}</span> ({bankOf(pending.newSheba)}) ·{" "}
              {pending.requestedAt}
            </span>
            <button
              type="button"
              onClick={() => {
                cancelShebaRequest(pending.id);
                toast("درخواست لغو شد");
              }}
              className="flex items-center gap-1 text-text-500 hover:text-red-500"
            >
              <X size={12} /> لغو درخواست
            </button>
          </div>
        ) : open ? (
          <form onSubmit={submit} noValidate className="mt-4 space-y-3">
            <Field
              label="شبای جدید"
              hint="از کارت بانکی یا اپ بانک کپی کن؛ با فاصله یا بدون فاصله فرقی نداره."
              error={errors.sheba}
            >
              <input
                value={sheba}
                onChange={(e) => {
                  setSheba(e.target.value.slice(0, 40));
                  setErrors({});
                }}
                dir="ltr"
                inputMode="text"
                autoComplete="off"
                placeholder="IR00 0000 0000 0000 0000 0000 00"
                className={`${fieldClass} tnum text-left`}
              />
            </Field>
            {check?.ok && <p className="-mt-1 text-xs text-mint-500">✓ معتبر — بانک {check.bank}</p>}
            <Field label="اسم صاحب حساب" error={errors.holder}>
              <input
                value={holder}
                onChange={(e) => {
                  setHolder(e.target.value.slice(0, 60));
                  setErrors({});
                }}
                className={fieldClass}
              />
            </Field>
            {nameMismatch && (
              <p className="-mt-1 text-xs text-orange-500">
                حساب باید به نام خودت ({mentorName}) باشه؛ حساب به نام کس دیگه معمولاً رد می‌شه.
              </p>
            )}
            <Field label="توضیح برای تیم مالی" optional>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 120))}
                placeholder="مثلاً: حساب قبلی بسته شد"
                className={fieldClass}
              />
            </Field>
            {errors.form && (
              <p role="alert" className="text-xs text-red-500">
                {errors.form}
              </p>
            )}
            <p className="flex items-start gap-1.5 text-xs leading-[1.8] text-text-500">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-blue-600" />
              تیم مالی مالکیت حساب رو استعلام می‌کنه. بعد از تأیید، اولین تسویه به حساب جدید{" "}
              {toPersianDigits(SHEBA_HOLD_HOURS)} ساعت صبر می‌کنه — برای اینکه اگه کسی به‌جای تو این کار رو کرده باشه،
              فرصت جلوگیری باشه.
            </p>
            <FormActions>
              <Button type="submit" size="md">
                ارسال درخواست
              </Button>
              <Button type="button" size="md" variant="secondary" onClick={() => setOpen(false)}>
                انصراف
              </Button>
            </FormActions>
          </form>
        ) : (
          <Button size="md" variant="secondary" className="mt-3" onClick={() => setOpen(true)}>
            درخواست تغییر شبا
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
