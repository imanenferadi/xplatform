"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Users, ShieldAlert, Search, Ban, RotateCcw, ArrowLeftRight } from "lucide-react";
import { AdminShell } from "@/components/app/AdminShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminUsers as initialUsers, complaints, studentAssignments, type AdminUser } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => users.filter((u) => u.name.includes(query) || u.phone.includes(query)),
    [users, query],
  );

  function toggleStatus(id: string) {
    setUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)),
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-1 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">کاربران</h1>
        </div>
        <p className="mb-4 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(users.length)}</span> کاربر ثبت‌شده
        </p>

        <div className="relative mb-4">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو با نام یا شماره تماس..."
            className="pr-11"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((u: AdminUser) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-900">{u.name}</span>
                    <Badge tone="neutral">{u.role}</Badge>
                  </div>
                  <div className="tnum mt-0.5 text-xs text-text-500">
                    {u.phone} · عضو از {u.joinedAt}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={u.status === "active" ? "success" : "danger"}>
                    {u.status === "active" ? "فعال" : "مسدود"}
                  </Badge>
                  <Button size="md" variant="secondary" onClick={() => toggleStatus(u.id)}>
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
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">کاربری با این مشخصات پیدا نشد.</p>
          )}
        </div>

        <div className="mb-1 mt-8 flex items-center gap-2">
          <ShieldAlert size={18} className="text-orange-500" />
          <h2 className="text-xl font-bold text-text-900">شکایات</h2>
        </div>
        <p className="mb-4 text-sm text-text-500">
          <span className="tnum">{toPersianDigits(complaints.filter((c) => c.status === "open").length)}</span> شکایت
          باز
        </p>
        <div className="space-y-2">
          {complaints.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-sm font-medium text-text-900">{c.fromName}</div>
                  <div className="mt-0.5 text-xs text-text-700">{c.reason}</div>
                  <div className="mt-1 text-xs text-text-500">{c.date}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.status === "open" && studentAssignments.some((a) => a.name === c.fromName) && (
                    <Link
                      href={`/admin/reassign?student=${studentAssignments.find((a) => a.name === c.fromName)!.userId}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ArrowLeftRight size={12} /> تعویض مشاور
                    </Link>
                  )}
                  <Badge tone={c.status === "open" ? "warning" : "success"}>
                    {c.status === "open" ? "باز" : "حل‌شده"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
