"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SupportCenter } from "@/components/app/SupportCenter";

export default function ParentSupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-8">
        <Logo />
        <Link href="/parent" className="flex items-center gap-1 text-xs text-text-500 hover:text-text-900">
          <ArrowRight size={13} /> پنل والد
        </Link>
      </div>
      <SupportCenter requester={{ name: "والد ایمان", role: "والد" }} />
    </div>
  );
}
