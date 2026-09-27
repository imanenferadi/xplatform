"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, AlertTriangle, Send, ArrowLeftRight } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrendChart } from "@/components/ui/TrendChart";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FollowUpBadges,
  ReasonPrompt,
  Allowed,
} from "@/components/admin/AdminKit";
import { MENTOR_WARNING_REASONS, QUALITY_FLAGS, QUALITY_WEIGHTS, mentorQuality, mentors } from "@/lib/mock-data";
import { computeQuality, type QualityRow } from "@/lib/quality";
import { useChurn } from "@/lib/churn-store";
import { logEvent } from "@/lib/admin-log-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn, toPersianDigits } from "@/lib/utils";

type SortKey = "score" | "responseHours" | "reportRate" | "retention" | "rating" | "complaints";

const COLUMNS: { key: SortKey; label: string; lowerIsBetter?: boolean }[] = [
  { key: "score", label: "امتیاز کیفیت" },
  { key: "responseHours", label: "زمان پاسخ", lowerIsBetter: true },
  { key: "reportRate", label: "گزارش کار" },
  { key: "retention", label: "ماندگاری" },
  { key: "rating", label: "امتیاز جلسه" },
  { key: "complaints", label: "شکایت", lowerIsBetter: true },
];

function scoreTone(score: number) {
  return score >= 80 ? "text-mint-500" : score >= 60 ? "text-orange-500" : "text-red-500";
}

export default function AdminQualityPage() {
  const { responses } = useChurn();
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [openId, setOpenId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [warned, setWarned] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    const list = mentorQuality
      .map((q) => {
        const m = mentors.find((x) => x.id === q.mentorId);
        return m ? computeQuality(m, q, responses) : null;
      })
      .filter((r): r is QualityRow => r !== null);
    const col = COLUMNS.find((c) => c.key === sortKey)!;
    // Worst first, so problems surface at the top.
    return list.sort((a, b) => (col.lowerIsBetter ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]));
  }, [responses, sortKey]);

  const avg = Math.round(rows.reduce((s, r) => s + r.score, 0) / (rows.length || 1));
  const flagged = rows.filter((r) => r.flags.length > 0).length;

  function sendWarning(r: QualityRow, reason: string, note: string) {
    setWarning(null);
    setWarned((w) => ({ ...w, [r.mentor.id]: reason }));
    logEvent({
      category: "مشاوران",
      action: "ارسال هشدار کتبی به مشاور",
      target: r.mentor.name,
      severity: "warning",
      details: [
        { label: "دلیل", value: reason },
        ...(note ? [{ label: "متن", value: note }] : []),
        { label: "امتیاز کیفیت", value: toPersianDigits(r.score) },
        ...(r.flags.length ? [{ label: "پرچم‌ها", value: r.flags.join("، ") }] : []),
      ],
      href: "/admin/quality",
    });
  }

  function exportRows() {
    downloadCsv(
      "x-platform-mentor-quality.csv",
      toCsv(
        [
          "مشاور",
          "امتیاز کیفیت",
          "زمان پاسخ (ساعت)",
          "گزارش کار ٪",
          "ماندگاری ٪",
          "امتیاز جلسه",
          "برنامه سر وقت ٪",
          "شکایت",
          "ظرفیت پر ٪",
          "پرچم‌ها",
        ],
        rows.map((r) => [
          r.mentor.name,
          String(r.score),
          String(r.responseHours),
          String(r.reportRate),
          String(r.retention),
          String(r.rating),
          String(r.planOnTime),
          String(r.complaints),
          String(r.utilization),
          r.flags.join("، "),
        ])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">کیفیت مشاورها</h1>
          </div>
          <ExportButton count={rows.length} onExport={exportRows} />
        </div>
        <p className="mb-5 text-sm text-text-500">
          میانگین امتیاز کیفیت: <span className={cn("tnum font-bold", scoreTone(avg))}>{toPersianDigits(avg)}</span> از
          ۱۰۰ · <span className="tnum">{toPersianDigits(flagged)}</span> مشاور با پرچم قرمز. بدترین‌ها بالای جدول‌اند.
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-text-500">مرتب‌سازی (بدترین اول):</span>
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSortKey(c.key)}
              className={cn(
                "rounded-x-pill border px-3 py-1 transition-colors",
                sortKey === c.key
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {rows.map((r) => {
            const key = `mentor-quality:${r.mentor.id}`;
            return (
              <AdminRow
                key={r.mentor.id}
                open={openId === r.mentor.id}
                onToggle={() => {
                  setOpenId(openId === r.mentor.id ? null : r.mentor.id);
                  setWarning(null);
                }}
                className={cn(r.flags.length > 0 && "border-red-500/40")}
                summary={
                  <div className="flex items-center gap-4">
                    <div className={cn("tnum w-12 shrink-0 text-center text-2xl font-extrabold", scoreTone(r.score))}>
                      {toPersianDigits(r.score)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{r.mentor.name}</span>
                        <span className="text-xs text-text-500">· {r.mentor.group}</span>
                        {r.flags.map((f) => (
                          <Badge key={f} tone="danger">
                            <AlertTriangle size={10} /> {f}
                          </Badge>
                        ))}
                        {warned[r.mentor.id] && <Badge tone="warning">هشدار ارسال شد</Badge>}
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="mt-1 grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs text-text-500 sm:grid-cols-5">
                        <Metric
                          label="پاسخ"
                          value={`${toPersianDigits(r.responseHours)} ساعت`}
                          bad={r.responseHours > QUALITY_FLAGS.maxResponseHours}
                        />
                        <Metric
                          label="گزارش کار"
                          value={`${toPersianDigits(r.reportRate)}٪`}
                          bad={r.reportRate < QUALITY_FLAGS.minReportRate}
                        />
                        <Metric label="ماندگاری" value={`${toPersianDigits(r.retention)}٪`} />
                        <Metric
                          label="امتیاز"
                          value={toPersianDigits(r.rating)}
                          bad={r.rating < QUALITY_FLAGS.minRating}
                        />
                        <Metric
                          label="شکایت"
                          value={toPersianDigits(r.complaints)}
                          bad={r.complaints >= QUALITY_FLAGS.maxComplaints}
                        />
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-bold text-text-900">روند زمان پاسخ — ۴ هفته‌ی اخیر (ساعت)</div>
                      <TrendChart
                        points={r.data.responseTrend.map((v, i) => ({
                          label: `هفته ${toPersianDigits(i + 1)}`,
                          value: v,
                        }))}
                        max={Math.max(48, ...r.data.responseTrend) + 4}
                        unit=""
                        lowerIsBetter
                      />
                    </div>
                    <DetailList
                      title="همه‌ی شاخص‌ها"
                      rows={[
                        [
                          "زمان پاسخ",
                          `${toPersianDigits(r.responseHours)} ساعت (وزن ${toPersianDigits(QUALITY_WEIGHTS.response)})`,
                        ],
                        [
                          "گزارش کار دانش‌آموزها",
                          `${toPersianDigits(r.reportRate)}٪ (وزن ${toPersianDigits(QUALITY_WEIGHTS.reports)})`,
                        ],
                        [
                          "ماندگاری بعد از ماه اول",
                          `${toPersianDigits(r.retention)}٪ (وزن ${toPersianDigits(QUALITY_WEIGHTS.retention)})`,
                        ],
                        [
                          "امتیاز جلسه‌ها",
                          `${toPersianDigits(r.rating)} از ۵ — ${toPersianDigits(r.mentor.reviewCount)} نظر (وزن ${toPersianDigits(QUALITY_WEIGHTS.rating)})`,
                        ],
                        [
                          "برنامه تا شنبه آماده",
                          `${toPersianDigits(r.planOnTime)}٪ (وزن ${toPersianDigits(QUALITY_WEIGHTS.planOnTime)})`,
                        ],
                        [
                          "شکایت و لغو به‌خاطر مشاور",
                          `${toPersianDigits(r.complaints)} مورد (وزن ${toPersianDigits(QUALITY_WEIGHTS.complaints)})`,
                        ],
                        [
                          "ظرفیت پر",
                          `${toPersianDigits(r.utilization)}٪ — ${toPersianDigits(r.mentor.capacityTotal - r.mentor.capacity)} از ${toPersianDigits(r.mentor.capacityTotal)}`,
                        ],
                      ]}
                    />
                    {warning === r.mentor.id ? (
                      <ReasonPrompt
                        title={`هشدار کتبی به ${r.mentor.name}`}
                        reasons={MENTOR_WARNING_REASONS}
                        confirmLabel="ارسال هشدار"
                        notePlaceholder="متن کوتاه برای مشاور (اختیاری)"
                        onConfirm={(reason, note) => sendWarning(r, reason, note)}
                        onCancel={() => setWarning(null)}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <Allowed perm="quality.warn">
                          <Button size="md" variant="secondary" onClick={() => setWarning(r.mentor.id)}>
                            <Send size={14} /> ارسال هشدار کتبی
                          </Button>
                        </Allowed>
                        <Link
                          href="/admin/reassign"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ArrowLeftRight size={12} /> تعویض مشاور یکی از دانش‌آموزها
                        </Link>
                      </div>
                    )}
                    <EntityActivity match={r.mentor.name} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-[1.8] text-text-500">
          امتیاز ۰ تا ۱۰۰ = پاسخ‌گویی ({toPersianDigits(QUALITY_WEIGHTS.response)}) + گزارش کار (
          {toPersianDigits(QUALITY_WEIGHTS.reports)}) + ماندگاری ({toPersianDigits(QUALITY_WEIGHTS.retention)}) + امتیاز
          جلسه ({toPersianDigits(QUALITY_WEIGHTS.rating)}) + برنامه سر وقت (
          {toPersianDigits(QUALITY_WEIGHTS.planOnTime)}) + بدون شکایت ({toPersianDigits(QUALITY_WEIGHTS.complaints)}).
          لغوهایی که دلیلشون «مشاور» بوده، خودکار شکایت حساب می‌شن.
        </p>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <span className={cn(bad && "font-medium text-red-500")}>
      {label}: {value}
    </span>
  );
}
