"use client";

import { useState, useRef, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Avatar } from "@/components/ui/Avatar";
import { mentorStudents, mentorMessageThreads, type ChatMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function MentorThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const student = mentorStudents.find((s) => s.id === id);
  const [messages, setMessages] = useState<ChatMessage[]>(
    student ? (mentorMessageThreads[student.id] ?? []) : []
  );
  const [input, setInput] = useState("");
  const nextId = useRef(1000);

  if (!student) notFound();

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "mentor", text: input, time: "الان" }]);
    setInput("");
  }

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
          <div>
            <div className="font-bold text-text-900">{student.name}</div>
            <div className="text-xs text-text-500">{student.grade}</div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">هنوز پیامی رد و بدل نشده.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "mentor" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.7]",
                  m.from === "mentor" ? "bg-navy-900 text-white" : "border border-border bg-surface-2 text-text-700"
                )}
              >
                {m.text}
                <div className={cn("tnum mt-1 text-[10px]", m.from === "mentor" ? "text-white/60" : "text-text-500")}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-3 flex items-center gap-2 rounded-x-md border border-border bg-surface p-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیامت رو بنویس..."
            className="flex-1 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-x-sm bg-navy-900 p-2 text-white disabled:opacity-40"
            aria-label="ارسال"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </MentorShell>
  );
}
