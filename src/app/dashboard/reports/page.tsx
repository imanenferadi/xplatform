import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { levelProfile, studentPlan } from "@/lib/mock-data";

const metrics = [
  { label: "ساعت مطالعه", value: `${studentPlan.weekCompletedHours} از ${studentPlan.weekHours}`, delta: "+۲ نسبت به هفته قبل" },
  { label: "اجرای برنامه", value: "۶۸٪", delta: "+۵٪ نسبت به هفته قبل" },
  { label: "تست‌های زده‌شده", value: "۱۲۰", delta: "بدون تغییر" },
];

export default function ReportsPage() {
  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 className="text-xl font-bold text-text-900">گزارش عملکرد</h1>
        <p className="mt-1 text-sm text-text-500">این هفته چه چیزی تغییر کرد؟</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent>
                <div className="text-xs text-text-500">{m.label}</div>
                <div className="tnum mt-1 text-xl font-bold text-text-900">{m.value}</div>
                <div className="mt-1 text-xs text-mint-500">{m.delta}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardContent>
            <h3 className="mb-4 text-sm font-bold text-text-900">تسلط بر مباحث</h3>
            <div className="space-y-4">
              {levelProfile.subjects.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-text-700">{s.name}</span>
                    <span className="tnum text-text-500">{s.value}٪</span>
                  </div>
                  <ProgressBar value={s.value} tone={s.value >= 75 ? "success" : s.value >= 55 ? "brand" : "warning"} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
