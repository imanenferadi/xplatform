"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApprovedMentors } from "@/lib/mentor-applications-store";
import { Video, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { mentors } from "@/lib/mock-data";

const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"];
const times = ["۱۷:۰۰", "۱۸:۰۰", "۱۹:۰۰", "۲۰:۰۰"];

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const approved = useApprovedMentors();
  const mentor = mentors.find((m) => m.id === id) ?? approved.find((m) => m.id === id);
  const router = useRouter();
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [confirmed, setConfirmed] = useState(false);

  // Not notFound(): self-registered mentors live only in the browser's demo
  // store, which the server render can't see.
  if (!mentor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <p className="text-text-500">این مشاور پیدا نشد.</p>
        <Link href="/mentors" className="mt-3 text-sm text-blue-600 hover:underline">
          فهرست مشاوران
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
          <Check size={28} className="text-mint-500" />
        </div>
        <h1 className="text-xl font-bold text-text-900">رزرو شد ✓</h1>
        <p className="mt-2 text-text-500">
          جلسه‌ات با {mentor.name}، {day} ساعت {time} است.
        </p>
        <p className="mt-1 text-sm text-text-500">یک یادآوری ۱ ساعت قبل برات می‌فرستیم.</p>
        <Button size="lg" className="mt-8" onClick={() => router.push("/dashboard")}>
          برو به داشبورد
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3 rounded-x-lg border border-border bg-surface p-4">
          <Avatar name={mentor.name} size="md" />
          <div>
            <div className="font-bold text-text-900">{mentor.name}</div>
            <div className="text-xs text-text-500">{mentor.rank} · جلسه‌ی آشنایی رایگان · ۲۰ دقیقه</div>
          </div>
          <Badge tone="success" className="mr-auto">رایگان</Badge>
        </div>

        <h2 className="mb-3 text-sm font-bold text-text-900">روز را انتخاب کن</h2>
        <div className="mb-6 grid grid-cols-5 gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "rounded-x-md border-2 py-2.5 text-xs font-medium transition-colors",
                day === d
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700 hover:border-blue-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-bold text-text-900">ساعت را انتخاب کن</h2>
        <div className="mb-6 grid grid-cols-4 gap-2">
          {times.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={cn(
                "tnum rounded-x-md border-2 py-2.5 text-sm font-medium transition-colors",
                time === t
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700 hover:border-blue-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-bold text-text-900">نوع جلسه</h2>
        <div className="mb-8 grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("video")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-x-md border-2 py-3 text-sm font-medium transition-colors",
              mode === "video"
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border bg-surface text-text-700"
            )}
          >
            <Video size={16} /> تصویری
          </button>
          <button
            onClick={() => setMode("audio")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-x-md border-2 py-3 text-sm font-medium transition-colors",
              mode === "audio"
                ? "border-blue-600 bg-blue-100 text-text-900"
                : "border-border bg-surface text-text-700"
            )}
          >
            <Phone size={16} /> صوتی
          </button>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!day || !time}
          onClick={() => setConfirmed(true)}
        >
          رزرو جلسه‌ی آشنایی
        </Button>
      </div>
    </div>
  );
}
