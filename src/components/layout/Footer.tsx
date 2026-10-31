"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  BadgePercent,
  Car,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Lock,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  FOOTER_SERVICE_LINKS,
  FOOTER_LEGAL_LINKS,
  MAIN_NAV_ITEMS,
  CONTACT_DETAILS,
  TRUST_BADGES,
} from "@/lib/constants/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Do not render customer footer on admin portal pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const getIcon = (name: string) => {
    switch (name) {
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-brand-orange" aria-hidden="true" />;
      case "Clock":
        return <Clock className="w-5 h-5 text-brand-orange" aria-hidden="true" />;
      case "BadgePercent":
        return <BadgePercent className="w-5 h-5 text-brand-orange" aria-hidden="true" />;
      case "Car":
        return <Car className="w-5 h-5 text-brand-orange" aria-hidden="true" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-brand-orange" aria-hidden="true" />;
    }
  };

  return (
    <footer className="text-white relative z-10" role="contentinfo">
      {/* 1. DISTINCT TRUST & GUARANTEES DECK (Layer 1: Deep Navy Slate) */}
      <section
        aria-label="Key2Drive Guarantees"
        className="bg-[#0B1522] border-t border-white/10 py-12 sm:py-14 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.title}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#132236]/90 border border-white/10 shadow-lg hover:border-brand-orange/40 hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                  {getIcon(badge.iconName)}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-heading font-bold text-white text-base leading-snug group-hover:text-brand-orange transition-colors">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Illuminated Gold/Amber Divider Hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent" />

      {/* 2. EXECUTIVE MIDNIGHT FOOTER (Layer 2: Obsidian Midnight Navy) */}
      <div className="bg-[#070D16] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand & Value Proposition (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-5">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-orange rounded-lg"
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
                <span className="font-heading font-black text-2xl tracking-tight text-white">
                  Key<span className="text-brand-orange">2</span>Drive
                </span>
              </Link>

              <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-sans">
                Key2Drive is a premier chauffeur and acting driver platform delivering vetted, professional drivers directly to your vehicle for hourly errands, outstation adventures, corporate duty, and airport transfers.
              </p>

              {/* Direct WhatsApp Trigger Button */}
              <div className="pt-1">
                <a
                  href={CONTACT_DETAILS.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all duration-150 active:scale-[0.97] shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Column 2: Chauffeur Services (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                <span>Chauffeur Services</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                {FOOTER_SERVICE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Quick Navigation (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                <span>Company</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                {MAIN_NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/book"
                    className="text-brand-orange hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                  >
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    <span>Book a Chauffeur</span>
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

              {/* Dignified Client Review Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>Provisional Contact Coordinates</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Bengaluru operations desk pending final client commercial verification.
                </p>
              </div>

              <address className="not-italic space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                  </div>
                  <div>
                    <a
                      href={`tel:${CONTACT_DETAILS.phoneTel}`}
                      className="hover:text-brand-orange transition-colors font-bold text-white text-sm block"
                    >
                      {CONTACT_DETAILS.phoneDisplay}
                    </a>
                    <span className="text-[10px] text-slate-400 font-sans block">
                      24/7 Dispatch Desk
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
                      className="hover:text-brand-orange transition-colors font-medium text-slate-200 text-xs block"
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
                  className="hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                >
                  {legal.label}
                </Link>
              ))}

              {/* Discreet Admin Portal Link */}
              <Link
                href="/admin/login"
                className="flex items-center gap-1 text-slate-500 hover:text-brand-orange transition-colors pl-3 border-l border-white/15 focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
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
