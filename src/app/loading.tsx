import { Logo } from "@/components/brand/Logo";

// Shown while a page's data loads. The mark pulses; nothing else moves.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <Logo markOnly className="h-10 animate-pulse" />
      <span className="sr-only">در حال بارگذاری…</span>
    </div>
  );
}
