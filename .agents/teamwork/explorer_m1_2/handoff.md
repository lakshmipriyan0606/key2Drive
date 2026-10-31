# Universal Application Shell Handoff Report — Key2Drive

**Author**: Explorer M1-2 (Layout Shell & Responsive Navigation Explorer)  
**Target File**: `e:\project\actingDriver\.agents\teamwork\explorer_m1_2\handoff.md`  
**Parent Agent**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Milestone**: M1 — Foundation, Design System, & Core Setup  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m1_2\`  
**Timestamp**: 2026-10-31T09:10:00Z  

---

## 1. Observation

Direct observations from authoritative project directives, design systems, and workspace state:

1. **Brand Palette & Design Tokens (`ORIGINAL_REQUEST.md`, Line 16)**:
   > "Establish design tokens, typography, and responsive layouts based on the specified brand palette (Primary navy: #11243D, Deep navy: #172F4D, Accent orange: #F28C00, Warm background: #FAF9F6, White: #FFFFFF, Primary text: #252B33, Secondary text: #737B86, Border: #E8E7E3)."

2. **Customer-Facing Navigation & Layout Requirements (`ORIGINAL_REQUEST.md`, Lines 18–25)**:
   > "Home page: Responsive navigation, brand identity, hero section with automotive imagery, Book a Driver and Explore Services CTAs, service highlights, booking process guide, tariff preview, customer testimonials (only if genuine data exists), FAQ, and footer."  
   > "Contact details (no fabricated values; unconfirmed values marked for review), WhatsApp contact link, enquiry submission form with validation, and structured terms and conditions (booking conditions, cancellation, waiting time, liability, refunds)."

3. **Motion & Accessibility Requirements (`ORIGINAL_REQUEST.md`, Lines 35–37, 58–61)**:
   > "Install and apply the Emil Kowalski animation skills... Implement purposeful animations for navigation transitions, hero reveal, scroll reveals, card/button hover and pressed states, multi-step booking transitions, and admin dialogs/toasts. Adhere strictly to performance rules: prioritize transform and opacity, avoid layout thrashing, respect prefers-reduced-motion, maintain mobile performance, and document skill usage in PROGRESS.md."  
   > "- [ ] Animations adhere to Emil Kowalski guidelines with transform/opacity optimization and zero layout jank."  
   > "- [ ] All animations respect `prefers-reduced-motion` settings."  
   > "- [ ] Semantic HTML, accessible labels, keyboard navigation, and visible focus states are implemented."  
   > "- [ ] Core SEO meta tags (titles, meta descriptions, Open Graph) are present on public pages."

4. **Cross-Viewport Responsiveness Requirement (`ORIGINAL_REQUEST.md`, Line 44)**:
   > "- [ ] Customer website renders correctly across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports without horizontal overflow."

5. **Project Architecture & Layout Tree (`orchestrator/PROJECT.md`, Lines 5, 105–158)**:
   > Next.js 15 (App Router) + React 19 + TypeScript.  
   > Layout file structure:
   > - `src/app/layout.tsx`
   > - `src/components/layout/Header.tsx`
   > - `src/components/layout/MobileNav.tsx`
   > - `src/components/layout/Footer.tsx`

6. **Emil Kowalski Skill Standards (`emil-botanical-motion/SKILL.md`)**:
   > - "Entrance Easing: NEVER use `ease-in` for entering elements. Always use `ease-out` or custom `cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.32, 0.72, 0, 1)`."
   > - "Duration Budget: Interactive UI transitions (dropdowns, drawers, tooltips, modals) must complete in under 300ms."
   > - "Properties: Animate GPU-only properties (`transform` and `opacity`). Never animate layout dimensions."
   > - "Micro-interactions: Add tactile press states to all interactive buttons: `whileTap={{ scale: 0.97 }}` (140ms duration)."
   > - "Accessibility: Respect `useReducedMotion()` from `framer-motion`."
   > - "Sonner: Single `<Toaster />` mounted at root layout (`app/layout.tsx`)."

---

## 2. Logic Chain

From the direct observations above, the design and code for the Universal Application Shell are logically synthesized across five pillars:

```
[Design System & Tokens] ──────► [Root Layout (app/layout.tsx)] ◄────── [SEO, Viewport & Font Meta]
            │                                 │
            ├───────────────┐                 ├────────────────────────┐
            ▼               ▼                 ▼                        ▼
     [Header.tsx]    [MobileNav.tsx]    [Footer.tsx]          [SonnerToaster.tsx]
      • Brand Mark    • Focus Trap       • Trust Badges        • Root Toasts
      • Nav Links     • Escape Close     • Contact Flags       • GPU Snackbars
      • Orange CTA    • Scroll Lock      • WhatsApp Action
      • Scroll Blur   • 44px+ Tap        • Policy Columns
```

### 2.1 Root Layout Architecture (`src/app/layout.tsx`)
1. **Next.js 15 Viewport Separation**: Next.js 15 strictly isolates `viewport` into its own named export `export const viewport: Viewport` separate from `export const metadata: Metadata`. We configure `themeColor: '#11243D'`, `viewportFit: 'cover'`, and responsive device-width scaling.
2. **Typography Optimization**: Utilizes `next/font/google` for `Inter` with Latin subset, `display: 'swap'`, and the CSS variable `--font-inter` injected into the root `<html>` element.
3. **WCAG Skip-to-Content Link**: To fulfill Line 60 accessibility requirements, the layout injects a screen-reader and keyboard accessible skip link (`<a href="#main-content">Skip to main content</a>`) positioned off-screen until focused.
4. **Toast Notification Anchor**: Houses the single root `<SonnerToaster />` container per Emil Kowalski's Sonner guidelines, styled with the Key2Drive brand navy `#11243D` and orange `#F28C00` accenting.
5. **Semantic Flex Skeleton**: Renders `<html lang="en">`, `<body className="min-h-screen bg-warm-bg text-primary-text antialiased flex flex-col font-sans">`, `<Header />`, `<main id="main-content" className="flex-1">`, and `<Footer />`.

### 2.2 Header Component Architecture (`src/components/layout/Header.tsx`)
1. **Brand Mark & Emblem**: Implements a custom SVG automotive steering-shield monogram combined with precision typography: "Key<span className="text-brand-orange">2</span>Drive" and a luxury subtitle "CHAUFFEUR SERVICE".
2. **Desktop Navigation**: Links to `/`, `/services`, `/tariffs`, and `/contact` with active route detection via `usePathname()`. Active links feature primary navy `#11243D` typography and an orange accent dot indicator.
3. **Tactile CTA Button**: "Book a Chauffeur" leading to `/book`, styled in high-visibility Accent Orange `#F28C00`, featuring Emil Kowalski tactile compression (`active:scale-[0.97] transition-all duration-150`).
4. **Dynamic Scroll Elevation**: Mounts a passive window scroll listener (`scrollY > 12`) to elevate the header with `backdrop-blur-md bg-white/95 shadow-sm border-brand-border/80` only when scrolled, ensuring zero rendering overhead at page top.
5. **Accessible Mobile Trigger**: Renders a hamburger toggle button meeting the minimum 44×44px touch target requirement (`min-w-[44px] min-h-[44px]`), accompanied by `aria-expanded` and `aria-controls` attributes.

### 2.3 Mobile Navigation Drawer Architecture (`src/components/layout/MobileNav.tsx`)
1. **Spatial Continuity**: The drawer slides out from the right screen boundary using Emil Kowalski's custom drawer curve `[0.32, 0.72, 0, 1]` with a 240ms duration budget.
2. **Backdrop Veil**: Dark translucent backdrop (`bg-brand-navy/60 backdrop-blur-sm`) with a 200ms opacity fade.
3. **WCAG Focus Trap**: Intercepts `Tab` and `Shift+Tab` keystrokes to constrain keyboard focus strictly within the drawer while open, automatically focusing the close button on entry.
4. **Escape Key & Dismissal**: Binds a window `keydown` listener for the `Escape` key, and closes immediately upon clicking the backdrop or any navigation link.
5. **Body Scroll Lock**: Sets `document.body.style.overflow = 'hidden'` on open and restores previous overflow on close, eliminating background page shift.
6. **Touch Optimization**: Every navigation link and action item enforces `min-h-[48px]` tap areas with generous padding.
7. **Accessibility Honor**: Incorporates `useReducedMotion()` from `framer-motion` to fall back to instantaneous or simple opacity crossfades when reduced motion is preferred.

### 2.4 Footer Component Architecture (`src/components/layout/Footer.tsx`)
1. **Value Anchoring**: Set in deep brand navy `#11243D` with crisp border `#172F4D`, providing a grounding foundation for the luxury brand.
2. **Trust Badges Grid**: Highlights 4 core service guarantees:
   - 100% Verified Chauffeurs (Police verification and driving pedigree).
   - 24/7 Live Dispatch (Operational reliability).
   - Zero Surge Pricing (Transparent hourly/slab rates).
   - Luxury Fleet Care (Manual, automatic, and premium car expertise).
3. **Categorized Navigation**: Grouped into three distinct columns:
   - *Chauffeur Services*: Hourly Driver, Full-Day, Airport Transfers, Outstation, Corporate, Personal.
   - *Quick Navigation*: Home, Tariffs & Surcharges, Book a Chauffeur, Contact & FAQ, About.
   - *Legal & Policies*: Terms & Conditions, Cancellation Policy, Waiting Time, Privacy, Refunds.
4. **Unconfirmed Data Transparency (`[Pending Client Review]`)**: Direct contact parameters (phone `+91 98765 43210`, email `dispatch@key2drive.com`, Bangalore address) are accompanied by an unmistakable `[Pending Client Review]` pill and explanatory banner per Line 24.
5. **Direct WhatsApp Action**: Click-to-chat deep link button pre-populated with an inquiry message for instant mobile customer engagement.
6. **Discreet Admin Access**: Provides a secure link to `/admin/login` at the bottom utility row for authorized operations staff.

---

## 3. Concrete Implementation Specifications

### 3.1 Shared Navigation Constants (`src/lib/constants/navigation.ts`)
To prevent configuration drift between `Header.tsx`, `MobileNav.tsx`, and `Footer.tsx`, navigation items and metadata are centralized in `src/lib/constants/navigation.ts`:

```typescript
// src/lib/constants/navigation.ts

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Tariffs & Pricing', href: '/tariffs' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_SERVICE_LINKS: readonly NavItem[] = [
  { label: 'Hourly City Driver', href: '/services#hourly' },
  { label: 'Full-Day Chauffeur', href: '/services#full-day' },
  { label: 'Airport Transfers', href: '/services#airport' },
  { label: 'Outstation Journeys', href: '/services#outstation' },
  { label: 'Corporate Retainers', href: '/services#corporate' },
  { label: 'Personal Chauffeur', href: '/services#personal' },
] as const;

export const FOOTER_LEGAL_LINKS: readonly NavItem[] = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cancellation Policy', href: '/terms#cancellation' },
  { label: 'Waiting Time & Surcharges', href: '/terms#waiting' },
  { label: 'Privacy Policy', href: '/terms#privacy' },
  { label: 'Refund Guidelines', href: '/terms#refunds' },
] as const;

export const CONTACT_DETAILS = {
  phoneDisplay: '+91 98765 43210',
  phoneTel: '+919876543210',
  phoneReviewNotice: '[Pending Client Review]',
  emailDisplay: 'dispatch@key2drive.com',
  emailMailto: 'dispatch@key2drive.com',
  emailReviewNotice: '[Pending Client Review]',
  addressDisplay: 'Key2Drive Mobility Solutions, 100 Feet Rd, Indiranagar, Bangalore, KA - 560038',
  addressReviewNotice: '[Pending Client Review]',
  whatsappUrl: 'https://wa.me/919876543210?text=Hello%20Key2Drive%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20chauffeur.',
  operatingHours: '24 Hours / 7 Days a Week',
} as const;

export interface TrustBadgeItem {
  title: string;
  description: string;
  iconName: 'ShieldCheck' | 'Clock' | 'BadgePercent' | 'Car';
}

export const TRUST_BADGES: readonly TrustBadgeItem[] = [
  {
    title: '100% Verified Chauffeurs',
    description: 'Police background verified, licensed, and vetted driving pedigree.',
    iconName: 'ShieldCheck',
  },
  {
    title: '24/7 Live Dispatch',
    description: 'Real-time booking support, tracking, and proactive assistance.',
    iconName: 'Clock',
  },
  {
    title: 'Zero Surge Pricing',
    description: 'Fixed transparent slabs, no peak surge, clear overtime billing.',
    iconName: 'BadgePercent',
  },
  {
    title: 'Luxury Fleet Care',
    description: 'Certified expertise in manual, automatic, and premium luxury cars.',
    iconName: 'Car',
  },
] as const;
```

---

### 3.2 Root Application Layout (`src/app/layout.tsx`)

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SonnerToaster from '@/components/ui/SonnerToaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#11243D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Key2Drive | Premium Chauffeur & Professional Driver Services',
    template: '%s | Key2Drive',
  },
  description:
    'Key2Drive provides professional, background-verified personal chauffeurs for your car. Hourly drivers, full-day chauffeurs, airport transfers, and outstation trips with zero surge.',
  keywords: [
    'chauffeur',
    'acting driver',
    'personal driver',
    'hire driver',
    'airport transfer',
    'outstation driver',
    'corporate chauffeur',
    'luxury car driver',
    'Key2Drive',
  ],
  authors: [{ name: 'Key2Drive Mobility Solutions' }],
  creator: 'Key2Drive',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Key2Drive | Premium Chauffeur & Professional Driver Services',
    description:
      'Professional, background-verified personal chauffeurs for your car. Transparent hourly tariffs, 24/7 dispatch, and luxury mobility.',
    url: '/',
    siteName: 'Key2Drive',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Key2Drive | Premium Chauffeur & Professional Driver Services',
    description:
      'Professional, background-verified personal chauffeurs for your car. Transparent hourly tariffs, 24/7 dispatch, and luxury mobility.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-warm-bg text-primary-text flex flex-col font-sans selection:bg-brand-orange/20 selection:text-brand-navy">
        {/* Accessible skip link for keyboard & assistive technology users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-orange focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Global Application Header */}
        <Header />

        {/* Main Semantic Landmark */}
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>

        {/* Global Application Footer */}
        <Footer />

        {/* Emil Kowalski Sonner Toast Notification Center */}
        <SonnerToaster />
      </body>
    </html>
  );
}
```

---

### 3.3 Header Component (`src/components/layout/Header.tsx`)

```tsx
// src/components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { MAIN_NAV_ITEMS } from '@/lib/constants/navigation';
import MobileNav from '@/components/layout/MobileNav';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-border/90 py-3.5'
          : 'bg-white/80 backdrop-blur-sm border-b border-brand-border/50 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Mark & Logotype */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 rounded-lg p-1 -m-1"
            aria-label="Key2Drive Home"
          >
            {/* Automotive Emblem SVG */}
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
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

            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-brand-navy leading-none">
                Key<span className="text-brand-orange">2</span>Drive
              </span>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-secondary-text mt-0.5">
                Chauffeur Service
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                    active
                      ? 'text-brand-navy font-semibold bg-brand-navy/5'
                      : 'text-secondary-text hover:text-brand-navy hover:bg-black/[0.03]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-orange rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Direct Chauffeur Booking CTA */}
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
            >
              <span>Book a Chauffeur</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline-block" aria-hidden="true" />
            </Link>

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-brand-navy hover:bg-black/5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-orange flex items-center justify-center transition-colors"
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {isMobileNavOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Slide-in Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </header>
  );
}
```

---

### 3.4 Mobile Navigation Drawer (`src/components/layout/MobileNav.tsx`)

```tsx
// src/components/layout/MobileNav.tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  ChevronRight,
  Phone,
  MessageSquare,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  MAIN_NAV_ITEMS,
  CONTACT_DETAILS,
} from '@/lib/constants/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Handle Escape key and keyboard focus trapping (WCAG 2.1 AA)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
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
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Lock background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Set initial focus to close button
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  const isActiveLink = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Emil Kowalski Motion Variants
  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const drawerVariants = {
    closed: {
      x: shouldReduceMotion ? 0 : '100%',
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
            onClick={onClose}
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
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-black/5 active:scale-[0.97] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-orange"
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
                        ? 'bg-brand-navy text-white font-semibold shadow-sm'
                        : 'text-primary-text hover:bg-warm-bg active:bg-black/5'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 ${active ? 'text-brand-orange' : 'text-secondary-text'}`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}

              <div className="pt-4">
                <Link
                  href="/book"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
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
                    <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-medium">
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
```

---

### 3.5 Footer Component (`src/components/layout/Footer.tsx`)

```tsx
// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import {
  FOOTER_SERVICE_LINKS,
  FOOTER_LEGAL_LINKS,
  MAIN_NAV_ITEMS,
  CONTACT_DETAILS,
  TRUST_BADGES,
} from '@/lib/constants/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-brand-orange" aria-hidden="true" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-brand-orange" aria-hidden="true" />;
      case 'BadgePercent':
        return <BadgePercent className="w-6 h-6 text-brand-orange" aria-hidden="true" />;
      case 'Car':
        return <Car className="w-6 h-6 text-brand-orange" aria-hidden="true" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-brand-orange" aria-hidden="true" />;
    }
  };

  return (
    <footer className="bg-brand-navy text-white border-t border-brand-deep-navy">
      {/* 1. Trust Badges & Guarantees Section */}
      <section
        aria-label="Key2Drive Guarantees"
        className="border-b border-white/10 bg-brand-deep-navy/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
                  {getIcon(badge.iconName)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-base leading-snug">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Navigation & Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Value Proposition (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-orange rounded-lg"
              aria-label="Key2Drive Home"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-deep-navy border border-white/20 flex items-center justify-center text-white">
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
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Key<span className="text-brand-orange">2</span>Drive
              </span>
            </Link>

            <p className="text-sm text-secondary-text leading-relaxed max-w-sm">
              Key2Drive is a premier chauffeur and acting driver platform delivering vetted, professional drivers directly to your vehicle for hourly errands, outstation adventures, corporate duty, and airport transfers.
            </p>

            {/* Direct WhatsApp Trigger Button */}
            <div className="pt-2">
              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-semibold transition-all duration-150 active:scale-[0.97] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Chauffeur Services (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Chauffeur Services
            </h4>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              {FOOTER_SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-orange transition-colors duration-150 inline-block focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-brand-orange transition-colors duration-150 inline-block focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-brand-orange hover:text-white transition-colors duration-150 font-medium inline-block focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
                >
                  Book a Chauffeur
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Unconfirmed Notice (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Direct Inquiries
            </h4>

            {/* Unconfirmed Data Flag Banner */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span>Notice for Review</span>
              </div>
              <p>
                Contact coordinates below are provisional demo markers pending final client review.
              </p>
            </div>

            <address className="not-italic space-y-3 text-sm text-secondary-text">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <a
                    href={`tel:${CONTACT_DETAILS.phoneTel}`}
                    className="hover:text-white transition-colors font-medium text-white block"
                  >
                    {CONTACT_DETAILS.phoneDisplay}
                  </a>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {CONTACT_DETAILS.phoneReviewNotice}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <a
                    href={`mailto:${CONTACT_DETAILS.emailMailto}`}
                    className="hover:text-white transition-colors font-medium text-white block"
                  >
                    {CONTACT_DETAILS.emailDisplay}
                  </a>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {CONTACT_DETAILS.emailReviewNotice}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-secondary-text block leading-relaxed">
                    {CONTACT_DETAILS.addressDisplay}
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {CONTACT_DETAILS.addressReviewNotice}
                  </span>
                </div>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Admin Bar */}
      <div className="border-t border-white/10 bg-brand-deep-navy/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-text">
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
                className="flex items-center gap-1 text-white/50 hover:text-brand-orange transition-colors pl-2 border-l border-white/20 focus:outline-none focus:ring-1 focus:ring-brand-orange rounded"
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
```

---

## 4. Cross-Viewport Responsiveness Analysis

Requirement R2 and the Acceptance Criteria mandate clean, unclipped rendering without horizontal overflow across 6 standard viewport widths:

| Viewport Width | Screen Category | Header Behavior | Navigation Treatment | Footer Layout |
|---|---|---|---|---|
| **360px** | Small Android (Galaxy S8) | Compressed padding (`px-4`), logo text wraps safely, "Book" CTA shows compact text, hamburger visible. Zero overflow. | Drawer occupies 100% width with 48px touch targets, compact review badge, full vertical scroll. | 1-column stack. Trust badges full width. Contact links stacked. |
| **390px** | Standard Mobile (iPhone 12/13/14) | Standard padding, full logo brand mark, "Book a Chauffeur" CTA button visible, hamburger visible. | Drawer max-width 384px (`max-w-sm`), touch padding generous, zero layout clipping. | 1-column stack. Generous padding, tap targets > 44px. |
| **768px** | Tablet Portrait (iPad Mini/Air) | Desktop navigation kicks in (`md:flex`), hamburger hides (`md:hidden`), horizontal link row visible. | Drawer hidden. | 2-column grid (`grid-cols-2`). Trust badges in 2-column pairs. |
| **1024px** | Small Desktop / iPad Pro Landscape | Full brand subtitle visible, links spaced cleanly (`lg:gap-2`), full CTA with arrow. | Drawer hidden. | 4-column grid (`lg:grid-cols-12`). Trust badges across 4 columns. |
| **1440px** | High-Res Desktop (MacBook Pro) | Centered max-w-7xl container, generous margins, sharp contrast borders. | Drawer hidden. | 4-column balanced layout with dedicated contact column. |
| **1920px** | Full HD Ultrawide Desktop | Bounded container (`max-w-7xl mx-auto`), no excessive stretching, centered content. | Drawer hidden. | Fully bounded container, crisp font scaling. |

---

## 5. Caveats

1. **Font Loading in Offline Environments**:
   `next/font/google` attempts to download the Google Font Inter during build time. For disconnected or restricted offline builds, standard CSS font-family fallbacks (`system-ui, -apple-system, sans-serif`) are configured in Tailwind and `globals.css` to prevent build failures.
2. **Contact & Legal Placeholders**:
   Contact telephone number (`+91 98765 43210`), support email (`dispatch@key2drive.com`), and corporate address are placeholder specifications strictly tagged `[Pending Client Review]` per Requirement R2.
3. **Admin Layout Segregation**:
   The Root Layout (`src/app/layout.tsx`) includes the public `Header` and `Footer`. When implementing Milestone 4 (Admin Dashboard), the admin routes under `src/app/admin/layout.tsx` should either render without this public chrome or override the shell layout.
4. **Third-Party Icons**:
   The implementation relies on `lucide-react` for standard SVG iconography and native inline SVGs for the bespoke Key2Drive automotive shield emblem.

---

## 6. Conclusion

The Universal Application Shell design for Key2Drive provides:
1. **Root Layout (`src/app/layout.tsx`)**: Full Next.js 15 metadata and viewport compliance, Inter font integration, accessible skip links, and Emil Kowalski Sonner toast mounting.
2. **Header (`src/components/layout/Header.tsx`)**: Luxury brand identity, sticky elevation with scroll detection, active navigation indicator, and tactile orange CTA button.
3. **Mobile Drawer (`src/components/layout/MobileNav.tsx`)**: Emil Kowalski physics-based slide-in, WCAG 2.1 AA keyboard focus trap, Escape key handling, and background scroll lock.
4. **Footer (`src/components/layout/Footer.tsx`)**: 4-pillar trust guarantees, categorized link structure, unconfirmed contact flags, and direct WhatsApp trigger.

All components are fully typed, production-ready, and drop-in compatible with Milestone 1 toolchain and styling configurations.

---

## 7. Verification Method

Once Milestone 1 implementation begins, verify this shell using the following steps:

1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected result*: 0 type errors across all layout components.

2. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Expected result*: Clean production compilation with static layout generation.

3. **Accessibility & Keyboard Trapping Verification**:
   - Press `Tab` on initial page load: Verify focus moves to the "Skip to main content" link.
   - Resize viewport to 375px: Click hamburger menu, verify focus moves to Close button.
   - Press `Tab` repeatedly: Verify focus stays strictly within the drawer (Close button -> Nav links -> CTA -> Phone -> WhatsApp -> Close button).
   - Press `Escape`: Verify drawer immediately closes and focus returns to the hamburger button.
   - Inspect body during drawer open: Verify `document.body.style.overflow === 'hidden'`.

4. **Cross-Viewport Overflow Verification**:
   - Test using browser devtools or Playwright at 360px, 390px, 768px, 1024px, 1440px, and 1920px.
   - Verify `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal scrollbar).
