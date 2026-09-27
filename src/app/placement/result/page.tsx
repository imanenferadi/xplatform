"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressCircle, ProgressBar } from "@/components/ui/Progress";
import { levelProfile } from "@/lib/mock-data";
import { toPersianDigits } from "@/lib/utils";

export default function PlacementResultPage() {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Badge tone="info" className="mb-4">
            <Sparkles size={14} /> نیمرخ سطح تو آماده شد
          </Badge>
          <h1 className="text-2xl font-bold text-text-900 md:text-[32px]">این نتیجه‌ی واقعیِ توئه</h1>
          <p className="mt-2 text-text-500">بر همین اساس، مشاورهایی رو پیدا کردیم که مسیرشون به مسیر تو نزدیک‌تره.</p>
        </div>

        {/* Score hero */}
        <div className="rounded-x-xl border border-border bg-surface p-6 shadow-x-sm md:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <ProgressCircle value={levelProfile.score} size={104} />
              <div>
                <div className="text-sm text-text-500">سطح فعلی</div>
                <div className="text-lg font-bold text-text-900">{levelProfile.label}</div>
              </div>
            </div>
            <div className="rounded-x-md bg-surface-2 px-4 py-3 text-center sm:text-right">
              <div className="text-xs text-text-500">بازه‌ی رتبه‌ی احتمالی</div>
              <div className="tnum text-lg font-bold text-text-900">{levelProfile.rankRange}</div>
            </div>
          </div>

          {/* Subject heatmap */}
          <div className="mt-8 space-y-4">
            {levelProfile.subjects.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-text-700">{s.name}</span>
                  <span className="tnum text-text-500">{toPersianDigits(s.value)}٪</span>
                </div>
                <ProgressBar value={s.value} tone={s.value >= 75 ? "success" : s.value >= 55 ? "brand" : "warning"} />
              </div>
            ))}
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <TopicGroup title="مسلط" tone="success" topics={levelProfile.topics.strong} />
          <TopicGroup title="لرزان" tone="warning" topics={levelProfile.topics.shaky} />
          <TopicGroup title="نیاز به بازسازی" tone="danger" topics={levelProfile.topics.weak} />
        </div>

        {/* Critical points */}
        <div className="mt-5 rounded-x-lg border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-bold text-text-900">سه نقطه‌ی بحرانی</h3>
          <ul className="space-y-3">
            {levelProfile.criticalPoints.map((c, i) => (
              <li key={c.topic} className="flex items-start gap-3 text-sm">
                <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  {toPersianDigits(i + 1)}
                </span>
                <div>
                  <span className="font-medium text-text-900">{c.topic}</span>
                  <span className="text-text-500"> — {c.reason}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-x-md bg-surface-2 p-3 text-sm text-text-700">
          <span className="font-medium text-text-900">الگوی زمان‌بندی:</span>
          {levelProfile.timingPattern}
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={() => router.push("/matching")}>
            ۳ مشاور مناسب من رو ببین
            <ArrowLeft size={18} />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setShareOpen(true)}>
            <Share2 size={18} />
            اشتراک‌گذاری
          </Button>
        </div>
      </div>

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function TopicGroup({
  title,
  tone,
  topics,
}: {
  title: string;
  tone: "success" | "warning" | "danger";
  topics: string[];
}) {
  const dot = { success: "bg-mint-500", warning: "bg-orange-500", danger: "bg-red-500" }[tone];
  return (
    <div className="rounded-x-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h4 className="text-sm font-bold text-text-900">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {topics.map((t) => (
          <li key={t} className="text-sm text-text-700">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Draws the same card onto a canvas and saves it as a PNG. */
function downloadCard() {
  const W = 800;
  const H = 1000;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return;
  const font = getComputedStyle(document.body).fontFamily;
  g.fillStyle = "#0f2d58";
  g.beginPath();
  g.roundRect(0, 0, W, H, 48);
  g.fill();
  g.direction = "rtl";
  g.fillStyle = "#ffffff";
  g.textAlign = "right";
  g.font = `bold 40px ${font}`;
  g.fillText("X", W - 60, 90);
  g.textAlign = "center";
  g.font = `800 180px ${font}`;
  g.fillText(toPersianDigits(levelProfile.score), W / 2, 380);
  g.font = `36px ${font}`;
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.fillText(levelProfile.label, W / 2, 450);
  g.font = `34px ${font}`;
  levelProfile.subjects.forEach((sub, i) => {
    const y = 580 + i * 80;
    g.fillStyle = "#ffffff";
    g.textAlign = "right";
    g.fillText(sub.name, W - 80, y);
    g.textAlign = "left";
    g.fillText(`${toPersianDigits(sub.value)}٪`, 80, y);
  });
  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = "x-placement-result.png";
  a.click();
}

function ShareModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-x-xl bg-surface p-6 shadow-x-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-text-900">کارت قابل‌اشتراک</h3>
          <button onClick={onClose} className="text-text-500 hover:text-text-900" aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        <div className="aspect-[4/5] rounded-x-lg bg-navy-900 p-5 text-white">
          <span className="text-sm font-bold">X</span>
          <div className="mt-6 text-center">
            <div className="tnum text-5xl font-extrabold">{toPersianDigits(levelProfile.score)}</div>
            <div className="mt-1 text-sm text-white/70">{levelProfile.label}</div>
          </div>
          <div className="mt-6 space-y-2">
            {levelProfile.subjects.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span>{s.name}</span>
                <span className="tnum">{toPersianDigits(s.value)}٪</span>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="mt-4 w-full" onClick={downloadCard}>
          دانلود تصویر
        </Button>
      </div>
    </div>
  );
}
