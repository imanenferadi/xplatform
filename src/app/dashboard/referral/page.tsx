"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Copy, Check, UserPlus, Wallet } from "lucide-react";
import { StudentShell } from "@/components/app/StudentShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { REFERRAL_CREDIT, referralProgram } from "@/lib/mock-data";
import { Toman } from "@/components/ui/Toman";
import { useWallet } from "@/lib/wallet-store";
import { toPersianDigits } from "@/lib/utils";

const inviteLink = `https://x-platform.ir/r/${referralProgram.code}`;

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const pendingCount = referralProgram.invited.filter(
    (r) => r.status === "pending_payment",
  ).length;
  const wallet = useWallet();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // link is still visible on screen to copy manually.
    }
  }

  return (
    <StudentShell>
      <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
        <div className="mb-1 flex items-center gap-2">
          <Gift size={18} className="text-blue-600" />
          <h1 className="text-xl font-bold text-text-900">دعوت از دوستان</h1>
        </div>
        <p className="mb-6 text-sm text-text-500">
          هر دوستی که با لینک تو عضو بشه و اولین پرداختش رو انجام بده،{" "}
          <Toman amount={REFERRAL_CREDIT} /> اعتبار می‌ریزه به کیف پولت و خودش
          هم{" "}
          <span className="tnum font-medium text-text-900">
            {toPersianDigits(referralProgram.discountPercent)}٪
          </span>{" "}
          تخفیف ماه اول می‌گیره. اعتبار موقع پرداخت بعدیت خودکار کم می‌شه.
        </p>

        <Card>
          <CardContent>
            <div className="mb-2 text-xs text-text-500">
              لینک دعوت اختصاصی تو
            </div>
            <div className="flex items-center gap-2">
              <div
                dir="ltr"
                className="tnum flex-1 truncate rounded-x-md bg-surface-2 px-3 py-2.5 text-sm text-text-700"
              >
                {inviteLink}
              </div>
              <button
                onClick={copyLink}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-x-md border border-border bg-surface text-text-700 transition-colors hover:bg-surface-2"
                aria-label="کپی لینک"
              >
                {copied ? (
                  <Check size={16} className="text-mint-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            {copied && (
              <div className="mt-2 text-xs text-mint-500">لینک کپی شد!</div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-text-700">
                <Wallet size={16} className="text-blue-600" /> موجودی کیف پول
              </span>
              <span className="text-lg font-bold text-text-900">
                <Toman amount={wallet.balance} />
              </span>
            </div>
            {pendingCount > 0 && (
              <p className="mt-1 text-xs text-text-500">
                + <Toman amount={pendingCount * REFERRAL_CREDIT} /> در انتظار
                اولین پرداخت دوستات
              </p>
            )}
            {(wallet.credits.length > 0 || wallet.spends.length > 0) && (
              <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                {wallet.credits.map((c) => (
                  <li key={c.id} className="flex justify-between text-text-700">
                    <span>
                      {c.label} · {c.date}
                    </span>
                    <span className="text-mint-500">
                      + <Toman amount={c.amount} />
                    </span>
                  </li>
                ))}
                {wallet.spends.map((c) => (
                  <li key={c.id} className="flex justify-between text-text-700">
                    <span>
                      {c.label} · {c.date}
                    </span>
                    <span>
                      − <Toman amount={c.amount} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {wallet.balance > 0 && (
              <Link
                href="/checkout"
                className="mt-3 inline-block text-xs text-blue-600 hover:underline"
              >
                استفاده در خرید یا تمدید بعدی
              </Link>
            )}
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-6 text-sm font-bold text-text-900">
          تاریخچه‌ی دعوت‌ها
        </h2>
        <div className="space-y-2">
          {referralProgram.invited.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <UserPlus size={15} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-900">
                    {r.friendName}
                  </div>
                  <div className="text-xs text-text-500">{r.date}</div>
                </div>
                <Badge tone={r.status === "joined" ? "success" : "warning"}>
                  {r.status === "joined"
                    ? "اعتبار گرفتی"
                    : "در انتظار اولین پرداختش"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
