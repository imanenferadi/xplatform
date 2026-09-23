"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Star, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { mentors } from "@/lib/mock-data";
import { cn, toPersianDigits } from "@/lib/utils";

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return toPersianDigits(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

export default function SessionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mentor = mentors.find((m) => m.id === id);
  const router = useRouter();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (ended) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [ended]);

  if (!mentor) notFound();

  function toggleMic() {
    setMicOn((on) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !on));
      return !on;
    });
  }

  function toggleCam() {
    setCamOn((on) => {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !on));
      return !on;
    });
  }

  function endCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setEnded(true);
  }

  function submitFeedback() {
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  if (ended) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        {submitted ? (
          <>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500/15">
              <Check size={28} className="text-mint-500" />
            </div>
            <h1 className="text-xl font-bold text-text-900">ممنون بابت نظرت!</h1>
            <p className="mt-2 text-text-500">داری برمی‌گردی به داشبورد...</p>
          </>
        ) : (
          <div className="w-full max-w-sm">
            <h1 className="text-xl font-bold text-text-900">جلسه با {mentor.name} تموم شد</h1>
            <p className="mt-1 text-sm text-text-500">به این جلسه چند ستاره می‌دی؟</p>
            <div className="mt-5 flex justify-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} ستاره`}>
                  <Star
                    size={32}
                    className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-border"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="یک جمله درباره‌ی این جلسه بنویس (اختیاری)"
              className="mt-4 w-full rounded-x-md border border-border bg-surface p-3 text-sm text-text-900 outline-none focus:border-blue-600"
            />
            <Button size="lg" className="mt-4 w-full" disabled={rating === 0} onClick={submitFeedback}>
              ثبت نظر
            </Button>
            <button
              className="mt-3 text-xs text-text-500 hover:text-text-900"
              onClick={() => router.push("/dashboard")}
            >
              رد شدن
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-900 px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between text-white">
          <span className="text-sm font-medium">جلسه با {mentor.name}</span>
          <span className="tnum flex items-center gap-1.5 rounded-x-pill bg-white/10 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
            {formatDuration(elapsed)}
          </span>
        </div>

        {/* Mentor tile — the other side isn't actually connected in this demo */}
        <div className="relative flex flex-1 items-center justify-center rounded-x-lg bg-white/5">
          <div className="flex flex-col items-center gap-3">
            <Avatar name={mentor.name} size="xl" />
            <span className="text-white/70 text-sm">{mentor.name}</span>
            <span className="text-white/40 text-xs">نمونه‌ی نمایشی — این دمو تماس دوطرفه‌ی واقعی برقرار نمی‌کند</span>
          </div>

          {/* Self preview tile */}
          <div className="absolute bottom-3 left-3 h-28 w-20 overflow-hidden rounded-x-md bg-black/60 sm:h-36 sm:w-28">
            {camOn && !cameraError ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <VideoOff size={18} className="text-white/50" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={toggleMic}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              micOn ? "bg-white/10 text-white" : "bg-red-500 text-white"
            )}
            aria-label="میکروفون"
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button
            onClick={toggleCam}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              camOn ? "bg-white/10 text-white" : "bg-red-500 text-white"
            )}
            aria-label="دوربین"
          >
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button
            onClick={endCall}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white"
            aria-label="پایان تماس"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
