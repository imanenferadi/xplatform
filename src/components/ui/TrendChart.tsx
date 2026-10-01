import { toPersianDigits } from "@/lib/utils";

type Point = { label: string; value: number };

/**
 * A small dependency-free line chart for weekly trends. Not meant to
 * replace a real charting library at scale — just enough to answer
 * "is this going up or down?" at a glance, which parents and mentors
 * both asked for explicitly (research: "اولیا عاشق نمودارند").
 */
export function TrendChart({
  points,
  max = 100,
  unit = "٪",
  color = "var(--x-blue-600)",
  lowerIsBetter = false,
}: {
  points: Point[];
  max?: number;
  unit?: string;
  color?: string;
  /** e.g. response time: a rising line is bad news, not growth. */
  lowerIsBetter?: boolean;
}) {
  const width = 300;
  const height = 100;
  const padding = 8;

  const stepX = (width - padding * 2) / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (p.value / max) * (height - padding * 2);
    return { x, y, ...p };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");
  const isUp =
    points.length >= 2 && points[points.length - 1].value >= points[0].value;

  return (
    <div>
      {/* Kept LTR on purpose: the SVG's x-axis is a fixed left→right time
          series regardless of page direction, so the axis labels below it
          (which use flexbox and would otherwise mirror under RTL) need the
          same direction to stay aligned with the points. The Persian
          summary line below stays in the page's normal (RTL) flow. */}
      <div dir="ltr">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: 100 }}
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {coords.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={2.5} fill={color} />
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-xs text-text-500">
          {points.map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-text-500">
          از{" "}
          <span className="tnum">
            {toPersianDigits(points[0]?.value ?? 0)}
            {unit}
          </span>{" "}
          به{" "}
          <span className="tnum">
            {toPersianDigits(points[points.length - 1]?.value ?? 0)}
            {unit}
          </span>
        </span>
        {lowerIsBetter ? (
          <span className={isUp ? "text-orange-500" : "text-mint-500"}>
            {isUp ? "↑ بدتر شده" : "↓ بهتر شده"}
          </span>
        ) : (
          <span className={isUp ? "text-mint-500" : "text-orange-500"}>
            {isUp ? "↑ رو به رشد" : "↓ رو به افت"}
          </span>
        )}
      </div>
    </div>
  );
}
