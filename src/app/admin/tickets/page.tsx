"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LifeBuoy, Send, Lock, Paperclip, History, ArrowLeftRight, Receipt, AlertTriangle, Star } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminRow, EntityActivity, ExportButton, FilterSelect, SearchBox } from "@/components/admin/AdminKit";
import {
  CANNED_REPLIES,
  LOG_ADMINS,
  TICKET_CATEGORIES,
  TICKET_PRIORITY,
  TICKET_STATUS,
  studentAssignments,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketRole,
  type TicketStatus,
} from "@/lib/mock-data";
import { adminUpdate, slaState, supportMessage, useTickets } from "@/lib/ticket-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn, toPersianDigits } from "@/lib/utils";

const STATUS_TONE: Record<TicketStatus, "info" | "warning" | "success" | "neutral"> = {
  new: "info",
  in_progress: "warning",
  answered: "success",
  closed: "neutral",
};
const PRIORITY_TONE: Record<TicketPriority, "danger" | "warning" | "neutral"> = {
  urgent: "danger",
  high: "warning",
  normal: "neutral",
  low: "neutral",
};
const selectClass = "h-9 w-full rounded-x-sm border border-border bg-surface px-3 text-xs text-text-900";

export default function AdminTicketsPage() {
  return (
    <AdminShell>
      <Suspense>
        <Tickets />
      </Suspense>
    </AdminShell>
  );
}

function Tickets() {
  const tickets = useTickets();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "همه">("همه");
  const [category, setCategory] = useState<TicketCategory | "همه">("همه");
  const [priority, setPriority] = useState<TicketPriority | "همه">("همه");
  const [role, setRole] = useState<TicketRole | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(useSearchParams().get("t"));

  // Overdue first, then by priority, closed tickets last.
  const sorted = useMemo(
    () =>
      [...tickets].sort((a, b) => {
        const closed = Number(a.status === "closed") - Number(b.status === "closed");
        if (closed) return closed;
        const overdue = Number(slaState(b).overdue) - Number(slaState(a).overdue);
        if (overdue) return overdue;
        return TICKET_PRIORITY[a.priority].rank - TICKET_PRIORITY[b.priority].rank;
      }),
    [tickets]
  );
  const filtered = sorted.filter(
    (t) =>
      (status === "همه" || t.status === status) &&
      (category === "همه" || t.category === category) &&
      (priority === "همه" || t.priority === priority) &&
      (role === "همه" || t.requester.role === role) &&
      (!query.trim() ||
        [t.id, t.subject, t.requester.name, ...t.messages.map((m) => m.text)].some((v) => v.includes(query.trim())))
  );

  const open = tickets.filter((t) => t.status !== "closed");
  const overdue = open.filter((t) => slaState(t).overdue).length;
  const waiting = open.filter((t) => t.status === "new" || t.status === "in_progress").length;
  const rated = tickets.filter((t) => t.rating);
  const avgRating = rated.length ? rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length : 0;

  function exportTickets() {
    downloadCsv(
      "x-platform-tickets.csv",
      toCsv(
        ["شماره", "موضوع", "دسته", "اولویت", "وضعیت", "درخواست‌دهنده", "نقش", "مسئول", "ثبت", "تعداد پیام", "امتیاز"],
        filtered.map((t) => [
          t.id,
          t.subject,
          t.category,
          TICKET_PRIORITY[t.priority].label,
          TICKET_STATUS[t.status].label,
          t.requester.name,
          t.requester.role,
          t.assignee,
          t.createdAt,
          String(t.messages.length),
          t.rating ? String(t.rating) : "",
        ])
      )
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LifeBuoy size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تیکت‌های پشتیبانی</h1>
        </div>
        <ExportButton count={filtered.length} onExport={exportTickets} />
      </div>
      <p className="mb-5 text-sm text-text-500">
        یک کانال برای همه — دانش‌آموز، والد و مشاور. شکایت‌ها هم همین‌جا به‌عنوان تیکت دسته‌ی «مشاور» ثبت می‌شن.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="تیکت باز" value={toPersianDigits(open.length)} onClick={() => setStatus("همه")} />
        <Stat label="دیرکرده (بیش از مهلت پاسخ)" value={toPersianDigits(overdue)} danger={overdue > 0} />
        <Stat label="منتظر پشتیبانی" value={toPersianDigits(waiting)} onClick={() => setStatus("new")} />
        <Stat
          label="میانگین رضایت"
          value={
            rated.length ? (
              <>
                <span className="tnum">{toPersianDigits(avgRating.toFixed(1))}</span> از ۵
              </>
            ) : (
              "—"
            )
          }
        />
      </div>

      <SearchBox value={query} onChange={setQuery} placeholder="جستجو در شماره، موضوع، نام یا متن پیام‌ها..." />
      <div className="mb-4 mt-3 flex flex-wrap items-center gap-2">
        <FilterSelect
          label="وضعیت"
          value={status}
          onChange={setStatus}
          options={(Object.keys(TICKET_STATUS) as TicketStatus[]).map((s) => ({
            value: s,
            label: TICKET_STATUS[s].label,
          }))}
        />
        <FilterSelect
          label="دسته"
          value={category}
          onChange={setCategory}
          options={TICKET_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="اولویت"
          value={priority}
          onChange={setPriority}
          options={(Object.keys(TICKET_PRIORITY) as TicketPriority[]).map((p) => ({
            value: p,
            label: TICKET_PRIORITY[p].label,
          }))}
        />
        <FilterSelect
          label="نقش"
          value={role}
          onChange={setRole}
          options={(["دانش‌آموز", "والد", "مشاور"] as TicketRole[]).map((r) => ({ value: r, label: r }))}
        />
        <span className="mr-auto text-xs text-text-500">
          <span className="tnum">{toPersianDigits(filtered.length)}</span> تیکت
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => {
          const sla = slaState(t);
          return (
            <AdminRow
              key={t.id}
              open={openId === t.id}
              onToggle={() => setOpenId(openId === t.id ? null : t.id)}
              className={cn(sla.overdue && "border-red-500/40")}
              summary={
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="tnum text-xs text-text-500">{t.id}</span>
                      <span className="text-sm font-medium text-text-900">{t.subject}</span>
                      <Badge tone={PRIORITY_TONE[t.priority]}>{TICKET_PRIORITY[t.priority].label}</Badge>
                      {sla.overdue && (
                        <span className="flex items-center gap-0.5 text-[11px] text-red-500">
                          <AlertTriangle size={11} /> دیرکرده
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-text-500">
                      {t.requester.name} ({t.requester.role}) · {t.category} · {t.createdAt}
                      {t.assignee && ` · مسئول: ${t.assignee}`}
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[t.status]}>{TICKET_STATUS[t.status].label}</Badge>
                </div>
              }
            >
              <TicketDetail ticket={t} />
            </AdminRow>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-500">تیکتی با این فیلترها پیدا نشد.</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="rounded-x-md border border-border bg-surface p-3 text-right transition-colors enabled:hover:border-blue-300"
    >
      <div className={cn("text-xl font-bold", danger ? "text-red-500" : "text-text-900")}>{value}</div>
      <div className="text-xs text-text-500">{label}</div>
    </button>
  );
}

function TicketDetail({ ticket: t }: { ticket: Ticket }) {
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const sla = slaState(t);
  const assignment = studentAssignments.find((a) => a.name === t.requester.name);

  function send() {
    if (!text.trim()) return;
    supportMessage(t.id, text.trim(), internal);
    setText("");
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
      {/* Conversation */}
      <div>
        <div className="space-y-3">
          {t.messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "user" ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[90%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.8]",
                  m.from === "user" && "border border-border bg-surface-2 text-text-700",
                  m.from === "support" && "bg-navy-900 text-white",
                  m.from === "internal" && "border border-dashed border-yellow-400/60 bg-yellow-400/10 text-text-700"
                )}
              >
                <div
                  className={cn(
                    "mb-0.5 flex items-center gap-1 text-[11px] font-medium",
                    m.from === "support" ? "text-white/70" : "text-text-500"
                  )}
                >
                  {m.from === "internal" && <Lock size={10} />}
                  {m.author}
                  {m.from === "internal" && " — یادداشت داخلی (کاربر نمی‌بینه)"}
                </div>
                {m.text}
                {m.attachment && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
                    <Paperclip size={11} /> {m.attachment}
                  </div>
                )}
                <div className={cn("tnum mt-1 text-[10px]", m.from === "support" ? "text-white/60" : "text-text-500")}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {t.status !== "closed" && (
          <div className="mt-4">
            <div className="mb-2 flex gap-1.5">
              {[false, true].map((isInternal) => (
                <button
                  key={String(isInternal)}
                  type="button"
                  onClick={() => setInternal(isInternal)}
                  className={cn(
                    "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                    internal === isInternal
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700"
                  )}
                >
                  {isInternal ? "یادداشت داخلی" : "پاسخ به کاربر"}
                </button>
              ))}
            </div>
            {!internal && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {CANNED_REPLIES.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => setText(c.text)}
                    className="rounded-x-pill bg-surface-2 px-2.5 py-1 text-[11px] text-text-700 hover:text-blue-600"
                  >
                    + {c.title}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              aria-label={internal ? "یادداشت داخلی" : "پاسخ به کاربر"}
              placeholder={internal ? "فقط تیم پشتیبانی می‌بینه..." : `پاسخ به ${t.requester.name}...`}
              className={cn(
                "w-full rounded-x-md border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600",
                internal ? "border-yellow-400/60" : "border-border"
              )}
            />
            <Button size="md" className="mt-2" disabled={!text.trim()} onClick={send}>
              {internal ? <Lock size={14} /> : <Send size={14} />}
              {internal ? "ثبت یادداشت داخلی" : "ارسال پاسخ"}
            </Button>
          </div>
        )}
      </div>

      {/* Properties */}
      <div className="space-y-4">
        <div className="space-y-2 rounded-x-md bg-surface-2 p-3 text-xs">
          <Field label="وضعیت">
            <select
              value={t.status}
              onChange={(e) => adminUpdate(t.id, { status: e.target.value as TicketStatus })}
              aria-label="وضعیتِ این تیکت"
              className={selectClass}
            >
              {(Object.keys(TICKET_STATUS) as TicketStatus[]).map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS[s].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="اولویت">
            <select
              value={t.priority}
              onChange={(e) => adminUpdate(t.id, { priority: e.target.value as TicketPriority })}
              aria-label="اولویتِ این تیکت"
              className={selectClass}
            >
              {(Object.keys(TICKET_PRIORITY) as TicketPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TICKET_PRIORITY[p].label} (مهلت {toPersianDigits(TICKET_PRIORITY[p].slaHours)} ساعت)
                </option>
              ))}
            </select>
          </Field>
          <Field label="دسته">
            <select
              value={t.category}
              onChange={(e) => adminUpdate(t.id, { category: e.target.value as TicketCategory })}
              aria-label="دسته‌ی این تیکت"
              className={selectClass}
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="مسئول">
            <select
              value={t.assignee}
              onChange={(e) => adminUpdate(t.id, { assignee: e.target.value })}
              aria-label="مسئولِ این تیکت"
              className={selectClass}
            >
              <option value="">بدون مسئول</option>
              {LOG_ADMINS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <div className="border-t border-border pt-2 text-text-700">
            {t.status === "closed" ? (
              t.rating ? (
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" /> رضایت کاربر:{" "}
                  <span className="tnum">{toPersianDigits(t.rating)}</span> از ۵
                </span>
              ) : (
                "بسته شده — کاربر هنوز امتیاز نداده"
              )
            ) : t.messages.some((m) => m.from === "support") ? (
              "اولین پاسخ داده شده"
            ) : sla.overdue ? (
              <span className="text-red-500">
                اولین پاسخ دیر شده — مهلت {toPersianDigits(TICKET_PRIORITY[t.priority].slaHours)} ساعت بود
              </span>
            ) : (
              <span>
                مهلت اولین پاسخ: <span className="tnum">{toPersianDigits(sla.hoursLeft)}</span> ساعت دیگه
              </span>
            )}
          </div>
        </div>

        {(t.category === "مشاور" || t.category === "پرداخت و اشتراک") && (
          <div className="flex flex-wrap gap-3 text-xs">
            {t.category === "مشاور" && assignment && (
              <Link
                href={`/admin/reassign?student=${assignment.userId}`}
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ArrowLeftRight size={12} /> تعویض مشاور {t.requester.name}
              </Link>
            )}
            {t.category === "پرداخت و اشتراک" && (
              <Link href="/admin/payments" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Receipt size={12} /> تراکنش‌ها
              </Link>
            )}
          </div>
        )}

        <EntityActivity match={t.requester.name} />

        {t.history.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-text-900">
              <History size={12} className="text-text-500" /> تاریخچه‌ی تیکت
            </div>
            <ol className="space-y-1 text-[11px] text-text-500">
              {[...t.history].reverse().map((h, i) => (
                <li key={i}>
                  <span className="text-text-700">{h.by}</span> · {h.at} · {h.change}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-text-500">{label}</span>
      {children}
    </label>
  );
}
