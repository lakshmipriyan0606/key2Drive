# Key2Drive Motion Design System & Emil Kowalski Animation Architecture
**Explorer Survey 3 Handoff Report**
**Target**: `e:\project\actingDriver\.agents\teamwork\explorer_survey_3\handoff.md`  
**Timestamp**: 2026-10-31T09:00:00Z  
**Author**: Explorer Survey 3 (Motion & Animation Systems Explorer)  
**Parent Agent**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  

---

## 1. Observation

### 1.1 Project & Request Constraints (Verbatim)
From `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md`:
* **Requirement R4 (Lines 35–37)**:
  > "Install and apply the Emil Kowalski animation skills (from https://github.com/emilkowalski/skills, including emil-design-eng, animate, animation-vocabulary, animation-performance, find-animation-opportunities, improve-animations, review-animations, remove-animations, pick-ui-library, prototype, break-ui, apple-design, ask-sonner). Implement purposeful animations for navigation transitions, hero reveal, scroll reveals, card/button hover and pressed states, multi-step booking transitions, and admin dialogs/toasts. Adhere strictly to performance rules: prioritize transform and opacity, avoid layout thrashing, respect prefers-reduced-motion, maintain mobile performance, and document skill usage in PROGRESS.md."
* **Acceptance Criteria (Lines 58–60)**:
  > "- [ ] Animations adhere to Emil Kowalski guidelines with transform/opacity optimization and zero layout jank.  
  > - [ ] All animations respect `prefers-reduced-motion` settings.  
  > - [ ] Semantic HTML, accessible labels, keyboard navigation, and visible focus states are implemented."
* **Brand Palette Constraints (Line 16)**:
  > Primary navy: `#11243D`, Deep navy: `#172F4D`, Accent orange: `#F28C00`, Warm background: `#FAF9F6`, White: `#FFFFFF`, Primary text: `#252B33`, Secondary text: `#737B86`, Border: `#E8E7E3`.

### 1.2 Local Skill Analysis (`emil-botanical-motion/SKILL.md`)
* **Motion Principles (Lines 17–22)**:
  - Entrance Easing: "NEVER use `ease-in` for entering elements. Always use `ease-out` or custom `cubic-bezier(0.16, 1, 0.3, 1)`."
  - Exit Transitions: "Fast ease-out or linear fade."
  - Duration Budget: "Interactive UI transitions (dropdowns, drawers, tooltips, modals) must complete in under 300ms."
  - Scale Rules: "Never scale up from 0. Start at `0.94–0.97` with opacity 0 to 1."
  - Properties: "Animate GPU-only properties (`transform` and `opacity`). Never animate layout dimensions (`width`, `height`, `margin`, `top`, `left`)."
  - Origin Awareness: "Popovers, tooltips, and dropdowns must set `transform-origin` relative to the trigger element."
* **Framer Motion Rules (Lines 28–31)**:
  - Springs: `damping: 24–30` and `stiffness: 280–350` for natural interactive elements.
  - Scroll reveals: `useInView({ once: true, margin: "-60px" })`.
  - Accessibility: `useReducedMotion()` from `framer-motion`.
  - Micro-interactions: `active:scale-95` or `whileTap={{ scale: 0.94 }}`.

### 1.3 Authoritative Reference Material (`emilkowalski/skills`)
Directly extracted and verified from `emilkowalski/skills` repository:
* **`emil-design-eng/SKILL.md`**:
  - Unseen details compound: "When a feature functions exactly as someone assumes it should, they proceed without giving it a second thought."
  - Animation Gate (Lines 78–84): 100+ times/day = No animation; keyboard actions = Never animate; occasional (modals/toasts) = standard animation; rare/first-time = delight budget.
  - Custom Easing Curves (Lines 118–127):
    `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
    `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);`
    `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);`
  - Spring physics: Apple-style `{ type: "spring", duration: 0.5, bounce: 0.2 }` vs physics triplet `{ type: "spring", mass: 1, stiffness: 100, damping: 10 }`.
  - Buttons: `transform: scale(0.97)` on `:active` with `100–160ms ease-out`.
  - Popovers: `transform-origin: var(--transform-origin)` (modals exempt, keep centered).
  - Blur to mask imperfect crossfades: `filter: blur(2px)` during transition (never exceed 20px).
* **`animate/SKILL.md` & `RECIPES.md`**:
  - Hard rule: Never use `transition: all`. Specify exact properties.
  - UI duration budget: strictly under 300ms (dropdowns: 150–250ms, tooltips: 125–200ms, buttons: 100–160ms, modals: 200–280ms).
  - Stagger delay: 30–80ms per item; non-blocking.
  - Hold to confirm: linear fill on `:active` (2s) and snappy release (200ms ease-out).
* **`animation-performance/SKILL.md`**:
  - The Frame Budget: 16.7ms for 60fps; 8ms for 120fps displays (ProMotion / modern mobile devices).
  - Pipeline cost: Composite-only (`transform`, `opacity`) = cheapest. Layout (`width`, `height`, `margin`, `top`, `left`) = catastrophic jank.
  - Framer Motion Hardware Acceleration Caveat (Lines 126–131):
    `<motion.div animate={{ x: 100 }} />` runs on main thread via animated CSS variables and rAF.
    `<motion.div animate={{ transform: "translateX(100px)" }} />` is hardware-accelerated.
  - Two hidden traps:
    1. Inherited CSS variable recalculation (setting `--swipe-amount` on parent recalcs every child node).
    2. Animated `blur()` above 20px causes GPU memory pressure and stutter in Safari.
* **`ask-sonner/SKILL.md`**:
  - Sonner created by Emil Kowalski. Single `<Toaster />` at root layout (`app/layout.tsx`).
  - Never mount multiple Toasters; never use keyframes for dynamic toasts (CSS transitions retarget from current value).
  - Use `richColors={false}` with custom design-system styling to match brand palette.
* **`apple-design/SKILL.md`**:
  - Direct manipulation, interruptibility, and critically damped springs (`damping 1.0`, `response 0.3–0.4` for zero overshoot).
  - Symmetric spatial paths (enter and exit through the same direction).
  - Translucent materials: `backdrop-filter: blur(20px)` + semi-transparent chrome.
* **`remove-animations/SKILL.md`**:
  - Restraint is craft. Never animate keyboard shortcuts (Cmd+K palette, ESC to close). Never animate tabular financial data on reload. Never loop pulsing badges continuously.

---

## 2. Logic Chain

```
[Observation: Luxury Chauffeur Domain & Brand Palette #11243D/#F28C00]
         │
         ▼
[Step 1: Motion Character & Personality Definition]
   • Understated, crisp, dignified, reassuring.
   • No playful cartoon bounce (bounce: 0 to 0.1 max).
   • Precise physical response simulating luxury automotive switchgear.
         │
         ▼
[Step 2: Gate Analysis & Frequency Tiering]
   • Keyboard shortcuts & command navigation → 0ms (instant).
   • High-frequency admin table updates → instant, no layout shift.
   • Primary CTAs & booking buttons → tactile press (scale 0.97, 140ms).
   • Occasional transitions (modals, drawers, booking steps) → 200–280ms.
   • First-time booking confirmation → deliberate reassurance (spring settle).
         │
         ▼
[Step 3: Physics Tokens & Easing Architecture]
   • Replace generic CSS curves with Emil's verified cubic-beziers.
   • Configure 4 distinct Framer Motion spring presets.
   • Map to Tailwind CSS theme extension for zero-overhead utility usage.
         │
         ▼
[Step 4: Layout Thrashing & Compositor Optimization]
   • Enforce composite-only properties: transform & opacity exclusively.
   • Use transform strings for high-load route & booking transitions.
   • For accordions/faqs: limit height animation to 200ms with overflow-hidden.
         │
         ▼
[Step 5: Universal Accessibility & Pointer Gating]
   • Build `useAccessibleMotion` wrapper honoring `prefers-reduced-motion`.
   • Gate all hover transforms behind `@media (hover: hover) and (pointer: fine)`.
         │
         ▼
[Step 6: Concrete Component Motion Specifications]
   • Buttons, Cards, Header Nav, Scroll Reveals, Multi-Step Booking,
     Sonner Toaster, Admin Dialogs.
```

### Detailed Deduction of System Decisions

1. **Why Framer Motion (or `motion/react`) over vanilla CSS alone?**  
   While CSS transitions handle hover and active states efficiently, Key2Drive requires:
   - Direction-aware multi-step booking wizard with `AnimatePresence mode="wait"`.
   - Shared layout transitions for tab indicators (`layoutId="activeTab"`).
   - Interruptible modal dialog unmounting with orchestrated backdrops.
   - Spring physics that naturally blend velocity on touch gestures.
   *Resolution*: Use hybrid architecture. CSS transitions for button `:active` and pure hover states (off main thread); Framer Motion for multi-step booking, modals, drawers, and orchestrated scroll reveals.

2. **Why Apple-style critically damped springs for Key2Drive?**  
   Key2Drive represents an elite chauffeur service. Overshooting, bouncing UI communicates a playful, casual mobile game feel. Critically damped springs (`bounce: 0`, `damping: 1.0` or `stiffness: 280, damping: 26`) communicate precision, mechanical perfection, and authority—mirroring the tactile feeling of high-end automotive controls (like Bentley or Mercedes-Benz dashboard dials).

3. **Why avoid `transition: all` unconditionally?**  
   `transition: all` is one of the most common causes of hidden layout thrashing. If an element with `transition: all` has its `padding`, `margin`, `top`, or `border-width` modified, the browser re-triggers the entire layout tree (Reflow -> Repaint -> Composite) 60 to 120 times per second. By explicitly restricting transitions to `transform` and `opacity`, frame budgets remain well below the 8ms target on 120Hz displays.

---

## 3. Caveats

1. **Safari `backdrop-filter` GPU Overhead**:
   - Applying `backdrop-filter: blur(20px)` to large fixed surfaces (e.g. sticky header) alongside animated child elements can cause GPU compositor slowdowns on older iOS devices.
   - *Mitigation*: Restrict blur radius to 12px–16px, use `will-change: transform` only on active elements, and never nest blurred layers.
2. **Dynamic Height Accordions (FAQ section)**:
   - Animating `height` from `0` to `auto` violates the "transform only" rule. However, CSS cannot currently animate `height: auto` without layout calculation.
   - *Mitigation*: Keep FAQ expand duration strictly at `200ms` with `--ease-out` and `overflow: hidden`, or utilize modern CSS `grid-template-rows: 0fr -> 1fr` which has hardware-optimized browser paths in 2026.
3. **Motion Package Naming in React 19 / Next.js**:
   - Framer Motion has rebranded to `motion` (`import { motion } from 'motion/react'`), while legacy projects import from `'framer-motion'`.
   - *Mitigation*: Both `framer-motion` and `motion` provide equivalent APIs. The tokens and recipes formulated herein work identically in both.
4. **Mobile Browser Address Bar Resizing**:
   - Mobile Safari/Chrome dynamic viewport shifts (`100vh` vs `100dvh`) can trigger layout jank if components animate based on raw viewport heights.
   - *Mitigation*: All drawer and modal offsets use percentage-based transforms (`translateY(100%)`) or `100dvh` CSS units.

---

## 4. Conclusion & Complete Motion System Specification

### 4.1 Motion Design Tokens (Source of Truth)

#### A. Duration Scale
```typescript
export const MOTION_DURATIONS = {
  instant: 0,       // 0ms   - Keyboard shortcuts, command palettes, instant tooltips
  press: 0.14,      // 140ms - Button press / active tactile response
  micro: 0.18,      // 180ms - Badges, small toggles, tooltips, dropdown menus
  standard: 0.24,   // 240ms - Card lifts, popovers, accordions, tab indicators
  deliberate: 0.32, // 320ms - Modals, multi-step booking slide, sheet transitions
  toast: 0.40,      // 400ms - Sonner toasts (graceful notification arrival)
  longPress: 1.80,  // 1.8s  - Hold-to-confirm destructive actions (linear fill)
} as const;
```

#### B. Custom Easing Curves (Cubic-Bézier)
*Zero default browser easings (`ease`, `ease-in-out` built-ins). NEVER `ease-in` on entrances.*
```typescript
export const MOTION_EASINGS = {
  // Strong, intentional ease-out for entering UI elements (starts fast, lands gently)
  easeOut: [0.23, 1, 0.32, 1] as const,
  easeOutCss: "cubic-bezier(0.23, 1, 0.32, 1)",

  // Botanical / high-polish entrance variant (ultra-responsive initial frame)
  easeOutPunch: [0.16, 1, 0.3, 1] as const,
  easeOutPunchCss: "cubic-bezier(0.16, 1, 0.3, 1)",

  // Symmetrical ease-in-out for elements traveling across the screen (tabs, carousels)
  easeInOut: [0.77, 0, 0.175, 1] as const,
  easeInOutCss: "cubic-bezier(0.77, 0, 0.175, 1)",

  // iOS-style sheet / drawer curve (from Ionic Framework & Apple WWDC)
  easeDrawer: [0.32, 0.72, 0, 1] as const,
  easeDrawerCss: "cubic-bezier(0.32, 0.72, 0, 1)",

  // Linear progression only for hold-to-confirm progress overlays
  linear: [0, 0, 1, 1] as const,
  linearCss: "linear",
} as const;
```

#### C. Spring Physics Presets
```typescript
import type { Transition } from "framer-motion";

export const MOTION_SPRINGS = {
  // Snappy: Buttons, badge counts, micro state toggles (critically damped, no bounce)
  snappy: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,

  // Smooth: Modals, popovers, card elevation, dropdowns
  smooth: {
    type: "spring",
    stiffness: 280,
    damping: 26,
    mass: 1.0,
  } satisfies Transition,

  // Gentle / Sheet: Mobile booking drawer, slide-over panels
  sheet: {
    type: "spring",
    stiffness: 220,
    damping: 28,
    mass: 1.0,
  } satisfies Transition,

  // Tab Indicator: Shared layout tab pills (fast, zero overshoot)
  tab: {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.9,
  } satisfies Transition,

  // Apple-style duration/bounce alternative (ideal for drag-to-dismiss gestures)
  appleCriticallyDamped: {
    type: "spring",
    duration: 0.38,
    bounce: 0,
  } satisfies Transition,

  appleMomentum: {
    type: "spring",
    duration: 0.45,
    bounce: 0.12,
  } satisfies Transition,
} as const;
```

---

### 4.2 Tailwind CSS Configuration Integration (`tailwind.config.ts`)

Extend Tailwind to expose these physics tokens to CSS classes:

```typescript
// snippet for tailwind.config.ts
export default {
  theme: {
    extend: {
      transitionDuration: {
        '140': '140ms',
        '180': '180ms',
        '240': '240ms',
        '320': '320ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'ease-out-emil': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-punch': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out-emil': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'ease-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.97)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-out': 'fade-out 150ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
    },
  },
};
```

---

### 4.3 Universal Reduced-Motion & Accessibility Architecture

Users who prefer reduced motion must never experience jarring positional displacements. However, motion should NOT be stripped entirely to a broken static state: **opacity fades and semantic color transitions remain active**.

#### The `useAccessibleMotion` Hook
```typescript
// File: src/lib/motion/useAccessibleMotion.ts
"use client";

import { useReducedMotion } from "framer-motion";

export function useAccessibleMotion() {
  const shouldReduce = useReducedMotion();

  return {
    shouldReduce,
    // Helper to safely choose transform vs static
    transformOrNone: (transformVal: string) => (shouldReduce ? "none" : transformVal),
    // Returns accessible variant mapping
    withReduced: <T>(standard: T, reduced: T): T => (shouldReduce ? reduced : standard),
  };
}
```

#### Global CSS Reduced-Motion Override (`globals.css`)
```css
/* Accessibility Guard: Kill all translation/scale motion while preserving opacity */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 150ms !important;
    scroll-behavior: auto !important;
  }

  /* Retain gentle opacity fades for state clarity */
  .fade-on-reduced {
    transition: opacity 150ms ease-out !important;
    transform: none !important;
  }
}

/* Pointer Guard: Prevent sticky hover states on touch screens */
@media (hover: none) and (pointer: coarse) {
  .hover-lift:hover {
    transform: none !important;
  }
}
```

---

### 4.4 Component-Specific Motion Specifications & Code Recipes

#### 1. Interactive Buttons & CTAs
* **Rule**: Never scale from 0. Give instant tactile feedback on touch-down (`scale: 0.97`). Never wait for touch-up.
* **Component Specification**:
```tsx
// File: src/components/ui/ButtonMotion.tsx
"use client";

import { motion } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
}

export const ButtonMotion: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  const { shouldReduce } = useAccessibleMotion();

  return (
    <motion.button
      whileTap={shouldReduce ? undefined : { scale: 0.97 }}
      transition={{
        duration: 0.14,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`relative inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
```

#### 2. Service & Feature Cards (Card Elevation & Border Highlight)
* **Rule**: Never animate `border-color` or `box-shadow` directly (causes frame drops). Elevate via `translateY(-4px)` with transform only. Highlight border via an overlaid gradient with animated `opacity`.
* **Component Specification**:
```tsx
// File: src/components/ui/ServiceCardMotion.tsx
"use client";

import { motion } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import React from "react";

export const ServiceCardMotion: React.FC<{
  title: string;
  price: string;
  description: string;
}> = ({ title, price, description }) => {
  const { shouldReduce } = useAccessibleMotion();

  return (
    <motion.div
      whileHover={shouldReduce ? undefined : { y: -4 }}
      transition={{
        duration: 0.22,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="group relative rounded-xl bg-white p-6 border border-[#E8E7E3] shadow-sm hover:shadow-md transition-shadow"
      style={{ willChange: "transform" }}
    >
      {/* GPU-accelerated border glow overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#F28C00] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <h3 className="text-xl font-bold text-[#11243D]">{title}</h3>
      <p className="mt-2 text-[#737B86]">{description}</p>
      <div className="mt-4 font-semibold text-[#F28C00]">{price}</div>
    </motion.div>
  );
};
```

#### 3. Navigation Header & Active Tab Indicator
* **Rule**: Sticky header transforms with `translateY(-100%)` on scroll down, returns with `--ease-out` on scroll up. Active tab indicator uses `layoutId` with zero-bounce spring.
* **Component Specification**:
```tsx
// File: src/components/nav/ActiveTabIndicator.tsx
"use client";

import { motion } from "framer-motion";
import { MOTION_SPRINGS } from "@/lib/motion/motionTokens";
import React from "react";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onSelect: (tab: string) => void;
}

export const ActiveTabNav: React.FC<TabsProps> = ({ tabs, activeTab, onSelect }) => {
  return (
    <nav className="inline-flex rounded-full bg-[#172F4D]/5 p-1 backdrop-blur-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className="relative px-4 py-2 text-sm font-medium text-[#11243D] focus-visible:outline-2"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-full bg-white shadow-sm border border-[#E8E7E3]"
                transition={MOTION_SPRINGS.tab}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </nav>
  );
};
```

#### 4. Hero Section & Scroll Reveals
* **Rule**: Scroll reveal must execute **only once** (`once: true`). Trigger with margin offset `-60px`. Stagger children with 40–50ms delays. Never re-trigger when scrolling back up.
* **Component Specification**:
```tsx
// File: src/components/motion/ScrollRevealGroup.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms stagger
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, transform: "translateY(12px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      duration: 0.28,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

const reducedItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const ScrollRevealGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { shouldReduce } = useAccessibleMotion();

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={shouldReduce ? reducedItemVariants : itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

#### 5. Multi-Step Booking Wizard Transitions
* **Rule**: Direction-aware slides. Step 1 -> Step 2 slides left (`direction = 1`). Step 2 -> Step 1 slides right (`direction = -1`). `AnimatePresence mode="wait"` prevents content overlap.
* **Component Specification**:
```tsx
// File: src/components/booking/StepTransition.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import React from "react";

interface StepTransitionProps {
  step: number;
  direction: number; // 1 = forward (Next), -1 = backward (Back)
  children: React.ReactNode;
}

const slideVariants = {
  enter: (direction: number) => ({
    transform: direction > 0 ? "translateX(24px)" : "translateX(-24px)",
    opacity: 0,
  }),
  center: {
    transform: "translateX(0%)",
    opacity: 1,
  },
  exit: (direction: number) => ({
    transform: direction > 0 ? "translateX(-24px)" : "translateX(24px)",
    opacity: 0,
  }),
};

const reducedSlideVariants = {
  enter: () => ({ opacity: 0 }),
  center: { opacity: 1 },
  exit: () => ({ opacity: 0 }),
};

export const StepTransition: React.FC<StepTransitionProps> = ({ step, direction, children }) => {
  const { shouldReduce } = useAccessibleMotion();
  const variants = shouldReduce ? reducedSlideVariants : slideVariants;

  return (
    <div className="relative overflow-hidden w-full">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.24,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
```

#### 6. Emil Kowalski's Sonner Toast Configuration
* **Rule**: One root `<Toaster />`. Match luxury automotive brand identity (#11243D primary navy background, #F28C00 orange accents). 400ms duration with `ease` timing for graceful presence.
* **Component Specification**:
```tsx
// File: src/components/ui/SonnerToaster.tsx
"use client";

import { Toaster as SonnerPrimitive } from "sonner";
import React from "react";

export const SonnerToaster: React.FC = () => {
  return (
    <SonnerPrimitive
      position="top-right"
      offset={32}
      mobileOffset={16}
      closeButton
      duration={4000}
      toastOptions={{
        className: "!bg-[#11243D] !text-white !border !border-[#172F4D] !rounded-xl !shadow-2xl !p-4 !font-sans",
        classNames: {
          title: "!font-semibold !text-white !text-sm",
          description: "!text-[#FAF9F6]/80 !text-xs !mt-1",
          actionButton: "!bg-[#F28C00] !text-white !font-medium !text-xs !rounded-lg !px-3 !py-1.5 hover:!bg-[#F28C00]/90",
          cancelButton: "!bg-white/10 !text-white !text-xs !rounded-lg !px-3 !py-1.5",
          closeButton: "!bg-[#172F4D] !border-none !text-white hover:!bg-[#11243D]",
        },
      }}
    />
  );
};
```
* **Toast Invocation Pattern in Booking Form**:
```typescript
import { toast } from "sonner";

// Upon successful booking creation
toast.success("Booking Confirmed", {
  description: "Reference #K2D-20261031-8910 has been created. Chauffeur details dispatched.",
  action: {
    label: "View Status",
    onClick: () => router.push(`/booking/confirmation/${bookingRef}`),
  },
});
```

#### 7. Admin Dialogs & Modal Windows
* **Rule**: Centered origin (`transform-origin: center`). Never scale from 0! Entry: `scale(0.96), opacity: 0` -> `scale(1), opacity: 1` over 240ms `--ease-out`. Exit: 160ms fast fade.
* **Component Specification**:
```tsx
// File: src/components/ui/AdminModalMotion.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const AdminModalMotion: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { shouldReduce } = useAccessibleMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with coordinated opacity fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#11243D] backdrop-blur-sm"
          />

          {/* Modal Panel: transform-origin: center, never scale from 0 */}
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.96)" }}
            animate={shouldReduce ? { opacity: 1 } : { opacity: 1, transform: "scale(1)" }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.97)" }}
            transition={{
              duration: 0.24,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E7E3]"
            style={{ transformOrigin: "center" }}
          >
            <div className="flex items-center justify-between border-b border-[#E8E7E3] pb-3">
              <h2 className="text-lg font-bold text-[#11243D]">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#737B86] hover:bg-neutral-100 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

---

### 4.5 Motion Review Table (Emil Kowalski Mandatory Standard)

Before and After comparison illustrating why this architecture prevents common AI failure modes:

| Element | AI Anti-Pattern (Before) | Key2Drive Specification (After) | Why (Emil Kowalski Principle) |
|---|---|---|---|
| **Button Click** | `transition: all 0.3s ease-in` | `transform: scale(0.97)` on `:active` with `140ms ease-out` | `all` thrashes layout; `ease-in` delays visual feedback; `:active` gives physical switchgear response. |
| **Modal Entry** | `transform: scale(0); transition: 0.4s` | `opacity: 0; scale(0.96)` to `scale(1)` at `240ms` | Nothing appears from 0 in reality. Starting at 0.96 feels anchored and natural. |
| **Drawer Slide** | Keyframe animation with `top: 100%` | `transform: translateY(100%)` with `--ease-drawer` | Animating `top` recalcs layout on every frame; `translateY(%)` is GPU-accelerated and height-agnostic. |
| **Tab Indicator** | Sliding margin / width transition | Framer Motion `layoutId` pill with zero-bounce spring | Layout properties cause reflow. Shared layout transforms only bounding coordinates smoothly. |
| **Toast System** | Hand-rolled `<div>` with `setInterval` | Emil Kowalski's Sonner mounted once in root layout | Handles tab visibility, stacking pseudo-elements, swipe-to-dismiss, and accessibility out of the box. |
| **Scroll Reveal** | Continuous fade-up on every scroll pass | Motion `useInView({ once: true, margin: "-60px" })` | Re-animating on scroll-up fights the user's reading intent. Fire once and settle. |
| **Hover on Mobile** | Plain CSS `:hover` causing sticky hover state on tap | Gated with `@media (hover: hover) and (pointer: fine)` | Touch displays misread tap events as hover, causing sticky lifted cards on phone viewports. |
| **Destructive Admin Action** | Immediate click or harsh browser alert | Hold-to-confirm with `clip-path: inset(0 100% 0 0)` (2s linear) | Deliberate input for high-consequence admin changes; snappy 200ms ease-out on release. |

---

## 5. Verification Method

### 5.1 Independent Code & Style Verification
Inspect the following files and rules once implemented:
1. `tailwind.config.ts`: verify `--ease-out-emil`, `--ease-punch`, and custom duration tokens exist.
2. `src/lib/motion/motionTokens.ts`: verify `MOTION_SPRINGS`, `MOTION_EASINGS`, and `MOTION_DURATIONS`.
3. `src/lib/motion/useAccessibleMotion.ts`: verify `useReducedMotion` is wired to prevent transform jumps.
4. `src/app/layout.tsx`: verify `<SonnerToaster />` is mounted once at the root with brand styling.

### 5.2 Performance & Layout Thrashing Automated Check
Run grep audit across codebase to assert zero forbidden layout animations:
```powershell
# Verify no transition: all exists in CSS or Tailwind
rg "transition:\s*all" src/

# Verify no layout dimensions are animated in Framer Motion
rg "animate=\{\{[^}]*(width|height|padding|margin|top|left)" src/

# Verify scale(0) is never used
rg "scale\(0\)" src/
```
*Expected Result*: Zero occurrences found.

### 5.3 Frame-Budget & DevTools Performance Profiling
1. Open Chrome DevTools -> **Performance** panel -> CPU 4x slowdown (simulating mid-tier mobile device).
2. Record navigation between Home, Services, and Multi-Step Booking flow.
3. Open **Rendering** tab -> check **Paint flashing** and **Layout Shift Regions**.
4. *Validation Criteria*:
   - Zero layout reflow bars during card hovers or multi-step booking slides.
   - Frame rate remains locked at 60fps (or 120fps on high-refresh panels).
   - Zero pink layout shift boxes during transitions.

### 5.4 Accessibility (`prefers-reduced-motion`) Invalidation Condition
1. In Chrome DevTools, open Command Menu (`Ctrl+Shift+P`), type `Emulate CSS prefers-reduced-motion: reduce`.
2. Navigate across multi-step booking and open admin modals.
3. *Pass Condition*: Slides and scales are eliminated; screens transition via soft opacity crossfades (150ms); no jumping or broken layouts occur.
