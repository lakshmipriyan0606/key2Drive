"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import BrandLogo from "@/components/ui/BrandLogo";
import MobileNav from "@/components/layout/MobileNav";
import ButtonMotion from "@/components/ui/ButtonMotion";
import { CONTACT_DETAILS, MAIN_NAV_ITEMS } from "@/lib/constants/navigation";

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

  const navLinks = MAIN_NAV_ITEMS;

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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <div className="shrink-0">
              <BrandLogo variant="light" size="md" href="/" />
            </div>

            {/* Desktop Navigation Links (Visible on lg: 1024px and above) */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
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

            {/* Right Action: 3-Way Reach (WhatsApp, Call, Book - Visible on lg: 1024px and above) */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                title="Chat on WhatsApp"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-brand-orange hover:bg-amber-500/25 text-xs font-bold transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy tabular-nums"
                title="Call Now for Instant Driver Dispatch"
                aria-label={`Call Key2Drive dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
                <span>
                  Call Now
                  <span className="hidden xl:inline">
                    : <span className="text-white font-semibold" translate="no">{CONTACT_DETAILS.phoneDisplay}</span>
                  </span>
                </span>
              </a>

              <Link href="/book">
                <ButtonMotion
                  variant="accent"
                  size="sm"
                  className="!px-4 xl:!px-5 !py-2 xl:!py-2.5 !rounded-full shadow-md font-bold text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />}
                >
                  Book a Driver
                </ButtonMotion>
              </Link>
            </div>

            {/* Mobile & Tablet Actions (Visible below lg: < 1024px) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/15 text-brand-orange border border-amber-500/30 flex items-center justify-center sm:gap-1 text-xs font-bold hover:bg-amber-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums shrink-0"
                aria-label={`Call dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
                title="Call Now"
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Call</span>
              </a>

              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0 shadow-xs"
                aria-label="WhatsApp Dispatch"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
              </a>

              <Link href="/book" className="hidden sm:inline-flex shrink-0">
                <ButtonMotion
                  variant="accent"
                  size="sm"
                  className="!px-3.5 !py-1.5 !rounded-full text-xs font-bold min-h-[36px]"
                >
                  Book
                </ButtonMotion>
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={handleToggleMobileNav}
                className="w-9 h-9 rounded-xl text-white hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange flex items-center justify-center transition-colors shrink-0"
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
