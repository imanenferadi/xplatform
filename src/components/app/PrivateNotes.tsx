"use client";

import { useRef, useState } from "react";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PrivateNote } from "@/lib/mock-data";

export function PrivateNotes({
  studentId,
  initialNotes,
}: {
  studentId: string;
  initialNotes: PrivateNote[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const nextId = useRef(100);

  function addNote() {
    if (!draft.trim()) return;
    setNotes((n) => [
      {
        id: `pn-${nextId.current++}`,
        studentId,
        text: draft.trim(),
        date: "همین الان",
      },
      ...n,
    ]);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-xs text-text-500">
        <EyeOff size={12} />
        فقط خودت این یادداشت‌ها رو می‌بینی — نه دانش‌آموز، نه والد.
      </div>

      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="یادداشتی برای خودت بنویس..."
          className="flex-1 rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
        />
        <Button
          size="md"
          onClick={addNote}
          disabled={!draft.trim()}
          className="self-end"
        >
          ثبت
        </Button>
      </div>

      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-x-md bg-surface-2 p-3 text-sm text-text-700"
            >
              <p>{n.text}</p>
              <div className="mt-1 text-xs text-text-500">{n.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
