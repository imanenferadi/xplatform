"use client";

import { StudentShell } from "@/components/app/StudentShell";
import { SupportCenter } from "@/components/app/SupportCenter";

export default function StudentSupportPage() {
  return (
    <StudentShell>
      <SupportCenter requester={{ name: "ایمان", role: "دانش‌آموز", userId: "u-1" }} />
    </StudentShell>
  );
}
