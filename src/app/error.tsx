"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";

// Shown when a page crashes. The rest of the site keeps working; `reset`
// re-renders just this segment.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15">
        <TriangleAlert size={26} className="text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-text-900">یه مشکلی پیش اومد</h1>
      <p className="mt-2 max-w-sm text-text-500">
        مشکل از تو نبود. دوباره امتحان کن؛ اگه درست نشد، به پشتیبانی خبر بده تا
        بررسی کنیم.
      </p>
      {error.digest && (
        <p className="tnum mt-2 text-xs text-text-500">
          کد خطا: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          دوباره امتحان کن
        </Button>
        <Link
          href="/support"
          className={buttonVariants({ size: "lg", variant: "secondary" })}
        >
          پیام به پشتیبانی
        </Link>
      </div>
    </main>
  );
}
