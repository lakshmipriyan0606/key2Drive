import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "dark" | "light" | "white";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function BrandLogo({
  variant = "dark",
  size = "md",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const isLight = variant === "light" || variant === "white";

  const sizeStyles = {
    sm: {
      icon: "w-7 h-7",
      title: "text-sm sm:text-base tracking-tight",
      subtitle: "text-[7px] sm:text-[8px] tracking-[0.18em]",
    },
    md: {
      icon: "w-8 h-8 sm:w-9 sm:h-9",
      title: "text-base sm:text-lg tracking-tight",
      subtitle: "text-[7.5px] sm:text-[9px] tracking-[0.16em] sm:tracking-[0.22em]",
    },
    lg: {
      icon: "w-10 h-10 sm:w-11 sm:h-11",
      title: "text-xl sm:text-2xl tracking-tight",
      subtitle: "text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em]",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-2 sm:gap-2.5 group ${className}`}>
      {/* Automotive emblem with gold-orange swoosh */}
      <div className={`relative ${sizeStyles.icon} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        >
          {/* Outer circle accent */}
          <circle cx="20" cy="20" r="19" stroke="#F28C00" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Inner dark shield */}
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#11243D" />
          {/* Stylized sports car aerodynamic curves */}
          <path
            d="M9 25C13 25 15 22 17 19C19 16 23 15 27 15C30 15 32 17 33 19L31 23H9V25Z"
            fill="#F28C00"
          />
          <path
            d="M13 22C15 22 17 20 18.5 18C20 16 23 15.5 26 15.5"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Wheel hubs */}
          <circle cx="14" cy="24" r="2.5" fill="#11243D" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="26" cy="24" r="2.5" fill="#11243D" stroke="#FFFFFF" strokeWidth="1" />
          {/* Speed swoosh */}
          <path
            d="M7 21C11 21 13 18 16 16C18 14 22 13.5 25 13.5"
            stroke="#F28C00"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span
            className={`font-black uppercase font-heading ${sizeStyles.title} ${
              isLight ? "text-white" : "text-brand-navy"
            }`}
          >
            KEY<span className="text-brand-orange">2</span>DRIVE
          </span>
        </div>
        <span
          className={`font-bold uppercase font-sans mt-1 ${sizeStyles.subtitle} ${
            isLight ? "text-white/60" : "text-secondary-text"
          }`}
        >
          ACTING DRIVER SERVICES
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Key2Drive Home"
        className="focus:outline-none focus:ring-2 focus:ring-brand-orange rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
