import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// The one place that touches the database. SQLite through Node's built-in
// `node:sqlite` — no extra dependency, no service to run, one file on disk.
// Needs a host with a writable disk (a VPS, a container, your own machine);
// serverless platforms with a read-only filesystem can't use it.

export type StateRow = {
  key: string;
  value: string;
  version: number;
  updated_at: string;
};

const DB_PATH =
  process.env.MATRISS_DB ?? path.join(process.cwd(), "data", "matriss.db");

// Cached on globalThis so dev-server hot reloads reuse one connection.
const g = globalThis as unknown as { __matrissDb?: DatabaseSync };

function open(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS state (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      version    INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS state_updated ON state (updated_at);
  `);
  return db;
}

export function db(): DatabaseSync {
  return (g.__matrissDb ??= open());
}

export const KEY_PATTERN = /^x-[a-z0-9-]{1,60}$/;
export const MAX_VALUE_BYTES = 5 * 1024 * 1024;

export function listState(since?: string): StateRow[] {
  const d = db();
  return (
    since
      ? d
          .prepare(
            "SELECT key, value, version, updated_at FROM state WHERE updated_at > ? ORDER BY updated_at",
          )
          .all(since)
      : d
          .prepare(
            "SELECT key, value, version, updated_at FROM state ORDER BY updated_at",
          )
          .all()
  ) as StateRow[];
}

export function getState(key: string): StateRow | undefined {
  return db()
    .prepare("SELECT key, value, version, updated_at FROM state WHERE key = ?")
    .get(key) as StateRow | undefined;
}

/** Last write wins; `version` counts the writes so clients can tell what's new. */
export function putState(key: string, value: string): StateRow {
  // ISO strings with millisecond precision sort correctly, and `max(…)` keeps them
  // strictly increasing even for two writes in the same millisecond.
  const d = db();
  const now = new Date().toISOString();
  const last = d.prepare("SELECT max(updated_at) AS m FROM state").get() as {
    m: string | null;
  };
  const stamp =
    last.m && last.m >= now
      ? new Date(Date.parse(last.m) + 1).toISOString()
      : now;
  d.prepare(
    `INSERT INTO state (key, value, version, updated_at) VALUES (?, ?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, version = version + 1, updated_at = excluded.updated_at`,
  ).run(key, value, stamp);
  return getState(key)!;
}

export function resetState(): number {
  return Number(db().prepare("DELETE FROM state").run().changes);
}
