import { redirect } from "next/navigation";

// Notes are now a tab of «دفترچه».
export default function NotesPage() {
  redirect("/dashboard/mistakes?tab=notes");
}
