"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
  { key: "major", question: "برای کدوم رشته می‌خونی؟", options: ["ریاضی", "تجربی", "انسانی"] },
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
    options: ["کمتر از ۲ ساعت", "۲ تا ۴ ساعت", "۴ تا ۶ ساعت", "بیشتر از ۶ ساعت"],
  },
  {
    key: "style",
    question: "دوست داری چطور کمکت کنیم؟",
    options: ["توضیح آروم و قدم‌به‌قدم", "مستقیم برو سر تست", "با مثال و داستان"],
  },
  {
    key: "personality",
    question: "وقتی گیر می‌کنی، بیشتر به چی نیاز داری؟",
    options: ["یکی که سخت‌گیری کنه", "یکی که همراهیم کنه", "دیدن پیشرفت با عدد"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});

  const step = steps[index];
  const isLast = index === steps.length - 1;

  function choose(option: string) {
    setAnswers((a) => ({ ...a, [step.key]: option }));
    if (isLast) {
      router.push("/placement");
    } else {
      setIndex((i) => i + 1);
    }
  }

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
                      : "border-border bg-surface text-text-700 hover:border-blue-300"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {isLast && (
          <Button size="lg" className="mt-6" onClick={() => router.push("/placement")}>
            ادامه به تعیین سطح
          </Button>
        )}
      </div>
    </div>
  );
}
