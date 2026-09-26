"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  LogOut,
  GraduationCap,
  ArrowLeft,
  LifeBuoy,
  Users,
  Lock,
  MessageSquareWarning,
} from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { mentors, targetMajor, studentProfile } from "@/lib/mock-data";
import { MySubscription } from "@/components/app/MySubscription";
import { PARENT_ACCESS_LABELS, setParentAccess, useParentAccess, type ParentAccess } from "@/lib/parent-access-store";
import { cn } from "@/lib/utils";

const NOTIFICATION_LABELS: Record<keyof typeof studentProfile.notificationPrefs, string> = {
  checkinReminder: "یادآوری گزارش کار شب",
  mentorMessage: "پیام جدید از مشاور",
  weeklyReport: "خلاصه‌ی هفتگی پیشرفت",
};

function Toggle({ checked, onClick, label }: { checked: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-x-pill transition-colors",
        checked ? "bg-blue-600" : "bg-surface-2"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-[-1.375rem]" : "translate-x-[-0.125rem]",
          "right-0.5"
        )}
      />
    </button>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-text-500" />;
}

export default function ProfilePage() {
  const mentor = mentors[0];
  const [name, setName] = useState(studentProfile.name);
  const [city, setCity] = useState(studentProfile.city);
  const [prefs, setPrefs] = useState(studentProfile.notificationPrefs);
  const parentAccess = useParentAccess();

  return (
    <StudentShell>
      <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
        <div className="mb-6 flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">پروفایل من</h1>
        </div>

        <Card>
          <CardContent className="flex items-center gap-4">
            <Avatar name={name} size="lg" />
            <div>
              <div className="font-bold text-text-900">{name}</div>
              <div dir="ltr" className="tnum text-right text-xs text-text-500">
                {studentProfile.phone}
              </div>
              <div className="mt-1 text-xs text-text-500">عضو از {studentProfile.joinedAt}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="space-y-4">
            <h2 className="text-sm font-bold text-text-900">اطلاعات فردی</h2>
            <Input label="نام" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="شهر" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="پایه‌ی تحصیلی" value={studentProfile.grade} disabled />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">هدف کنکور</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text-900">{targetMajor.name}</div>
                <div className="mt-1 text-xs text-text-500">مشاور: {mentor.name}</div>
              </div>
              <Link
                href={`/mentors/${mentor.id}`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                مشاهده‌ی پروفایل مشاور
                <ArrowLeft size={12} />
              </Link>
            </div>
          </CardContent>
        </Card>

        <MySubscription />

        {/* The student decides what their parent sees — trust with a teenager
            breaks fast if the parent panel feels like surveillance. */}
        <Card className="mt-4">
          <CardContent>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-text-900">والدینم چی ببینن؟</h2>
              </div>
              <Link href="/parent" className="text-xs text-blue-600 hover:underline">
                پیش‌نمایش پنل والد
              </Link>
            </div>
            <p className="mb-3 text-xs text-text-500">هر بخشی رو خاموش کنی، توی پنل والدینت نشون داده نمی‌شه.</p>
            <div className="space-y-3">
              {(Object.keys(PARENT_ACCESS_LABELS) as (keyof ParentAccess)[]).map((key) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-text-700">{PARENT_ACCESS_LABELS[key].label}</div>
                    <div className="text-[11px] text-text-500">{PARENT_ACCESS_LABELS[key].hint}</div>
                  </div>
                  <Toggle
                    checked={parentAccess[key]}
                    label={PARENT_ACCESS_LABELS[key].label}
                    onClick={() => setParentAccess(key, !parentAccess[key])}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-text-500">
              <div className="flex items-center gap-1.5">
                <Dot /> اشتراک و پرداخت همیشه برای والدین پیداست — پرداخت‌کننده خودشونن.
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={11} /> گفتگوهات با مشاور و معلم AI هیچ‌وقت به والدین نشون داده نمی‌شه.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-text-900">اعلان‌ها</h2>
            </div>
            <div className="space-y-3">
              {(Object.keys(prefs) as (keyof typeof prefs)[]).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-text-700">{NOTIFICATION_LABELS[key]}</span>
                  <Toggle
                    checked={prefs[key]}
                    label={NOTIFICATION_LABELS[key]}
                    onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Link
          href="/support"
          className="mt-4 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <MessageSquareWarning size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">پشتیبانی و تیکت‌ها</div>
            <div className="text-xs text-text-500">مشکل فنی، پرداخت یا درخواست تعویض مشاور</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        <Link
          href="/help"
          className="mt-3 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <LifeBuoy size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-900">راهنما و سؤالات متداول</div>
            <div className="text-xs text-text-500">تازه‌واردی؟ اینجا شروع کن</div>
          </div>
          <ArrowLeft size={16} className="text-text-500" />
        </Link>

        <Link
          href="/login"
          className="mt-3 flex items-center justify-center gap-2 rounded-x-lg border border-border bg-surface p-3.5 text-sm font-medium text-red-500 transition-colors hover:bg-surface-2"
        >
          <LogOut size={16} />
          خروج از حساب
        </Link>
      </div>
    </StudentShell>
  );
}
