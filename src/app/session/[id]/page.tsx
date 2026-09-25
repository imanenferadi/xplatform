"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Star, Check, ExternalLink, Phone, CalendarClock, ListChecks } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MEETING_PROVIDERS, mentors } from "@/lib/mock-data";
import { useMeetingSetup } from "@/lib/meeting-store";
import { toLatinDigits } from "@/lib/utils";

// Sessions happen on the mentor's own platform (Google Meet / Skyroom / …);
// this page is the doorway before it and the feedback form after it.
export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mentor = mentors.find((m) => m.id === id);
  const router = useRouter();
  const meeting = useMeetingSetup();

  const [joined, setJoined] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!mentor) notFound();
  // Demo: only the logged-in mentor (سارا محمدی) has a stored room link.
  const hasLink = mentor.id === mentors[0].id;
  const provider = MEETING_PROVIDERS[meeting.provider];

  function submitFeedback() {
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
          <Check size={28} className="text-mint-500" />
        </div>
        <h1 className="text-xl font-bold text-text-900">ممنون بابت نظرت!</h1>
        <p className="mt-2 text-text-500">داری برمی‌گردی به داشبورد...</p>
      </div>
    );
  }

  if (ratingOpen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-text-900">جلسه با {mentor.name} چطور بود؟</h1>
          <p className="mt-1 text-sm text-text-500">به این جلسه چند ستاره می‌دی؟</p>
          <div className="mt-5 flex justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} ستاره`}>
                <Star size={32} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-border"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="یک جمله درباره‌ی این جلسه بنویس (اختیاری)"
            className="mt-4 w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
          />
          <Button size="lg" className="mt-4 w-full" disabled={rating === 0} onClick={submitFeedback}>
            ثبت نظر
          </Button>
          <button className="mt-3 text-xs text-text-500 hover:text-text-900" onClick={() => router.push("/dashboard")}>
            رد شدن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <Avatar name={mentor.name} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-text-900">جلسه با {mentor.name}</h1>
            <p className="flex items-center gap-1 text-sm text-text-500">
              <CalendarClock size={14} /> شنبه، ساعت ۱۸:۰۰ · ۴۵ دقیقه
            </p>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent>
            {hasLink ? (
              <>
                <p className="text-sm text-text-700">
                  جلسه روی <span className="font-medium text-text-900">{provider.label}</span> برگزار می‌شه. با دکمه‌ی
                  زیر در یک تب جدید وارد اتاق مشاورت می‌شی.
                </p>
                <a
                  href={meeting.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setJoined(true)}
                  className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}
                >
                  <ExternalLink size={16} /> ورود به جلسه در {provider.label}
                </a>
                <div className="mt-3 flex items-start gap-2 rounded-x-md bg-surface-2 p-3 text-xs leading-[1.8] text-text-700">
                  <Phone size={13} className="mt-0.5 shrink-0 text-blue-600" />
                  <span>
                    لینک باز نشد یا اینترنت قطع بود؟ {mentor.name} با شماره‌ی{" "}
                    <a
                      href={`tel:${toLatinDigits(meeting.fallbackPhone).replace(/\s/g, "")}`}
                      dir="ltr"
                      className="tnum whitespace-nowrap text-blue-600"
                    >
                      {meeting.fallbackPhone}
                    </a>{" "}
                    تماس صوتی می‌گیره — جلسه کنسل نمی‌شه.
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-text-500">
                {mentor.name} هنوز لینک جلسه‌اش رو ثبت نکرده. نزدیک زمان جلسه از طریق{" "}
                <Link href="/chat" className="text-blue-600 hover:underline">
                  پیام‌ها
                </Link>{" "}
                لینک رو برات می‌فرسته.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-text-900">
              <ListChecks size={15} className="text-blue-600" /> قبل از جلسه
            </h2>
            <ul className="list-inside list-disc space-y-1 text-xs leading-[1.8] text-text-700">
              <li>سؤال‌هایی که این هفته برات پیش اومده رو از قبل بنویس.</li>
              <li>برنامه‌ی هفته و آخرین کارنامه‌ات دم دستت باشه.</li>
              <li>جای ساکت و هدفون — جلسه‌ی ۴۵ دقیقه‌ای زود تموم می‌شه.</li>
            </ul>
          </CardContent>
        </Card>

        <Button
          size="lg"
          variant={joined ? "primary" : "secondary"}
          className="mt-4 w-full"
          onClick={() => setRatingOpen(true)}
        >
          جلسه تموم شد — ثبت نظر
        </Button>
        <Link href="/dashboard" className="mt-3 block text-center text-xs text-text-500 hover:text-text-900">
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}
