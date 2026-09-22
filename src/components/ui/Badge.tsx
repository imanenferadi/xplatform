import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "excellent" | "success" | "warning" | "danger" | "info" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-700",
  // Distinct from "success" — a standout performer, not just "not at risk".
  excellent: "bg-mint-500/20 text-mint-500 font-semibold",
  success: "bg-mint-500/15 text-mint-500",
  warning: "bg-orange-500/15 text-orange-500",
  danger: "bg-red-500/15 text-red-500",
  info: "bg-blue-100 text-blue-600",
  brand: "bg-blue-100 text-text-900",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-x-pill px-3 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
