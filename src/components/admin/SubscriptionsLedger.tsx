"use client";

import { useState } from "react";
import {
  CalendarClock,
  CreditCard,
  Gift,
  PauseCircle,
  Undo2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { Allowed } from "@/components/admin/AdminKit";
import { InvoiceControl } from "@/components/admin/InvoiceControl";
import {
  DAY_OPTIONS,
  cancelPause,
  fa,
  moveInstallment,
  nextDue,
  pauseSubscription,
  requestGift,
  requestManualPayment,
  useBilling,
  validUntilIso,
  type LedgerInstallment,
  type LedgerSub,
} from "@/lib/billing-store";
import { DEMO_TODAY_ISO } from "@/lib/mock-data";
import { addDaysIso, cn, formatJalali, toPersianDigits } from "@/lib/utils";

const input =
  "h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

/** «اشتراک‌ها»: the finance ledger — validity, installments and the tools on them. */
export function SubscriptionsLedger() {
  const { subs } = useBilling();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Card className="mb-6">
      <CardContent>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text-900">
          <CreditCard size={15} className="text-blue-600" /> اشتراک‌ها
        </h2>
        <ul className="divide-y divide-border/60">
          {subs.map((s) => {
            const due = nextDue(s);
            const paused = s.pauses.some((p) => !p.cancelled);
            return (
              <li key={s.userId} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(open === s.userId ? null : s.userId)}
                  aria-expanded={open === s.userId}
                  className="flex w-full flex-wrap items-center gap-2 text-right text-sm"
                >
                  <span className="font-medium text-text-900">
                    {s.userName}
                  </span>
                  <span className="text-xs text-text-500">
                    {s.planName} {s.durationLabel} · اعتبار تا{" "}
                    {formatJalali(validUntilIso(s))}
                  </span>
                  {paused && <Badge tone="info">توقف دارد</Badge>}
                  {s.giftDays > 0 && (
                    <Badge tone="success">
                      {toPersianDigits(s.giftDays)} روز هدیه
                    </Badge>
                  )}
                  <span className="mr-auto text-xs text-text-500">
                    {due
                      ? `قسط بعدی: ${fa(due.amount)} تومان — ${formatJalali(due.dueIso)}`
                      : "همه‌ی اقساط پرداخت شده"}
                  </span>
                </button>
                {open === s.userId && <SubTools s={s} />}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function SubTools({ s }: { s: LedgerSub }) {
  return (
    <div className="mt-3 space-y-4 rounded-x-md bg-surface-2 p-3 text-xs">
      <div>
        <div className="mb-1.5 font-bold text-text-900">اقساط</div>
        <ul className="space-y-2">
          {s.installments.map((i, idx) => (
            <InstallmentRow key={i.id} s={s} i={i} n={idx + 1} />
          ))}
        </ul>
      </div>
      <PauseTool s={s} />
      <GiftTool s={s} />
    </div>
  );
}

function InstallmentRow({
  s,
  i,
  n,
}: {
  s: LedgerSub;
  i: LedgerInstallment;
  n: number;
}) {
  const [mode, setMode] = useState<"move" | "pay" | null>(null);
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [paidIso, setPaidIso] = useState(DEMO_TODAY_ISO);
  const [error, setError] = useState("");
  const pendingPay = useBilling().approvals.some(
    (a) => a.status === "pending" && a.manual?.installmentId === i.id,
  );

  function submit() {
    const err =
      mode === "move"
        ? moveInstallment(s.userId, i.id, days, reason)
        : requestManualPayment(s.userId, i.id, amount, ref, paidIso, reason);
    if (err) return setError(err);
    toast(
      mode === "move"
        ? "قسط جابه‌جا شد و به دانش‌آموز خبر داده شد"
        : "ثبت شد — منتظر تأیید نفر دوم",
    );
    setMode(null);
    setReason("");
  }

  return (
    <li className="rounded-x-sm bg-surface p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-text-900">
          قسط {toPersianDigits(n)}
        </span>
        <span className="tnum">{fa(i.amount)} تومان</span>
        <span className="text-text-500">
          ·{" "}
          {i.paid
            ? `پرداخت ${formatJalali(i.paidIso!)}`
            : `موعد ${formatJalali(i.dueIso)}`}
          {i.moves > 0 && ` (اصلی: ${formatJalali(i.origDueIso)})`}
        </span>
        <Badge tone={i.paid ? "success" : "warning"}>
          {i.paid ? "پرداخت‌شده" : "پرداخت‌نشده"}
        </Badge>
        {i.paid && i.ref && (
          <span className="mr-auto">
            <InvoiceControl
              txKey={`ref:${i.ref}`}
              studentName={s.userName}
              description={`اشتراک ${s.planName} ${s.durationLabel} — قسط ${toPersianDigits(n)}`}
              amount={i.amount}
            />
          </span>
        )}
      </div>
      {pendingPay && (
        <p className="mt-2 text-orange-500">
          ثبت دستی پرداخت منتظر تأیید نفر دومه.
        </p>
      )}
      {!i.paid && !pendingPay && mode === null && (
        <Allowed perm="billing.manage">
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("move")}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <CalendarClock size={12} /> جابه‌جایی موعد
            </button>
            <button
              type="button"
              onClick={() => setMode("pay")}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <CreditCard size={12} /> ثبت دستی پرداخت
            </button>
          </div>
        </Allowed>
      )}
      {mode && (
        <div className="mt-2 space-y-2">
          {mode === "move" ? (
            <div className="flex flex-wrap gap-1.5">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "rounded-x-pill border px-3 py-1",
                    days === d
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border text-text-700",
                  )}
                >
                  {toPersianDigits(d)} روز بعد
                </button>
              ))}
            </div>
          ) : (
            <>
              <p className="text-text-500">
                پرداختی که به بانک رسیده ولی در پلتفرم ثبت نشده. بعد از ثبت، یک
                نفر دیگه باید تأییدش کنه.
              </p>
              <input
                value={amount}
                onChange={(e) => (
                  setAmount(e.target.value.slice(0, 15)),
                  setError("")
                )}
                inputMode="numeric"
                placeholder={`مبلغ (باید ${fa(i.amount)} باشه)`}
                aria-label="مبلغ"
                className={`${input} tnum`}
              />
              <input
                value={ref}
                onChange={(e) => (
                  setRef(e.target.value.slice(0, 24)),
                  setError("")
                )}
                dir="ltr"
                placeholder="کد پیگیری بانکی"
                aria-label="کد پیگیری"
                className={`${input} tnum text-left`}
              />
              <label className="block text-text-700">
                تاریخ پرداخت
                <input
                  type="date"
                  value={paidIso}
                  max={DEMO_TODAY_ISO}
                  onChange={(e) => (setPaidIso(e.target.value), setError(""))}
                  aria-label="تاریخ پرداخت"
                  dir="ltr"
                  className={`${input} mt-1`}
                />
              </label>
            </>
          )}
          <input
            value={reason}
            onChange={(e) => (
              setReason(e.target.value.slice(0, 160)),
              setError("")
            )}
            placeholder={
              mode === "move"
                ? "دلیل (اجباری) — مثلاً درخواست والد در تیکت"
                : "از کجا فهمیدی پرداخت شده؟ (اجباری) — مثلاً تیکت T-1038 و صورت‌حساب بانک"
            }
            aria-label="دلیل"
            className={input}
          />
          {error && (
            <p role="alert" className="text-red-500">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="md" onClick={submit}>
              {mode === "move" ? "جابه‌جا کن" : "ثبت برای تأیید"}
            </Button>
            <button
              type="button"
              onClick={() => (setMode(null), setError(""))}
              className="text-text-500"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function PauseTool({ s }: { s: LedgerSub }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(14);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const active = s.pauses.filter((p) => !p.cancelled);
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 font-bold text-text-900">
        <PauseCircle size={13} /> توقف
      </div>
      {active.map((p) => (
        <div key={p.id} className="mb-1 flex items-center gap-2 text-text-700">
          {formatJalali(p.startIso)} تا{" "}
          {formatJalali(addDaysIso(p.startIso, p.days))} (
          {toPersianDigits(p.days)} روز) — «{p.reason}» · {p.by}
          <Allowed perm="billing.manage">
            <button
              type="button"
              onClick={() => {
                cancelPause(s.userId, p.id);
                toast("توقف لغو شد");
              }}
              className="flex items-center gap-1 text-text-500 hover:text-red-500"
            >
              <Undo2 size={11} /> لغو
            </button>
          </Allowed>
        </div>
      ))}
      <Allowed perm="billing.manage">
        {open ? (
          <div className="space-y-2">
            <p className="text-text-500">
              از امروز شروع می‌شه و اعتبار رو همون‌قدر جلو می‌بره. اقساط سر
              جاشون می‌مونن — اگه لازمه، جداگونه جابه‌جا کن.
            </p>
            <div className="flex gap-1.5">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "rounded-x-pill border px-3 py-1",
                    days === d
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border text-text-700",
                  )}
                >
                  {toPersianDigits(d)} روز
                </button>
              ))}
            </div>
            <input
              value={reason}
              onChange={(e) => (
                setReason(e.target.value.slice(0, 120)),
                setError("")
              )}
              placeholder="دلیل (اجباری) — مثلاً امتحانات نهایی"
              aria-label="دلیل توقف"
              className={input}
            />
            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="md"
                onClick={() => {
                  const err = pauseSubscription(s.userId, days, reason);
                  if (err) return setError(err);
                  toast("اشتراک متوقف شد و اعتبارش جلو رفت");
                  setOpen(false);
                  setReason("");
                }}
              >
                توقف
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-text-500"
              >
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-blue-600 hover:underline"
          >
            توقف موقت اشتراک
          </button>
        )}
      </Allowed>
    </div>
  );
}

function GiftTool({ s }: { s: LedgerSub }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 font-bold text-text-900">
        <Gift size={13} /> هدیه‌ی تمدید
      </div>
      <Allowed perm="billing.manage">
        {open ? (
          <div className="space-y-2">
            <p className="text-text-500">فقط مدیر کل می‌تونه تأییدش کنه.</p>
            <div className="flex gap-1.5">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "rounded-x-pill border px-3 py-1",
                    days === d
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border text-text-700",
                  )}
                >
                  {toPersianDigits(d)} روز
                </button>
              ))}
            </div>
            <input
              value={reason}
              onChange={(e) => (
                setReason(e.target.value.slice(0, 120)),
                setError("")
              )}
              placeholder="دلیل (اجباری) — مثلاً جبران ۳ روز قطعی چت"
              aria-label="دلیل هدیه"
              className={input}
            />
            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="md"
                onClick={() => {
                  const err = requestGift(s.userId, days, reason);
                  if (err) return setError(err);
                  toast("درخواست هدیه برای مدیر کل فرستاده شد");
                  setOpen(false);
                  setReason("");
                }}
              >
                درخواست هدیه
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-text-500"
              >
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-blue-600 hover:underline"
          >
            درخواست روز هدیه
          </button>
        )}
      </Allowed>
    </div>
  );
}
