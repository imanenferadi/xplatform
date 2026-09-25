"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPersianDigits } from "./utils";

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return toPersianDigits(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

// Second-by-second countdown shared by the focus timer page and focus mode.
// `onFinish` fires once when it reaches zero while running.
export function useCountdown(initialSeconds: number, onFinish?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const remainingRef = useRef(initialSeconds);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (remainingRef.current <= 0) return;
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);
      if (remainingRef.current === 0) {
        setRunning(false);
        onFinishRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = useCallback((seconds: number) => {
    setRunning(false);
    remainingRef.current = seconds;
    setRemaining(seconds);
  }, []);

  return { remaining, running, setRunning, reset };
}
