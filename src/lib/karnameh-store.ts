"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { karnamehUploads, type KarnamehUpload } from "./mock-data";
import { logEvent } from "./admin-log-store";
import { nowClock } from "./followup-store";

// Karnameh files per student. The file itself is kept as a data: URL
// (photos shrunk first) so the mentor can actually open it; no score is
// read or analysed from it — the platform only passes the sheet along.
export type StoredKarnameh = KarnamehUpload & {
  studentId: string;
  uploadedBy: "student" | "mentor";
  dataUrl?: string;
  mime?: string;
};

const SEED: StoredKarnameh[] = karnamehUploads.map((k) => ({ ...k, studentId: "me", uploadedBy: "student" }));
const store = createLocalStore<StoredKarnameh[]>("x-karnameh", SEED);

export const useAllKarnamehs = store.useValue;

export const MAX_FILE_BYTES = 1_500_000;
const MAX_SIDE = 1600;

export function useKarnamehs(studentId: string): StoredKarnameh[] {
  const all = store.useValue();
  return useMemo(() => all.filter((k) => k.studentId === studentId), [all, studentId]);
}

/** Photos are redrawn at ≤1600px JPEG; PDFs are kept if small enough. */
export async function readKarnamehFile(file: File): Promise<{ dataUrl?: string; mime: string }> {
  if (file.type.startsWith("image/")) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { dataUrl: dataUrl.length < MAX_FILE_BYTES * 1.37 ? dataUrl : undefined, mime: "image/jpeg" };
  }
  if (file.size > MAX_FILE_BYTES) return { mime: file.type };
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { dataUrl, mime: file.type };
}

export function addKarnameh(k: Omit<StoredKarnameh, "id" | "date" | "seenByMentor">, studentName: string) {
  const entry: StoredKarnameh = {
    ...k,
    id: `ku-${Date.now()}`,
    date: `امروز، ${nowClock()}`,
    seenByMentor: k.uploadedBy === "mentor",
  };
  store.set([entry, ...store.get()]);
  logEvent({
    category: "کاربران",
    actor: k.uploadedBy === "student" ? studentName : "سارا محمدی",
    actorRole: k.uploadedBy === "student" ? "دانش‌آموز" : "مشاور",
    action: "آپلود کارنامه",
    target: `${studentName} — ${k.examProvider}`,
    severity: "info",
    details: [{ label: "فایل", value: k.fileName }],
  });
  return Boolean(entry.dataUrl);
}

export function markKarnamehSeen(id: string) {
  store.set(store.get().map((k) => (k.id === id ? { ...k, seenByMentor: true } : k)));
}
