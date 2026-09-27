"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Avatar } from "@/components/ui/Avatar";
import { ChatThread } from "@/components/app/ChatThread";
import { mentorStudents } from "@/lib/mock-data";

export default function MentorThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const student = mentorStudents.find((s) => s.id === id);
  if (!student) notFound();

  return (
    <MentorShell>
      {/* MentorShell only reserves a pt-14 top bar on mobile (no bottom nav,
          unlike StudentShell) — hence -3.5rem here, not the -10rem used on
          the student-side chat pages. */}
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4 py-4 md:h-screen md:py-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <Link href="/mentor/messages" className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2">
            <ArrowRight size={18} />
          </Link>
          <Avatar name={student.name} size="md" />
          <div className="flex-1">
            <div className="font-bold text-text-900">{student.name}</div>
            <div className="text-xs text-text-500">{student.grade}</div>
          </div>
          <Link href={`/mentor/students/${student.id}`} className="text-xs text-blue-600 hover:underline">
            پرونده
          </Link>
        </div>
        <ChatThread studentId={student.id} side="mentor" />
      </div>
    </MentorShell>
  );
}
