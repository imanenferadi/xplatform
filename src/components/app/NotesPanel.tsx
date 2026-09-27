"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, FormActions, fieldClass } from "@/components/ui/Form";
import { toast } from "@/components/ui/Toaster";
import { addNote, removeNote, useNotes } from "@/lib/notes-store";

/** «یادداشت‌ها» tab of the دفترچه — anything you want to remember. */
export function NotesPanel() {
  const notes = useNotes();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return setError("یه عنوان یا متن بنویس.");
    addNote(title.trim(), body.trim());
    setTitle("");
    setBody("");
    setError("");
    toast("یادداشت اضافه شد");
  }

  return (
    <>
      <Card>
        <CardContent>
          <form onSubmit={add} noValidate className="space-y-3">
            <Field label="عنوان" optional>
              <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 60))} className={fieldClass} />
            </Field>
            <Field label="متن" error={error}>
              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setError("");
                }}
                rows={3}
                placeholder="هر چیزی که می‌خوای یادت بمونه..."
                className="w-full rounded-x-sm border border-border bg-surface p-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
              />
            </Field>
            <FormActions>
              <Button type="submit" size="md">
                <Plus size={15} /> افزودن یادداشت
              </Button>
            </FormActions>
          </form>
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
                type="button"
                onClick={() => toast("یادداشت حذف شد", removeNote(n.id))}
                className="shrink-0 rounded-x-sm p-2 text-text-500 hover:text-red-500"
                aria-label={`حذف یادداشت ${n.title}`}
              >
                <Trash2 size={15} />
              </button>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="py-8 text-center text-sm text-text-500">
            هنوز یادداشتی ننوشتی — فرمول‌ها، نکته‌های کنکوری یا هر چیزی که نمی‌خوای یادت بره.
          </p>
        )}
      </div>
    </>
  );
}
