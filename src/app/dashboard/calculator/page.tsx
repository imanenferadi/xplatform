"use client";

import { StudentShell } from "@/components/app/StudentShell";
import { PercentCalculator } from "@/components/app/PercentCalculator";

// Konkur percentage with negative marking — one of the student's tools.
export default function CalculatorPage() {
  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <PercentCalculator />
      </div>
    </StudentShell>
  );
}
