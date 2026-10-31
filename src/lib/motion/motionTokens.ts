/**
 * Key2Drive Motion Design System Tokens
 * Source of Truth for Emil Kowalski Animation Standards
 * Path: src/lib/motion/motionTokens.ts
 */

import type { Transition } from "framer-motion";

/**
 * Emil Kowalski Duration Scale (in seconds)
 * Strict duration budget: Interactive UI actions must complete under 300ms.
 */
export const MOTION_DURATIONS = {
  instant: 0, // 0ms - Keyboard shortcuts, command palettes, instant table refreshes
  press: 0.14, // 140ms - Tactile button press / touch-down switchgear response
  micro: 0.18, // 180ms - Badge counts, status pills, small toggles, tooltips
  standard: 0.24, // 240ms - Card lifts, popovers, accordions, tab indicator slides
  deliberate: 0.32, // 320ms - Modal dialogs, multi-step booking wizard slides, drawer sheets
  toast: 0.4, // 400ms - Sonner toast notifications (graceful arrival)
  longPress: 1.8, // 1800ms - Hold-to-confirm destructive admin actions (linear fill)
} as const;

/**
 * Custom Cubic-Bézier Curves
 * Hard rule: Never use default browser easings or ease-in for entering elements.
 */
export const MOTION_EASINGS = {
  // Primary entrance easing: Starts fast, lands gently and reassuringly
  easeOut: [0.23, 1, 0.32, 1] as const,
  easeOutCss: "cubic-bezier(0.23, 1, 0.32, 1)",

  // Botanical / high-polish entrance variant (ultra-snappy initial frame)
  easeOutPunch: [0.16, 1, 0.3, 1] as const,
  easeOutPunchCss: "cubic-bezier(0.16, 1, 0.3, 1)",

  // Symmetrical ease-in-out for elements traversing viewport (tabs, horizontal carousels)
  easeInOut: [0.77, 0, 0.175, 1] as const,
  easeInOutCss: "cubic-bezier(0.77, 0, 0.175, 1)",

  // iOS-style sheet / drawer slide easing
  easeDrawer: [0.32, 0.72, 0, 1] as const,
  easeDrawerCss: "cubic-bezier(0.32, 0.72, 0, 1)",

  // Linear progression strictly for hold-to-confirm progress fills
  linear: [0, 0, 1, 1] as const,
  linearCss: "linear",
} as const;

/**
 * Framer Motion Spring Presets
 * Critically damped physics tailored for luxury automotive switchgear.
 */
export const MOTION_SPRINGS = {
  // Snappy: Tactile buttons, badge counters, micro toggles (critically damped, zero bounce)
  snappy: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,

  // Smooth: Modal dialogs, card elevations, popovers, dropdown menus
  smooth: {
    type: "spring",
    stiffness: 280,
    damping: 26,
    mass: 1.0,
  } satisfies Transition,

  // Sheet: Mobile booking drawer, slide-over sheets
  sheet: {
    type: "spring",
    stiffness: 220,
    damping: 28,
    mass: 1.0,
  } satisfies Transition,

  // Tab: Active tab pill indicators (shared layoutId, fast and smooth, no overshoot)
  tab: {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.9,
  } satisfies Transition,

  // Apple-style critically damped alternative
  appleCriticallyDamped: {
    type: "spring",
    duration: 0.38,
    bounce: 0,
  } satisfies Transition,

  // Apple momentum spring for drag gestures
  appleMomentum: {
    type: "spring",
    duration: 0.45,
    bounce: 0.12,
  } satisfies Transition,
} as const;

/**
 * Standard Pre-composed Transitions
 */
export const TRANSITIONS = {
  buttonPress: {
    duration: MOTION_DURATIONS.press,
    ease: MOTION_EASINGS.easeOut,
  } satisfies Transition,

  cardHover: {
    duration: MOTION_DURATIONS.standard,
    ease: MOTION_EASINGS.easeOut,
  } satisfies Transition,

  modalEntry: {
    duration: MOTION_DURATIONS.deliberate,
    ease: MOTION_EASINGS.easeOutPunch,
  } satisfies Transition,

  reducedFade: {
    duration: 0.15,
    ease: "linear",
  } satisfies Transition,
} as const;
