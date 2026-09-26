"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Banknote, Check } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import { TrendChart } from "@/components/ui/TrendChart";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FollowUpBadges,
  ReasonPrompt,
} from "@/components/admin/AdminKit";
import {
  PLATFORM_COMMISSION_PERCENT,
  mentorPayouts as initialPayouts,
  platformRevenue,
  pricingPlans,
  refundsThisMonth,
  type MentorPayout,
} from "@/lib/mock-data";
import { logEvent } from "@/lib/admin-log-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn, toPersianDigits } from "@/lib/utils";

// No real subscription records yet (no backend) — mock subscriber counts
// per plan, just enough to make the breakdown meaningful.
const PLAN_SUBSCRIBERS: Record<string, number> = { basic: 14, companion: 22, premium: 6 };
const planBreakdown = pricingPlans
  .filter((p) => p.price > 0)
  .map((p) => ({ ...p, subscribers: PLAN_SUBSCRIBERS[p.id] ?? 0, revenue: (PLAN_SUBSCRIBERS[p.id] ?? 0) * p.price }));
const planRevenueTotal = planBreakdown.reduce((s, p) => s + p.revenue, 0);

const commissionOf = (gross: number) => Math.round((gross * PLATFORM_COMMISSION_PERCENT) / 100);

export default function AdminFinancePage() {
  const [payouts, setPayouts] = useState<MentorPayout[]>(initialPayouts);
  const [openId, setOpenId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const thisMonth = platformRevenue[platformRevenue.length - 1];
  const lastMonth = platformRevenue[platformRevenue.length - 2];
  const change = Math.round(((thisMonth.total - lastMonth.total) / lastMonth.total) * 1000) / 10;
  const platformShare = commissionOf(thisMonth.total);
  const subscribers = planBreakdown.reduce((s, p) => s + p.subscribers, 0);
  const pending = payouts.filter((p) => p.status === "pending");
  const pendingNet = pending.reduce((s, p) => s + p.gross - commissionOf(p.gross), 0);

  function markPaid(p: MentorPayout, bankRef: string) {
    setPayouts((ps) => ps.map((x) => (x.id === p.id ? { ...x, status: "paid", bankRef } : x)));
    setPayingId(null);
    logEvent({
      category: "مالی",
      action: "تسویه با مشاور",
      target: p.mentorName,
      severity: "info",
      details: [
        { label: "دوره", value: p.period },
        {
          label: "مبلغ خالص",
          value: `${toPersianDigits((p.gross - commissionOf(p.gross)).toLocaleString("en-US"))} تومان`,
        },
        { label: "شبا", value: p.sheba },
        { label: "کد پیگیری بانک", value: bankRef },
      ],
      href: "/admin",
    });
  }

  function exportPayouts() {
    downloadCsv(
      "x-platform-payouts.csv",
      toCsv(
        ["مشاور", "دوره", "دانش‌آموز", "ناخالص", "کارمزد", "خالص", "شبا", "وضعیت", "کد پیگیری"],
        payouts.map((p) => [
          p.mentorName,
          p.period,
          String(p.students),
          String(p.gross),
          String(commissionOf(p.gross)),
          String(p.gross - commissionOf(p.gross)),
          p.sheba,
          p.status === "paid" ? "پرداخت‌شده" : "در انتظار",
          p.bankRef ?? "",
        ])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Wallet size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">داشبورد مالی</h1>
          <span className="text-sm text-text-500">— {thisMonth.monthLabel} ۱۴۰۵</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Kpi
            label="پرداختی دانش‌آموزها (ناخالص)"
            value={<Toman amount={thisMonth.total} />}
            sub={
              <span className={cn("flex items-center gap-1", change >= 0 ? "text-mint-500" : "text-red-500")}>
                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="tnum">{toPersianDigits(Math.abs(change))}٪</span> نسبت به {lastMonth.monthLabel}
              </span>
            }
          />
          <Kpi
            label={`سهم پلتفرم (${toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪)`}
            value={<Toman amount={platformShare} />}
          />
          <Kpi label="سهم مشاورها" value={<Toman amount={thisMonth.total - platformShare} />} />
          <Kpi label="بازپرداخت‌های این ماه" value={<Toman amount={refundsThisMonth} />} />
          <Kpi label="مشترک فعال" value={<span className="tnum">{toPersianDigits(subscribers)}</span>} />
          <Kpi
            label="میانگین درآمد هر مشترک"
            value={<Toman amount={Math.round(thisMonth.total / subscribers / 1000) * 1000} />}
          />
        </div>

        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">روند درآمد — ۳ ماه اخیر (میلیون تومان)</h2>
            </div>
            <TrendChart
              points={platformRevenue.map((h) => ({ label: h.monthLabel, value: Math.round(h.total / 100000) / 10 }))}
              max={Math.max(...platformRevenue.map((h) => h.total)) / 1000000 + 5}
              unit=""
            />
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">تفکیک اشتراک‌های ماهانه بر اساس پلن</h2>
        <div className="space-y-2">
          {planBreakdown.map((p) => {
            const share = Math.round((p.revenue / planRevenueTotal) * 100);
            return (
              <div key={p.id} className="rounded-x-md border border-border bg-surface p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-900">{p.name}</div>
                    <div className="text-xs text-text-500">
                      <Toman amount={p.price} /> در ماه · <span className="tnum">{toPersianDigits(p.subscribers)}</span>{" "}
                      مشترک
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-text-900">
                      <Toman amount={p.revenue} />
                    </div>
                    <div className="text-xs text-text-500">
                      <span className="tnum">{toPersianDigits(share)}٪</span> از اشتراک‌ها
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-x-pill bg-surface-2">
                  <div className="h-full rounded-x-pill bg-blue-600" style={{ width: `${share}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-3 mt-8 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-text-900">
              <Banknote size={16} className="text-blue-600" /> تسویه با مشاورها
            </h2>
            <p className="mt-0.5 text-xs text-text-500">
              <span className="tnum">{toPersianDigits(pending.length)}</span> تسویه‌ی در انتظار — جمعاً{" "}
              <Toman amount={pendingNet} /> خالص
            </p>
          </div>
          <ExportButton count={payouts.length} onExport={exportPayouts} />
        </div>
        <div className="space-y-2">
          {payouts.map((p) => {
            const commission = commissionOf(p.gross);
            const key = `payout:${p.id}`;
            return (
              <AdminRow
                key={p.id}
                open={openId === p.id}
                onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{p.mentorName}</span>
                        <span className="text-xs text-text-500">· {p.period}</span>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="text-xs text-text-500">
                        خالص <Toman amount={p.gross - commission} />
                      </div>
                    </div>
                    <Badge tone={p.status === "paid" ? "success" : "warning"}>
                      {p.status === "paid" ? "پرداخت‌شده" : "در انتظار"}
                    </Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="جزئیات تسویه"
                      rows={[
                        ["دوره", p.period],
                        [
                          "دانش‌آموز فعال",
                          <span key="s" className="tnum">
                            {toPersianDigits(p.students)}
                          </span>,
                        ],
                        ["پرداختی ناخالص", <Toman key="g" amount={p.gross} />],
                        [
                          `کارمزد (${toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪)`,
                          <Toman key="c" amount={commission} />,
                        ],
                        [
                          "مبلغ خالص",
                          <strong key="n">
                            <Toman amount={p.gross - commission} />
                          </strong>,
                        ],
                        [
                          "شبا",
                          <span key="sh" dir="ltr" className="font-mono text-[11px]">
                            {p.sheba}
                          </span>,
                        ],
                        ["کد پیگیری بانک", p.bankRef ?? "—"],
                      ]}
                    />
                    {p.status === "pending" &&
                      (payingId === p.id ? (
                        <ReasonPrompt
                          title={`ثبت پرداخت به ${p.mentorName}`}
                          confirmLabel="ثبت پرداخت"
                          noteRequired
                          notePlaceholder="کد پیگیری پایا / ساتنا (اجباری)"
                          onConfirm={(_, ref) => markPaid(p, ref)}
                          onCancel={() => setPayingId(null)}
                        />
                      ) : (
                        <Button size="md" onClick={() => setPayingId(p.id)}>
                          <Check size={15} /> پرداخت شد
                        </Button>
                      ))}
                    <EntityActivity match={p.mentorName} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs text-text-500">{label}</div>
        <div className="mt-1 text-lg font-bold text-text-900">{value}</div>
        {sub && <div className="mt-1 text-xs">{sub}</div>}
      </CardContent>
    </Card>
  );
}
