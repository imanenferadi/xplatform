"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./Button";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  window.addEventListener("x-theme-change", callback);
  return () => window.removeEventListener("x-theme-change", callback);
}

function getSnapshot(): Theme {
  const stored = localStorage.getItem("x-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// During SSR / before hydration we have no access to localStorage or the
// media query, so we fall back to "light" — this matches the server-rendered
// markup exactly, and useSyncExternalStore swaps to the real value right
// after hydration commits (no manual effect, no mismatch warning).
function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("x-theme", next);
    window.dispatchEvent(new Event("x-theme-change"));
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={
        theme === "light" ? "فعال‌سازی حالت تاریک" : "فعال‌سازی حالت روشن"
      }
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  );
}
