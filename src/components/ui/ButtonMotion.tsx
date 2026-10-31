"use client";

/**
 * Key2Drive Tactile Press Button Component
 * Path: src/components/ui/ButtonMotion.tsx
 */

import React, { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import { MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion/motionTokens";

export type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonMotionProps
  extends Omit<HTMLMotionProps<"button">, "children" | "whileTap"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#11243D] text-white hover:bg-[#172F4D] active:bg-[#0c1a2c] focus-visible:ring-[#F28C00] shadow-sm",
  accent:
    "bg-[#F28C00] text-white hover:bg-[#d97d00] active:bg-[#bf6d00] focus-visible:ring-[#11243D] shadow-sm",
  secondary:
    "bg-[#FAF9F6] text-[#11243D] border border-[#E8E7E3] hover:bg-[#f0eee8] active:bg-[#e4e2dc] focus-visible:ring-[#11243D]",
  outline:
    "bg-transparent text-[#11243D] border-2 border-[#11243D] hover:bg-[#11243D]/5 active:bg-[#11243D]/10 focus-visible:ring-[#F28C00]",
  ghost:
    "bg-transparent text-[#252B33] hover:bg-black/5 active:bg-black/10 focus-visible:ring-[#11243D]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs rounded-md gap-1.5 min-h-[36px]",
  md: "h-11 px-5 text-sm font-medium rounded-lg gap-2 min-h-[44px]", // 44px touch target compliance
  lg: "h-13 px-7 text-base font-semibold rounded-xl gap-2.5 min-h-[48px]",
};

export const ButtonMotion = forwardRef<HTMLButtonElement, ButtonMotionProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const { shouldReduce } = useAccessibleMotion();

    const isInteractive = !disabled && !isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={!isInteractive}
        whileTap={isInteractive && !shouldReduce ? { scale: 0.97 } : undefined}
        transition={{
          duration: MOTION_DURATIONS.press,
          ease: MOTION_EASINGS.easeOut,
        }}
        className={`relative inline-flex items-center justify-center select-none font-sans transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        style={{ willChange: "transform" }}
        {...props}
      >
        {isLoading && (
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

ButtonMotion.displayName = "ButtonMotion";

export default ButtonMotion;
