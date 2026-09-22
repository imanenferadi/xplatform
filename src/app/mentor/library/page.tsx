"use client";

import { useState, useRef } from "react";
import { FileText, Headphones, Video, Plus, X } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentLibrary as initialLibrary, type ContentItem, type Subject } from "@/lib/mock-data";

const typeMeta: Record<ContentItem["type"], { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: "PDF" },
  audio: { icon: Headphones, label: "صوتی" },
  video: { icon: Video, label: "ویدیو" },
};

const subjects: Subject[] = ["ریاضی", "فیزیک", "شیمی", "زیست"];

export default function MentorLibraryPage() {
  const [library, setLibrary] = useState(initialLibrary);
  const [open, setOpen] = useState(false);

  function addItem(item: ContentItem) {
    setLibrary((l) => [item, ...l]);
    setOpen(false);
  }

  return (
    <MentorShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-900">کتابخونه‌ی محتوا</h1>
          <Button size="md" onClick={() => setOpen(true)}>
            <Plus size={16} /> افزودن محتوا
          </Button>
        </div>
        <p className="mb-5 text-sm text-text-500">
          جزوه، ویس و ویدیوی خودت — یک‌جا، به‌جای پخش‌شدن توی گروه‌های تلگرام.
        </p>

        <div className="space-y-2">
          {library.map((item) => {
            const meta = typeMeta[item.type];
            const Icon = meta.icon;
            return (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-3 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-900">{item.title}</div>
                    <div className="text-xs text-text-500">
                      {item.subject} · {item.topic} · {item.uploadedAt}
                    </div>
                  </div>
                  <Badge tone="neutral">{meta.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {open && <AddContentModal onClose={() => setOpen(false)} onAdd={addItem} />}
    </MentorShell>
  );
}

function AddContentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: ContentItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentItem["type"]>("pdf");
  const [subject, setSubject] = useState<Subject>("شیمی");
  const [topic, setTopic] = useState("");
  const nextId = useRef(100);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: `c-${nextId.current++}`,
      title,
      type,
      subject,
      topic: topic || "—",
      uploadedAt: "همین الان",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-x-xl bg-surface p-6 shadow-x-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-text-900">افزودن محتوا</h3>
          <button onClick={onClose} className="text-text-500 hover:text-text-900" aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="عنوان"
            placeholder="مثلاً: جزوه‌ی جمع‌بندی ژنتیک"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-700">نوع فایل</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(typeMeta) as ContentItem["type"][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-x-sm border-2 py-2 text-xs font-medium ${
                    type === t
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700"
                  }`}
                >
                  {typeMeta[t].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-700">درس</label>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`rounded-x-sm border-2 py-2 text-xs font-medium ${
                    subject === s
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="مبحث (اختیاری)"
            placeholder="مثلاً: تعادل شیمیایی"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="rounded-x-md border border-dashed border-border p-4 text-center text-xs text-text-500">
            انتخاب فایل — در نسخه‌ی نهایی اینجا واقعاً آپلود می‌شود
          </div>

          <Button type="submit" size="lg" className="w-full">
            افزودن به کتابخونه
          </Button>
        </form>
      </div>
    </div>
  );
}
