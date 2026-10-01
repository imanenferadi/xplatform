"use client";

import { FormActions } from "@/components/ui/Form";
import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  ArrowRight,
  Paperclip,
  Send,
  Star,
  CheckCircle2,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FAQ_FOR_CATEGORY,
  TICKET_CATEGORIES,
  TICKET_STATUS,
  type Ticket,
  type TicketCategory,
  type TicketRole,
  type TicketStatus,
} from "@/lib/mock-data";
import { FAQ } from "@/lib/faq";
import {
  adminUpdate,
  createTicket,
  markReadByUser,
  rateTicket,
  useMyTickets,
  userReply,
} from "@/lib/ticket-store";
import { cn, toPersianDigits } from "@/lib/utils";

const STATUS_TONE: Record<
  TicketStatus,
  "info" | "warning" | "success" | "neutral"
> = {
  new: "info",
  in_progress: "warning",
  answered: "success",
  closed: "neutral",
};

const INTRO: Record<TicketRole, string> = {
  دانش‌آموز: "مشکل فنی، پرداخت، درخواست تعویض مشاور یا هر چیز دیگه",
  والد: "سؤال درباره‌ی پرداخت، فاکتور، اشتراک یا روند کار فرزندتون",
  مشاور: "مشکل فنی، تسویه و شبا، حساب کاربری یا هر چیز دیگه",
};

const MAX_SUBJECT = 80;
const MAX_TEXT = 2000;

/** The requester sees which team has their ticket — never the internal notes. */
const TEAM: Record<string, string> = {
  finance: "تیم مالی",
  tech_support: "تیم فنی",
  edu_support: "تیم آموزشی",
  ops: "تیم عملیات",
  super: "مدیریت",
};
function handledBy(t: Ticket): string | null {
  const open = t.referrals?.filter((r) => r.status === "open") ?? [];
  return open.length
    ? `در حال بررسی توسط ${open.map((r) => TEAM[r.toRole]).join(" و ")}`
    : null;
}

// The requester's side of support tickets — same component for student,
// parent and mentor; only who's asking changes.
export function SupportCenter({
  requester,
}: {
  requester: { name: string; role: TicketRole; userId?: string };
}) {
  const tickets = useMyTickets(requester.name);
  const [view, setView] = useState<
    { kind: "list" } | { kind: "new" } | { kind: "ticket"; id: string }
  >({
    kind: "list",
  });
  const [justCreated, setJustCreated] = useState("");

  function open(id: string) {
    markReadByUser(id);
    setView({ kind: "ticket", id });
  }

  const current =
    view.kind === "ticket" ? tickets.find((t) => t.id === view.id) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LifeBuoy size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">پشتیبانی</h1>
        </div>
        {view.kind === "list" && (
          <Button size="md" onClick={() => setView({ kind: "new" })}>
            <Plus size={15} /> تیکت جدید
          </Button>
        )}
      </div>
      <p className="mb-6 text-sm text-text-500">
        {INTRO[requester.role]} — اینجا ثبت کن و همین‌جا جواب بگیر.
      </p>

      {view.kind === "list" && (
        <>
          {justCreated && (
            <div className="mb-4 flex items-center gap-2 rounded-x-md border border-mint-500/30 bg-mint-500/10 p-3 text-sm text-text-900">
              <CheckCircle2 size={15} className="text-mint-500" />
              تیکت <span className="tnum font-medium">{justCreated}</span> ثبت
              شد. جواب رو همین‌جا می‌بینی.
            </div>
          )}
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => open(t.id)}
                className="block w-full text-right"
              >
                <Card
                  interactive
                  className={cn(t.unreadForUser && "border-blue-600/40")}
                >
                  <CardContent className="flex items-center gap-3 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">
                          {t.subject}
                        </span>
                        {t.unreadForUser && (
                          <Badge tone="info">پاسخ جدید</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">
                        <span className="tnum">{t.id}</span> · {t.category} ·{" "}
                        {t.createdAt}
                        {handledBy(t) && ` · ${handledBy(t)}`}
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[t.status]}>
                      {TICKET_STATUS[t.status].userLabel}
                    </Badge>
                    <ChevronLeft size={16} className="shrink-0 text-text-500" />
                  </CardContent>
                </Card>
              </button>
            ))}
            {tickets.length === 0 && (
              <p className="py-10 text-center text-sm text-text-500">
                هنوز تیکتی ثبت نکردی.
              </p>
            )}
          </div>
          <Link
            href="/help"
            className="mt-6 flex items-center gap-2 text-xs text-text-500 hover:text-text-900"
          >
            <HelpCircle size={14} /> قبل از تیکت، راهنما و سؤالات متداول رو ببین
          </Link>
        </>
      )}

      {view.kind === "new" && (
        <NewTicket
          requester={requester}
          onCancel={() => setView({ kind: "list" })}
          onCreated={(id) => {
            setJustCreated(id);
            setView({ kind: "list" });
          }}
        />
      )}

      {view.kind === "ticket" && current && (
        <TicketThread
          ticket={current}
          requesterName={requester.name}
          onBack={() => setView({ kind: "list" })}
        />
      )}
    </div>
  );
}

function NewTicket({
  requester,
  onCancel,
  onCreated,
}: {
  requester: { name: string; role: TicketRole; userId?: string };
  onCancel: () => void;
  onCreated: (id: string) => void;
}) {
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState("");
  const [errors, setErrors] = useState<{
    category?: string;
    subject?: string;
    text?: string;
  }>({});

  const faqSection = category && FAQ_FOR_CATEGORY[category];
  const suggestions = faqSection
    ? (FAQ.find((f) => f.title === faqSection)?.items ?? [])
    : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!category) next.category = "دسته رو انتخاب کن.";
    if (subject.trim().length < 5)
      next.subject = "یه موضوع کوتاه بنویس (حداقل ۵ حرف).";
    if (text.trim().length < 15)
      next.text = "مشکل رو کامل‌تر توضیح بده (حداقل ۱۵ حرف) تا سریع‌تر حل بشه.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !category) return;
    onCreated(
      createTicket({
        subject: subject.trim(),
        category,
        text: text.trim(),
        attachment: attachment || undefined,
        requester,
      }),
    );
  }

  return (
    <Card>
      <CardContent>
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 flex items-center gap-1 text-xs text-text-500 hover:text-text-900"
        >
          <ArrowRight size={13} /> تیکت‌های من
        </button>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium text-text-700">
              درباره‌ی چیه؟
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TICKET_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    setErrors((er) => ({ ...er, category: undefined }));
                  }}
                  className={cn(
                    "rounded-x-md border-2 px-3 py-2.5 text-sm transition-colors",
                    category === c
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.category && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.category}
              </p>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="rounded-x-md bg-surface-2 p-3">
              <div className="mb-1.5 text-xs font-medium text-text-900">
                شاید جوابت اینجا باشه:
              </div>
              {suggestions.map((s) => (
                <details key={s.q} className="py-1 text-xs">
                  <summary className="cursor-pointer text-blue-600 marker:content-none">
                    {s.q}
                  </summary>
                  <p className="mt-1 leading-[1.8] text-text-700">{s.a}</p>
                </details>
              ))}
            </div>
          )}

          <div>
            <label
              htmlFor="ticket-subject"
              className="mb-1.5 block text-sm font-medium text-text-700"
            >
              موضوع
            </label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value.slice(0, MAX_SUBJECT));
                setErrors((er) => ({ ...er, subject: undefined }));
              }}
              placeholder="مثلاً: عکس کارنامه آپلود نمی‌شه"
              className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            {errors.subject && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ticket-text"
              className="mb-1.5 block text-sm font-medium text-text-700"
            >
              توضیح
            </label>
            <textarea
              id="ticket-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value.slice(0, MAX_TEXT));
                setErrors((er) => ({ ...er, text: undefined }));
              }}
              rows={5}
              placeholder="چی شد، کِی شد، و انتظار داشتی چی بشه؟"
              className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            {errors.text && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.text}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-500 hover:text-text-900">
            <Paperclip size={14} />
            {attachment
              ? `پیوست: ${attachment}`
              : "پیوست عکس یا فایل (اختیاری)"}
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? "")}
            />
          </label>

          <FormActions>
            <Button type="submit" size="md">
              <Send size={14} /> ثبت تیکت
            </Button>
            <Button
              type="button"
              size="md"
              variant="secondary"
              onClick={onCancel}
            >
              انصراف
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

function TicketThread({
  ticket: t,
  requesterName,
  onBack,
}: {
  ticket: Ticket;
  requesterName: string;
  onBack: () => void;
}) {
  const [reply, setReply] = useState("");
  // Internal notes are for the support team only — never rendered here.
  const visible = t.messages.filter((m) => m.from !== "internal");

  return (
    <Card>
      <CardContent>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-xs text-text-500 hover:text-text-900"
        >
          <ArrowRight size={13} /> تیکت‌های من
        </button>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-bold text-text-900">{t.subject}</h2>
            <div className="mt-0.5 text-xs text-text-500">
              <span className="tnum">{t.id}</span> · {t.category} ·{" "}
              {t.createdAt}
            </div>
            {handledBy(t) && (
              <div className="mt-1 text-xs font-medium text-blue-600">
                {handledBy(t)}
              </div>
            )}
          </div>
          <Badge tone={STATUS_TONE[t.status]}>
            {TICKET_STATUS[t.status].userLabel}
          </Badge>
        </div>

        <div className="space-y-3">
          {visible.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.from === "user" ? "justify-start" : "justify-end",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.8]",
                  m.from === "user"
                    ? "bg-navy-900 text-white"
                    : "border border-border bg-surface-2 text-text-700",
                )}
              >
                <div
                  className={cn(
                    "mb-0.5 text-xs font-medium",
                    m.from === "user" ? "text-white/70" : "text-blue-600",
                  )}
                >
                  {m.from === "user" ? "شما" : `${m.author} — پشتیبانی`}
                </div>
                {m.text}
                {m.attachment && (
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs",
                      m.from === "user" ? "text-white/70" : "text-text-500",
                    )}
                  >
                    <Paperclip size={11} /> {m.attachment}
                  </div>
                )}
                <div
                  className={cn(
                    "tnum mt-1 text-xs",
                    m.from === "user" ? "text-white/60" : "text-text-500",
                  )}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {t.status === "closed" ? (
          <div className="mt-5 rounded-x-md bg-surface-2 p-4 text-center">
            <p className="text-sm text-text-700">این تیکت بسته شده.</p>
            {t.rating ? (
              <p className="mt-1 text-xs text-text-500">
                امتیازت:{" "}
                <span className="tnum">{toPersianDigits(t.rating)}</span> از ۵ —
                ممنون!
              </p>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-text-500">
                  از پاسخ پشتیبانی راضی بودی؟
                </p>
                <div className="mt-1.5 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => rateTicket(t.id, n)}
                      aria-label={`${n} ستاره`}
                    >
                      <Star
                        size={24}
                        className="text-border hover:fill-yellow-400 hover:text-yellow-400"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reply.trim()) return;
              userReply(t.id, requesterName, reply.trim());
              setReply("");
            }}
            className="mt-5 space-y-2"
          >
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value.slice(0, MAX_TEXT))}
              rows={3}
              placeholder="جواب یا توضیح بیشتر..."
              className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="md" disabled={!reply.trim()}>
                <Send size={14} /> ارسال
              </Button>
              <button
                type="button"
                onClick={() =>
                  adminUpdate(t.id, { status: "closed" }, requesterName)
                }
                className="text-xs text-text-500 hover:text-text-900"
              >
                مشکلم حل شد، تیکت رو ببند
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
