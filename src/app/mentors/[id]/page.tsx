import type { Metadata } from "next";
import { MentorProfileView } from "@/components/app/MentorProfileView";
import { StoredMentorProfile } from "@/components/app/StoredMentorProfile";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { mentors, sessionFeedback } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";
import { SITE_URL, noIndex, pageMetadata } from "@/lib/seo";
import { toLatinDigits } from "@/lib/utils";

export function generateStaticParams() {
  return mentors.map((m) => ({ id: m.id }));
}

// Each profile gets its own title, description and link preview.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = mentors.find((x) => x.id === id);
  if (!m) return noIndex; // self-registered mentors only exist in the browser demo store
  const story = m.story.length > 130 ? `${m.story.slice(0, 127)}…` : m.story;
  return pageMetadata(
    `${m.name} — ${m.rank} کنکور`,
    `${m.name}، ${m.major} ${m.school}، ${m.rank} ${m.year} (${m.group}). سبک مشاوره: ${m.style}. ${story}`,
    `/mentors/${m.id}`,
  );
}

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = mentors.find((m) => m.id === id);
  // Not a seeded mentor — may be a self-registered one approved in the admin
  // panel, which only the browser (localStorage demo store) knows about.
  if (!mentor) return <StoredMentorProfile id={id} />;

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: mentor.name,
            url: `${SITE_URL}/mentors/${mentor.id}`,
            jobTitle: `مشاور کنکور در ${BRAND}`,
            description: `${mentor.rank} کنکور ${toLatinDigits(mentor.year).replace(/\D/g, "")} — ${mentor.major}، ${mentor.school}`,
            alumniOf: { "@type": "CollegeOrUniversity", name: mentor.school },
          },
        }}
      />
      <SiteHeader />
      <MentorProfileView
        mentor={mentor}
        reviews={sessionFeedback.filter((f) => f.mentorId === id)}
      />
    </div>
  );
}
