"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Lock,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import {
  FOOTER_SERVICE_LINKS,
  FOOTER_LEGAL_LINKS,
  MAIN_NAV_ITEMS,
  CONTACT_DETAILS,
} from "@/lib/constants/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Do not render customer footer on admin portal pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="text-white relative z-10" role="contentinfo">
      {/* EXECUTIVE MIDNIGHT FOOTER */}
      <div className="bg-[#070D16] border-t border-white/10 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand & Value Proposition (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-5">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-lg"
                aria-label="Key2Drive Home"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-white shadow-inner">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2L4 5V11C4 16.5 7.5 21.3 12 22.5C16.5 21.3 20 16.5 20 11V5L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="3" stroke="#F28C00" strokeWidth="2" />
                    <path d="M12 13V17" stroke="#F28C00" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 15H14" stroke="#F28C00" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-heading font-black text-2xl tracking-tight text-white" translate="no">
                  Key<span className="text-brand-orange">2</span>Drive
                </span>
              </Link>

              <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-sans">
                Key2Drive is a premier acting driver service platform delivering verified, professional drivers directly to your vehicle for city traffic, outstation trips, family duties, and airport transfers.
              </p>

              {/* Direct Reach Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href={`tel:${CONTACT_DETAILS.phoneTel}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  title="Call Now for Instant Dispatch"
                  aria-label={`Call dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Call Now</span>
                </a>

                <a
                  href={CONTACT_DETAILS.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  title="WhatsApp Booking with Greeting"
                  aria-label="WhatsApp Booking with greeting"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Column 2: Driver Services (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
                <span>Driver Services</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                {FOOTER_SERVICE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-[color,transform] duration-150 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Quick Navigation (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
                <span>Company</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                {MAIN_NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-[color,transform] duration-150 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/book"
                    className="text-brand-orange hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                  >
                    <Sparkles className="w-3 h-3 text-brand-orange" aria-hidden="true" />
                    <span>Book a Driver</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Direct Inquiries (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                <span>Direct Inquiries</span>
              </h4>

              <address className="not-italic space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                  </div>
                  <div>
                    <a
                      href={`tel:${CONTACT_DETAILS.phoneTel}`}
                      className="hover:text-brand-orange transition-colors font-extrabold text-white text-sm block tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                      title="Tap to Call Now"
                    >
                      <span className="text-brand-orange font-bold mr-1.5">Call Now:</span>
                      <span translate="no">{CONTACT_DETAILS.phoneDisplay}</span>
                    </a>
                    <span className="text-[10px] text-brand-orange font-sans block">
                      Click to Call • 24/7 Dispatch Desk
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                  </div>
                  <div>
                    <a
                      href={`mailto:${CONTACT_DETAILS.emailMailto}`}
                      className="hover:text-brand-orange transition-colors font-medium text-slate-200 text-xs block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                    >
                      {CONTACT_DETAILS.emailDisplay}
                    </a>
                    <span className="text-[10px] text-slate-400 font-sans block">
                      Commercial & Bookings
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-slate-300 text-xs block leading-relaxed">
                      {CONTACT_DETAILS.addressDisplay}
                    </span>
                  </div>
                </div>
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SUB-FOOTER LEGAL BAR (Layer 3: Deepest Obsidian Black) */}
      <div className="border-t border-white/10 bg-[#04080F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © {currentYear} Key2Drive Mobility Solutions Pvt. Ltd. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {FOOTER_LEGAL_LINKS.map((legal) => (
                <Link
                  key={legal.label}
                  href={legal.href}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                >
                  {legal.label}
                </Link>
              ))}

              {/* Discreet Admin Portal Link */}
              <Link
                href="/admin/login"
                className="flex items-center gap-1 text-slate-500 hover:text-brand-orange transition-colors pl-3 border-l border-white/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                aria-label="Admin Portal Login"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
