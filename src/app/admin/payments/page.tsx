"use client";

import { useState } from "react";
import { Receipt, Check, X } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { transactions as initialTransactions, type Transaction } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

const statusMeta: Record<Transaction["status"], { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};

function formatToman(n: number): string {
  return toPersianDigits(n.toLocaleString("en-US")) + " تومان";
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);

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
          <span className="tnum">{toPersianDigits(pendingRefunds.length)}</span> درخواست بازپرداخت در انتظار بررسی
        </p>

        <div className="space-y-3">
          {pendingRefunds.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-text-900">{t.studentName}</div>
                  <div className="tnum mt-0.5 text-xs text-text-500">
                    {t.planName} — {formatToman(t.amount)} · {t.date}
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
            <div key={t.id} className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5">
              <div>
                <div className="text-sm font-medium text-text-900">
                  {t.studentName} — {t.type === "purchase" ? "خرید" : "درخواست بازپرداخت"}
                </div>
                <div className="tnum text-xs text-text-500">
                  {t.planName} — {formatToman(t.amount)} · {t.date}
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
