"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Camera, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/chat-store";
import { toast } from "@/components/ui/Toaster";

type Msg = { id: number; from: "student" | "ai"; text: string; image?: string };

const quickActions = ["ساده‌تر بگو", "یک مثال دیگر", "روش تست‌زنی", "برای مشاورم بفرست"];

const mockAnswer =
  "نکته‌ی کلیدی در علامت شتاب است. چون متحرک در حال ترمزکردن است، a = −۲ m/s² قرار می‌گیرد. با فرمول مستقل از زمان v² − v₀² = ۲aΔx، مسافت توقف برابر ۱۰۰ متر می‌شود.";

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    if ((!text.trim() && !photo) || isStreaming) return;
    setMessages((m) => [
      ...m,
      {
        id: nextId.current++,
        from: "student",
        text: text.trim() || "این سؤال رو توضیح بده",
        ...(photo ? { image: photo } : {}),
      },
    ]);
    setInput("");
    setPhoto(null);
    streamAnswer();
  }

  // «برای مشاورم بفرست» really reaches the mentor: the last question goes to the chat.
  function forwardToMentor() {
    const q = [...messages].reverse().find((m) => m.from === "student");
    if (!q) return;
    sendMessage(
      "me",
      "student",
      `سؤالم از معلم AI: «${q.text}»${q.image ? " (با عکس)" : ""} — می‌شه سر جلسه با هم ببینیم؟`
    );
    toast("سؤال برای مشاورت فرستاده شد");
  }

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
    e.target.value = "";
  }

  function streamAnswer() {
    setIsStreaming(true);
    setTyping("");
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setTyping(mockAnswer.slice(0, i));
      if (i >= mockAnswer.length) {
        clearInterval(interval);
        setMessages((m) => [...m, { id: nextId.current++, from: "ai", text: mockAnswer }]);
        setTyping("");
        setIsStreaming(false);
      }
    }, 20);
  }

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <StudentShell>
      {/* Mobile height accounts for the shell's fixed top bar (pt-16 = 4rem),
          fixed bottom nav (pb-24 = 6rem), and the ابزارها sub-tab bar (h-14 =
          3.5rem); on md only the sub-tab bar remains. */}
      <div className="mx-auto flex h-[calc(100vh-13.5rem)] max-w-2xl flex-col px-4 py-4 md:h-[calc(100vh-3.5rem)] md:py-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h1 className="text-lg font-bold text-text-900">معلم هوشمند</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Sparkles size={24} className="text-blue-600" />
              </div>
              <p className="text-text-500">سؤالت رو بفرست؛ حتی اگه فقط عکسشه.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((m) => (
                <Bubble key={m.id} from={m.from}>
                  {m.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- a local photo the student just picked
                    <img src={m.image} alt="عکس سؤال" className="mb-2 max-h-48 rounded-x-sm" />
                  )}
                  {m.text}
                </Bubble>
              ))}
              {isStreaming && <Bubble from="ai">{typing || "…"}</Bubble>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {messages.some((m) => m.from === "ai") && !isStreaming && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => (a === "برای مشاورم بفرست" ? forwardToMentor() : send(a))}
                className="rounded-x-pill border border-border bg-surface px-3 py-1.5 text-xs text-text-700 hover:bg-surface-2"
              >
                {a}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-x-md border border-border bg-surface p-2"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={pickPhoto}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative shrink-0 rounded-x-sm p-2 text-text-500 hover:bg-surface-2"
            aria-label={photo ? "عکس سؤال انتخاب شد — عوضش کن" : "عکس سؤال"}
          >
            <Camera size={18} className={photo ? "text-blue-600" : undefined} />
            {photo && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={photo ? "عکس آماده‌ست — اگه توضیحی داری بنویس..." : "سؤالت رو بنویس..."}
            aria-label="سؤال"
            className="flex-1 bg-transparent text-sm text-text-900 outline-none placeholder:text-text-500"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !photo) || isStreaming}
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

function Bubble({ from, children }: { from: "student" | "ai"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", from === "student" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-x-lg px-4 py-2.5 text-sm leading-[1.75]",
          from === "student" ? "bg-navy-900 text-white" : "bg-surface-2 text-text-700 border border-border"
        )}
      >
        {children}
      </div>
    </div>
  );
}
