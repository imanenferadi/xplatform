import { MentorProfileView } from "@/components/app/MentorProfileView";
import { StoredMentorProfile } from "@/components/app/StoredMentorProfile";
import { mentors, sessionFeedback } from "@/lib/mock-data";

export function generateStaticParams() {
  return mentors.map((m) => ({ id: m.id }));
}

export default async function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mentor = mentors.find((m) => m.id === id);
  // Not a seeded mentor — may be a self-registered one approved in the admin
  // panel, which only the browser (localStorage demo store) knows about.
  if (!mentor) return <StoredMentorProfile id={id} />;

  return (
    <div className="min-h-screen bg-background">
      <MentorProfileView mentor={mentor} reviews={sessionFeedback.filter((f) => f.mentorId === id)} />
    </div>
  );
}
