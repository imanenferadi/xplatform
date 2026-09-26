import { Wallet, CheckCircle2, Clock } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/ui/TrendChart";
import {
  mentors,
  mentorPayouts,
  mentorStudents,
  studentEarnings,
  earningsHistory,
  PLATFORM_COMMISSION_PERCENT,
  TRADITIONAL_INSTITUTE_COMMISSION,
} from "@/lib/mock-data";
import { Toman } from "@/components/ui/Toman";
import { toPersianDigits } from "@/lib/utils";

export default function MentorEarningsPage() {
  const me = mentors[0]; // سارا محمدی — the logged-in mentor of this demo
  const month = earningsHistory[earningsHistory.length - 1];
  const thisMonth = month.total;
  const commission = Math.round((thisMonth * PLATFORM_COMMISSION_PERCENT) / 100);
  const activeStudents = me.capacityTotal - me.capacity;
  // Only four students have named rows in this demo; the rest are summed.
  const others = activeStudents - studentEarnings.length;
  const othersTotal = thisMonth - studentEarnings.reduce((s, e) => s + e.monthlyFee, 0);
  const paidCount = studentEarnings.filter((e) => e.paidThisMonth).length + others;
  const payout = mentorPayouts.find((p) => p.mentorId === me.id);

  return (
    <MentorShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
        <div className="mb-5 flex items-center gap-2">
          <Wallet size={18} className="text-blue-600" />
          <h1 className="text-lg font-bold text-text-900">درآمد</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent>
              <div className="text-xs text-text-500">سهم خالص {month.monthLabel}</div>
              <div className="mt-1 text-xl font-bold text-text-900">
                <Toman amount={thisMonth - commission} />
              </div>
              {payout && (
                <div className={`mt-1 text-xs ${payout.status === "paid" ? "text-mint-500" : "text-orange-500"}`}>
                  {payout.status === "paid" ? "واریز شد" : "در انتظار واریز توسط پلتفرم"}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-xs text-text-500">پرداخت‌شده</div>
              <div className="tnum mt-1 text-xl font-bold text-text-900">
                {toPersianDigits(paidCount)} از {toPersianDigits(activeStudents)} نفر
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-500">جمع پرداختی دانش‌آموزها</span>
              <span className="text-text-700">
                <Toman amount={thisMonth} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-500">کارمزد پلتفرم ({toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪)</span>
              <span className="text-text-700">
                − <Toman amount={commission} />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-1.5">
              <span className="font-medium text-text-900">سهم تو</span>
              <span className="font-bold text-mint-500">
                <Toman amount={thisMonth - commission} />
              </span>
            </div>
            <p className="pt-1 text-xs text-text-500">
              آموزشگاه‌های سنتی معمولاً {TRADITIONAL_INSTITUTE_COMMISSION} شهریه رو برمی‌دارن.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <h2 className="mb-3 text-sm font-bold text-text-900">روند سه ماه اخیر (میلیون تومان)</h2>
            <TrendChart
              points={earningsHistory.map((h) => ({
                label: h.monthLabel,
                value: Math.round(h.total / 100000) / 10, // e.g. 17880000 -> 17.9
              }))}
              max={Math.max(...earningsHistory.map((h) => h.total)) / 1000000 + 1}
              unit=""
            />
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">تفکیک دانش‌آموزان</h2>
        <div className="space-y-2">
          {studentEarnings.map((e) => {
            const student = mentorStudents.find((s) => s.id === e.studentId);
            if (!student) return null;
            return (
              <Card key={e.studentId}>
                <CardContent className="flex items-center gap-3 py-3.5">
                  <Avatar name={student.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-900">{student.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-text-500">
                      <Badge tone="neutral">پلن {e.planName}</Badge>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-text-900">
                      <Toman amount={e.monthlyFee} />
                    </div>
                    <div
                      className={`mt-0.5 flex items-center justify-end gap-1 text-xs ${
                        e.paidThisMonth ? "text-mint-500" : "text-orange-500"
                      }`}
                    >
                      {e.paidThisMonth ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {e.paidThisMonth ? "پرداخت‌شده" : "در انتظار"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {others > 0 && (
            <Card>
              <CardContent className="flex items-center justify-between py-3.5 text-sm">
                <span className="text-text-700">
                  <span className="tnum">{toPersianDigits(others)}</span> دانش‌آموز دیگه
                </span>
                <span className="font-bold text-text-900">
                  <Toman amount={othersTotal} />
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MentorShell>
  );
}
