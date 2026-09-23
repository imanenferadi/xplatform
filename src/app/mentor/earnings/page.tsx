import { Wallet, CheckCircle2, Clock } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/ui/TrendChart";
import { mentorStudents, studentEarnings, earningsHistory } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

function formatToman(n: number): string {
  return toPersianDigits(n.toLocaleString("en-US")) + " تومان";
}

export default function MentorEarningsPage() {
  const thisMonth = earningsHistory[earningsHistory.length - 1].total;
  const paidCount = studentEarnings.filter((e) => e.paidThisMonth).length;

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
              <div className="text-xs text-text-500">درآمد این ماه</div>
              <div className="tnum mt-1 text-xl font-bold text-text-900">{formatToman(thisMonth)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-xs text-text-500">پرداخت‌شده</div>
              <div className="tnum mt-1 text-xl font-bold text-text-900">
                {paidCount} از {studentEarnings.length} نفر
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent>
            <h2 className="mb-3 text-sm font-bold text-text-900">روند سه ماه اخیر (میلیون تومان)</h2>
            <TrendChart
              points={earningsHistory.map((h) => ({
                label: h.monthLabel,
                value: Math.round(h.total / 100000) / 10, // e.g. 3800000 -> 3.8
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
                      <Badge tone="neutral">طرح {e.planName}</Badge>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="tnum text-sm font-bold text-text-900">{formatToman(e.monthlyFee)}</div>
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
        </div>
      </div>
    </MentorShell>
  );
}
