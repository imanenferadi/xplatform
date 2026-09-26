"use client";

import { useState } from "react";
import Link from "next/link";
import { UserMinus, Gauge } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FilterSelect,
  FollowUpBadges,
} from "@/components/admin/AdminKit";
import { CHURN_REASONS, mentors, type ChurnReason } from "@/lib/mock-data";
import { useChurn } from "@/lib/churn-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toPersianDigits } from "@/lib/utils";

type Outcome = "cancelled" | "retained";
const OUTCOME_LABEL: Record<Outcome, string> = { cancelled: "لغو شد", retained: "موند (پیشنهاد رو قبول کرد)" };
const REASONS = Object.keys(CHURN_REASONS) as ChurnReason[];
const mentorName = (id: string) => mentors.find((m) => m.id === id)?.name ?? "—";

export default function AdminChurnPage() {
  const { responses } = useChurn();
  const [reason, setReason] = useState<ChurnReason | "همه">("همه");
  const [outcome, setOutcome] = useState<Outcome | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = responses.filter(
    (r) => (reason === "همه" || r.reason === reason) && (outcome === "همه" || r.outcome === outcome)
  );
  const cancelled = responses.filter((r) => r.outcome === "cancelled").length;
  const offered = responses.filter((r) => CHURN_REASONS[r.reason].offer);
  const saved = offered.filter((r) => r.outcome === "retained").length;
  const byReason = REASONS.map((k) => ({ k, n: responses.filter((r) => r.reason === k).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const top = byReason[0]?.n ?? 1;

  function exportRows() {
    downloadCsv(
      "x-platform-cancellations.csv",
      toCsv(
        ["تاریخ", "دانش‌آموز", "پلن", "مشاور", "دلیل", "توضیح", "پیشنهاد", "نتیجه"],
        filtered.map((r) => [
          r.date,
          r.student,
          r.plan,
          mentorName(r.mentorId),
          CHURN_REASONS[r.reason].label,
          r.text,
          CHURN_REASONS[r.reason].offer?.title ?? "",
          OUTCOME_LABEL[r.outcome],
        ])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserMinus size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">چرا می‌رن؟</h1>
          </div>
          <ExportButton count={filtered.length} onExport={exportRows} />
        </div>
        <p className="mb-5 text-sm text-text-500">
          جواب نظرسنجی کوتاهی که قبل از خاموش کردن تمدید خودکار پرسیده می‌شه، و اینکه پیشنهاد نگه‌داشت جواب داد یا نه.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="پاسخ نظرسنجی" value={toPersianDigits(responses.length)} />
          <Stat label="لغو نهایی" value={toPersianDigits(cancelled)} />
          <Stat label="نگه داشته شد" value={toPersianDigits(responses.length - cancelled)} />
          <Stat
            label="موفقیت پیشنهاد نگه‌داشت"
            value={offered.length ? `${toPersianDigits(Math.round((saved / offered.length) * 100))}٪` : "—"}
          />
        </div>

        <Card className="mb-5">
          <CardContent>
            <h2 className="mb-3 text-sm font-bold text-text-900">سهم هر دلیل</h2>
            <div className="space-y-2">
              {byReason.map(({ k, n }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setReason(reason === k ? "همه" : k)}
                  className="block w-full text-right"
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={reason === k ? "font-bold text-blue-600" : "text-text-700"}>
                      {CHURN_REASONS[k].label}
                    </span>
                    <span className="text-text-500">
                      <span className="tnum">{toPersianDigits(n)}</span> (
                      <span className="tnum">{toPersianDigits(Math.round((n / responses.length) * 100))}</span>٪)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-x-pill bg-surface-2">
                    <div className="h-full rounded-x-pill bg-blue-600" style={{ width: `${(n / top) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
            {byReason.some((x) => x.k === "mentor") && (
              <Link
                href="/admin/quality"
                className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Gauge size={12} /> لغوهای «مشاور» در امتیاز کیفیت همون مشاور حساب شدن
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="دلیل"
            value={reason}
            onChange={setReason}
            options={REASONS.map((k) => ({ value: k, label: CHURN_REASONS[k].label }))}
          />
          <FilterSelect
            label="نتیجه"
            value={outcome}
            onChange={setOutcome}
            options={(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => ({ value: o, label: OUTCOME_LABEL[o] }))}
          />
          <span className="mr-auto text-xs text-text-500">
            <span className="tnum">{toPersianDigits(filtered.length)}</span> پاسخ
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((r) => {
            const key = `churn:${r.id}`;
            const offer = CHURN_REASONS[r.reason].offer;
            return (
              <AdminRow
                key={r.id}
                open={openId === r.id}
                onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{r.student}</span>
                        <Badge tone="neutral">{CHURN_REASONS[r.reason].label}</Badge>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="mt-0.5 truncate text-xs text-text-500">
                        پلن {r.plan} · مشاور: {mentorName(r.mentorId)} · {r.date}
                        {r.text && ` · «${r.text}»`}
                      </div>
                    </div>
                    <Badge tone={r.outcome === "retained" ? "success" : "danger"}>
                      {r.outcome === "retained" ? "موند" : "لغو شد"}
                    </Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="جزئیات"
                      rows={[
                        ["دانش‌آموز", r.student],
                        ["پلن", r.plan],
                        ["مشاور", mentorName(r.mentorId)],
                        ["دلیل", CHURN_REASONS[r.reason].label],
                        ["توضیح", r.text || "—"],
                        ["پیشنهاد نگه‌داشت", offer ? offer.title : "برای این دلیل پیشنهادی نداریم"],
                        ["نتیجه", OUTCOME_LABEL[r.outcome]],
                        ["تاریخ", r.date],
                      ]}
                    />
                    <EntityActivity match={r.student} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">پاسخی با این فیلترها نیست.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-x-md border border-border bg-surface p-3">
      <div className="text-xl font-bold text-text-900">{value}</div>
      <div className="text-xs text-text-500">{label}</div>
    </div>
  );
}
