"use client";

/**
 * Key2Drive Universal Accessible Motion Hook
 * Respects user OS prefers-reduced-motion preferences while preserving state clarity.
 * Path: src/lib/motion/useAccessibleMotion.ts
 */

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

export interface AccessibleMotionResult {
  /** True if the user has enabled reduced motion at the OS/browser level */
  shouldReduce: boolean;
  /** Raw value from framer-motion (may be null during initial hydration) */
  prefersReduced: boolean | null;
  /** Gentle 150ms opacity transition for accessible fallbacks */
  fallbackTransition: Transition;
  /** Wraps a standard transition; falls back to soft opacity fade when reduced motion is preferred */
  accessibleTransition: (standard: Transition) => Transition;
  /** Returns the specified transform string if motion allowed, or 'none' if reduced */
  transformOrNone: (transformValue: string) => string;
  /** Filters translation/scale keys from a Variants object, leaving opacity and color transitions */
  filterAccessibleVariants: (variants: Variants) => Variants;
  /** Ternary helper to select between standard and reduced values */
  withReduced: <T>(standard: T, reduced: T) => T;
}

export function useAccessibleMotion(): AccessibleMotionResult {
  const prefersReduced = useReducedMotion();
  const shouldReduce = Boolean(prefersReduced);

  const fallbackTransition: Transition = {
    duration: 0.15,
    ease: "linear",
  };

  const accessibleTransition = (standard: Transition): Transition => {
    return shouldReduce ? fallbackTransition : standard;
  };

  const transformOrNone = (transformValue: string): string => {
    return shouldReduce ? "none" : transformValue;
  };

  const filterAccessibleVariants = (variants: Variants): Variants => {
    if (!shouldReduce) return variants;

    const accessible: Variants = {};
    for (const [variantKey, definition] of Object.entries(variants)) {
      if (typeof definition === "object" && definition !== null) {
        // Strip out spatial and scale transforms
        const {
          x,
          y,
          z,
          scale,
          scaleX,
          scaleY,
          rotate,
          rotateX,
          rotateY,
          rotateZ,
          transform,
          ...rest
        } = definition as Record<string, unknown>;

        accessible[variantKey] = {
          ...rest,
          transition: fallbackTransition,
        };
      } else {
        accessible[variantKey] = definition;
      }
    }
    return accessible;
  };

  const withReduced = <T>(standard: T, reduced: T): T => {
    return shouldReduce ? reduced : standard;
  };

  return {
    shouldReduce,
    prefersReduced,
    fallbackTransition,
    accessibleTransition,
    transformOrNone,
    filterAccessibleVariants,
    withReduced,
  };
}

/**
 * Standard Reduced-Motion Fade Variants
 */
export const accessibleFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: "linear" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "linear" } },
};
