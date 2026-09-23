import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Star, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/Progress";
import { mentors, sessionFeedback } from "@/lib/mock-data";

export function generateStaticParams() {
  return mentors.map((m) => ({ id: m.id }));
}

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = mentors.find((m) => m.id === id);
  if (!mentor) notFound();
  const reviews = sessionFeedback.filter((f) => f.mentorId === id);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <div className="border-b border-border bg-surface px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Avatar name={mentor.name} size="xl" />
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-text-900">{mentor.name}</h1>
            {mentor.verified && (
              <span title="مشاور تأییدشده">
                <BadgeCheck size={20} className="text-blue-600" />
              </span>
            )}
          </div>
          <p className="text-text-500">
            {mentor.major} — {mentor.school}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge tone="brand">{mentor.rank}</Badge>
            <Badge tone="neutral">{mentor.year}</Badge>
            <Badge tone="info">{mentor.style}</Badge>
          </div>

          <div className="flex items-center gap-1 text-sm text-text-500">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="tnum">{mentor.rating}</span> ({mentor.reviewCount} نظر) ·{" "}
            <span className="tnum">{mentor.capacity}</span> ظرفیت باقی‌مانده
          </div>

          <Link href={`/booking/${mentor.id}`} className={buttonVariants({ size: "lg", className: "mt-2" })}>
            رزرو جلسه‌ی آشنایی رایگان
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-6 px-4">
        {/* Story */}
        <Section title="درباره من">
          <p className="text-sm leading-[1.9] text-text-700">{mentor.story}</p>
        </Section>

        {/* Video placeholder */}
        <Section title="ویدیوی معرفی">
          <div className="flex aspect-video items-center justify-center rounded-x-lg bg-surface-2">
            <PlayCircle size={40} className="text-text-500" />
          </div>
        </Section>

        {/* Strengths */}
        <Section title="نقاط قوت درسی (نمرات کنکور)">
          <div className="space-y-4">
            {mentor.strengths.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-text-700">{s.subject}</span>
                  <span className="tnum text-text-500">{s.score}٪</span>
                </div>
                <ProgressBar value={s.score} tone="success" />
              </div>
            ))}
          </div>
        </Section>

        {/* Real reviews left by students after a session, not just the number */}
        {reviews.length > 0 && (
          <Section title="نظر دانش‌آموزها">
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-900">{r.studentName}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-[1.8] text-text-700">{r.comment}</p>
                  <div className="tnum mt-1 text-xs text-text-500">{r.date}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Availability placeholder */}
        <Section title="زمان‌های آزاد">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {["شنبه ۱۸:۰۰", "دوشنبه ۱۹:۰۰", "سه‌شنبه ۲۰:۰۰", "پنجشنبه ۱۷:۰۰"].map((t) => (
              <div
                key={t}
                className="rounded-x-md border border-border bg-surface-2 px-3 py-2 text-center text-xs text-text-700"
              >
                {t}
              </div>
            ))}
          </div>
        </Section>

        <div className="rounded-x-lg border border-border bg-surface p-5 text-center">
          <p className="text-sm text-text-500">
            قبل از هر تصمیمی، یک جلسه‌ی ۲۰ دقیقه‌ای رایگان با هم داشته باشید.
          </p>
          <Link
            href={`/booking/${mentor.id}`}
            className={buttonVariants({ size: "lg", className: "mt-4 w-full sm:w-auto" })}
          >
            رزرو جلسه‌ی آشنایی
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-x-lg border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-bold text-text-900">{title}</h2>
      {children}
    </section>
  );
}
