"use client";

import { useMemo, useState } from "react";
import { Receipt, Check, X, RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toman } from "@/components/ui/Toman";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FilterSelect,
  FollowUpBadges,
  ReasonPrompt,
  SearchBox,
} from "@/components/admin/AdminKit";
import { REFUND_REJECT_REASONS, transactions as initialTransactions, type Transaction } from "@/lib/mock-data";
import { decideRefund, useSubscription } from "@/lib/subscription-store";
import { logEvent } from "@/lib/admin-log-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toPersianDigits } from "@/lib/utils";

type TxType = Transaction["type"];
type TxStatus = Transaction["status"];

const statusMeta: Record<TxStatus, { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};
const typeLabel: Record<TxType, string> = { purchase: "خرید", refund_request: "درخواست بازپرداخت" };

function logRefund(
  student: string,
  plan: string,
  amount: number,
  approved: boolean,
  kind: string,
  extra: { label: string; value: string }[] = []
) {
  logEvent({
    category: "مالی",
    action: approved ? "تأیید بازپرداخت" : "رد بازپرداخت",
    target: `${student} — ${plan}`,
    severity: approved ? "info" : "warning",
    details: [
      { label: "مبلغ", value: `${toPersianDigits(amount.toLocaleString("en-US"))} تومان` },
      { label: "نوع", value: kind },
      ...extra,
    ],
    href: "/admin/payments",
  });
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TxType | "همه">("همه");
  const [status, setStatus] = useState<TxStatus | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const sub = useSubscription();
  const guaranteeRefund = sub?.refund ?? null;

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (type === "همه" || t.type === type) &&
          (status === "همه" || t.status === status) &&
          (!query.trim() || [t.studentName, t.planName, t.code, t.gatewayRef].some((v) => v.includes(query.trim())))
      ),
    [transactions, query, type, status]
  );
  const pendingCount =
    transactions.filter((t) => t.type === "refund_request" && t.status === "pending").length +
    (guaranteeRefund?.status === "pending" ? 1 : 0);

  function decide(t: Transaction, next: "approved" | "rejected", reason = "", note = "") {
    setTransactions((txs) => txs.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    setRejecting(null);
    logRefund(t.studentName, t.planName, t.amount, next === "approved", "درخواست عادی", [
      { label: "کد تراکنش", value: t.code },
      ...(t.reason ? [{ label: "دلیل دانش‌آموز", value: t.reason }] : []),
      ...(reason ? [{ label: "دلیل رد", value: note ? `${reason} — ${note}` : reason }] : []),
    ]);
  }

  function decideGuarantee(next: "approved" | "rejected", reason = "") {
    decideRefund(next);
    setRejecting(null);
    if (sub?.refund) {
      logRefund(
        "ایمان",
        `پلن ${sub.planName} (${sub.durationLabel})`,
        sub.refund.amount,
        next === "approved",
        "ضمانت ۷ روزه",
        [
          ...(sub.refund.reason ? [{ label: "دلیل دانش‌آموز", value: sub.refund.reason }] : []),
          ...(reason ? [{ label: "دلیل رد", value: reason }] : []),
        ]
      );
    }
  }

  function exportTx() {
    downloadCsv(
      "x-platform-transactions.csv",
      toCsv(
        [
          "کد",
          "تاریخ",
          "ساعت",
          "دانش‌آموز",
          "پلن",
          "نوع",
          "مبلغ",
          "روش",
          "پرداخت‌کننده",
          "مرجع درگاه",
          "وضعیت",
          "دلیل",
        ],
        filtered.map((t) => [
          t.code,
          t.date,
          t.time,
          t.studentName,
          t.planName,
          typeLabel[t.type],
          String(t.amount),
          t.method,
          t.payer,
          t.gatewayRef,
          statusMeta[t.status].label,
          t.reason ?? "",
        ])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">تراکنش‌ها و بازپرداخت</h1>
          </div>
          <ExportButton count={filtered.length} onExport={exportTx} />
        </div>
        <p className="mb-5 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(pendingCount)}</span> درخواست بازپرداخت در انتظار بررسی
        </p>

        {/* 7-day guarantee refunds: no questions asked, so approving is the
            default — reject only for obvious abuse. */}
        {sub && guaranteeRefund && (
          <Card className="mb-5 border-mint-500/40">
            <CardContent>
              <div className="flex items-center justify-between gap-4">
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
                  {guaranteeRefund.reason && (
                    <div className="mt-1 text-xs text-text-700">«{guaranteeRefund.reason}»</div>
                  )}
                </div>
                {guaranteeRefund.status === "pending" ? (
                  rejecting !== "guarantee" && (
                    <div className="flex shrink-0 gap-2">
                      <Button size="md" variant="secondary" onClick={() => setRejecting("guarantee")}>
                        <X size={15} /> رد
                      </Button>
                      <Button size="md" onClick={() => decideGuarantee("approved")}>
                        <Check size={15} /> برگشت وجه
                      </Button>
                    </div>
                  )
                ) : (
                  <Badge tone={statusMeta[guaranteeRefund.status].tone}>
                    {statusMeta[guaranteeRefund.status].label}
                  </Badge>
                )}
              </div>
              {rejecting === "guarantee" && (
                <div className="mt-3">
                  <ReasonPrompt
                    title="رد ضمانت — فقط برای سوءاستفاده‌ی آشکار"
                    reasons={REFUND_REJECT_REASONS}
                    confirmLabel="رد درخواست"
                    onConfirm={(reason, note) => decideGuarantee("rejected", note ? `${reason} — ${note}` : reason)}
                    onCancel={() => setRejecting(null)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <SearchBox value={query} onChange={setQuery} placeholder="جستجو با نام، پلن، کد تراکنش یا مرجع درگاه..." />
        <div className="mb-4 mt-3 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="نوع"
            value={type}
            onChange={setType}
            options={[
              { value: "purchase", label: "خرید" },
              { value: "refund_request", label: "درخواست بازپرداخت" },
            ]}
          />
          <FilterSelect
            label="وضعیت"
            value={status}
            onChange={setStatus}
            options={(Object.keys(statusMeta) as TxStatus[]).map((s) => ({ value: s, label: statusMeta[s].label }))}
          />
          <span className="mr-auto text-xs text-text-500">
            <span className="tnum">{toPersianDigits(filtered.length)}</span> تراکنش
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((t) => {
            const key = `tx:${t.id}`;
            const actionable = t.type === "refund_request" && t.status === "pending";
            return (
              <AdminRow
                key={t.id}
                open={openId === t.id}
                onToggle={() => {
                  setOpenId(openId === t.id ? null : t.id);
                  setRejecting(null);
                }}
                className={actionable ? "border-orange-500/40" : undefined}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{t.studentName}</span>
                        <span className="text-xs text-text-500">— {typeLabel[t.type]}</span>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">
                        {t.planName} — <Toman amount={t.amount} /> · {t.date}
                      </div>
                    </div>
                    <Badge tone={statusMeta[t.status].tone}>{statusMeta[t.status].label}</Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="جزئیات تراکنش"
                      rows={[
                        [
                          "کد تراکنش",
                          <span key="c" dir="ltr" className="font-mono text-[11px]">
                            {t.code}
                          </span>,
                        ],
                        [
                          "زمان",
                          <span key="d">
                            {t.date}، ساعت <span className="tnum">{t.time}</span>
                          </span>,
                        ],
                        ["نوع", typeLabel[t.type]],
                        ["پلن", t.planName],
                        ["مبلغ", <Toman key="a" amount={t.amount} />],
                        [
                          "روش پرداخت",
                          <span key="m" className="tnum">
                            {t.method}
                          </span>,
                        ],
                        ["پرداخت‌کننده", t.payer],
                        [
                          "مرجع درگاه",
                          <span key="g" dir="ltr" className="font-mono text-[11px]">
                            {t.gatewayRef}
                          </span>,
                        ],
                        ...(t.reason ? ([["دلیل دانش‌آموز", `«${t.reason}»`]] as [string, React.ReactNode][]) : []),
                      ]}
                    />
                    {actionable &&
                      (rejecting === t.id ? (
                        <ReasonPrompt
                          title="رد درخواست بازپرداخت"
                          reasons={REFUND_REJECT_REASONS}
                          confirmLabel="رد درخواست"
                          onConfirm={(reason, note) => decide(t, "rejected", reason, note)}
                          onCancel={() => setRejecting(null)}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <Button size="md" variant="secondary" onClick={() => setRejecting(t.id)}>
                            <X size={15} /> رد
                          </Button>
                          <Button size="md" onClick={() => decide(t, "approved")}>
                            <Check size={15} /> تأیید بازپرداخت
                          </Button>
                        </div>
                      ))}
                    <EntityActivity match={t.studentName} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">تراکنشی با این فیلترها پیدا نشد.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
