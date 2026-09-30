"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/app/StepProgress";
import { placementQuestions } from "@/lib/mock-data";
import { markPlacementDone } from "@/lib/placement-store";
import { cn, toPersianDigits } from "@/lib/utils";

type Phase = "intro" | "question" | "paused" | "analyzing";

export default function PlacementPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = placementQuestions[qIndex];
  const total = placementQuestions.length;

  function answer(optionIndex: number | null) {
    setSelected(optionIndex);
    // Small delay so the selected state is visible before advancing —
    // mirrors the tap feedback a real quiz needs.
    setTimeout(() => {
      setSelected(null);
      if (qIndex + 1 >= total) {
        setPhase("analyzing");
        markPlacementDone();
        setTimeout(() => router.push("/placement/result"), 2600);
      } else {
        setQIndex((i) => i + 1);
      }
    }, 260);
  }

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Sparkles size={28} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-900">
            چند دقیقه وقت بذار، دقیق‌تر بفهم کجایی.
          </h1>
          <p className="mt-3 text-text-500">
            اختیاریه — ولی مشاورت با نتیجه‌ش نقطه‌های ضعفت رو دقیق‌تر می‌بینه.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            <InfoTile label="زمان" value="چند دقیقه" />
            <InfoTile
              label="تعداد سؤال"
              value={`${toPersianDigits(total)} سؤال`}
            />
            <InfoTile label="قابل توقف" value="بله" />
          </div>

          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() => setPhase("question")}
          >
            شروع تعیین سطح
          </Button>
          <p className="mt-4 text-xs text-text-500">
            نتیجه فوریه و همیشه رایگانه.{" "}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-blue-600 hover:underline"
            >
              فعلاً نه
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (phase === "paused") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-bold text-text-900">
            {total - qIndex} سؤال مونده. می‌تونی همین‌جا ذخیره کنی و بعداً
            برگردی.
          </h1>
          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" onClick={() => setPhase("question")}>
              ادامه بده
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              بعداً ادامه می‌دم
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div
          aria-hidden
          className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"
        />
        <h1 className="text-lg font-bold text-text-900">
          در حال ساختن نیمرخ سطح تو...
        </h1>
        <p className="mt-2 text-sm text-text-500">
          چند ثانیه بیشتر طول نمی‌کشه
        </p>
      </div>
    );
  }

  // phase === "question"
  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3">
        <button
          onClick={() => setPhase("paused")}
          className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2"
          aria-label="توقف موقت"
        >
          <Pause size={20} />
        </button>
        <StepProgress current={qIndex + 1} total={total} />
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2"
          aria-label="خروج"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        <span className="mb-3 text-center text-xs font-medium text-text-500">
          {question.subject} · {question.topic}
        </span>
        <h1 className="mb-8 text-center text-xl font-bold leading-[1.6] text-text-900 md:text-2xl">
          {question.prompt}
        </h1>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => answer(i)}
              className={cn(
                "w-full rounded-x-lg border-2 px-5 py-4 text-right text-base font-medium transition-colors",
                selected === i
                  ? "border-blue-600 bg-blue-100 text-text-900"
                  : "border-border bg-surface text-text-700 hover:border-blue-300",
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={() => answer(null)}
          className="mt-5 text-center text-sm text-text-500 hover:text-text-900"
        >
          بلد نیستم
        </button>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-x-md border border-border bg-surface p-3">
      <div className="font-bold text-text-900">{value}</div>
      <div className="mt-0.5 text-xs text-text-500">{label}</div>
    </div>
  );
}
