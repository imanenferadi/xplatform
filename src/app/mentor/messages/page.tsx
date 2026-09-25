import Link from "next/link";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { BroadcastComposer } from "@/components/app/BroadcastComposer";
import { mentorStudents, mentorMessageThreads } from "@/lib/mock-data";

export default function MentorMessagesPage() {
  return (
    <MentorShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
        <h1 className="mb-5 text-lg font-bold text-text-900">گفتگوها</h1>

        <BroadcastComposer />

        <div className="space-y-2">
          {mentorStudents.map((s) => {
            const thread = mentorMessageThreads[s.id] ?? [];
            const last = thread[thread.length - 1];
            return (
              <Link key={s.id} href={`/mentor/messages/${s.id}`}>
                <Card interactive>
                  <CardContent className="flex items-center gap-3 py-3.5">
                    <Avatar name={s.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-text-900">{s.name}</span>
                        {last && <span className="shrink-0 text-xs text-text-500">{last.time}</span>}
                      </div>
                      <p className="truncate text-xs text-text-500">
                        {last ? (last.from === "mentor" ? "شما: " : "") + last.text : "هنوز پیامی رد و بدل نشده"}
                      </p>
                    </div>
                    {s.unreadMessages > 0 && (
                      <span className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                        {s.unreadMessages}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MentorShell>
  );
}
