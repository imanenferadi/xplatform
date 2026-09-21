"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) return;
    setStep("otp");
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    // Mock auth — any 4-digit code works.
    router.push("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-x-xl border border-border bg-surface p-6 shadow-x-sm">
          {step === "phone" ? (
            <>
              <h1 className="text-xl font-bold text-text-900">خوش اومدی!</h1>
              <p className="mt-1 text-sm text-text-500">
                برای ادامه، شماره موبایلت رو وارد کن.
              </p>
              <form onSubmit={submitPhone} className="mt-6 space-y-4">
                <Input
                  label="شماره موبایل"
                  type="tel"
                  inputMode="numeric"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  className="text-left"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
                <Button type="submit" size="lg" className="w-full">
                  دریافت کد
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-text-900">کد رو وارد کن</h1>
              <p className="mt-1 text-sm text-text-500">
                کد ۴ رقمی به شماره {phone || "شما"} پیامک شد.
              </p>
              <form onSubmit={submitOtp} className="mt-6 space-y-4">
                <Input
                  label="کد تأیید"
                  inputMode="numeric"
                  placeholder="----"
                  dir="ltr"
                  className="text-center tracking-[0.5em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={4}
                  autoFocus
                />
                <Button type="submit" size="lg" className="w-full">
                  ورود
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full text-center text-sm text-text-500 hover:text-text-900"
                >
                  تغییر شماره موبایل
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-500">
          با ورود، <Link href="#" className="text-blue-600 hover:underline">قوانین و حریم خصوصی</Link> را می‌پذیری.
        </p>
      </div>
    </div>
  );
}
