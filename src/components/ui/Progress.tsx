import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    brand: "bg-blue-600",
    success: "bg-mint-500",
    warning: "bg-orange-500",
    danger: "bg-red-500",
  }[tone];

  return (
    <div
      className={cn("h-2 w-full rounded-x-pill bg-surface-2 overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-x-pill transition-all duration-500", toneClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressCircle({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  ringClassName,
  transitionMs = 700,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Override the ring's color, e.g. "stroke-mint-500" for a rest timer. */
  ringClassName?: string;
  /** Countdown timers tick every second and shouldn't ease between steps. */
  transitionMs?: number;
  /** Custom center content — defaults to "{value}%" when omitted. */
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none", ringClassName ?? "stroke-blue-600")}
          style={{ transition: `stroke-dashoffset ${transitionMs}ms linear` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? <span className="tnum text-xl font-extrabold text-text-900">{Math.round(value)}%</span>}
        {label && <span className="text-[11px] text-text-500">{label}</span>}
      </div>
    </div>
  );
}
