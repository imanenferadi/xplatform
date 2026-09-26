"use client";

import { MentorShell } from "@/components/app/MentorShell";
import { SupportCenter } from "@/components/app/SupportCenter";

export default function MentorSupportPage() {
  return (
    <MentorShell>
      <SupportCenter requester={{ name: "سارا محمدی", role: "مشاور", userId: "u-3" }} />
    </MentorShell>
  );
}
