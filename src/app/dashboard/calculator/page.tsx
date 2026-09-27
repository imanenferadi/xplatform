import { redirect } from "next/navigation";

// The calculator now sits on «کارنامه», where percentages are needed.
export default function CalculatorPage() {
  redirect("/dashboard/karnameh#calculator");
}
