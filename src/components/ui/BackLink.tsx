"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** «بازگشت» to wherever you came from on this site; a visitor arriving from outside goes to the home page. */
export function BackLink() {
  return (
    <Link
      href="/"
      onClick={(e) => {
        if (
          document.referrer.startsWith(location.origin) &&
          history.length > 1
        ) {
          e.preventDefault();
          history.back();
        }
      }}
      className="flex items-center gap-1 text-xs text-text-500 hover:text-text-900"
    >
      بازگشت
      <ArrowRight size={13} />
    </Link>
  );
}
