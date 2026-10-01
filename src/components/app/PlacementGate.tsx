"use client";

import { usePlacementDone } from "@/lib/placement-store";

/**
 * Placement is optional, so data derived from it must not appear for a
 * student who skipped it. For the demo student ("me") show `empty` until the
 * test is done; other (seeded) students always show `children`.
 */
export function PlacementGate({
  studentId,
  children,
  empty,
}: {
  studentId: string;
  children: React.ReactNode;
  empty: React.ReactNode;
}) {
  const done = usePlacementDone();
  return studentId === "me" && !done ? empty : children;
}
