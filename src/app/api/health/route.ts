import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    db().prepare("SELECT 1").get();
    return NextResponse.json({ ok: true, db: "sqlite" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 503 });
  }
}
