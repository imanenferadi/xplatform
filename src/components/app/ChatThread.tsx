"use client";

import { useEffect, useRef, useState } from "react";
import { Send, CheckCheck, Check, Flag } from "lucide-react";
import { VoiceBubble, VoiceRecordButton } from "@/components/app/Voice";
import { markRead, persistVoice, sendMessage, useReadMark, useThread, type Side } from "@/lib/chat-store";
import type { VoiceClip } from "@/lib/use-voice-recorder";
import { useViewAsTab } from "@/lib/viewas-store";
import { createTicket } from "@/lib/ticket-store";
import { mentorStudents, type ChatMessage } from "@/lib/mock-data";

const studentName = (id: string) => mentorStudents.find((s) => s.id === id)?.name ?? "";
import { cn } from "@/lib/utils";

// The same thread from either side: mine on the left-hand bubble colour,
// theirs on the other, «خوانده شد» once the other side has opened it.
export function ChatThread({ studentId, side }: { studentId: string; side: Side }) {
  // Support «view as user» never shows the mentor conversation.
  if (useViewAsTab())
    return (
      <p className="py-16 text-center text-sm text-text-500">
        در حالت مشاهده‌ی پشتیبانی، گفتگو با مشاور نمایش داده نمی‌شه.
      </p>
    );
  return <Thread studentId={studentId} side={side} />;
}

function Thread({ studentId, side }: { studentId: string; side: Side }) {
  const thread = useThread(studentId);
  const theirMark = useReadMark(studentId, side === "mentor" ? "student" : "mentor");
  const [input, setInput] = useState("");
  const [voiceNote, setVoiceNote] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [reported, setReported] = useState<Record<number, string>>({});

  // Staff never read chats; a reported message reaches support as a ticket
  // quoting only that one message, sent by the person who reported it.
  function report(m: ChatMessage) {
    const other = side === "student" ? "سارا محمدی (مشاور)" : `${studentName(studentId)} (دانش‌آموز)`;
    const id = createTicket({
      subject: "گزارش یک پیام در گفتگو",
      category: "سایر",
      text: `پیام گزارش‌شده از ${other}، ${m.time}:\n«${m.voice ? "پیام صوتی" : m.text}»`,
      requester:
        side === "student"
          ? { name: "ایمان", role: "دانش‌آموز", userId: "u-1" }
          : { name: "سارا محمدی", role: "مشاور", userId: "u-3" },
    });
    setReported((r) => ({ ...r, [m.id]: id }));
    setConfirming(null);
  }

  // Opening the thread (and every new message while it's open) counts as read.
  useEffect(() => {
    markRead(studentId, side, thread);
    bottom.current?.scrollIntoView({ block: "end" });
  }, [studentId, side, thread]);

  function send() {
    if (!input.trim()) return;
    sendMessage(studentId, side, input.trim());
    setInput("");
  }

  async function sendVoice(clip: VoiceClip) {
    const stored = await persistVoice(clip).catch(() => clip);
    sendMessage(studentId, side, "", stored);
    setVoiceNote(stored.url.startsWith("blob:") ? "این پیام صوتی بزرگ بود و فقط روی همین صفحه پخش می‌شه." : "");
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {thread.length === 0 && <p className="py-8 text-center text-sm text-text-500">هنوز پیامی رد و بدل نشده.</p>}
        {thread.map((m) => {
          const mine = m.from === side;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.7]",
                  mine ? "bg-navy-900 text-white" : "border border-border bg-surface-2 text-text-700"
                )}
              >
                {m.broadcast && (
                  <div className={cn("mb-1 text-xs font-medium", mine ? "text-white/70" : "text-blue-600")}>
                    📣 پیام گروهی
                  </div>
                )}
                {m.voice ? <VoiceBubble clip={m.voice} mine={mine} /> : m.text}
                <div
                  className={cn("tnum mt-1 flex items-center gap-1 text-xs", mine ? "text-white/60" : "text-text-500")}
                >
                  {m.time}
                  {mine &&
                    !m.broadcast &&
                    (theirMark >= m.id ? (
                      <span className="flex items-center gap-0.5 font-medium text-white">
                        <CheckCheck size={12} /> خوانده شد
                      </span>
                    ) : (
                      <Check size={12} aria-label="ارسال شد" />
                    ))}
                  {!mine &&
                    (reported[m.id] ? (
                      <span className="text-orange-500">گزارش شد ({reported[m.id]})</span>
                    ) : confirming === m.id ? (
                      <span className="flex items-center gap-1.5">
                        برای پشتیبانی بفرستم؟
                        <button
                          type="button"
                          onClick={() => report(m)}
                          className="font-medium text-red-500 hover:underline"
                        >
                          بفرست
                        </button>
                        <button type="button" onClick={() => setConfirming(null)} className="hover:underline">
                          نه
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(m.id)}
                        aria-label="گزارش این پیام"
                        title="گزارش این پیام"
                        className="opacity-60 hover:text-red-500 hover:opacity-100"
                      >
                        <Flag size={11} />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {voiceNote && <p className="mt-2 text-xs text-orange-500">{voiceNote}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="relative mt-3 flex items-center gap-2 rounded-x-md border border-border bg-surface p-2"
      >
        <VoiceRecordButton onRecorded={sendVoice} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="پیامت رو بنویس..."
          aria-label="متن پیام"
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
    </>
  );
}
