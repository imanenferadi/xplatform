"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { mentors, type Mentor } from "@/lib/mock-data";

const reasons: Record<string, string> = {
  "sara-mohammadi":
    "شیمی نقطه‌ضعف توئه و شیمیِ سارا در کنکور ۹۲٪ بوده. او هم سال دهم از صفر شروع کرد.",
  "amirhossein-rezaei":
    "الگوی تست‌زنی تو «سریع ولی نامطمئن» است. امیرحسین دقیقاً همین مشکل را با تحلیل زمان‌بندی حل کرد.",
  "negar-ahmadi":
    "هدف تو دندان‌پزشکی است؛ نگار همین رشته را با یک جهش رتبه در دوازدهم گرفت.",
};

export default function MatchingPage() {
  const router = useRouter();
  const [whyMentor, setWhyMentor] = useState<Mentor | null>(null);

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-900 md:text-[32px]">
            بر اساس نیمرخ تو، ۳ نفر رو پیدا کردیم
          </h1>
          <p className="mt-2 text-text-500">
            نه یک لیست ۵۰ نفره — سه مشاور تأییدشده که مسیرشان به مسیر تو نزدیک‌تر است.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {mentors.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-1 font-bold text-text-900">
                      {m.name}
                      {m.verified && (
                        <BadgeCheck size={15} className="text-blue-600" aria-label="مشاور تأییدشده" />
                      )}
                    </div>
                    <div className="text-xs text-text-500">
                      {m.major}، {m.school}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="brand">{m.rank}</Badge>
                  <Badge tone="neutral">{m.year}</Badge>
                  <Badge tone="info">{m.style}</Badge>
                </div>

                <button
                  onClick={() => setWhyMentor(m)}
                  className="mt-4 flex-1 rounded-x-md bg-surface-2 p-3 text-right text-sm leading-[1.75] text-text-700 transition-colors hover:bg-blue-100"
                >
                  {reasons[m.id]}
                  <span className="mt-1 block text-xs font-medium text-blue-600">
                    چرا این نفر؟
                  </span>
                </button>

                <div className="mt-4 flex items-center justify-between text-xs text-text-500">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    <span className="tnum">{m.rating}</span> ({m.reviewCount} نظر)
                  </span>
                  <span className="tnum">{m.capacity} ظرفیت باقی‌مانده</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full" size="md" onClick={() => router.push(`/mentors/${m.id}`)}>
                  مشاهده پروفایل
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-500">
          هیچ‌کدام مناسب نبود؟{" "}
          <Link href="/mentors" className="text-blue-600 hover:underline">
            گزینه‌های بیشتر را ببین
          </Link>
        </p>
      </div>

      {whyMentor && <WhyDrawer mentor={whyMentor} onClose={() => setWhyMentor(null)} />}
    </div>
  );
}

function WhyDrawer({ mentor, onClose }: { mentor: Mentor; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-x-xl bg-surface p-6 sm:rounded-x-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-text-900">چرا {mentor.name}؟</h3>
          <button onClick={onClose} className="text-text-500 hover:text-text-900" aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <WhyRow title="نقطه‌ی قوت مشترک">
            {mentor.strengths.map((s) => (
              <div key={s.subject} className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-text-700">{s.subject}</span>
                <span className="tnum text-text-500">{s.score}٪ در کنکور</span>
              </div>
            ))}
          </WhyRow>

          <WhyRow title="نزدیکی مسیر">
            <p className="text-sm leading-[1.75] text-text-700">{mentor.story}</p>
          </WhyRow>

          <WhyRow title="سبک و ظرفیت">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{mentor.style}</Badge>
              <Badge tone="neutral" className="tnum">
                {mentor.capacity} از {mentor.capacityTotal} ظرفیت آزاد
              </Badge>
            </div>
          </WhyRow>
        </div>

        <Button size="lg" className="mt-6 w-full">
          مشاهده پروفایل کامل
        </Button>
      </div>
    </div>
  );
}

function WhyRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold text-text-500">{title}</h4>
      {children}
    </div>
  );
}
