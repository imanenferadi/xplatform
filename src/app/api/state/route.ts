import { NextResponse } from "next/server";
import { listState, resetState } from "@/server/db";

export const dynamic = "force-dynamic";

// GET /api/state[?since=<ISO>]  — every key (or only those changed after `since`).
export function GET(req: Request) {
  const since = new URL(req.url).searchParams.get("since") ?? undefined;
  try {
    const rows = listState(since);
    return NextResponse.json({
      items: rows.map((r) => ({
        key: r.key,
        value: r.value,
        version: r.version,
        updatedAt: r.updated_at,
      })),
      cursor: rows.at(-1)?.updated_at ?? since ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 503 });
  }
}

// DELETE /api/state — wipe the demo data (development only).
export function DELETE() {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json(
      { error: "disabled in production" },
      { status: 403 },
    );
  return NextResponse.json({ deleted: resetState() });
}
