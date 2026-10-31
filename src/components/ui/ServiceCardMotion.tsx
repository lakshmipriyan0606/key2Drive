"use client";

/**
 * Key2Drive Service & Tariff Card Motion Component
 * Path: src/components/ui/ServiceCardMotion.tsx
 */

import React from "react";
import { motion } from "framer-motion";
import { useAccessibleMotion } from "@/lib/motion/useAccessibleMotion";
import { MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion/motionTokens";

export interface ServiceCardMotionProps {
  title: string;
  tagline?: string;
  price: string;
  priceUnit?: string;
  description: string;
  features?: string[];
  badge?: string;
  ctaText?: string;
  onSelect?: () => void;
  className?: string;
  isPopular?: boolean;
}

export const ServiceCardMotion: React.FC<ServiceCardMotionProps> = ({
  title,
  tagline,
  price,
  priceUnit = "base tariff",
  description,
  features = [],
  badge,
  ctaText = "Select Service",
  onSelect,
  className = "",
  isPopular = false,
}) => {
  const { shouldReduce } = useAccessibleMotion();

  return (
    <motion.div
      whileHover={shouldReduce ? undefined : { y: -4 }}
      transition={{
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      }}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white p-7 border border-[#E8E7E3] shadow-sm hover:shadow-xl transition-shadow duration-200 ${
        isPopular ? "ring-2 ring-[#F28C00]/40" : ""
      } ${className}`}
      style={{ willChange: "transform" }}
    >
      {/* GPU-accelerated border highlight overlay (avoids layout thrashing of direct border-color) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#F28C00] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-hidden="true"
      />

      <div>
        {/* Top Header: Title & Badges */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#11243D]">{title}</h3>
            {tagline && <p className="mt-1 text-xs font-medium text-[#737B86]">{tagline}</p>}
          </div>
          {(badge || isPopular) && (
            <span className="inline-flex items-center rounded-full bg-[#F28C00]/10 px-3 py-1 text-xs font-semibold text-[#F28C00]">
              {badge || "Recommended"}
            </span>
          )}
        </div>

        {/* Pricing Matrix */}
        <div className="mt-5 border-y border-[#E8E7E3]/60 py-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-[#11243D]">{price}</span>
            <span className="text-xs font-medium text-[#737B86]">/ {priceUnit}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-[#737B86]">{description}</p>

        {/* Features Checklist */}
        {features.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-xs text-[#252B33]">
                <span
                  className="mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#11243D]/5 text-[#F28C00]"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-7 pt-4">
        <button
          type="button"
          onClick={onSelect}
          className="relative inline-flex w-full items-center justify-center rounded-xl bg-[#FAF9F6] px-5 py-3 text-sm font-semibold text-[#11243D] border border-[#E8E7E3] group-hover:bg-[#11243D] group-hover:text-white group-hover:border-[#11243D] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C00]"
        >
          {ctaText}
        </button>
      </div>
    </motion.div>
  );
};

export default ServiceCardMotion;
