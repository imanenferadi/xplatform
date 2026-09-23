"use client";

import { useState } from "react";
import { UserCheck, Check, X } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { mentorApplications as initialApplications, type MentorApplication } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

const statusMeta: Record<MentorApplication["status"], { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "در انتظار بررسی", tone: "warning" },
  approved: { label: "تأییدشده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
};

export default function AdminMentorsPage() {
  const [applications, setApplications] = useState(initialApplications);

  function setStatus(id: string, status: MentorApplication["status"]) {
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <UserCheck size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">تأیید مشاوران</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(pending.length)}</span> درخواست در انتظار بررسی
        </p>

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

        {decided.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-sm font-bold text-text-900">تصمیم‌های قبلی</h2>
            <div className="space-y-2">
              {decided.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-x-md border border-border bg-surface p-3.5">
                  <div>
                    <div className="text-sm font-medium text-text-900">{a.name}</div>
                    <div className="text-xs text-text-500">{a.major} — {a.school}</div>
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
