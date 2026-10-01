import { BadgeCheck, Star, PlayCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/Progress";
import {
  DEFAULT_AVAILABILITY,
  type Mentor,
  type SessionFeedback,
} from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";
import { ShareButton } from "@/components/ui/ShareButton";
import {
  BookOrWaitlist,
  CapacityNote,
} from "@/components/app/MentorAvailability";

// Single source for how a mentor profile looks: the public page, the
// applicant's own preview while registering, and the admin's review
// preview all render this, so "what you approve is what goes live".
export function MentorProfileView({
  mentor,
  reviews = [],
  preview = false,
}: {
  mentor: Mentor;
  reviews?: SessionFeedback[];
  preview?: boolean;
}) {
  const isNew = mentor.reviewCount === 0;
  const availability = mentor.availability?.length
    ? mentor.availability
    : DEFAULT_AVAILABILITY;

  return (
    <div className="bg-background pb-16">
      {preview && (
        <div className="flex items-center justify-center gap-1.5 bg-blue-100 px-4 py-2 text-xs text-blue-600">
          <Eye size={13} /> پیش‌نمایش — این پروفایل بعد از تأیید تیم فنی دقیقاً
          همین‌طور روی سایت دیده می‌شه
        </div>
      )}

      <div className="border-b border-border bg-surface px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Avatar name={mentor.name || "؟"} size="xl" />
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
            {isNew ? (
              <Badge tone="success">مشاور تازه‌وارد</Badge>
            ) : (
              <>
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="tnum">{toPersianDigits(mentor.rating)}</span> (
                {toPersianDigits(mentor.reviewCount)} نظر)
              </>
            )}
            {" · "}
            <CapacityNote mentor={mentor} />
          </div>
          {!preview && (
            <ShareButton
              title={`${mentor.name} — مشاور ماتریس`}
              text={`${mentor.name}، ${mentor.rank} کنکور، ${mentor.school}`}
              label="اشتراک‌گذاری پروفایل"
            />
          )}

          {!preview && (
            <BookOrWaitlist mentor={mentor} className="mt-2 w-full max-w-xs" />
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-6 px-4">
        <Section title="درباره من">
          <p className="whitespace-pre-line text-sm leading-[1.9] text-text-700">
            {mentor.story}
          </p>
        </Section>

        <Section title="ویدیوی معرفی">
          <div className="flex aspect-video items-center justify-center rounded-x-lg bg-surface-2">
            <PlayCircle size={40} className="text-text-500" />
          </div>
        </Section>

        <Section title="نقاط قوت درسی (نمرات کنکور)">
          <div className="space-y-4">
            {mentor.strengths.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-text-700">{s.subject}</span>
                  <span className="tnum text-text-500">
                    {toPersianDigits(s.score)}٪
                  </span>
                </div>
                <ProgressBar value={s.score} tone="success" />
              </div>
            ))}
          </div>
        </Section>

        {reviews.length > 0 && (
          <Section title="نظر دانش‌آموزها">
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-900">
                      {r.studentName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < r.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-border"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-[1.8] text-text-700">
                    {r.comment}
                  </p>
                  <div className="tnum mt-1 text-xs text-text-500">
                    {r.date}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="زمان‌های آزاد">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {availability.map((t) => (
              <div
                key={t}
                className="rounded-x-md border border-border bg-surface-2 px-3 py-2 text-center text-xs text-text-700"
              >
                {t}
              </div>
            ))}
          </div>
        </Section>

        {!preview && (
          <div className="rounded-x-lg border border-border bg-surface p-5 text-center">
            <p className="text-sm text-text-500">
              قبل از هر تصمیمی، یک جلسه‌ی ۲۰ دقیقه‌ای رایگان با هم داشته باشید.
            </p>
            <BookOrWaitlist
              mentor={mentor}
              className="mx-auto mt-4 w-full max-w-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-x-lg border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-bold text-text-900">{title}</h2>
      {children}
    </section>
  );
}
