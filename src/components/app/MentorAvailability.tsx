"use client";

import Link from "next/link";
import { Hourglass, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import type { Mentor } from "@/lib/mock-data";
import { joinWaitlist, leaveWaitlist, ME, useMentorCapacity } from "@/lib/capacity-store";
import { cn, toPersianDigits } from "@/lib/utils";

export function CapacityNote({ mentor }: { mentor: Mentor }) {
  const cap = useMentorCapacity(mentor);
  if (!cap.accepting) return <span>فعلاً دانش‌آموز جدید نمی‌پذیره</span>;
  if (cap.full) return <span>ظرفیت تکمیل</span>;
  return (
    <span>
      <span className="tnum">{toPersianDigits(cap.remaining)}</span> ظرفیت باقی‌مانده
    </span>
  );
}

// The booking CTA — or, when the mentor has no seat, a waitlist instead of
// a dead end.
export function BookOrWaitlist({ mentor, className }: { mentor: Mentor; className?: string }) {
  const cap = useMentorCapacity(mentor);

  if (!cap.full) {
    return (
      <Link href={`/booking/${mentor.id}`} className={buttonVariants({ size: "lg", className })}>
        رزرو جلسه‌ی آشنایی رایگان
      </Link>
    );
  }

  if (cap.myPosition) {
    return (
      <div className={cn("rounded-x-md border border-blue-600/30 bg-blue-100 p-3 text-center", className)}>
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-text-900">
          <Hourglass size={15} className="text-blue-600" />
          توی لیست انتظاری — نفر <span className="tnum">{toPersianDigits(cap.myPosition)}</span>
        </div>
        <p className="mt-1 text-xs text-text-500">به محض باز شدن ظرفیت بهت خبر می‌دیم.</p>
        <button
          type="button"
          onClick={() => leaveWaitlist(mentor.id, ME.studentId)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-text-500 hover:text-red-500"
        >
          <LogOut size={12} /> خروج از لیست انتظار
        </button>
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <Button size="lg" variant="secondary" className="w-full" onClick={() => joinWaitlist(mentor.id)}>
        <Hourglass size={16} /> عضویت در لیست انتظار
      </Button>
      <p className="mt-1.5 text-xs text-text-500">
        {cap.accepting ? "ظرفیت این مشاور پره" : "این مشاور فعلاً دانش‌آموز جدید نمی‌پذیره"}
        {cap.waitlist.length > 0 && (
          <>
            {" "}
            — <span className="tnum">{toPersianDigits(cap.waitlist.length)}</span> نفر جلوتر از تو
          </>
        )}
      </p>
    </div>
  );
}

/** Renders the booking flow only while the mentor has a free seat. */
export function IfSeatAvailable({ mentor, children }: { mentor: Mentor; children: React.ReactNode }) {
  const cap = useMentorCapacity(mentor);
  if (!cap.full) return children;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-lg font-bold text-text-900">فعلاً جلسه با {mentor.name} رزرو نمی‌شه</h1>
      <BookOrWaitlist mentor={mentor} className="mt-5 w-full max-w-xs" />
      <Link href="/mentors" className="mt-4 text-sm text-blue-600 hover:underline">
        مشاورهای دیگه با ظرفیت خالی
      </Link>
    </div>
  );
}
