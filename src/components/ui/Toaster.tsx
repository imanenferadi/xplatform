"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Check, Undo2, X } from "lucide-react";

// One global toast: «انجام شد» plus an optional «برگردون», instead of
// «مطمئنی؟» dialogs. Undoable actions just do the thing and offer to undo.
type Toast = { id: number; message: string; undo?: () => void };

const DURATION_MS = 5000;
let current: Toast | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, undo?: () => void) {
  current = { id: Date.now(), message, undo };
  emit();
}

function dismiss() {
  current = null;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function Toaster() {
  const t = useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );

  useEffect(() => {
    if (!t) return;
    const timer = setTimeout(dismiss, DURATION_MS);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-6"
    >
      {t && (
        <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-x-pill bg-navy-900 py-2 pe-2 ps-4 text-sm text-white shadow-x-lg">
          <Check size={15} className="shrink-0" />
          <span>{t.message}</span>
          {t.undo && (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                dismiss();
              }}
              className="flex items-center gap-1 rounded-x-pill bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
            >
              <Undo2 size={13} /> برگردون
            </button>
          )}
          <button type="button" onClick={dismiss} aria-label="بستن پیام" className="rounded-full p-1 hover:bg-white/15">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
