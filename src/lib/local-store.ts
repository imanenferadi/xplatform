"use client";

import { useSyncExternalStore } from "react";
import { pushLocal, registerStore } from "./server-sync";

// Persistence: a JSON value in localStorage exposed as a React external store.
// Server render and hydration see `fallback`; the client then swaps to the
// stored value. localStorage is the working copy; ./server-sync mirrors it to
// the server (/api/state) so the data is shared and survives a cleared browser.
export const VIEW_AS_TAB_KEY = "x-viewas-tab"; // sessionStorage: this tab is a support view
export const VIEW_AS_STORE_KEY = "x-viewas";
export const READ_ONLY_EVENT = "x-readonly-blocked";
const WRITABLE_WHILE_VIEWING = new Set([VIEW_AS_STORE_KEY, "x-admin-log"]);

/** True in a tab opened by support to view a user's account (read-only). */
export function isReadOnlyTab(): boolean {
  try {
    return Boolean(sessionStorage.getItem(VIEW_AS_TAB_KEY));
  } catch {
    return false;
  }
}

export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T = fallback;

  // A value that arrived from the server: store it as-is (no push back) and re-render.
  registerStore(key, (raw) => {
    try {
      if (localStorage.getItem(key) === raw) return;
      localStorage.setItem(key, raw);
    } catch {
      return;
    }
    listeners.forEach((l) => l());
  });

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
    // A support «view as user» tab is read-only: nothing it does is saved,
    // except the view session's own bookkeeping and the audit log.
    if (!WRITABLE_WHILE_VIEWING.has(key) && isReadOnlyTab()) {
      window.dispatchEvent(new CustomEvent(READ_ONLY_EVENT));
      return;
    }
    const raw = JSON.stringify(value);
    try {
      localStorage.setItem(key, raw);
    } catch {
      // Storage blocked — keep the in-memory copy so this tab stays consistent.
      cachedRaw = null;
      cached = value;
    }
    listeners.forEach((l) => l());
    pushLocal(key, raw);
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

const noop = () => () => {};

/** False during server render and hydration, true once browser storage is readable. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
