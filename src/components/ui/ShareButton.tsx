"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";

/** Native share sheet where the device has one (phones), otherwise copies the link. */
export function ShareButton({
  title,
  text,
  label = "اشتراک‌گذاری",
}: {
  title: string;
  text?: string;
  label?: string;
}) {
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("لینک کپی شد");
    } catch (e) {
      // Closing the share sheet throws AbortError — not a failure.
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast("کپی نشد — لینک رو از نوار آدرس بردار");
    }
  }
  return (
    <Button type="button" size="md" variant="secondary" onClick={share}>
      <Share2 size={15} /> {label}
    </Button>
  );
}
