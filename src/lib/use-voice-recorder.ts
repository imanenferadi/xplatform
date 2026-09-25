"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceClip = { url: string; seconds: number };
export type RecorderStatus = "idle" | "recording" | "denied" | "unsupported";

const MAX_SECONDS = 120;

// Records a voice note with the browser's MediaRecorder. The clip stays
// local (a blob: URL) — there's no upload until a backend exists.
export function useVoiceRecorder(onRecorded: (clip: VoiceClip) => void) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const cancelledRef = useRef(false);
  const onRecordedRef = useRef(onRecorded);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  });

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= MAX_SECONDS) recorderRef.current?.stop();
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("denied");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    elapsedRef.current = 0;
    cancelledRef.current = false;

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setStatus("idle");
      if (cancelledRef.current || chunksRef.current.length === 0) return;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      onRecordedRef.current({ url: URL.createObjectURL(blob), seconds: Math.max(1, elapsedRef.current) });
    };
    recorderRef.current = recorder;
    recorder.start();
    setElapsed(0);
    setStatus("recording");
  }

  function stop() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function cancel() {
    cancelledRef.current = true;
    stop();
  }

  return { status, elapsed, start, stop, cancel };
}
