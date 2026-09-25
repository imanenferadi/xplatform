"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Send, Camera } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Avatar } from "@/components/ui/Avatar";
import { chatMessages, mentors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const mentor = mentors[0];
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const nextId = useRef(1000);

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [
      ...m,
      { id: nextId.current++, from: "student", text: input, time: "الان" },
    ]);
    setInput("");
  }

  return (
    <StudentShell>
      {/* See the same comment in dashboard/ai/page.tsx — this accounts for the
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

        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "student" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.7]",
                  m.from === "student" ? "bg-navy-900 text-white" : "border border-border bg-surface-2 text-text-700"
                )}
              >
                {m.text}
                <div
                  className={cn(
                    "tnum mt-1 text-[10px]",
                    m.from === "student" ? "text-white/60" : "text-text-500"
                  )}
                >
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
          <button type="button" className="shrink-0 rounded-x-sm p-2 text-text-500 hover:bg-surface-2" aria-label="ارسال عکس">
            <Camera size={18} />
          </button>
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
    </StudentShell>
  );
}
