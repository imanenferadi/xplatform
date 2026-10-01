"use client";

import Link from "next/link";
import { StudentShell } from "@/components/app/StudentShell";
import { Avatar } from "@/components/ui/Avatar";
import { ChatThread } from "@/components/app/ChatThread";
import { mentors } from "@/lib/mock-data";

export default function ChatPage() {
  const mentor = mentors[0];

  return (
    <StudentShell>
      {/* This accounts for the
          shell's fixed top bar + bottom nav height on mobile. */}
      <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col px-4 py-4 md:h-screen md:py-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <Avatar name={mentor.name} size="md" />
          <div className="flex-1">
            <div className="font-bold text-text-900">{mentor.name}</div>
            <div className="text-xs text-text-500">معمولاً تا ۱۲ ساعت جواب می‌ده</div>
          </div>
          <Link href={`/mentors/${mentor.id}`} className="text-xs text-blue-600 hover:underline">
            پروفایل مشاور
          </Link>
        </div>
        <ChatThread studentId="me" side="student" />
      </div>
    </StudentShell>
  );
}
