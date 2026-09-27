"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, Check, Eye } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PercentCalculator } from "@/components/app/PercentCalculator";
import { addKarnameh, readKarnamehFile, useKarnamehs } from "@/lib/karnameh-store";

export default function KarnamehUploadPage() {
  const uploads = useKarnamehs("me");
  const [file, setFile] = useState<File | null>(null);
  const fileName = file?.name ?? null;
  const [busy, setBusy] = useState(false);
  const [nameOnly, setNameOnly] = useState(false);
  const [provider, setProvider] = useState("قلمچی");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const { dataUrl, mime } = await readKarnamehFile(file).catch(() => ({ dataUrl: undefined, mime: file.type }));
    const stored = addKarnameh(
      {
        studentId: "me",
        uploadedBy: "student",
        examProvider: provider.trim() || "نامشخص",
        fileName: file.name,
        note: note.trim(),
        dataUrl,
        mime,
      },
      "ایمان"
    );
    setBusy(false);
    setNameOnly(!stored);
    setFile(null);
    setNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">آپلود کارنامه‌ی آزمون</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          همین که نتیجه‌ی آزمونت از قلمچی/گاج اومد، عکس یا فایلش رو اینجا بذار — مستقیم می‌ره برای سارا محمدی، دیگه
          نیازی به تلگرام نیست.
        </p>

        <Card>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">فایل کارنامه</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={onFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={pickFile}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-x-md border-2 border-dashed border-border py-8 text-sm text-text-500 hover:border-blue-600 hover:text-blue-600"
                >
                  <FileUp size={22} />
                  {fileName ? (
                    <span className="text-text-900">{fileName}</span>
                  ) : (
                    <span>عکس بگیر یا فایل رو انتخاب کن</span>
                  )}
                </button>
              </div>

              <Input
                label="منبع آزمون"
                placeholder="مثلاً: قلمچی، گاج، ماز..."
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">
                  یادداشت برای مشاور <span className="font-normal text-text-500">(اختیاری)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="مثلاً: این آزمون رو بیمار بودم، شرایط عادی نبود"
                  className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!fileName || busy}>
                {busy ? "در حال آماده‌سازی فایل..." : "ارسال برای مشاور"}
              </Button>

              {submitted && (
                <div className="flex items-center gap-2 rounded-x-md bg-mint-500/15 p-3 text-sm text-mint-500">
                  <Check size={16} />
                  {nameOnly
                    ? "ارسال شد — ولی فایل بیشتر از ۱.۵ مگابایت بود و در نسخه‌ی نمایشی فقط اسمش ذخیره شد."
                    : "ارسال شد — سارا محمدی به‌زودی می‌بینتش."}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">تاریخچه‌ی ارسال‌ها</h2>
        <div className="space-y-2">
          {uploads.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-3 py-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text-900">
                    {u.examProvider} — {u.fileName}
                  </div>
                  <div className="text-xs text-text-500">{u.date}</div>
                  {u.note && <p className="mt-1 text-xs text-text-700">{u.note}</p>}
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${u.seenByMentor ? "text-mint-500" : "text-text-500"}`}
                >
                  <Eye size={12} />
                  {u.seenByMentor ? "دیده شد" : "در انتظار"}
                </div>
              </CardContent>
            </Card>
          ))}
          {uploads.length === 0 && (
            <p className="py-6 text-center text-sm text-text-500">هنوز کارنامه‌ای آپلود نکردی.</p>
          )}
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <PercentCalculator />
        </div>
      </div>
    </StudentShell>
  );
}
