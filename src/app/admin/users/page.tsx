"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Ban, RotateCcw, ArrowLeftRight, LifeBuoy } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
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
  ReasonPrompt,
  SearchBox,
  Allowed,
} from "@/components/admin/AdminKit";
import { SUSPEND_REASONS, mentors, type AdminUser } from "@/lib/mock-data";
import { logEvent } from "@/lib/admin-log-store";
import { useTickets } from "@/lib/ticket-store";
import { useUsers } from "@/lib/user-edits-store";
import { UserEditPanel } from "@/components/admin/UserEditPanel";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toPersianDigits } from "@/lib/utils";

type Role = AdminUser["role"];
type Status = AdminUser["status"];

// By id, not by name — a support correction to the student's name mustn't lose the mentor.
function currentMentor(mentorId?: string) {
  return mentorId ? (mentors.find((m) => m.id === mentorId)?.name ?? "—") : null;
}

// Opened from the global search (Ctrl/⌘+K) with ?q= prefilled.
export default function AdminUsersPageRoute() {
  return (
    <AdminShell>
      <Suspense>
        <AdminUsersPage />
      </Suspense>
    </AdminShell>
  );
}

function AdminUsersPage() {
  // Seed users with staff corrections applied; suspend state stays page-local as before.
  const edited = useUsers();
  const [statusOverride, setStatusOverride] = useState<Record<string, Status>>({});
  const users = useMemo(
    () => edited.map((u) => (statusOverride[u.id] ? { ...u, status: statusOverride[u.id] } : u)),
    [edited, statusOverride]
  );
  const tickets = useTickets();
  const [query, setQuery] = useState(useSearchParams().get("q") ?? "");
  const [role, setRole] = useState<Role | "همه">("همه");
  const [status, setStatus] = useState<Status | "همه">("همه");
  const [openId, setOpenId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null); // user id awaiting a reason

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (role === "همه" || u.role === role) &&
          (status === "همه" || u.status === status) &&
          (!query.trim() || [u.name, u.phone, u.city].some((v) => v.includes(query.trim())))
      ),
    [users, query, role, status]
  );

  function toggle(id: string) {
    setOpenId(openId === id ? null : id);
    setPrompt(null);
  }

  function setUserStatus(u: AdminUser, next: Status, reason: string, note: string) {
    setStatusOverride((o) => ({ ...o, [u.id]: next }));
    setPrompt(null);
    const suspending = next === "suspended";
    logEvent({
      category: "کاربران",
      action: suspending ? "مسدودسازی حساب" : "رفع مسدودیت حساب",
      target: u.name,
      severity: suspending ? "warning" : "info",
      details: [
        { label: "نقش", value: u.role },
        { label: "موبایل", value: u.phone },
        { label: "وضعیت", value: suspending ? "فعال ← مسدود" : "مسدود ← فعال" },
        ...(reason ? [{ label: "دلیل", value: reason }] : []),
        ...(note ? [{ label: "توضیح", value: note }] : []),
      ],
      href: "/admin/users",
    });
  }

  function exportUsers() {
    downloadCsv(
      "x-platform-users.csv",
      toCsv(
        ["نام", "نقش", "موبایل", "شهر", "پلن", "جمع پرداختی", "عضو از", "آخرین ورود", "وضعیت"],
        filtered.map((u) => [
          u.name,
          u.role,
          u.phone,
          u.city,
          u.plan,
          String(u.totalPaid),
          u.joinedAt,
          u.lastLogin,
          u.status === "active" ? "فعال" : "مسدود",
        ])
      )
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-text-900">کاربران</h1>
          </div>
          <ExportButton count={filtered.length} onExport={exportUsers} />
        </div>
        <p className="mb-4 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(users.length)}</span> کاربر ثبت‌شده ·{" "}
          <span className="tnum">{toPersianDigits(users.filter((u) => u.status === "suspended").length)}</span> مسدود
        </p>

        <SearchBox value={query} onChange={setQuery} placeholder="جستجو با نام، شماره تماس یا شهر..." />
        <div className="mb-4 mt-3 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="نقش"
            value={role}
            onChange={setRole}
            options={[
              { value: "دانش‌آموز", label: "دانش‌آموز" },
              { value: "مشاور", label: "مشاور" },
            ]}
          />
          <FilterSelect
            label="وضعیت"
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: "فعال" },
              { value: "suspended", label: "مسدود" },
            ]}
          />
          <span className="mr-auto text-xs text-text-500">
            <span className="tnum">{toPersianDigits(filtered.length)}</span> کاربر
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((u) => {
            const key = `user:${u.id}`;
            const mentor = u.role === "دانش‌آموز" ? currentMentor(u.mentorId) : null;
            const userTickets = tickets.filter((t) => t.requester.name === u.name);
            return (
              <AdminRow
                key={u.id}
                open={openId === u.id}
                onToggle={() => toggle(u.id)}
                summary={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-text-900">{u.name}</span>
                        <Badge tone="neutral">{u.role}</Badge>
                        <FollowUpBadges entityKey={key} />
                      </div>
                      <div className="tnum mt-0.5 text-xs text-text-500">
                        <span dir="ltr">{u.phone}</span> · {u.city}
                      </div>
                    </div>
                    <Badge tone={u.status === "active" ? "success" : "danger"}>
                      {u.status === "active" ? "فعال" : "مسدود"}
                    </Badge>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <DetailList
                      title="مشخصات"
                      rows={[
                        [
                          "موبایل",
                          <span key="p" dir="ltr" className="tnum">
                            {u.phone}
                          </span>,
                        ],
                        ["شهر", u.city],
                        ...(u.grade
                          ? ([["پایه و رشته", `${u.grade} — ${u.group}`]] as [string, React.ReactNode][])
                          : []),
                        [
                          "عضو از",
                          <span key="j" className="tnum">
                            {u.joinedAt}
                          </span>,
                        ],
                        ["پلن", u.plan],
                        ...(mentor ? ([["مشاور فعلی", mentor]] as [string, React.ReactNode][]) : []),
                        ["جمع پرداختی", u.totalPaid ? <Toman key="t" amount={u.totalPaid} /> : "—"],
                        ["آخرین ورود", `${u.lastLogin} · ${u.device}`],
                        [
                          "تیکت‌ها",
                          userTickets.length ? (
                            <Link
                              key="tk"
                              href="/admin/tickets"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <LifeBuoy size={11} /> {toPersianDigits(userTickets.length)} تیکت
                              {userTickets.some((t) => t.status !== "closed") && " (باز)"}
                            </Link>
                          ) : (
                            "ندارد"
                          ),
                        ],
                      ]}
                    />
                    {prompt === u.id ? (
                      <ReasonPrompt
                        title={u.status === "active" ? `مسدود کردن ${u.name}` : `رفع مسدودیت ${u.name}`}
                        reasons={u.status === "active" ? SUSPEND_REASONS : undefined}
                        noteRequired={u.status !== "active"}
                        notePlaceholder={u.status === "active" ? "توضیح بیشتر (اختیاری)" : "چرا رفع مسدودیت؟ (اجباری)"}
                        confirmLabel={u.status === "active" ? "مسدود کن" : "فعال کن"}
                        onConfirm={(reason, note) =>
                          setUserStatus(u, u.status === "active" ? "suspended" : "active", reason, note)
                        }
                        onCancel={() => setPrompt(null)}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Allowed perm="users.suspend">
                          <Button size="md" variant="secondary" onClick={() => setPrompt(u.id)}>
                            {u.status === "active" ? (
                              <>
                                <Ban size={14} /> مسدود کن
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} /> فعال کن
                              </>
                            )}
                          </Button>
                        </Allowed>
                        {mentor && (
                          <Link
                            href={`/admin/reassign?student=${u.id}`}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ArrowLeftRight size={12} /> تعویض مشاور
                          </Link>
                        )}
                      </div>
                    )}
                    <UserEditPanel user={u} users={users} />
                    <EntityActivity match={u.name} />
                  </div>
                  <EntityFollowUp entityKey={key} />
                </div>
              </AdminRow>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">کاربری با این مشخصات پیدا نشد.</p>
          )}
        </div>
      </div>
    </>
  );
}
