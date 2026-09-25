"use client";

import { useState } from "react";
import { Receipt, Check, X, RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { transactions as initialTransactions, type Transaction } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";
import { Toman } from "@/components/ui/Toman";
import { decideRefund, useSubscription } from "@/lib/subscription-store";

const statusMeta: Record<Transaction["status"], { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const sub = useSubscription();
  const guaranteeRefund = sub?.refund ? sub.refund : null;

  function setStatus(id: string, status: Transaction["status"]) {
    setTransactions((txs) => txs.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const pendingRefunds = transactions.filter((t) => t.type === "refund_request" && t.status === "pending");
  const decided = transactions.filter((t) => !(t.type === "refund_request" && t.status === "pending"));

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <Receipt size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تراکنش‌ها و بازپرداخت</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          <span className="tnum">
            {toPersianDigits(pendingRefunds.length + (guaranteeRefund?.status === "pending" ? 1 : 0))}
          </span>{" "}
          درخواست بازپرداخت در انتظار بررسی
        </p>

        {/* 7-day guarantee refunds: no questions asked, so approving is the
            default — reject only for obvious abuse. */}
        {sub && guaranteeRefund && (
          <Card className="mb-3 border-mint-500/40">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-900">ایمان</span>
                  <Badge tone="success">
                    <RotateCcw size={11} /> ضمانت ۷ روزه
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-text-500">
                  پلن {sub.planName} ({sub.durationLabel}) — <Toman amount={guaranteeRefund.amount} /> · امروز
                </div>
                {guaranteeRefund.reason && <div className="mt-1 text-xs text-text-700">«{guaranteeRefund.reason}»</div>}
              </div>
              {guaranteeRefund.status === "pending" ? (
                <div className="flex shrink-0 gap-2">
                  <Button size="md" variant="secondary" onClick={() => decideRefund("rejected")}>
                    <X size={15} /> رد
                  </Button>
                  <Button size="md" onClick={() => decideRefund("approved")}>
                    <Check size={15} /> برگشت وجه
                  </Button>
                </div>
              ) : (
                <Badge tone={statusMeta[guaranteeRefund.status].tone}>{statusMeta[guaranteeRefund.status].label}</Badge>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {pendingRefunds.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-text-900">{t.studentName}</div>
                  <div className="mt-0.5 text-xs text-text-500">
                    {t.planName} — <Toman amount={t.amount} /> · {t.date}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="md" variant="secondary" onClick={() => setStatus(t.id, "rejected")}>
                    <X size={15} /> رد
                  </Button>
                  <Button size="md" onClick={() => setStatus(t.id, "approved")}>
                    <Check size={15} /> تأیید بازپرداخت
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingRefunds.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">درخواست بازپرداخت جدیدی در انتظار نیست.</p>
          )}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-bold text-text-900">تاریخچه‌ی تراکنش‌ها</h2>
        <div className="space-y-2">
          {decided.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5"
            >
              <div>
                <div className="text-sm font-medium text-text-900">
                  {t.studentName} — {t.type === "purchase" ? "خرید" : "درخواست بازپرداخت"}
                </div>
                <div className="text-xs text-text-500">
                  {t.planName} — <Toman amount={t.amount} /> · {t.date}
                </div>
              </div>
              <Badge tone={statusMeta[t.status].tone}>{statusMeta[t.status].label}</Badge>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
