"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, X } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";

export default function FloatingContactBar() {
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Do not render floating contact bar on admin portal pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (isDismissed) {
    // Minimized discreet launcher pill
    return (
      <aside aria-label="Re-open Contact Options" className="fixed bottom-5 right-5 z-40 touch-manipulation">
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-full bg-brand-navy/95 hover:bg-brand-navy text-white text-xs font-bold shadow-xl border border-white/15 backdrop-blur-md transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          title="Open Instant Contact Options"
          aria-label="Open Instant Contact Options"
        >
          <Phone className="w-3.5 h-3.5 text-brand-orange animate-pulse" aria-hidden="true" />
          <span>Need Help?</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Instant Contact Options"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-[box-shadow] hover:shadow-[0_12px_36px_rgb(0,0,0,0.18)] touch-manipulation"
    >
      {/* 1. Direct Call Action */}
      <a
        href={`tel:${CONTACT_DETAILS.phoneTel}`}
        className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs whitespace-nowrap shadow-xs transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums"
        title={`Call Key2Drive: ${CONTACT_DETAILS.phoneDisplay}`}
        aria-label={`Call Key2Drive dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
      >
        <Phone className="w-3.5 h-3.5 fill-current text-slate-950 shrink-0" aria-hidden="true" />
        <span>Call Now</span>
      </a>

      {/* 2. WhatsApp Click-to-Chat with Greeting */}
      <a
        href={CONTACT_DETAILS.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs whitespace-nowrap shadow-xs transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        title="Chat on WhatsApp with Pre-filled Greeting"
        aria-label="WhatsApp Booking with pre-filled greeting"
      >
        <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
        <span>WhatsApp</span>
      </a>

      {/* 3. Subtle Dismiss Button */}
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="w-8 h-8 rounded-full text-secondary-text hover:text-brand-navy hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0 ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        title="Dismiss"
        aria-label="Dismiss contact options"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </aside>
  );
}
