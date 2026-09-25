"use client";

import { useSyncExternalStore } from "react";

// Demo-only persistence: a JSON value in localStorage exposed as a React
// external store. Server render and hydration see `fallback`; the client
// then swaps to the stored value. Replace with API calls once there's a
// backend.
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T = fallback;

  function get(): T {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return cached;
    }
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cached = fallback;
    }
    return cached;
  }

  function set(value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage blocked — keep the in-memory copy so this tab stays consistent.
      cachedRaw = null;
      cached = value;
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, useValue };
}
