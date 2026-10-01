import { NextResponse } from "next/server";
import { KEY_PATTERN, MAX_VALUE_BYTES, getState, putState } from "@/server/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { key } = await params;
  if (!KEY_PATTERN.test(key))
    return NextResponse.json({ error: "bad key" }, { status: 400 });
  try {
    const row = getState(key);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      key,
      value: row.value,
      version: row.version,
      updatedAt: row.updated_at,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 503 });
  }
}

// PUT /api/state/<key>   body: { value: "<JSON text>" }
export async function PUT(req: Request, { params }: Ctx) {
  const { key } = await params;
  if (!KEY_PATTERN.test(key))
    return NextResponse.json({ error: "bad key" }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body must be JSON" }, { status: 400 });
  }
  const value = (body as { value?: unknown })?.value;
  if (typeof value !== "string")
    return NextResponse.json(
      { error: "value must be a string" },
      { status: 400 },
    );
  if (Buffer.byteLength(value) > MAX_VALUE_BYTES)
    return NextResponse.json({ error: "value too large" }, { status: 413 });
  try {
    JSON.parse(value);
  } catch {
    return NextResponse.json(
      { error: "value must be valid JSON" },
      { status: 400 },
    );
  }
  try {
    const row = putState(key, value);
    return NextResponse.json({
      key,
      version: row.version,
      updatedAt: row.updated_at,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 503 });
  }
}
