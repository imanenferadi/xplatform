"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { MentorProfileView } from "@/components/app/MentorProfileView";
import { useApprovedMentors } from "@/lib/mentor-applications-store";

export function StoredMentorProfile({ id }: { id: string }) {
  const mentor = useApprovedMentors().find((m) => m.id === id);

  if (!mentor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <p className="text-text-500">این پروفایل پیدا نشد یا هنوز توسط تیم فنی تأیید نشده.</p>
        <Link href="/mentors" className={buttonVariants({ size: "lg", className: "mt-4" })}>
          فهرست مشاوران
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MentorProfileView mentor={mentor} />
    </div>
  );
}
