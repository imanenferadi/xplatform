"use client";

import { useState } from "react";
import { TicketPercent, Plus, Pause, Play, X } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toman } from "@/components/ui/Toman";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FilterSelect,
  FollowUpBadges,
  Allowed,
} from "@/components/admin/AdminKit";
import {
  DEMO_TODAY_ISO,
  PACKAGE_DURATIONS,
  pricingPlans,
  type DiscountCode,
  type PackageDuration,
} from "@/lib/mock-data";
import {
  CODE_STATUS_LABEL,
  codeStatus,
  createCode,
  setPaused,
  useDiscountCodes,
  type CodeStatus,
} from "@/lib/discount-store";
import { logEvent } from "@/lib/admin-log-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { addDaysIso, cn, formatJalali, toLatinDigits, toPersianDigits } from "@/lib/utils";

const STATUS_TONE: Record<CodeStatus, "success" | "warning" | "neutral" | "danger"> = {
  active: "success",
  paused: "warning",
  expired: "neutral",
  exhausted: "danger",
};
const VALIDITY_DAYS = [7, 14, 30, 60, 90];
const paidPlans = pricingPlans.filter((p) => p.price > 0);

function describe(c: DiscountCode) {
  return c.kind === "percent"
    ? `${toPersianDigits(c.value)}٪`
    : `${toPersianDigits(c.value.toLocaleString("en-US"))} تومان`;
}

function scopeText(c: DiscountCode) {
  const plans = c.planIds.length
    ? c.planIds.map((id) => pricingPlans.find((p) => p.id === id)?.name).join("، ")
    : "همه‌ی پلن‌ها";
  const durations = c.durationIds.length
    ? c.durationIds.map((id) => PACKAGE_DURATIONS.find((d) => d.id === id)?.label).join("، ")
    : "همه‌ی مدت‌ها";
  return `${plans} · ${durations}${c.firstPurchaseOnly ? " · فقط خرید اول" : ""}`;
}

export default function AdminDiscountsPage() {
  const codes = useDiscountCodes();
  const [status, setStatus] = useState<CodeStatus | "همه">("همه");
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = codes.filter((c) => status === "همه" || codeStatus(c) === status);
  const active = codes.filter((c) => codeStatus(c) === "active").length;
  const totalGiven = codes.reduce((s, c) => s + c.given, 0);
  const totalSales = codes.reduce((s, c) => s + c.sales, 0);

  function togglePause(c: DiscountCode) {
    setPaused(c.code, !c.paused);
    logEvent({
      category: "مالی",
      action: c.paused ? "فعال‌سازی کد تخفیف" : "توقف کد تخفیف",
      target: c.code,
      severity: "info",
      details: [{ label: "مصرف", value: `${toPersianDigits(c.used)} از ${toPersianDigits(c.maxUses)}` }],
      href: "/admin/discounts",
    });
  }

  function exportCodes() {
    downloadCsv(
      "x-platform-discount-codes.csv",
      toCsv(
        ["کد", "تخفیف", "دامنه", "مصرف", "سقف", "انقضا", "وضعیت", "فروش با کد", "جمع تخفیف"],
        filtered.map((c) => [
          c.code,
          describe(c),
          scopeText(c),
          String(c.used),
          String(c.maxUses),
          formatJalali(c.expiresIso),
          CODE_STATUS_LABEL[codeStatus(c)],
          String(c.sales),
          String(c.given),
        ])
      )
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TicketPercent size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">کد تخفیف</h1>
          </div>
          <div className="flex gap-2">
            <ExportButton count={filtered.length} onExport={exportCodes} />
            {!creating && (
              <Allowed perm="discounts.manage">
                <Button size="md" onClick={() => setCreating(true)}>
                  <Plus size={15} /> کد جدید
                </Button>
              </Allowed>
            )}
          </div>
        </div>
        <p className="mb-5 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(active)}</span> کد فعال · فروش با کد: <Toman amount={totalSales} /> ·
          تخفیف داده‌شده: <Toman amount={totalGiven} />
        </p>

        {creating && <NewCodeForm existing={codes.map((c) => c.code)} onDone={() => setCreating(false)} />}

        <div className="mb-4 flex items-center gap-2">
          <FilterSelect
            label="وضعیت"
            value={status}
            onChange={setStatus}
            options={(Object.keys(CODE_STATUS_LABEL) as CodeStatus[]).map((s) => ({
              value: s,
              label: CODE_STATUS_LABEL[s],
            }))}
          />
          <span className="mr-auto text-xs text-text-500">
            <span className="tnum">{toPersianDigits(filtered.length)}</span> کد
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((c) => {
            const st = codeStatus(c);
            const key = `discount:${c.code}`;
            const usedPct = Math.round((c.used / c.maxUses) * 100);
            return (
              <AdminRow
                key={c.code}
                open={openCode === c.code}
                onToggle={() => setOpenCode(openCode === c.code ? null : c.code)}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span dir="ltr" className="font-mono text-sm font-bold text-text-900">
                          {c.code}
                        </span>
                        <Badge tone="info">{describe(c)}</Badge>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">
                        {scopeText(c)} · تا {formatJalali(c.expiresIso)}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-x-pill bg-surface-2">
                          <div
                            className={cn("h-full rounded-x-pill", usedPct >= 100 ? "bg-red-500" : "bg-blue-600")}
                            style={{ width: `${Math.min(100, usedPct)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-500">
                          <span className="tnum">{toPersianDigits(c.used)}</span> از{" "}
                          <span className="tnum">{toPersianDigits(c.maxUses)}</span>
                        </span>
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[st]}>{CODE_STATUS_LABEL[st]}</Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="جزئیات کد"
                      rows={[
                        ["تخفیف", describe(c)],
                        ["دامنه", scopeText(c)],
                        [
                          "مصرف",
                          `${toPersianDigits(c.used)} از ${toPersianDigits(c.maxUses)} (${toPersianDigits(usedPct)}٪)`,
                        ],
                        ["ساخته‌شده", c.createdAt],
                        ["انقضا", formatJalali(c.expiresIso)],
                        ["فروش با این کد", <Toman key="s" amount={c.sales} />],
                        ["جمع تخفیف داده‌شده", <Toman key="g" amount={c.given} />],
                        [
                          "میانگین هر خرید",
                          c.used ? <Toman key="a" amount={Math.round(c.sales / c.used / 1000) * 1000} /> : "—",
                        ],
                      ]}
                    />
                    {(st === "active" || st === "paused") && (
                      <Allowed perm="discounts.manage">
                        <Button size="md" variant="secondary" onClick={() => togglePause(c)}>
                          {c.paused ? (
                            <>
                              <Play size={14} /> فعال کن
                            </>
                          ) : (
                            <>
                              <Pause size={14} /> متوقف کن
                            </>
                          )}
                        </Button>
                      </Allowed>
                    )}
                    <EntityActivity match={c.code} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-text-500">کدی با این وضعیت نیست.</p>}
        </div>
      </div>
    </AdminShell>
  );
}

function NewCodeForm({ existing, onDone }: { existing: string[]; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [days, setDays] = useState(30);
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [durationIds, setDurationIds] = useState<PackageDuration["id"][]>([]);
  const [firstOnly, setFirstOnly] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    const v = Number(toLatinDigits(value.trim()).replace(/,/g, ""));
    const max = Number(toLatinDigits(maxUses.trim()));
    const next: Record<string, string> = {};
    if (!/^[A-Z0-9]{4,16}$/.test(clean)) next.code = "۴ تا ۱۶ حرف انگلیسی یا عدد، بدون فاصله.";
    else if (existing.includes(clean)) next.code = "این کد قبلاً ساخته شده.";
    if (kind === "percent" && (!Number.isInteger(v) || v < 1 || v > 90)) next.value = "درصد بین ۱ تا ۹۰.";
    if (kind === "fixed" && (!Number.isInteger(v) || v < 10000 || v % 1000 !== 0))
      next.value = "مبلغ حداقل ۱۰,۰۰۰ تومان و مضرب ۱,۰۰۰.";
    if (!Number.isInteger(max) || max < 1 || max > 10000) next.maxUses = "سقف استفاده بین ۱ تا ۱۰,۰۰۰.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const expiresIso = addDaysIso(DEMO_TODAY_ISO, days);
    createCode({
      code: clean,
      kind,
      value: v,
      maxUses: max,
      used: 0,
      expiresIso,
      planIds,
      durationIds,
      firstPurchaseOnly: firstOnly,
      paused: false,
      createdAt: "۷ مهر ۱۴۰۵",
      sales: 0,
      given: 0,
    });
    logEvent({
      category: "مالی",
      action: "ساخت کد تخفیف",
      target: clean,
      severity: "info",
      details: [
        {
          label: "تخفیف",
          value: kind === "percent" ? `${toPersianDigits(v)}٪` : `${toPersianDigits(v.toLocaleString("en-US"))} تومان`,
        },
        { label: "سقف", value: toPersianDigits(max) },
        { label: "انقضا", value: formatJalali(expiresIso) },
      ],
      href: "/admin/discounts",
    });
    onDone();
  }

  const field =
    "h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";
  const chip = (on: boolean) =>
    cn(
      "rounded-x-pill border px-3 py-1 text-xs transition-colors",
      on ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700"
    );

  return (
    <Card className="mb-5">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-900">کد تخفیف جدید</h2>
          <button type="button" onClick={onDone} aria-label="بستن" className="text-text-500 hover:text-text-900">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="dc-code" className="mb-1 block text-xs text-text-700">
                کد
              </label>
              <input
                id="dc-code"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MEHR1405"
                className={cn(field, "font-mono")}
              />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>
            <div>
              <div className="mb-1 flex gap-1.5">
                {(["percent", "fixed"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setKind(k)} className={chip(kind === k)}>
                    {k === "percent" ? "درصدی" : "مبلغ ثابت"}
                  </button>
                ))}
              </div>
              <input
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={kind === "percent" ? "درصد — مثلاً ۱۵" : "تومان — مثلاً ۲۰۰۰۰۰"}
                aria-label="مقدار تخفیف"
                className={cn(field, "tnum")}
              />
              {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
            </div>
            <div>
              <label htmlFor="dc-max" className="mb-1 block text-xs text-text-700">
                سقف تعداد استفاده
              </label>
              <input
                id="dc-max"
                inputMode="numeric"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="مثلاً ۱۰۰"
                className={cn(field, "tnum")}
              />
              {errors.maxUses && <p className="mt-1 text-xs text-red-500">{errors.maxUses}</p>}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs text-text-700">
              مدت اعتبار از امروز — تا{" "}
              <span className="font-medium">{formatJalali(addDaysIso(DEMO_TODAY_ISO, days))}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VALIDITY_DAYS.map((d) => (
                <button key={d} type="button" onClick={() => setDays(d)} className={chip(days === d)}>
                  {toPersianDigits(d)} روز
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs text-text-700">پلن‌ها (هیچ‌کدوم = همه)</div>
            <div className="flex flex-wrap gap-1.5">
              {paidPlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanIds((l) => toggle(l, p.id))}
                  className={chip(planIds.includes(p.id))}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs text-text-700">مدت اشتراک (هیچ‌کدوم = همه)</div>
            <div className="flex flex-wrap gap-1.5">
              {PACKAGE_DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDurationIds((l) => toggle(l, d.id))}
                  className={chip(durationIds.includes(d.id))}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-text-700">
            <input type="checkbox" checked={firstOnly} onChange={(e) => setFirstOnly(e.target.checked)} />
            فقط برای خرید اول (مشتری جدید)
          </label>

          <Button type="submit" size="md">
            ساخت کد
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
