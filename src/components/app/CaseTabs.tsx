"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type Tab = { key: string; label: string; content: React.ReactNode };

function subscribe(l: () => void) {
  window.addEventListener("hashchange", l);
  return () => window.removeEventListener("hashchange", l);
}
const getHash = () => window.location.hash.slice(1);

/** Tabs driven by the URL hash, so a link like «…#plan» opens that tab. */
export function CaseTabs({
  tabs,
  label = "بخش‌های پرونده",
}: {
  tabs: Tab[];
  label?: string;
}) {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  const active = tabs.find((t) => t.key === hash) ?? tabs[0];

  function select(key: string) {
    // replaceState doesn't fire hashchange, so notify the store ourselves.
    history.replaceState(null, "", `#${key}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  return (
    <div className="mt-4">
      <div
        role="tablist"
        aria-label={label}
        className="sticky top-14 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 md:top-0"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={t === active}
            aria-controls={`panel-${t.key}`}
            onClick={() => select(t.key)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              t === active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-text-500 hover:text-text-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active.key}`}
        aria-labelledby={`tab-${active.key}`}
      >
        {active.content}
      </div>
    </div>
  );
}
