"use client";

import { createLocalStore } from "./local-store";
import { reportFeedbackSeed, type ReportFeedback, type ReportReaction } from "./mock-data";
import { nowClock } from "./followup-store";

// Mentor feedback on nightly reports, keyed by report id.
const store = createLocalStore<Record<string, ReportFeedback>>("x-report-feedback", reportFeedbackSeed);

export const useReportFeedback = store.useValue;

export function giveFeedback(reportId: string, reaction: ReportReaction, comment: string) {
  store.set({ ...store.get(), [reportId]: { reaction, comment, at: `امروز، ${nowClock()}` } });
}
