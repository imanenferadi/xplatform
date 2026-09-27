"use client";

import { StudentShell } from "@/components/app/StudentShell";
import { SupportCenter } from "@/components/app/SupportCenter";
import { ViewAsHistory } from "@/components/app/SupportView";

export default function StudentSupportPage() {
  return (
    <StudentShell>
      <SupportCenter requester={{ name: "ایمان", role: "دانش‌آموز", userId: "u-1" }} />
      <div className="mx-auto max-w-2xl px-4 pb-10">
        <ViewAsHistory userId="me" />
      </div>
    </StudentShell>
  );
}
