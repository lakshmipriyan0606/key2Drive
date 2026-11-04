"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Phone, MessageSquare } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import MobileNav from "@/components/layout/MobileNav";
import ButtonMotion from "@/components/ui/ButtonMotion";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const handleToggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const isActiveLink = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  // Do not render customer header on admin portal pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full py-3.5 transition-[background-color,border-color,box-shadow] duration-200 ${
          isScrolled
            ? "bg-brand-navy/95 backdrop-blur-md shadow-md border-b border-white/10"
            : "bg-brand-navy border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <BrandLogo variant="light" size="md" href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
              {navLinks.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-150 py-1 ${
                      active ? "text-brand-orange" : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: 3-Way Reach (WhatsApp, Call, Book) */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 text-xs font-semibold transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                title="Chat on WhatsApp (Instant Greeting)"
                aria-label="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-brand-orange hover:bg-amber-500/25 text-xs font-bold transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy tabular-nums"
                title="Call Now for Instant Driver Dispatch"
                aria-label={`Call Key2Drive dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                <span>Call Now: <span className="text-white font-semibold" translate="no">{CONTACT_DETAILS.phoneDisplay}</span></span>
              </a>

              <Link href="/book">
                <ButtonMotion
                  variant="accent"
                  size="sm"
                  className="!px-5 !py-2.5 !rounded-full shadow-md font-bold text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />}
                >
                  Book a Driver
                </ButtonMotion>
              </Link>
            </div>

            {/* Mobile Actions: WhatsApp, Call, Book & Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[40px] min-h-[40px] rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="WhatsApp Dispatch"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="px-2.5 py-1.5 min-h-[40px] rounded-xl bg-amber-500/15 text-brand-orange border border-amber-500/30 flex items-center gap-1 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums"
                aria-label={`Call dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
                title="Call Now"
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                <span>Call Now</span>
              </a>

              <Link href="/book">
                <ButtonMotion
                  variant="accent"
                  size="sm"
                  className="!px-3 !py-1.5 !rounded-full text-xs font-bold min-h-[40px]"
                >
                  Book
                </ButtonMotion>
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={handleToggleMobileNav}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-white hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange flex items-center justify-center transition-colors"
                aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileNavOpen}
              >
                {isMobileNavOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={handleCloseMobileNav}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
