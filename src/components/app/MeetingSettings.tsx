"use client";

import { useState } from "react";
import { Video, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MEETING_PROVIDERS, type MeetingProvider } from "@/lib/mock-data";
import { saveMeetingSetup, useMeetingSetup } from "@/lib/meeting-store";
import { cn, toLatinDigits } from "@/lib/utils";

const PROVIDERS = Object.keys(MEETING_PROVIDERS) as MeetingProvider[];

// Where this mentor's sessions actually happen. We link out instead of
// hosting video ourselves; students open this link from /session/[id].
export function MeetingSettings() {
  const saved = useMeetingSetup();
  const [done, setDone] = useState(false);
  // Remount when the stored value arrives/changes so the fields start from it.
  return (
    <MeetingForm
      key={`${saved.provider}|${saved.url}|${saved.fallbackPhone}`}
      saved={saved}
      done={done}
      setDone={setDone}
    />
  );
}

function MeetingForm({
  saved,
  done,
  setDone,
}: {
  saved: ReturnType<typeof useMeetingSetup>;
  done: boolean;
  setDone: (v: boolean) => void;
}) {
  const [provider, setProvider] = useState(saved.provider);
  const [url, setUrl] = useState(saved.url);
  const [phone, setPhone] = useState(saved.fallbackPhone);
  const [errors, setErrors] = useState<{ url?: string; phone?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanUrl = url.trim();
    const digits = toLatinDigits(phone).replace(/\D/g, "");
    const next: typeof errors = {};
    if (!MEETING_PROVIDERS[provider].pattern.test(cleanUrl))
      next.url = `لینک معتبر ${MEETING_PROVIDERS[provider].label} نیست — شکلش باید این‌طوری باشه: ${MEETING_PROVIDERS[provider].example}`;
    if (!/^09\d{9}$/.test(digits))
      next.phone = "شماره‌ی موبایل ۱۱ رقمی که با ۰۹ شروع بشه.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    saveMeetingSetup({ provider, url: cleanUrl, fallbackPhone: phone.trim() });
    setDone(true);
  }

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="mb-1 flex items-center gap-2">
          <Video size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-text-900">لینک جلسه‌هات</h2>
        </div>
        <p className="mb-4 text-xs leading-[1.8] text-text-500">
          جلسه‌ها روی پلتفرمی برگزار می‌شن که خودت باهاش راحتی. دانش‌آموز موقع
          جلسه با یه دکمه وارد همین لینک می‌شه. اسکای‌روم موقع قطعی اینترنت
          بین‌الملل هم کار می‌کنه.
        </p>

        <form onSubmit={submit} noValidate className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setProvider(p);
                  setErrors((er) => ({ ...er, url: undefined }));
                  setDone(false);
                }}
                className={cn(
                  "rounded-x-md border-2 px-2 py-2 text-sm font-medium transition-colors",
                  provider === p
                    ? "border-blue-600 bg-blue-100 text-text-900"
                    : "border-border bg-surface text-text-700",
                )}
              >
                {MEETING_PROVIDERS[p].label}
              </button>
            ))}
          </div>

          <div>
            <label
              htmlFor="meeting-url"
              className="mb-1 block text-xs text-text-700"
            >
              لینک ثابت اتاقت
            </label>
            <input
              id="meeting-url"
              dir="ltr"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrors((er) => ({ ...er, url: undefined }));
                setDone(false);
              }}
              placeholder={MEETING_PROVIDERS[provider].example}
              className="h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-left text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            {errors.url && (
              <p className="mt-1 text-xs text-red-500">{errors.url}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="fallback-phone"
              className="mb-1 flex items-center gap-1 text-xs text-text-700"
            >
              <Phone size={12} /> شماره‌ی جایگزین (اگه لینک باز نشد، با این
              شماره تماس می‌گیری)
            </label>
            <input
              id="fallback-phone"
              dir="ltr"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((er) => ({ ...er, phone: undefined }));
                setDone(false);
              }}
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
              className="tnum h-10 w-full rounded-x-sm border border-border bg-surface px-3 text-left text-sm text-text-900 outline-none placeholder:text-text-500 focus:border-blue-600"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="md">
              ذخیره
            </Button>
            {done && <span className="text-sm text-mint-500">ذخیره شد ✓</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
