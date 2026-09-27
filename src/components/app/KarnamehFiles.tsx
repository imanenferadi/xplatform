"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  addKarnameh,
  markKarnamehSeen,
  readKarnamehFile,
  useKarnamehs,
  type StoredKarnameh,
} from "@/lib/karnameh-store";
import { cn } from "@/lib/utils";

// The karnameh files of one student, openable by the mentor. Opening one
// tells the student it was seen. The mentor can also attach one herself
// (e.g. a sheet the parent sent on WhatsApp).
export function KarnamehFiles({ studentId, studentName }: { studentId: string; studentName: string }) {
  const files = useKarnamehs(studentId);
  const [viewing, setViewing] = useState<StoredKarnameh | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  function open(k: StoredKarnameh) {
    setViewing(k);
    if (!k.seenByMentor) markKarnamehSeen(k.id);
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { dataUrl, mime } = await readKarnamehFile(file).catch(() => ({ dataUrl: undefined, mime: file.type }));
    const stored = addKarnameh(
      { studentId, uploadedBy: "mentor", examProvider: "آپلود مشاور", fileName: file.name, note: "", dataUrl, mime },
      studentName
    );
    setBusy(false);
    setNote(stored ? "" : "فایل بیشتر از ۱.۵ مگابایت بود؛ در نسخه‌ی نمایشی فقط اسمش ذخیره شد.");
    e.target.value = "";
  }

  return (
    <div>
      {files.length === 0 ? (
        <p className="text-sm text-text-500">هنوز کارنامه‌ای نفرستاده.</p>
      ) : (
        <div className="space-y-2">
          {files.map((k) => (
            <div key={k.id} className="flex items-center gap-3 rounded-x-md border border-border bg-surface-2 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-900">
                  <span className="truncate">
                    {k.examProvider} — {k.fileName}
                  </span>
                  {!k.seenByMentor && (
                    <span className="rounded-x-pill bg-blue-600 px-2 py-0.5 text-[10px] text-white">جدید</span>
                  )}
                </div>
                <div className="text-xs text-text-500">
                  {k.date}
                  {k.uploadedBy === "mentor" && " · آپلود خودت"}
                </div>
                {k.note && <p className="mt-0.5 text-xs text-text-700">«{k.note}»</p>}
              </div>
              <Button size="md" variant="secondary" onClick={() => open(k)}>
                <Eye size={14} /> مشاهده
              </Button>
            </div>
          ))}
        </div>
      )}

      <input ref={input} type="file" accept="image/*,.pdf" className="hidden" onChange={upload} />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-x-md border border-dashed border-border py-2.5 text-sm text-text-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50"
      >
        <Upload size={15} /> {busy ? "در حال آماده‌سازی..." : "آپلود کارنامه برای این دانش‌آموز"}
      </button>
      {note && <p className="mt-2 text-xs text-orange-500">{note}</p>}

      {viewing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={viewing.fileName}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-x-lg bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border p-3">
              <span className="flex-1 truncate text-sm font-medium text-text-900">
                {viewing.examProvider} — {viewing.fileName}
              </span>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="بستن"
                className="rounded-x-sm p-1 text-text-500 hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>
            <div className={cn("flex-1 overflow-auto bg-surface-2", !viewing.dataUrl && "p-10")}>
              {!viewing.dataUrl ? (
                <p className="text-center text-sm text-text-500">
                  فایل این کارنامه در نسخه‌ی نمایشی ذخیره نشده (نمونه‌ی اولیه یا فایل بزرگ‌تر از ۱.۵ مگابایت). با
                  بک‌اند، همین‌جا باز می‌شه.
                </p>
              ) : viewing.mime === "application/pdf" ? (
                <iframe src={viewing.dataUrl} title={viewing.fileName} className="h-[75vh] w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- a data: URL from storage, not an optimizable asset
                <img src={viewing.dataUrl} alt={viewing.fileName} className="mx-auto max-w-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
