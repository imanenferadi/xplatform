"use client";

import { useState } from "react";
import { Megaphone, Send, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mentorStudents } from "@/lib/mock-data";
import { sendBroadcast, useBroadcasts } from "@/lib/broadcast-store";
import { cn, toPersianDigits } from "@/lib/utils";

const MAX_LENGTH = 1000;

// One message to many students — what the mentor's Telegram channel is for
// today (exam reminders, weekly tips, schedule changes).
export function BroadcastComposer() {
  const sentList = useBroadcasts();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>(() => mentorStudents.map((s) => s.id));
  const [error, setError] = useState("");
  const [justSent, setJustSent] = useState(false);

  const everyone = selected.length === mentorStudents.length;

  function toggle(id: string) {
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
    setError("");
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setError("متن پیام رو بنویس.");
    if (selected.length === 0) return setError("حداقل یه دانش‌آموز رو انتخاب کن.");
    sendBroadcast({ id: Date.now(), text: text.trim(), time: "الان", recipients: everyone ? "all" : selected });
    setText("");
    setJustSent(true);
  }

  return (
    <Card className="mb-5">
      <CardContent>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 text-right"
          aria-expanded={open}
        >
          <Megaphone size={16} className="text-blue-600" />
          <span className="flex-1 text-sm font-bold text-text-900">پیام گروهی</span>
          {sentList.length > 0 && (
            <span className="text-xs text-text-500">
              <span className="tnum">{toPersianDigits(sentList.length)}</span> پیام فرستادی
            </span>
          )}
          <ChevronDown size={16} className={cn("text-text-500 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <form onSubmit={send} noValidate className="mt-3 space-y-3">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value.slice(0, MAX_LENGTH));
                setError("");
                setJustSent(false);
              }}
              rows={3}
              placeholder="مثلاً: یادتون باشه جمعه آزمون قلم‌چیه؛ پنجشنبه شب زود بخوابید."
              className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-text-700">گیرنده‌ها</span>
                <button
                  type="button"
                  onClick={() => setSelected(everyone ? [] : mentorStudents.map((s) => s.id))}
                  className="text-blue-600 hover:underline"
                >
                  {everyone ? "هیچ‌کس" : "همه"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mentorStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    aria-pressed={selected.includes(s.id)}
                    className={cn(
                      "rounded-x-pill border px-3 py-1 text-xs transition-colors",
                      selected.includes(s.id)
                        ? "border-blue-600 bg-blue-100 text-text-900"
                        : "border-border bg-surface text-text-500",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {justSent && (
              <p className="text-xs text-mint-500">فرستاده شد — توی گفتگوی هر نفر با برچسب «پیام گروهی» هست.</p>
            )}

            <Button type="submit" size="md">
              <Send size={14} />
              {everyone ? "ارسال به همه" : `ارسال به ${toPersianDigits(selected.length)} نفر`}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
