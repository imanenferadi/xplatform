import { redirect } from "next/navigation";

// «تقویم» is now the week view of «برنامه».
export default function CalendarPage() {
  redirect("/dashboard/plan?view=week");
}
