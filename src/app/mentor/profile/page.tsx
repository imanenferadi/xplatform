"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { MentorShell } from "@/components/app/MentorShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mentors } from "@/lib/mock-data";
import { CapacitySettings } from "@/components/app/CapacitySettings";

export default function MentorProfilePage() {
  const me = mentors[0]; // سارا محمدی — the logged-in mentor for this demo
  const [form, setForm] = useState({
    name: me.name,
    rank: me.rank,
    school: me.school,
    major: me.major,
    style: me.style,
    story: me.story,
  });
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Mock save — in the real product this is a PATCH to the mentor's
    // public profile, the same one students see in /mentors/[id].
    setSaved(true);
  }

  return (
    <MentorShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
        <div className="mb-5 flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <h1 className="text-lg font-bold text-text-900">پروفایل من</h1>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <Avatar name={form.name} size="xl" />
          <div>
            <div className="font-bold text-text-900">{form.name}</div>
            <div className="text-xs text-text-500">این پروفایل همونیه که دانش‌آموزها موقع تطبیق می‌بینن</div>
          </div>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input label="نام و نام خانوادگی" value={form.name} onChange={(e) => update("name", e.target.value)} />
              <Input label="رتبه‌ی کنکور" value={form.rank} onChange={(e) => update("rank", e.target.value)} />
              <Input label="دانشگاه" value={form.school} onChange={(e) => update("school", e.target.value)} />
              <Input label="رشته‌ی دانشگاهی" value={form.major} onChange={(e) => update("major", e.target.value)} />
              <Input label="سبک مشاوره" value={form.style} onChange={(e) => update("style", e.target.value)} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-700">
                  روایت من (چیزی که دانش‌آموزها اول می‌خونن)
                </label>
                <textarea
                  value={form.story}
                  onChange={(e) => update("story", e.target.value)}
                  rows={4}
                  className="w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" size="md">
                  <Save size={15} /> ذخیره‌ی تغییرات
                </Button>
                {saved && <span className="text-sm text-mint-500">ذخیره شد ✓</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <CapacitySettings mentor={me} />
      </div>
    </MentorShell>
  );
}
