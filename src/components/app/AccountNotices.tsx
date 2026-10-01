"use client";

import { Bell, Check, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import {
  answerParentLink,
  markNoticeSeen,
  useNotices,
  useParentLink,
} from "@/lib/user-edits-store";

/**
 * On the student's profile: what support changed on their account (with the
 * reason), and any parent link waiting for their yes/no. Nothing about the
 * account changes silently.
 */
export function AccountNotices({
  userId,
  studentName,
}: {
  userId: string;
  studentName: string;
}) {
  const notices = useNotices(userId).filter((n) => !n.seen);
  const parent = useParentLink(userId);
  const pendingParent = parent?.status === "pending" ? parent : null;
  if (notices.length === 0 && !pendingParent) return null;

  return (
    <div className="mb-4 space-y-3">
      {pendingParent && (
        <div className="rounded-x-lg border border-blue-600/40 bg-blue-100 p-4 text-sm">
          <div className="flex items-start gap-2">
            <UsersIcon size={17} className="mt-0.5 shrink-0 text-blue-600" />
            <div className="flex-1 leading-[1.8] text-text-700">
              پشتیبانی می‌خواد{" "}
              <span className="font-medium text-text-900">
                {pendingParent.parentName}
              </span>{" "}
              (<span dir="ltr">{pendingParent.parentPhone}</span>) رو به‌عنوان
              والدت به حسابت وصل کنه. بعد از تأیید، فقط چیزهایی رو می‌بینه که در
              «والدینم چی ببینن» روشن کردی — گفتگوهات با مشاور هرگز.
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="md"
              onClick={() => {
                answerParentLink(userId, true, studentName);
                toast("والد وصل شد");
              }}
            >
              تأیید
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                answerParentLink(userId, false, studentName);
                toast("رد شد — والد وصل نشد");
              }}
            >
              این والد من نیست
            </Button>
          </div>
        </div>
      )}
      {notices.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-2 rounded-x-lg border border-orange-500/40 bg-orange-500/10 p-3 text-sm"
        >
          <Bell size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="leading-[1.8] text-text-700">{n.text}</p>
            <p className="text-xs text-text-500">{n.at}</p>
          </div>
          <button
            type="button"
            onClick={() => markNoticeSeen(n.id)}
            className="flex shrink-0 items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Check size={12} /> دیدم
          </button>
        </div>
      ))}
    </div>
  );
}
