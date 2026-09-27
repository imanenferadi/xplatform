import { redirect } from "next/navigation";

// «روند پیشرفت» was merged into «جمع هفته و روند».
export default function ReportsPage() {
  redirect("/dashboard/weekly");
}
