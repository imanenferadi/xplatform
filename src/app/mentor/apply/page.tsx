"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileUp, Check, ShieldCheck, Percent } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { StepProgress } from "@/components/app/StepProgress";
import { MentorProfileView } from "@/components/app/MentorProfileView";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_TIMES,
  MENTOR_STYLES,
  PLATFORM_COMMISSION_PERCENT,
  SUBJECTS_BY_GROUP,
  TRADITIONAL_INSTITUTE_COMMISSION,
  type ExamGroup,
  type Mentor,
} from "@/lib/mock-data";
import { addApplication } from "@/lib/mentor-applications-store";
import { cn, toPersianDigits } from "@/lib/utils";

const STEPS = ["اطلاعات فردی", "سوابق کنکور", "ساخت پروفایل", "پیش‌نمایش و ارسال"];
const YEARS = ["1403", "1404", "1405"];
const GROUPS: ExamGroup[] = ["تجربی", "ریاضی", "انسانی"];
const MIN_STORY_LENGTH = 50;
const EXAMPLE_MONTHLY_FEE = 1200000;

function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function formatToman(n: number): string {
  return toPersianDigits(n.toLocaleString("en-US")) + " تومان";
}

type Errors = Record<string, string>;

export default function MentorApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [rank, setRank] = useState("");
  const [year, setYear] = useState("1404");
  const [group, setGroup] = useState<ExamGroup>("تجربی");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [karnamehFileName, setKarnamehFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [story, setStory] = useState("");
  const [style, setStyle] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [capacity, setCapacity] = useState("10");
  const [slots, setSlots] = useState<string[]>([]);

  const [agreed, setAgreed] = useState(false);

  const subjects = SUBJECTS_BY_GROUP[group];
  const filledScores = subjects
    .map((subject) => ({ subject, score: Number(toLatinDigits(scores[subject] ?? "")) }))
    .filter((s) => (scores[s.subject] ?? "").trim() !== "" && s.score >= 0 && s.score <= 100);

  const draftMentor: Mentor = {
    id: "preview",
    name: name.trim(),
    rank: `رتبه ${toPersianDigits(toLatinDigits(rank))}`,
    year: `کنکور ${toPersianDigits(year)}`,
    school: school.trim(),
    major: major.trim(),
    group,
    style,
    capacity: Number(toLatinDigits(capacity)) || 0,
    capacityTotal: Number(toLatinDigits(capacity)) || 0,
    rating: 0,
    reviewCount: 0,
    story: story.trim(),
    strengths: [...filledScores].sort((a, b) => b.score - a.score),
    verified: false,
    availability: slots,
  };

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (name.trim().length < 3) e.name = "نام و نام خانوادگی رو کامل بنویس.";
      if (!/^09\d{9}$/.test(toLatinDigits(phone.trim()))) e.phone = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع بشه.";
    }
    if (s === 1) {
      const r = Number(toLatinDigits(rank));
      if (!Number.isInteger(r) || r < 1) e.rank = "رتبه‌ی کشوری رو به عدد وارد کن.";
      if (!school.trim()) e.school = "دانشگاه محل تحصیل رو بنویس.";
      if (!major.trim()) e.major = "رشته‌ی دانشگاهی رو بنویس.";
      if (!karnamehFileName) e.karnameh = "برای احراز رتبه، کارنامه‌ی کنکورت لازمه.";
    }
    if (s === 2) {
      if (story.trim().length < MIN_STORY_LENGTH)
        e.story = `حداقل ${toPersianDigits(MIN_STORY_LENGTH)} کاراکتر — داستان مسیرت مهم‌ترین بخش پروفایله.`;
      if (!style) e.style = "یه سبک مشاوره انتخاب کن.";
      if (filledScores.length < 2) e.scores = "حداقل درصد دو درس رو (بین ۰ تا ۱۰۰) وارد کن.";
      const c = Number(toLatinDigits(capacity));
      if (!Number.isInteger(c) || c < 1 || c > 30) e.capacity = "ظرفیت بین ۱ تا ۳۰ دانش‌آموز.";
      if (slots.length === 0) e.slots = "حداقل یه زمان آزاد انتخاب کن.";
    }
    if (s === 3 && !agreed) e.agreed = "برای ارسال، شرایط همکاری رو تأیید کن.";
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    addApplication({ mentor: draftMentor, phone: toLatinDigits(phone.trim()), karnamehFileName: karnamehFileName ?? "" });
    setSubmitted(true);
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  function toggleSlot(slot: string) {
    setSlots((s) => (s.includes(slot) ? s.filter((x) => x !== slot) : [...s, slot]));
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
          <Check size={28} className="text-mint-500" />
        </div>
        <h1 className="text-xl font-bold text-text-900">درخواستت ثبت شد</h1>
        <p className="mt-2 max-w-sm text-sm leading-[1.8] text-text-500">
          تیم فنی کارنامه و پروفایلت رو بررسی می‌کنه. بعد از تأیید، پروفایلت همون‌طور که پیش‌نمایشش رو دیدی
          به فهرست مشاوران اضافه می‌شه و از طریق پیامک خبرت می‌کنیم.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          بازگشت به صفحه‌ی اصلی
        </Link>
        {/* Demo-only: there's no real ops team, so let the tester approve it. */}
        <p className="mt-4 text-xs text-text-500">
          (دمو){" "}
          <Link href="/admin/mentors" className="text-blue-600 hover:underline">
            در پنل ادمین تأییدش کن
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" aria-label="صفحه اصلی">
            <Logo />
          </Link>
          <span className="flex items-center gap-1 rounded-x-pill bg-mint-500/15 px-3 py-1 text-xs text-mint-500">
            <Percent size={12} /> کارمزد فقط {toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪
          </span>
        </div>

        <h1 className="text-2xl font-bold text-text-900">مشاور X شو</h1>
        <p className="mb-5 mt-1 text-sm text-text-500">
          رتبه‌ی برتر یکی دو سال اخیری؟ پروفایلت رو خودت بساز؛ بعد از تأیید تیم فنی روی سایت منتشر می‌شه.
        </p>

        <StepProgress current={step + 1} total={STEPS.length} />
        <div className="mb-5 mt-2 text-sm font-medium text-text-900">{STEPS[step]}</div>
      </div>

      {step === 0 && (
        <div className="mx-auto max-w-xl">
          <Card>
            <CardContent className="space-y-4">
              <Input label="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <Input
                label="شماره موبایل"
                inputMode="numeric"
                dir="ltr"
                placeholder="09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                helperText="فقط برای اطلاع‌رسانی نتیجه‌ی بررسی — روی پروفایل نمایش داده نمی‌شه."
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 1 && (
        <div className="mx-auto max-w-xl">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="رتبه‌ی کشوری"
                  inputMode="numeric"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  error={errors.rank}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-700">سال کنکور</label>
                  <div className="flex gap-1.5">
                    {YEARS.map((y) => (
                      <Pill key={y} active={year === y} onClick={() => setYear(y)}>
                        {toPersianDigits(y)}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">گروه آزمایشی</label>
                <div className="flex gap-1.5">
                  {GROUPS.map((g) => (
                    <Pill
                      key={g}
                      active={group === g}
                      onClick={() => {
                        setGroup(g);
                        setScores({});
                      }}
                    >
                      {g}
                    </Pill>
                  ))}
                </div>
              </div>

              <Input
                label="دانشگاه"
                placeholder="مثلاً دانشگاه تهران"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                error={errors.school}
              />
              <Input
                label="رشته‌ی دانشگاهی"
                placeholder="مثلاً پزشکی"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                error={errors.major}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">کارنامه‌ی کنکور (برای احراز رتبه)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setKarnamehFileName(e.target.files?.[0]?.name ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-x-md border-2 border-dashed py-6 text-sm transition-colors hover:border-blue-600 hover:text-blue-600",
                    errors.karnameh ? "border-red-500 text-red-500" : "border-border text-text-500"
                  )}
                >
                  <FileUp size={20} />
                  {karnamehFileName ? <span className="text-text-900">{karnamehFileName}</span> : "انتخاب فایل"}
                </button>
                {errors.karnameh && <span className="mt-1.5 block text-xs text-red-500">{errors.karnameh}</span>}
                <span className="mt-1.5 block text-xs text-text-500">فقط تیم فنی می‌بینه؛ عمومی نمی‌شه.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="mx-auto max-w-xl">
          <Card>
            <CardContent className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">داستان مسیرت (درباره من)</label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={5}
                  placeholder="از کجا شروع کردی، کجا گیر کردی و چطور ردش کردی؟ دانش‌آموزها بیشتر از هر چیزی با همین ارتباط می‌گیرن."
                  className={cn(
                    "w-full rounded-x-md border bg-surface p-3 text-sm leading-[1.8] text-text-900 outline-none focus:border-blue-600",
                    errors.story ? "border-red-500" : "border-border"
                  )}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-red-500">{errors.story}</span>
                  <span className="tnum text-text-500">
                    {toPersianDigits(story.trim().length)} / {toPersianDigits(MIN_STORY_LENGTH)}+
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">سبک مشاوره</label>
                <div className="flex flex-wrap gap-1.5">
                  {MENTOR_STYLES.map((s) => (
                    <Pill key={s} active={style === s} onClick={() => setStyle(s)}>
                      {s}
                    </Pill>
                  ))}
                </div>
                {errors.style && <span className="mt-1.5 block text-xs text-red-500">{errors.style}</span>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">درصد درس‌ها در کنکور خودت</label>
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <Input
                      key={subject}
                      label={subject}
                      inputMode="numeric"
                      placeholder="۰ تا ۱۰۰"
                      value={scores[subject] ?? ""}
                      onChange={(e) => setScores((s) => ({ ...s, [subject]: e.target.value }))}
                    />
                  ))}
                </div>
                {errors.scores && <span className="mt-1.5 block text-xs text-red-500">{errors.scores}</span>}
              </div>

              <Input
                label="ظرفیت دانش‌آموز"
                inputMode="numeric"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                error={errors.capacity}
                helperText="چند دانش‌آموز رو هم‌زمان می‌تونی با کیفیت همراهی کنی؟"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">زمان‌های آزاد برای جلسه</label>
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-1 text-xs">
                    <thead>
                      <tr>
                        <th />
                        {AVAILABILITY_TIMES.map((t) => (
                          <th key={t} className="tnum font-normal text-text-500">
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AVAILABILITY_DAYS.map((day) => (
                        <tr key={day}>
                          <td className="whitespace-nowrap pl-2 text-text-700">{day}</td>
                          {AVAILABILITY_TIMES.map((time) => {
                            const slot = `${day} ${time}`;
                            const on = slots.includes(slot);
                            return (
                              <td key={time}>
                                <button
                                  type="button"
                                  onClick={() => toggleSlot(slot)}
                                  aria-label={slot}
                                  aria-pressed={on}
                                  className={cn(
                                    "h-8 w-full min-w-9 rounded-x-sm border transition-colors",
                                    on ? "border-blue-600 bg-blue-600" : "border-border bg-surface hover:border-blue-300"
                                  )}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {errors.slots && <span className="mt-1.5 block text-xs text-red-500">{errors.slots}</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-x-lg border border-border">
            <MentorProfileView mentor={draftMentor} preview />
          </div>

          <div className="mx-auto mt-5 max-w-xl">
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Percent size={16} className="text-mint-500" />
                  <h2 className="text-sm font-bold text-text-900">شرایط مالی</h2>
                </div>
                <p className="text-sm leading-[1.8] text-text-700">
                  از هر اشتراک دانش‌آموز، فقط{" "}
                  <span className="font-bold text-text-900">{toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪</span> کارمزد
                  پلتفرم کم می‌شه و{" "}
                  <span className="font-bold text-text-900">{toPersianDigits(100 - PLATFORM_COMMISSION_PERCENT)}٪</span> سهم
                  خودته. آموزشگاه‌های سنتی معمولاً {TRADITIONAL_INSTITUTE_COMMISSION} برمی‌دارن.
                </p>
                <div className="space-y-1.5 rounded-x-md bg-surface-2 p-3 text-sm">
                  <Row label="نمونه: اشتراک ماهانه‌ی یک دانش‌آموز" value={formatToman(EXAMPLE_MONTHLY_FEE)} />
                  <Row
                    label={`کارمزد پلتفرم (${toPersianDigits(PLATFORM_COMMISSION_PERCENT)}٪)`}
                    value={`− ${formatToman((EXAMPLE_MONTHLY_FEE * PLATFORM_COMMISSION_PERCENT) / 100)}`}
                  />
                  <Row
                    label="سهم تو"
                    value={formatToman((EXAMPLE_MONTHLY_FEE * (100 - PLATFORM_COMMISSION_PERCENT)) / 100)}
                    strong
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2 pt-1 text-sm text-text-700">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 accent-blue-600"
                  />
                  اطلاعات و کارنامه‌ام واقعی‌ان و با شرایط همکاری و کارمزد موافقم.
                </label>
                {errors.agreed && <span className="block text-xs text-red-500">{errors.agreed}</span>}
                <div className="flex items-center gap-1.5 text-xs text-text-500">
                  <ShieldCheck size={13} /> پروفایل فقط بعد از تأیید تیم فنی منتشر می‌شه.
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="mx-auto mt-5 flex max-w-xl gap-3">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={back}>
            قبلی
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={next}>
          {step === STEPS.length - 1 ? "ارسال برای تأیید تیم فنی" : "بعدی"}
        </Button>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-x-pill border px-3.5 py-2 text-xs font-medium transition-colors",
        active ? "border-blue-600 bg-blue-100 text-text-900" : "border-border bg-surface text-text-700 hover:border-blue-300"
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium text-text-900" : "text-text-500"}>{label}</span>
      <span className={cn("tnum", strong ? "font-bold text-mint-500" : "text-text-700")}>{value}</span>
    </div>
  );
}
