import { Wallet, Clock, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { TrendChart } from "@/components/ui/TrendChart";
import { pricingPlans, platformRevenue, pendingMentorPayouts } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

function formatToman(n: number): string {
  return toPersianDigits(n.toLocaleString("en-US")) + " تومان";
}

// No real subscription records exist yet (no backend) — mock subscriber
// counts per plan, just enough to make the breakdown visually meaningful.
const PLAN_SUBSCRIBERS: Record<string, number> = { basic: 14, companion: 22, premium: 6 };
const planBreakdown = pricingPlans
  .filter((p) => p.price > 0)
  .map((p) => ({ ...p, subscribers: PLAN_SUBSCRIBERS[p.id] ?? 0 }));

export default function AdminFinancePage() {
  const thisMonth = platformRevenue[platformRevenue.length - 1].total;

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Wallet size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">داشبورد مالی</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent>
              <div className="text-xs text-text-500">درآمد این ماه</div>
              <div className="tnum mt-1 text-xl font-bold text-text-900">{formatToman(thisMonth)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs text-text-500">
                <Clock size={12} /> تسویه‌ی درانتظار مشاوران
              </div>
              <div className="tnum mt-1 text-xl font-bold text-text-900">
                {toPersianDigits(pendingMentorPayouts)} مورد
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">روند درآمد — ۳ ماه اخیر (میلیون تومان)</h2>
            </div>
            <TrendChart
              points={platformRevenue.map((h) => ({
                label: h.monthLabel,
                value: Math.round(h.total / 100000) / 10,
              }))}
              max={Math.max(...platformRevenue.map((h) => h.total)) / 1000000 + 5}
              unit=""
            />
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">تفکیک درآمد بر اساس پلن</h2>
        <div className="space-y-2">
          {planBreakdown.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5"
            >
              <div>
                <div className="text-sm font-medium text-text-900">{p.name}</div>
                <div className="tnum text-xs text-text-500">{formatToman(p.price)} در ماه</div>
              </div>
              <span className="tnum text-sm text-text-700">{toPersianDigits(p.subscribers)} مشترک</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
