"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ChevronRight,
  Phone,
  MessageSquare,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  MAIN_NAV_ITEMS,
  CONTACT_DETAILS,
} from "@/lib/constants/navigation";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function MobileNav({
  isOpen,
  onClose,
  triggerRef,
}: MobileNavProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Restore focus to opening hamburger button upon dismissal (WCAG 2.1 AA SC 2.4.3)
  const handleDismiss = useCallback(() => {
    onClose();
    setTimeout(() => {
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        previousActiveElementRef.current.focus();
      }
    }, 0);
  }, [onClose, triggerRef]);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Handle Escape key and keyboard focus trapping (WCAG 2.1 AA)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, handleDismiss]
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = (document.activeElement as HTMLElement) || null;
      window.addEventListener("keydown", handleKeyDown);
      // Lock background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Set initial focus to close button
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  const isActiveLink = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Emil Kowalski Motion Variants
  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const drawerVariants = {
    closed: {
      x: shouldReduceMotion ? 0 : "100%",
      opacity: shouldReduceMotion ? 0 : 1,
    },
    open: {
      x: 0,
      opacity: 1,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container */}
          <motion.div
            ref={drawerRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.26,
              ease: [0.32, 0.72, 0, 1], // Emil Kowalski drawer easing
            }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-10 border-l border-brand-border/60 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-border/60 bg-warm-bg/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" aria-hidden="true" />
                </div>
                <span className="font-bold text-lg text-brand-navy">Key2Drive</span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleDismiss}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-black/5 active:scale-[0.97] transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links Area */}
            <nav aria-label="Mobile Navigation Links" className="flex-1 p-5 space-y-1.5">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                      active
                        ? "bg-brand-navy text-white font-semibold shadow-sm"
                        : "text-primary-text hover:bg-warm-bg active:bg-black/5"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 ${active ? "text-brand-orange" : "text-secondary-text"}`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}

              <div className="pt-4">
                <Link
                  href="/book"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
                >
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  <span>Book a Chauffeur</span>
                </Link>
              </div>
            </nav>

            {/* Bottom Contact & Review Banner */}
            <div className="p-5 border-t border-brand-border/60 bg-warm-bg/70 space-y-3">
              {/* Unconfirmed data notice */}
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-900 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Notice:</strong> Contact details are placeholder specifications pending final client review.
                </span>
              </div>

              {/* Direct Call Trigger */}
              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg text-sm text-primary-text hover:bg-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center text-brand-navy flex-shrink-0">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-secondary-text">Call 24/7 Dispatch</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-brand-navy">{CONTACT_DETAILS.phoneDisplay}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded font-medium">
                      Review
                    </span>
                  </div>
                </div>
              </a>

              {/* WhatsApp Direct Chat Trigger */}
              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-emerald-950">WhatsApp Quick Chat</span>
                  <span className="text-[11px] text-emerald-800">Instant driver booking assistance</span>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
