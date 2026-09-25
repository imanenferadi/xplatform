"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { UserCheck, Check, X, Send, Copy, Link2, Eye, FileText } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { MentorProfileView } from "@/components/app/MentorProfileView";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { mentorApplications as initialApplications, type MentorApplication } from "@/lib/mock-data";
import { setApplicationStatus, useStoredApplications } from "@/lib/mentor-applications-store";
import { logEvent } from "@/lib/admin-log-store";

import { toPersianDigits } from "@/lib/utils";

type DirectInvite = { id: string; name: string; link: string };

const statusMeta: Record<MentorApplication["status"], { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

function logMentorDecision(name: string, rank: string, status: string, source = "صف تأیید") {
  const approved = status === "approved";
  logEvent({
    category: "مشاوران",
    action: approved ? "تأیید درخواست مشاور" : "رد درخواست مشاور",
    target: name,
    severity: "info",
    details: [
      { label: "رتبه", value: rank },
      { label: "منبع درخواست", value: source },
      { label: "وضعیت", value: `در انتظار ← ${approved ? "تأییدشده" : "رد شده"}` },
    ],
    href: "/admin/mentors",
  });
}

export default function AdminMentorsPage() {
  const [applications, setApplications] = useState(initialApplications);
  const [inviteName, setInviteName] = useState("");
  const [invites, setInvites] = useState<DirectInvite[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const nextId = useRef(1);

  function setStatus(id: string, status: MentorApplication["status"]) {
    const app = applications.find((a) => a.id === id);
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status } : a)));
    if (app) logMentorDecision(app.name, `${app.rank} · ${app.year}`, status);
  }

  function decideStored(id: string, name: string, rank: string, status: "approved" | "rejected") {
    setApplicationStatus(id, status);
    logMentorDecision(name, rank, status, "ثبت‌نام از سایت");
  }

  function generateInviteLink() {
    if (!inviteName.trim()) return;
    const link = `https://x-platform.ir/mentor-invite/${generateToken()}`;
    setInvites((inv) => [{ id: `di-${nextId.current++}`, name: inviteName.trim(), link }, ...inv]);
    logEvent({
      category: "مشاوران",
      action: "ساخت لینک دعوت مستقیم مشاور",
      target: inviteName.trim(),
      severity: "info",
      details: [{ label: "لینک", value: link }],
      href: "/admin/mentors",
    });
    setInviteName("");
  }

  async function copyInviteLink(invite: DirectInvite) {
    try {
      await navigator.clipboard.writeText(invite.link);
      setCopiedId(invite.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // link is still visible on screen to copy manually.
    }
  }

  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  // Self-registered via /mentor/apply — these carry a full built profile.
  const stored = useStoredApplications();
  const storedPending = stored.filter((a) => a.status === "pending");
  const storedDecided = stored.filter((a) => a.status !== "pending");
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <UserCheck size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تأیید مشاوران</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(pending.length + storedPending.length)}</span> درخواست در انتظار بررسی
        </p>

        {storedPending.length > 0 && (
          <div className="mb-6 space-y-3">
            {storedPending.map((a) => (
              <Card key={a.id} className="border-blue-600/30">
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-900">{a.mentor.name}</span>
                        <Badge tone="info">ثبت‌نام از سایت</Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-text-500">
                        {a.mentor.rank} · {a.mentor.year} · {a.mentor.group} · {a.mentor.major} — {a.mentor.school}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-500">
                        <span dir="ltr" className="tnum">
                          {a.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> کارنامه: {a.karnamehFileName}
                        </span>
                        <span>{a.appliedAt}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={() => decideStored(a.id, a.mentor.name, a.mentor.rank, "rejected")}
                      >
                        <X size={15} /> رد
                      </Button>
                      <Button size="md" onClick={() => decideStored(a.id, a.mentor.name, a.mentor.rank, "approved")}>
                        <Check size={15} /> تأیید و انتشار
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewId(previewId === a.id ? null : a.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Eye size={13} />
                    {previewId === a.id ? "بستن پیش‌نمایش" : "پیش‌نمایش پروفایلی که منتشر می‌شه"}
                  </button>
                  {previewId === a.id && (
                    <div className="mt-3 max-h-[480px] overflow-y-auto rounded-x-lg border border-border">
                      <MentorProfileView mentor={a.mentor} preview />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Direct invite — complements the public application form above:
            admin can invite a specific top-rank student directly instead
            of waiting for them to apply. */}
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
              <Button onClick={generateInviteLink} disabled={!inviteName.trim()}>
                <Link2 size={15} />
                تولید لینک دعوت
              </Button>
            </div>

            {invites.length > 0 && (
              <div className="mt-4 space-y-2">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 rounded-x-md bg-surface-2 p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-900">{inv.name}</div>
                      <div dir="ltr" className="tnum truncate text-xs text-text-500">
                        {inv.link}
                      </div>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-x-md border border-border bg-surface text-text-700 transition-colors hover:bg-surface-2"
                      aria-label="کپی لینک"
                    >
                      {copiedId === inv.id ? <Check size={14} className="text-mint-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {pending.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-text-900">{a.name}</div>
                  <div className="mt-0.5 text-xs text-text-500">
                    {a.rank} · {a.year} · {a.major} — {a.school}
                  </div>
                  <div className="mt-1 text-xs text-text-500">درخواست: {a.appliedAt}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="md" variant="secondary" onClick={() => setStatus(a.id, "rejected")}>
                    <X size={15} /> رد
                  </Button>
                  <Button size="md" onClick={() => setStatus(a.id, "approved")}>
                    <Check size={15} /> تأیید
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">درخواست جدیدی در انتظار نیست.</p>
          )}
        </div>

        {decided.length + storedDecided.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-sm font-bold text-text-900">تصمیم‌های قبلی</h2>
            <div className="space-y-2">
              {storedDecided.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5"
                >
                  <div>
                    <div className="text-sm font-medium text-text-900">{a.mentor.name}</div>
                    <div className="text-xs text-text-500">
                      {a.mentor.major} — {a.mentor.school}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === "approved" && (
                      <Link href={`/mentors/${a.id}`} className="text-xs text-blue-600 hover:underline">
                        مشاهده روی سایت
                      </Link>
                    )}
                    <Badge tone={statusMeta[a.status].tone}>{statusMeta[a.status].label}</Badge>
                  </div>
                </div>
              ))}
              {decided.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5"
                >
                  <div>
                    <div className="text-sm font-medium text-text-900">{a.name}</div>
                    <div className="text-xs text-text-500">
                      {a.major} — {a.school}
                    </div>
                  </div>
                  <Badge tone={statusMeta[a.status].tone}>{statusMeta[a.status].label}</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
