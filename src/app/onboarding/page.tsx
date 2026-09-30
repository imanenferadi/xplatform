"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/app/StepProgress";
import { cn } from "@/lib/utils";

type Answers = {
  major: string;
  grade: string;
  goal: string;
  hoursPerDay: string;
  style: string;
  personality: string;
};

const steps: {
  key: keyof Answers;
  question: string;
  options: string[];
}[] = [
  {
    key: "major",
    question: "برای کدوم رشته می‌خونی؟",
    options: ["ریاضی", "تجربی"],
  },
  {
    key: "grade",
    question: "الان کجای مسیری؟",
    options: ["دهم", "یازدهم", "دوازدهم", "پشت‌کنکوری"],
  },
  {
    key: "goal",
    question: "هدفت چیه؟",
    options: ["قبولی رشته/دانشگاه مشخص", "رتبه‌ی بهتر", "هنوز مطمئن نیستم"],
  },
  {
    key: "hoursPerDay",
    question: "واقعاً چند ساعت در روز وقت داری؟",
    options: [
      "کمتر از ۲ ساعت",
      "۲ تا ۴ ساعت",
      "۴ تا ۶ ساعت",
      "بیشتر از ۶ ساعت",
    ],
  },
  {
    key: "style",
    question: "دوست داری چطور کمکت کنیم؟",
    options: [
      "توضیح آروم و قدم‌به‌قدم",
      "مستقیم برو سر تست",
      "با مثال و داستان",
    ],
  },
  {
    key: "personality",
    question: "وقتی گیر می‌کنی، بیشتر به چی نیاز داری؟",
    options: [
      "یکی که سخت‌گیری کنه",
      "یکی که همراهیم کنه",
      "دیدن پیشرفت با عدد",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  function choose(option: string) {
    setAnswers((a) => ({ ...a, [step.key]: option }));
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  // Placement is optional: seeing the mentors is the default next step.
  if (finished)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-center">
        <div className="w-full max-w-md">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-mint-500/15">
            <Check size={26} className="text-mint-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-900">
            حالا مشاورت رو انتخاب کن
          </h1>
          <p className="mt-2 text-text-500">
            مشاورهای {answers.major ?? "رشته‌ی تو"} رو با رتبه، سبک و ظرفیت خالی
            ببین. جلسه‌ی آشنایی ۲۰ دقیقه‌ای رایگانه.
          </p>
          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() =>
              router.push(
                answers.major
                  ? `/mentors?group=${encodeURIComponent(answers.major)}`
                  : "/mentors",
              )
            }
          >
            مشاورها رو ببین
          </Button>
          <button
            type="button"
            onClick={() => router.push("/placement")}
            className="mt-4 w-full rounded-x-lg border border-border bg-surface p-4 text-right transition-colors hover:bg-surface-2"
          >
            <div className="text-sm font-medium text-text-900">
              اول تعیین سطح بدم (اختیاری)
            </div>
            <div className="mt-0.5 text-xs text-text-500">
              چند دقیقه — ۳ مشاور نزدیک‌تر به مسیرت پیشنهاد می‌شه و مشاورت نیمرخ
              سطحت رو می‌بینه.
            </div>
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="mb-8 flex items-center gap-3">
          {index > 0 && (
            <button
              onClick={() => setIndex((i) => i - 1)}
              className="rounded-x-sm p-1.5 text-text-500 hover:bg-surface-2"
              aria-label="بازگشت"
            >
              <ArrowRight size={20} />
            </button>
          )}
          <StepProgress current={index + 1} total={steps.length} />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <h1 className="mb-8 text-center text-2xl font-bold text-text-900 md:text-[28px]">
            {step.question}
          </h1>

          <div className="space-y-3">
            {step.options.map((opt) => {
              const selected = answers[step.key] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => choose(opt)}
                  className={cn(
                    "w-full rounded-x-lg border-2 px-5 py-4 text-right text-base font-medium transition-colors",
                    selected
                      ? "border-blue-600 bg-blue-100 text-text-900"
                      : "border-border bg-surface text-text-700 hover:border-blue-300",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
