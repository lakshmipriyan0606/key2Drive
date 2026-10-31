import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        xs: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
        "2xl": "3.5rem",
        "3xl": "4rem",
      },
      screens: {
        xs: "100%",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1800px",
      },
    },
    screens: {
      // Core responsive breakpoints covering 360px to 1920px
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
      // Dedicated viewport targets for Acceptance Criteria
      "vp-360": "360px",
      "vp-390": "390px",
      "vp-768": "768px",
      "vp-1024": "1024px",
      "vp-1440": "1440px",
      "vp-1920": "1920px",
    },
    extend: {
      colors: {
        // Authoritative Brand Token Palette
        brand: {
          navy: "#11243D",          // Primary navy
          "navy-deep": "#172F4D",   // Deep navy
          orange: "#F28C00",        // Accent orange
          "orange-hover": "#D97D00",// Darker orange for hover states
          "orange-light": "#FFF4E5",// Soft tinted container
          "warm-bg": "#FAF9F6",     // Warm background
          white: "#FFFFFF",         // Pure white
          text: "#252B33",          // Primary dark text
          "text-muted": "#737B86",  // Secondary text
          border: "#E8E7E3",        // Neutral border
        },
        // Semantic aliases
        primary: {
          DEFAULT: "#11243D",
          deep: "#172F4D",
          hover: "#0D1C30",
          50: "#F0F4F8",
          100: "#D9E3ED",
          200: "#B3C7DC",
          300: "#8DABCB",
          400: "#4D7DA7",
          500: "#172F4D",
          600: "#11243D",
          700: "#0E1D31",
          800: "#0A1523",
          900: "#060D16",
        },
        deepNavy: {
          DEFAULT: "#172F4D",
          light: "#21426B",
          dark: "#0F1F33",
        },
        accent: {
          DEFAULT: "#F28C00",
          hover: "#D97D00",
          light: "#FFF4E5",
          muted: "#F7B252",
        },
        warmBg: "#FAF9F6",
        primaryText: "#252B33",
        secondaryText: "#737B86",
        border: "#E8E7E3",
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#FAF9F6",
          dark: "#11243D",
          card: "#FFFFFF",
          muted: "#F3F2EF",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        heading: [
          "var(--font-manrope)",
          "Manrope",
          "var(--font-inter)",
          "sans-serif",
        ],
        display: [
          "var(--font-manrope)",
          "Manrope",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Cinzel",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
      },
      transitionTimingFunction: {
        "ease-out-punch": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-lux": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-in-out-smooth": "cubic-bezier(0.77, 0, 0.175, 1)",
        "ease-drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        press: "140ms",
        micro: "180ms",
        standard: "240ms",
        deliberate: "320ms",
        toast: "400ms",
      },
      boxShadow: {
        "luxury-sm": "0 2px 8px -2px rgba(17, 36, 61, 0.05), 0 1px 4px -1px rgba(17, 36, 61, 0.03)",
        "luxury-md": "0 12px 24px -6px rgba(17, 36, 61, 0.08), 0 4px 12px -2px rgba(17, 36, 61, 0.04)",
        "luxury-lg": "0 24px 48px -12px rgba(17, 36, 61, 0.12), 0 8px 16px -4px rgba(17, 36, 61, 0.06)",
        "luxury-xl": "0 32px 64px -16px rgba(17, 36, 61, 0.16), 0 16px 32px -8px rgba(17, 36, 61, 0.08)",
        "accent-glow": "0 0 24px 2px rgba(242, 140, 0, 0.35)",
      },
      borderRadius: {
        luxury: "1rem",
        card: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
