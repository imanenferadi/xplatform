"use client";

import { useRef, useState } from "react";
import { Mic, Play, Pause, Send, Trash2 } from "lucide-react";
import { useVoiceRecorder, type VoiceClip } from "@/lib/use-voice-recorder";
import { formatClock } from "@/lib/use-countdown";
import { cn } from "@/lib/utils";

const STATUS_MESSAGE = {
  denied: "دسترسی به میکروفون داده نشد — از تنظیمات مرورگر اجازه بده.",
  unsupported: "این مرورگر ضبط صدا رو پشتیبانی نمی‌کنه.",
};

// Sits inside a chat composer (the form must be `relative`). Idle: a mic
// button. Recording: a bar covering the composer with timer, cancel, send.
export function VoiceRecordButton({
  onRecorded,
}: {
  onRecorded: (clip: VoiceClip) => void;
}) {
  const { status, elapsed, start, stop, cancel } = useVoiceRecorder(onRecorded);

  if (status === "recording") {
    return (
      <div className="absolute inset-0 z-10 flex items-center gap-3 rounded-x-md bg-surface px-3">
        <button
          type="button"
          onClick={cancel}
          className="rounded-x-sm p-2 text-text-500 hover:bg-surface-2 hover:text-red-500"
          aria-label="لغو ضبط"
        >
          <Trash2 size={18} />
        </button>
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
        <span className="tnum text-sm text-text-900">
          {formatClock(elapsed)}
        </span>
        <span className="flex-1 text-xs text-text-500">در حال ضبط...</span>
        <button
          type="button"
          onClick={stop}
          className="shrink-0 rounded-x-sm bg-navy-900 p-2 text-white"
          aria-label="ارسال پیام صوتی"
        >
          <Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="shrink-0 rounded-x-sm p-2 text-text-500 hover:bg-surface-2"
        aria-label="ضبط پیام صوتی"
      >
        <Mic size={18} />
      </button>
      {(status === "denied" || status === "unsupported") && (
        <p className="absolute -top-7 right-0 text-xs text-red-500">
          {STATUS_MESSAGE[status]}
        </p>
      )}
    </>
  );
}

export function VoiceBubble({
  clip,
  mine,
}: {
  clip: VoiceClip;
  mine: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="flex min-w-44 items-center gap-2.5">
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          mine ? "bg-white/15 text-white" : "bg-blue-100 text-blue-600",
        )}
        aria-label={playing ? "توقف" : "پخش پیام صوتی"}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div
        className={cn(
          "h-1 flex-1 overflow-hidden rounded-x-pill",
          mine ? "bg-white/20" : "bg-border",
        )}
      >
        <div
          className={cn(
            "h-full rounded-x-pill",
            mine ? "bg-white" : "bg-blue-600",
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span
        className={cn("tnum text-xs", mine ? "text-white/70" : "text-text-500")}
      >
        {formatClock(clip.seconds)}
      </span>
      <audio
        ref={audioRef}
        src={clip.url}
        preload="metadata"
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          // MediaRecorder webm files often report duration=Infinity; fall back
          // to the length we measured while recording.
          const duration =
            Number.isFinite(a.duration) && a.duration > 0
              ? a.duration
              : clip.seconds;
          setProgress(Math.min(1, a.currentTime / duration));
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
}
