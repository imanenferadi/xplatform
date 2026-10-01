import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import {
  LOCKUP_WIDTH,
  MARK_STROKE_PATH,
  WORDMARK_BASELINE,
  WORDMARK_PATH,
  WORDMARK_SCALE,
  WORDMARK_X,
} from "./logo-data";

/**
 * The Matriss lockup: an M that climbs to a goal dot, then the wordmark
 * (Outfit 600, drawn as outlines so it needs no font). Colors follow the
 * theme: the M and the word use the text color, the dot is the brand yellow.
 * Regenerate the data with `npm run brand`.
 */
export function Logo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <svg
      role="img"
      aria-label={BRAND}
      viewBox={`0 0 ${markOnly ? 64 : LOCKUP_WIDTH} 64`}
      className={cn("h-7 w-auto text-text-900", className)}
    >
      <path
        d={MARK_STROKE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="54" cy="12" r="6.2" fill="var(--x-yellow-400)" />
      {!markOnly && (
        <path
          transform={`translate(${WORDMARK_X},${WORDMARK_BASELINE}) scale(${WORDMARK_SCALE})`}
          d={WORDMARK_PATH}
          fill="currentColor"
        />
      )}
    </svg>
  );
}
