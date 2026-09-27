"use client";

import { cloneElement, isValidElement, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// The one form pattern: label on top, optional hint, the error right under
// its own field (announced and linked for screen readers), the main button
// at the bottom — full width on phones — and «ذخیره شد» always in the same
// spot next to it.

type ControlProps = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

export function Field({
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  optional?: boolean;
  children: React.ReactElement<ControlProps>;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        className: cn(children.props.className, error && "border-red-500"),
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={children.props.id ?? id} className="mb-1.5 block text-sm font-medium text-text-700">
        {label}
        {optional && <span className="font-normal text-text-500"> (اختیاری)</span>}
      </label>
      {hint && (
        <p id={hintId} className="mb-1.5 text-xs text-text-500">
          {hint}
        </p>
      )}
      {control}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/** Main action(s) at the bottom; the primary button spans the width on phones. */
export function FormActions({ children, status }: { children: React.ReactNode; status?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center [&>button:first-child]:w-full sm:[&>button:first-child]:w-auto">
      {children}
      {status}
    </div>
  );
}

/** «ذخیره شد ✓» — always beside the form's main button. */
export function SaveStatus({ show, text = "ذخیره شد" }: { show: boolean; text?: string }) {
  return (
    <span aria-live="polite" className="min-h-5 text-sm text-mint-500">
      {show && (
        <span className="flex items-center gap-1">
          <Check size={15} /> {text}
        </span>
      )}
    </span>
  );
}

export const fieldClass =
  "h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600";
