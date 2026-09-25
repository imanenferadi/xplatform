"use client";

import { useRef, useState } from "react";
import { NotebookPen, Trash2, Plus } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { studentNotes as initialNotes, type StudentNote } from "@/lib/mock-data";

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<StudentNote[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const nextId = useRef(100);

  function addNote() {
    if (!title.trim() && !body.trim()) return;
    setNotes((n) => [
      { id: `sn-${nextId.current++}`, title: title.trim() || "بدون عنوان", body: body.trim(), date: "همین الان" },
      ...n,
    ]);
    setTitle("");
    setBody("");
  }

  function removeNote(id: string) {
    setNotes((n) => n.filter((note) => note.id !== id));
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <NotebookPen size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">یادداشت‌های من</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          یه فضای شخصی برای هر چیزی که می‌خوای یادت بمونه — جدا از برنامه و چک‌این.
        </p>

        <Card>
          <CardContent className="space-y-3">
            <Input placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="متن یادداشت..."
              className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
            />
            <Button size="md" onClick={addNote} disabled={!title.trim() && !body.trim()}>
              <Plus size={15} />
              افزودن یادداشت
            </Button>
          </CardContent>
        </Card>

        <div className="mt-5 space-y-2">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-900">{n.title}</div>
                  {n.body && <p className="mt-1 text-sm text-text-700">{n.body}</p>}
                  <div className="mt-1 text-xs text-text-500">{n.date}</div>
                </div>
                <button
                  onClick={() => removeNote(n.id)}
                  className="shrink-0 text-text-500 hover:text-red-500"
                  aria-label="حذف یادداشت"
                >
                  <Trash2 size={15} />
                </button>
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 && (
            <p className="py-8 text-center text-sm text-text-500">هنوز یادداشتی ننوشتی.</p>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
