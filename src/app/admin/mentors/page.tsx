"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserCheck, Check, X, Send, Copy, Link2, Eye, FileText, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { MentorProfileView } from "@/components/app/MentorProfileView";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  AdminRow,
  DetailList,
  EntityActivity,
  EntityFollowUp,
  ExportButton,
  FilterSelect,
  FollowUpBadges,
  ReasonPrompt,
  SearchBox,
  Allowed,
} from "@/components/admin/AdminKit";
import {
  MENTOR_REJECT_REASONS,
  MENTOR_VERIFY_STEPS,
  mentorApplications as initialApplications,
  type ExamGroup,
  type Mentor,
} from "@/lib/mock-data";
import { setApplicationStatus, useStoredApplications } from "@/lib/mentor-applications-store";
import { logEvent } from "@/lib/admin-log-store";
import { nowClock } from "@/lib/followup-store";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toPersianDigits } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";
type Source = "site" | "queue";

// One shape for both queues: the public /mentor/apply form (full built
// profile, kept in the browser) and the older seeded queue.
type AppRow = {
  id: string;
  source: Source;
  name: string;
  rank: string;
  year: string;
  school: string;
  major: string;
  group: ExamGroup;
  style: string;
  capacity: number;
  phone: string;
  karnamehFile: string;
  appliedAt: string;
  status: Status;
  mentor?: Mentor;
};

type DirectInvite = { id: string; name: string; link: string; createdAt: string; copied: boolean };

const statusMeta: Record<Status, { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};
const sourceLabel: Record<Source, string> = { site: "ثبت‌نام از سایت", queue: "صف قبلی" };

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Opened from the global search (Ctrl/⌘+K) with ?q= prefilled.
export default function AdminMentorsPageRoute() {
  return (
    <AdminShell>
      <Suspense>
        <AdminMentorsPage />
      </Suspense>
    </AdminShell>
  );
}

function AdminMentorsPage() {
  const [seedApps, setSeedApps] = useState(initialApplications);
  const stored = useStoredApplications();
  const [query, setQuery] = useState(useSearchParams().get("q") ?? "");
  const [status, setStatus] = useState<Status | "همه">("همه");
  const [source, setSource] = useState<Source | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  // Verification checklist per application — approval needs every step.
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});
  const [inviteName, setInviteName] = useState("");
  const [invites, setInvites] = useState<DirectInvite[]>([]);
  const nextId = useRef(1);

  const rows: AppRow[] = useMemo(
    () => [
      ...stored.map((a) => ({
        id: a.id,
        source: "site" as const,
        name: a.mentor.name,
        rank: a.mentor.rank,
        year: a.mentor.year,
        school: a.mentor.school,
        major: a.mentor.major,
        group: a.mentor.group,
        style: a.mentor.style,
        capacity: a.mentor.capacityTotal,
        phone: a.phone,
        karnamehFile: a.karnamehFileName,
        appliedAt: a.appliedAt,
        status: a.status,
        mentor: a.mentor,
      })),
      ...seedApps.map((a) => ({ ...a, source: "queue" as const, karnamehFile: a.karnamehFile })),
    ],
    [stored, seedApps]
  );

  const filtered = rows.filter(
    (r) =>
      (status === "همه" || r.status === status) &&
      (source === "همه" || r.source === source) &&
      (!query.trim() || [r.name, r.school, r.major, r.phone].some((v) => v.includes(query.trim())))
  );
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  function decide(r: AppRow, next: "approved" | "rejected", reason = "", note = "") {
    if (r.source === "site") setApplicationStatus(r.id, next);
    else setSeedApps((apps) => apps.map((a) => (a.id === r.id ? { ...a, status: next } : a)));
    setRejecting(null);
    const approved = next === "approved";
    logEvent({
      category: "مشاوران",
      action: approved ? "تأیید درخواست مشاور" : "رد درخواست مشاور",
      target: r.name,
      severity: "info",
      details: [
        { label: "رتبه", value: `${r.rank} · ${r.year}` },
        { label: "منبع درخواست", value: sourceLabel[r.source] },
        { label: "مدرک احراز", value: r.karnamehFile },
        ...(approved
          ? [{ label: "احراز", value: MENTOR_VERIFY_STEPS.join("، ") }]
          : [{ label: "دلیل رد", value: note ? `${reason} — ${note}` : reason }]),
        { label: "وضعیت", value: `در انتظار ← ${approved ? "تأییدشده" : "رد شده"}` },
      ],
      href: "/admin/mentors",
    });
  }

  function toggleCheck(id: string, i: number) {
    setChecks((c) => {
      const list = c[id] ?? MENTOR_VERIFY_STEPS.map(() => false);
      return { ...c, [id]: list.map((v, j) => (j === i ? !v : v)) };
    });
  }

  function generateInviteLink() {
    if (!inviteName.trim()) return;
    const link = `https://x-platform.ir/mentor-invite/${generateToken()}`;
    setInvites((inv) => [
      { id: `di-${nextId.current++}`, name: inviteName.trim(), link, createdAt: `امروز، ${nowClock()}`, copied: false },
      ...inv,
    ]);
    logEvent({
      category: "مشاوران",
      action: "ساخت لینک دعوت مستقیم مشاور",
      target: inviteName.trim(),
      severity: "info",
      details: [
        { label: "لینک", value: link },
        { label: "انقضا", value: "۷ روز" },
      ],
      href: "/admin/mentors",
    });
    setInviteName("");
  }

  async function copyInviteLink(invite: DirectInvite) {
    try {
      await navigator.clipboard.writeText(invite.link);
      setInvites((inv) => inv.map((x) => (x.id === invite.id ? { ...x, copied: true } : x)));
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // link is still visible on screen to copy manually.
    }
  }

  function exportApps() {
    downloadCsv(
      "x-platform-mentor-applications.csv",
      toCsv(
        [
          "نام",
          "منبع",
          "رتبه",
          "سال",
          "گروه",
          "دانشگاه",
          "رشته",
          "سبک",
          "ظرفیت",
          "موبایل",
          "کارنامه",
          "تاریخ",
          "وضعیت",
        ],
        filtered.map((r) => [
          r.name,
          sourceLabel[r.source],
          r.rank,
          r.year,
          r.group,
          r.school,
          r.major,
          r.style,
          String(r.capacity),
          r.phone,
          r.karnamehFile,
          r.appliedAt,
          statusMeta[r.status].label,
        ])
      )
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">تأیید مشاوران</h1>
          </div>
          <ExportButton count={filtered.length} onExport={exportApps} />
        </div>
        <p className="mb-5 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(pendingCount)}</span> درخواست در انتظار بررسی
        </p>

        {/* Direct invite — complements the public application form: admin
            can invite a specific top-rank student directly. */}
        <Card className="mb-6">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <Send size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">دعوت مستقیم مشاور</h2>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="نام رتبه‌برتری که می‌خوای دعوت کنی"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="flex-1"
              />
              <Allowed perm="mentors.approve">
                <Button onClick={generateInviteLink} disabled={!inviteName.trim()}>
                  <Link2 size={15} />
                  تولید لینک دعوت
                </Button>
              </Allowed>
            </div>
            {invites.length > 0 && (
              <div className="mt-4 space-y-2">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 rounded-x-md bg-surface-2 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-900">
                        {inv.name}
                        <Badge tone={inv.copied ? "success" : "neutral"}>
                          {inv.copied ? "کپی شد" : "هنوز ارسال نشده"}
                        </Badge>
                      </div>
                      <div dir="ltr" className="tnum truncate text-xs text-text-500">
                        {inv.link}
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">ساخته‌شده {inv.createdAt} · انقضا: ۷ روز</div>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-x-md border border-border bg-surface text-text-700 transition-colors hover:bg-surface-2"
                      aria-label="کپی لینک"
                    >
                      {inv.copied ? <Check size={14} className="text-mint-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SearchBox value={query} onChange={setQuery} placeholder="جستجو با نام، دانشگاه، رشته یا موبایل..." />
        <div className="mb-4 mt-3 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="وضعیت"
            value={status}
            onChange={setStatus}
            options={(Object.keys(statusMeta) as Status[]).map((s) => ({ value: s, label: statusMeta[s].label }))}
          />
          <FilterSelect
            label="منبع"
            value={source}
            onChange={setSource}
            options={(Object.keys(sourceLabel) as Source[]).map((s) => ({ value: s, label: sourceLabel[s] }))}
          />
          <span className="mr-auto text-xs text-text-500">
            <span className="tnum">{toPersianDigits(filtered.length)}</span> درخواست
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((r) => {
            const key = `app:${r.id}`;
            const list = checks[r.id] ?? MENTOR_VERIFY_STEPS.map(() => false);
            const verified = list.every(Boolean);
            return (
              <AdminRow
                key={r.id}
                open={openId === r.id}
                onToggle={() => {
                  setOpenId(openId === r.id ? null : r.id);
                  setRejecting(null);
                }}
                className={r.status === "pending" && r.source === "site" ? "border-blue-600/30" : undefined}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{r.name}</span>
                        <Badge tone={r.source === "site" ? "info" : "neutral"}>{sourceLabel[r.source]}</Badge>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">
                        {r.rank} · {r.year} · {r.group} · {r.major} — {r.school}
                      </div>
                    </div>
                    <Badge tone={statusMeta[r.status].tone}>{statusMeta[r.status].label}</Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="مشخصات درخواست"
                      rows={[
                        ["رتبه و سال", `${r.rank} · ${r.year}`],
                        ["گروه آزمایشی", r.group],
                        ["دانشگاه و رشته", `${r.major} — ${r.school}`],
                        ["سبک مشاوره", r.style],
                        ["ظرفیت اعلام‌شده", `${toPersianDigits(r.capacity)} دانش‌آموز`],
                        [
                          "موبایل",
                          <span key="p" dir="ltr" className="tnum">
                            {r.phone}
                          </span>,
                        ],
                        [
                          "کارنامه",
                          <span key="k" className="flex items-center gap-1">
                            <FileText size={12} /> {r.karnamehFile}
                          </span>,
                        ],
                        ["تاریخ درخواست", r.appliedAt],
                      ]}
                    />

                    {r.status === "pending" && (
                      <div>
                        <div className="mb-2 flex items-center gap-1 text-xs font-bold text-text-900">
                          <ShieldCheck size={12} className="text-blue-600" /> چک‌لیست احراز
                        </div>
                        <div className="space-y-1.5">
                          {MENTOR_VERIFY_STEPS.map((step, i) => (
                            <label key={step} className="flex items-center gap-2 text-xs text-text-700">
                              <input type="checkbox" checked={list[i]} onChange={() => toggleCheck(r.id, i)} />
                              {step}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.status === "pending" &&
                      (rejecting === r.id ? (
                        <ReasonPrompt
                          title={`رد درخواست ${r.name}`}
                          reasons={MENTOR_REJECT_REASONS}
                          confirmLabel="رد درخواست"
                          onConfirm={(reason, note) => decide(r, "rejected", reason, note)}
                          onCancel={() => setRejecting(null)}
                        />
                      ) : (
                        <div>
                          <Allowed perm="mentors.approve">
                            <div className="flex gap-2">
                              <Button size="md" variant="secondary" onClick={() => setRejecting(r.id)}>
                                <X size={15} /> رد
                              </Button>
                              <Button size="md" disabled={!verified} onClick={() => decide(r, "approved")}>
                                <Check size={15} /> {r.source === "site" ? "تأیید و انتشار" : "تأیید"}
                              </Button>
                            </div>
                          </Allowed>
                          {!verified && (
                            <p className="mt-1.5 text-xs text-text-500">
                              برای تأیید، همه‌ی مراحل چک‌لیست احراز رو تیک بزن.
                            </p>
                          )}
                        </div>
                      ))}

                    {r.mentor && (
                      <div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPreviewId(previewId === r.id ? null : r.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Eye size={13} />
                            {previewId === r.id ? "بستن پیش‌نمایش" : "پیش‌نمایش پروفایلی که منتشر می‌شه"}
                          </button>
                          {r.status === "approved" && (
                            <Link href={`/mentors/${r.id}`} className="text-xs text-blue-600 hover:underline">
                              مشاهده روی سایت
                            </Link>
                          )}
                        </div>
                        {previewId === r.id && (
                          <div className="mt-3 max-h-[480px] overflow-y-auto rounded-x-lg border border-border">
                            <MentorProfileView mentor={r.mentor} preview />
                          </div>
                        )}
                      </div>
                    )}

                    <EntityActivity match={r.name} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">درخواستی با این فیلترها پیدا نشد.</p>
          )}
        </div>
      </div>
    </>
  );
}
