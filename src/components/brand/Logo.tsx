import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark for X. Deliberately not a graduation cap / book /
 * lightbulb (design doc §2.1 explicitly rules those out). A small star +
 * a minimal path/arrow, standing in until the real name is chosen.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-extrabold text-text-900", className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <path
          d="M4 20 L11 8 L15 14 L22 4"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="4" r="2" fill="var(--x-yellow-400)" />
      </svg>
      <span className="text-xl">X</span>
    </span>
  );
}
