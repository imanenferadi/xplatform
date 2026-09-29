"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import {
  issueInvoice,
  useBilling,
  validNationalCode,
  type Buyer,
} from "@/lib/billing-store";

const input =
  "h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";

/** «فاکتور رسمی» for one paid transaction: issue once, then link to the printable page. */
export function InvoiceControl({
  txKey,
  studentName,
  description,
  amount,
}: {
  txKey: string;
  studentName: string;
  description: string;
  amount: number;
}) {
  const invoice = useBilling().invoices.find((v) => v.txKey === txKey);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Buyer["kind"]>("person");
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [economicCode, setEconomicCode] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const idOk =
    kind === "person"
      ? validNationalCode(nationalId)
      : /^\d{11}$/.test(nationalId.trim());

  if (invoice)
    return (
      <Link
        href={`/invoice/${invoice.no}`}
        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
      >
        <FileText size={12} /> فاکتور رسمی {invoice.no}
      </Link>
    );

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
      >
        <FileText size={12} /> صدور فاکتور رسمی
      </button>
    );

  function issue() {
    const r = issueInvoice(txKey, studentName, description, amount, {
      kind,
      name,
      nationalId,
      economicCode: economicCode.trim() || undefined,
      address: address.trim() || undefined,
    });
    if (typeof r === "string") return setError(r);
    toast(`فاکتور ${r.no} صادر شد`);
    setOpen(false);
  }

  return (
    <div className="space-y-2 rounded-x-sm border border-border p-2.5 text-xs">
      <div className="flex gap-1.5">
        {(["person", "company"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => {
              setKind(k);
              setError("");
            }}
            className={`rounded-x-pill border px-3 py-1 ${kind === k ? "border-blue-600 bg-blue-100 text-text-900" : "border-border text-text-700"}`}
          >
            {k === "person" ? "شخص حقیقی" : "شرکت (حقوقی)"}
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => (setName(e.target.value.slice(0, 80)), setError(""))}
        placeholder={
          kind === "person"
            ? "نام و نام خانوادگی خریدار (مثلاً والد)"
            : "نام شرکت"
        }
        aria-label="نام خریدار"
        className={input}
      />
      <input
        value={nationalId}
        onChange={(e) => (
          setNationalId(e.target.value.slice(0, 11)),
          setError("")
        )}
        dir="ltr"
        inputMode="numeric"
        placeholder={
          kind === "person" ? "کد ملی ۱۰ رقمی" : "شناسه‌ی ملی ۱۱ رقمی"
        }
        aria-label={kind === "person" ? "کد ملی" : "شناسه‌ی ملی"}
        className={`${input} tnum text-left`}
      />
      {nationalId.trim().length >= (kind === "person" ? 10 : 11) && (
        <p className={idOk ? "text-mint-500" : "text-red-500"}>
          {idOk
            ? "✓ معتبر"
            : kind === "person"
              ? "کد ملی معتبر نیست"
              : "باید ۱۱ رقم باشه"}
        </p>
      )}
      {kind === "company" && (
        <input
          value={economicCode}
          onChange={(e) => setEconomicCode(e.target.value.slice(0, 12))}
          dir="ltr"
          inputMode="numeric"
          placeholder="کد اقتصادی ۱۲ رقمی (اختیاری)"
          aria-label="کد اقتصادی"
          className={`${input} tnum text-left`}
        />
      )}
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value.slice(0, 160))}
        placeholder="نشانی (اختیاری)"
        aria-label="نشانی"
        className={input}
      />
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="md" onClick={issue}>
          صدور فاکتور
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
  );
}
