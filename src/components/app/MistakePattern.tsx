import { Lightbulb } from "lucide-react";
import { MISTAKE_REASONS, type MistakeEntry, type MistakeReason } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

const REASON_COLOR: Record<MistakeReason, string> = {
  careless: "bg-orange-500",
  calculation: "bg-yellow-400",
  concept: "bg-red-500",
  forgot: "bg-blue-600",
  time: "bg-blue-300",
  trap: "bg-mint-500",
  not_studied: "bg-text-500",
};

export function reasonBreakdown(entries: MistakeEntry[]) {
  const counts = new Map<MistakeReason, number>();
  for (const e of entries) counts.set(e.reason, (counts.get(e.reason) ?? 0) + 1);
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

// Turns the counts into the one sentence a mentor would actually say.
function insight(entries: MistakeEntry[], audience: "student" | "mentor"): string | null {
  if (entries.length < 3) return null;
  const share = (rs: MistakeReason[]) => entries.filter((e) => rs.includes(e.reason)).length / entries.length;
  const you = audience === "student";
  if (share(["careless", "calculation"]) >= 0.5)
    return you
      ? "بیشتر غلط‌هات از بی‌دقتی و محاسبه‌ست، نه ندونستن. راهش تمرین دقت و دوباره‌خوانی صورت سؤاله، نه خوندن دوباره‌ی درس."
      : "بیشتر غلط‌ها از بی‌دقتی و محاسبه‌ست، نه ندونستن؛ برنامه باید روی دقت و تست زمان‌دار باشه، نه درسنامه.";
  if (share(["concept", "not_studied", "forgot"]) >= 0.5)
    return you
      ? "بیشتر غلط‌هات از ندونستن یا یادت نموندنه. قبل از تست بیشتر، برگرد سراغ درسنامه و مرور."
      : "بیشتر غلط‌ها از ضعف مفهومی یا نخوندنه؛ برگشت به درسنامه و مرور فاصله‌دار لازمه.";
  if (share(["time"]) >= 0.3)
    return you
      ? "کمبود وقت سهم زیادی از غلط‌هات داره. با شبیه‌ساز آزمون، زمان‌بندی هر بخش رو تمرین کن."
      : "کمبود وقت سهم زیادی داره؛ تمرین آزمون زمان‌دار و مدیریت ترتیب سؤال‌ها.";
  return null;
}

export function MistakePattern({ entries, audience }: { entries: MistakeEntry[]; audience: "student" | "mentor" }) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-500">هنوز غلطی ثبت نشده.</p>;
  }
  const rows = reasonBreakdown(entries);
  const message = insight(entries, audience);

  return (
    <div>
      {/* One stacked bar = the whole picture at a glance */}
      <div className="flex h-3 overflow-hidden rounded-x-pill bg-surface-2">
        {rows.map((r) => (
          <div
            key={r.reason}
            className={REASON_COLOR[r.reason]}
            style={{ width: `${(r.count / entries.length) * 100}%` }}
            title={MISTAKE_REASONS[r.reason].label}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.reason} className="flex items-center gap-1.5 text-text-700">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${REASON_COLOR[r.reason]}`} />
            <span className="flex-1">{MISTAKE_REASONS[r.reason].label}</span>
            <span className="tnum text-text-500">
              {toPersianDigits(r.count)} ({toPersianDigits(Math.round((r.count / entries.length) * 100))}٪)
            </span>
          </li>
        ))}
      </ul>
      {message && (
        <div className="mt-3 flex items-start gap-2 rounded-x-md bg-blue-100 p-3 text-xs leading-[1.8] text-text-900">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-blue-600" />
          {message}
        </div>
      )}
    </div>
  );
}
