"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Users, Lock, Plus, ShoppingCart, Download } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import {
  SCHOOL_DISCOUNT_PERCENT,
  SCHOOL_SEAT_PLAN_ID,
  pricingPlans,
  schoolSeed,
  type SchoolStudent,
} from "@/lib/mock-data";
import { addSchoolStudents, buySeats, useSchool } from "@/lib/school-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn, toLatinDigits, toPersianDigits } from "@/lib/utils";

type Status = "excellent" | "ok" | "attention" | "invited";
const STATUS: Record<Status, { label: string; tone: "success" | "info" | "danger" | "neutral" }> = {
  excellent: { label: "عالی", tone: "success" },
  ok: { label: "روی مسیر", tone: "info" },
  attention: { label: "نیاز به توجه", tone: "danger" },
  invited: { label: "دعوت‌شده", tone: "neutral" },
};

function statusOf(s: SchoolStudent): Status {
  if (s.reportRate === null || s.studyHours === null) return "invited";
  if (s.reportRate < 50 || s.studyHours < 10) return "attention";
  if (s.reportRate >= 80 && s.studyHours >= 20) return "excellent";
  return "ok";
}

const seatPlan = pricingPlans.find((p) => p.id === SCHOOL_SEAT_PLAN_ID)!;
const seatPrice = Math.round((seatPlan.price * (1 - SCHOOL_DISCOUNT_PERCENT / 100)) / 1000) * 1000;

// A school buys seats in bulk and follows its students — aggregate
// progress only. Chats, notes, sleep and mistakes stay private.
export default function SchoolPage() {
  const { seats, students } = useSchool();
  const [filter, setFilter] = useState<Status | "همه">("همه");
  const [bulk, setBulk] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [added, setAdded] = useState(0);
  const [buying, setBuying] = useState(0);

  const active = students.filter((s) => statusOf(s) !== "invited");
  const avg = (f: (s: SchoolStudent) => number) =>
    active.length ? Math.round(active.reduce((a, s) => a + f(s), 0) / active.length) : 0;
  const attention = students.filter((s) => statusOf(s) === "attention").length;
  const free = seats - students.length;
  const visible = useMemo(() => students.filter((s) => filter === "همه" || statusOf(s) === filter), [students, filter]);

  function addBulk(e: React.FormEvent) {
    e.preventDefault();
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const errors: string[] = [];
    const parsed: { name: string; phone: string }[] = [];
    lines.forEach((line, i) => {
      const [name, phone] = line.split(/[،,]/).map((x) => x?.trim() ?? "");
      const digits = toLatinDigits(phone ?? "").replace(/\D/g, "");
      if (!name || name.length < 3) errors.push(`خط ${toPersianDigits(i + 1)}: اسم کامل نیست.`);
      else if (!/^09\d{9}$/.test(digits))
        errors.push(`خط ${toPersianDigits(i + 1)}: موبایل «${phone || "—"}» درست نیست.`);
      else if (
        students.some((s) => toLatinDigits(s.phone).replace(/\D/g, "") === digits) ||
        parsed.some((p) => toLatinDigits(p.phone).replace(/\D/g, "") === digits)
      )
        errors.push(`خط ${toPersianDigits(i + 1)}: این شماره قبلاً اضافه شده.`);
      else parsed.push({ name, phone: phone.trim() });
    });
    if (!lines.length) errors.push("حداقل یک خط «نام، موبایل» بنویس.");
    if (!errors.length && parsed.length > free)
      errors.push(
        `فقط ${toPersianDigits(free)} صندلی خالی داری؛ ${toPersianDigits(parsed.length)} نفر وارد کردی. اول صندلی بخر.`
      );
    setBulkErrors(errors);
    if (errors.length) return;
    addSchoolStudents(parsed);
    setAdded(parsed.length);
    setBulk("");
  }

  function exportCsv() {
    downloadCsv(
      "school-students.csv",
      toCsv(
        ["نام", "پایه", "مشاور", "گزارش کار ٪", "ساعت مطالعه‌ی هفته", "وضعیت"],
        visible.map((s) => [
          s.name,
          s.grade,
          s.mentorName,
          s.reportRate === null ? "" : String(s.reportRate),
          s.studyHours === null ? "" : String(s.studyHours),
          STATUS[statusOf(s)].label,
        ])
      )
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Link href="/login" className="text-xs text-text-500 hover:text-text-900">
            خروج
          </Link>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">{schoolSeed.name}</h1>
        </div>
        <p className="mb-5 flex items-start gap-1.5 text-xs leading-[1.8] text-text-500">
          <Lock size={12} className="mt-1 shrink-0" />
          فقط شاخص‌های کلی رو می‌بینید (گزارش کار و ساعت مطالعه). گفتگو با مشاور، یادداشت‌ها، ساعت خواب و دفترچه‌ی
          غلط‌های دانش‌آموزها خصوصی می‌مونه.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="صندلی استفاده‌شده" value={`${toPersianDigits(students.length)} از ${toPersianDigits(seats)}`} />
          <Stat label="میانگین ساعت مطالعه‌ی هفته" value={`${toPersianDigits(avg((s) => s.studyHours ?? 0))} ساعت`} />
          <Stat label="میانگین گزارش کار" value={`${toPersianDigits(avg((s) => s.reportRate ?? 0))}٪`} />
          <Stat label="نیاز به توجه" value={toPersianDigits(attention)} danger={attention > 0} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["همه", "attention", "ok", "excellent", "invited"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                filter === f ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
              )}
            >
              {f === "همه" ? "همه" : STATUS[f].label}
            </button>
          ))}
          <Button size="md" variant="secondary" className="mr-auto" onClick={exportCsv} disabled={!visible.length}>
            <Download size={14} /> CSV
          </Button>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-500">
                  <th className="p-3 font-normal">دانش‌آموز</th>
                  <th className="p-3 font-normal">مشاور</th>
                  <th className="p-3 text-center font-normal">گزارش کار</th>
                  <th className="p-3 text-center font-normal">مطالعه‌ی هفته</th>
                  <th className="p-3 font-normal">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const st = statusOf(s);
                  return (
                    <tr key={s.id} className="border-b border-border/60 last:border-0">
                      <td className="p-3">
                        <div className="font-medium text-text-900">{s.name}</div>
                        <div className="text-xs text-text-500">{s.grade}</div>
                      </td>
                      <td className="p-3 text-text-700">{s.mentorName}</td>
                      <td className="p-3 text-center">
                        {s.reportRate === null ? (
                          "—"
                        ) : (
                          <span className={cn("tnum", s.reportRate < 50 && "font-medium text-red-500")}>
                            {toPersianDigits(s.reportRate)}٪
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {s.studyHours === null ? (
                          "—"
                        ) : (
                          <span className={cn(s.studyHours < 10 && "font-medium text-red-500")}>
                            <span className="tnum">{toPersianDigits(s.studyHours)}</span> ساعت
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visible.length === 0 && (
              <p className="p-6 text-center text-sm text-text-500">دانش‌آموزی در این دسته نیست.</p>
            )}
          </div>
        </Card>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent>
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-text-900">
                <Users size={16} className="text-blue-600" /> افزودن دانش‌آموز
              </h2>
              <p className="mb-3 text-xs text-text-500">
                هر خط: «نام، موبایل». برای هر نفر پیامک دعوت فرستاده می‌شه.{" "}
                <span className="tnum">{toPersianDigits(free)}</span> صندلی خالی داری.
              </p>
              <form onSubmit={addBulk} noValidate>
                <textarea
                  value={bulk}
                  onChange={(e) => {
                    setBulk(e.target.value);
                    setBulkErrors([]);
                    setAdded(0);
                  }}
                  rows={4}
                  placeholder={"سارا رحمانی، ۰۹۱۲۳۴۵۶۷۸۹\nعلی کاظمی، ۰۹۳۵۱۱۱۲۲۳۳"}
                  aria-label="فهرست دانش‌آموزها"
                  className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
                />
                {bulkErrors.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-red-500">
                    {bulkErrors.map((er) => (
                      <li key={er}>{er}</li>
                    ))}
                  </ul>
                )}
                {added > 0 && (
                  <p className="mt-1 text-xs text-mint-500">
                    <span className="tnum">{toPersianDigits(added)}</span> نفر اضافه و دعوت شدن ✓
                  </p>
                )}
                <Button type="submit" size="md" className="mt-2">
                  <Plus size={14} /> افزودن و دعوت
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-text-900">
                <ShoppingCart size={16} className="text-blue-600" /> صندلی و صورت‌حساب
              </h2>
              <p className="mb-3 text-xs leading-[1.8] text-text-500">
                هر صندلی = اشتراک {seatPlan.name} با {toPersianDigits(SCHOOL_DISCOUNT_PERCENT)}٪ تخفیف گروهی:{" "}
                <Toman amount={seatPrice} /> در ماه (به‌جای <Toman amount={seatPlan.price} />
                ).
              </p>
              <div className="rounded-x-md bg-surface-2 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-500">مبلغ ماهانه‌ی فعلی</span>
                  <span className="font-medium text-text-900">
                    <Toman amount={seats * seatPrice} />
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-text-500">
                  <span>صورت‌حساب بعدی</span>
                  <span>{schoolSeed.nextInvoice}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[5, 10, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setBuying(n)}
                    className={cn(
                      "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                      buying === n
                        ? "border-blue-600 bg-blue-100 text-text-900"
                        : "border-border bg-surface text-text-700"
                    )}
                  >
                    +{toPersianDigits(n)} صندلی
                  </button>
                ))}
              </div>
              {buying > 0 && (
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span className="text-text-700">
                    + <Toman amount={buying * seatPrice} /> در ماه
                  </span>
                  <Button
                    size="md"
                    onClick={() => {
                      buySeats(buying, buying * seatPrice);
                      setBuying(0);
                    }}
                  >
                    خرید
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-x-md border border-border bg-surface p-3">
      <div className={cn("text-lg font-bold", danger ? "text-red-500" : "text-text-900")}>{value}</div>
      <div className="text-xs text-text-500">{label}</div>
    </div>
  );
}
