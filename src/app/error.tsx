"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Phone } from "lucide-react";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for internal diagnostics without exposing raw stack to search crawlers
    console.error("Key2Drive Client Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-brand-warm-bg">
      <div className="max-w-md w-full bg-white rounded-3xl border border-brand-border p-8 sm:p-10 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-brand-orange flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertTriangle className="w-8 h-8 text-brand-orange" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider">
            Notice
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
            We encountered a temporary issue while loading this view. You can reload the page or reach our dispatch helpline directly.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-deep text-white font-bold text-sm shadow-sm transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <RefreshCw className="w-4 h-4 mr-1" aria-hidden="true" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-black/5 text-primary-text border border-brand-border font-bold text-sm transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <Home className="w-4 h-4 mr-1 text-secondary-text" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-brand-border/60">
          <a
            href={`tel:${CONTACT_DETAILS.phoneTel}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call Driver Dispatch: {CONTACT_DETAILS.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

