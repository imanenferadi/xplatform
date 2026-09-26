"use client";

import { createLocalStore } from "./local-store";
import { seedChurnResponses, type ChurnReason, type ChurnResponse } from "./mock-data";
import { logEvent } from "./admin-log-store";

// Answers to «چرا می‌ری؟» before auto-renew is switched off, plus the
// logged-in student's own outcome (shown on their profile).
type MyOutcome = { outcome: "cancelled" | "retained"; reason: ChurnReason } | null;
type State = { responses: ChurnResponse[]; mine: MyOutcome };

const store = createLocalStore<State>("x-churn", { responses: seedChurnResponses, mine: null });

export const useChurn = store.useValue;

export function recordChurn(r: Omit<ChurnResponse, "id" | "date">, reasonLabel: string) {
  const s = store.get();
  const entry: ChurnResponse = { ...r, id: `ch-${Date.now()}`, date: "امروز" };
  store.set({ responses: [entry, ...s.responses], mine: { outcome: r.outcome, reason: r.reason } });
  logEvent({
    category: "مالی",
    actor: r.student,
    actorRole: "دانش‌آموز",
    action: r.outcome === "cancelled" ? "لغو تمدید خودکار اشتراک" : "پذیرش پیشنهاد نگه‌داشت",
    target: `${r.student} — پلن ${r.plan}`,
    severity: r.outcome === "cancelled" ? "warning" : "info",
    details: [{ label: "دلیل", value: reasonLabel }, ...(r.text ? [{ label: "توضیح", value: r.text }] : [])],
    href: "/admin/churn",
  });
}

/** Turn auto-renew back on (undo a cancellation). */
export function undoMyCancellation() {
  store.set({ ...store.get(), mine: null });
}
