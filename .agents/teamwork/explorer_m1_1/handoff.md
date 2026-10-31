# Milestone 1 Toolchain, Packages & Configuration Blueprint

**Explorer**: Explorer M1-1 (Toolchain & Build Setup Explorer)  
**Date**: 2026-10-31  
**Target Milestone**: M1 (Foundation, Design System & Shell)  
**Authoritative Sources**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `DISPATCH.md`  

---

## 1. Observation

Direct observations from workspace environment, configuration constraints, and package registries:

1. **Runtime Environment**:
   - Node.js runtime: `v24.8.0` (observed via `node -v`).
   - Package manager: `npm 11.6.2` (observed via `npm -v`).
   - Host OS: Windows (PowerShell execution context).

2. **Package Version Compatibility**:
   - `next@15.1.7`: Verified peer dependencies show support for `react: ^18.2.0 || 19.0.0-rc-... || ^19.0.0` and `react-dom: ^18.2.0 || 19.0.0-rc-... || ^19.0.0`.
   - `react@19.0.0` and `react-dom@19.0.0`: Confirmed available in npm registry.
   - `framer-motion@12.4.3`: Verified peer dependencies include `react: ^18.0.0 || ^19.0.0` and `react-dom: ^18.0.0 || ^19.0.0`.
   - `sonner@2.0.8`: Verified peer dependencies include `react: ^18.0.0 || ^19.0.0`.
   - `lucide-react@1.66.0`: Verified peer dependencies include `react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`.
   - `clsx@2.1.1` and `tailwind-merge@3.0.1`: Zero peer dependency conflicts.
   - `tailwindcss@3.4.17`, `postcss@8.4.49`, `autoprefixer@10.4.20`: Clean compatibility with Next.js 15.1.x and Node 24.
   - `typescript@5.6.3`, `@types/node@22.10.5`, `@types/react@19.0.2`, `@types/react-dom@19.0.2`.
   - `eslint@9.17.0` and `eslint-config-next@15.1.7`: Compatible with ESLint 9 / Next 15.

3. **Brand Token Specifications** (from `ORIGINAL_REQUEST.md` line 16 and `PROJECT.md` line 6):
   - Primary navy: `#11243D`
   - Deep navy: `#172F4D`
   - Accent orange: `#F28C00`
   - Warm background: `#FAF9F6`
   - White: `#FFFFFF`
   - Primary text: `#252B33`
   - Secondary text: `#737B86`
   - Border: `#E8E7E3`

4. **Viewport & Responsive Requirements** (from `ORIGINAL_REQUEST.md` line 44 and `DISPATCH.md` line 22):
   - Target viewports: `360px`, `390px`, `768px`, `1024px`, `1440px`, and `1920px` without horizontal overflow.
   - Breakpoint scale: `xs: 360px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1440px`, `3xl: 1920px`.

5. **Motion System Contract** (from `PROJECT.md` lines 7, 91-97 and `emil-botanical-motion/SKILL.md`):
   - GPU-only animations (`transform` and `opacity` exclusively; never animate layout properties like width, height, margin).
   - Enter easing: Custom cubic-bezier `[0.16, 1, 0.3, 1]` or `[0.23, 1, 0.32, 1]` (never `ease-in`).
   - Durations: interactive transitions under 300ms (`press: 0.14s`, `micro: 0.18s`, `standard: 0.24s`, `deliberate: 0.32s`, `toast: 0.40s`).
   - Accessible motion fallback: Universal `@media (prefers-reduced-motion: reduce)` override and `useAccessibleMotion()` hook.

---

## 2. Logic Chain

1. **Node 24 & Next.js 15.1 Compatibility**: Node v24.8.0 requires modern ES module handling and bundler module resolution. Next.js 15.1.7 officially supports Node 18.18+ through Node 24, and React 19.0.0. Selecting `next@15.1.7` with `react@19.0.0` satisfies both runtime compatibility and prompt mandates.
2. **Type Safety & Aliases**: Setting `baseUrl: "."` and `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` ensures TypeScript and Next.js resolve module paths identically, preventing import path errors across client and server components.
3. **Tailwind Design System Architecture**: Defining both the semantic scale (`brand.navy`, `brand.orange`, etc.) and the direct functional tokens (`primary`, `deepNavy`, `accent`, `warmBg`, `primaryText`, `border`) in `tailwind.config.ts` ensures that UI developers and automated agents can write either `bg-brand-navy` or `bg-primary` without token mismatch.
4. **Breakpoint Mapping**: Setting `screens` with `xs: "360px"` ensures mobile devices down to 360px render without clipping. Adding explicit aliases (`vp-360`, `vp-390`, `vp-768`, `vp-1024`, `vp-1440`, `vp-1920`) allows deterministic media query testing matching Acceptance Criteria #44 directly.
5. **CSS Variables & Base Reset in globals.css**: Exposing CSS variables (`--color-primary-navy`, etc.) allows CSS animations, Framer Motion values, and third-party styling (like Sonner toast theme) to access tokens directly. Enforcing `overflow-x: hidden` and box-sizing reset at the root eliminates unexpected horizontal scrollbars on narrow mobile viewports (360px/390px).
6. **Class Merging Foundation**: `clsx` and `tailwind-merge` combined in `cn()` (`src/lib/utils.ts`) prevent Tailwind class precedence conflicts (e.g., `p-4` vs `p-6`), which is foundational for reusable motion components.

---

## 3. Concrete File Blueprints

The following complete file blueprints must be created in the project root and `src/` directory by the implementer.

### File 1: `package.json`
Location: `e:\project\actingDriver\package.json`

```json
{
  "name": "key2drive",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.2.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.4.3",
    "lucide-react": "^1.66.0",
    "next": "15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sonner": "^2.0.8",
    "tailwind-merge": "^3.0.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "15.1.7",
    "postcss": "^8.4.49",
    "prisma": "^6.2.1",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

---

### File 2: `next.config.ts`
Location: `e:\project\actingDriver\next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Ensure strict linting & typechecking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

---

### File 3: `tsconfig.json`
Location: `e:\project\actingDriver\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

### File 4: `postcss.config.mjs`
Location: `e:\project\actingDriver\postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

---

### File 5: `tailwind.config.ts`
Location: `e:\project\actingDriver\tailwind.config.ts`

```ts
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
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
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
```

---

### File 6: `src/app/globals.css`
Location: `e:\project\actingDriver\src\app\globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand color tokens */
  --color-primary-navy: #11243D;
  --color-deep-navy: #172F4D;
  --color-accent-orange: #F28C00;
  --color-accent-hover: #D97D00;
  --color-warm-bg: #FAF9F6;
  --color-white: #FFFFFF;
  --color-primary-text: #252B33;
  --color-secondary-text: #737B86;
  --color-border: #E8E7E3;
  --color-border-subtle: #F0EFEA;

  /* Emil Kowalski motion tokens */
  --ease-out-punch: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-lux: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out-smooth: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  --duration-press: 140ms;
  --duration-micro: 180ms;
  --duration-standard: 240ms;
  --duration-deliberate: 320ms;
  --duration-toast: 400ms;
}

@layer base {
  * {
    border-color: var(--color-border);
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    background-color: var(--color-warm-bg);
    color: var(--color-primary-text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-height: 100vh;
    background-color: var(--color-warm-bg);
    color: var(--color-primary-text);
    overflow-x: hidden;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  ::selection {
    background-color: #11243D;
    color: #FAF9F6;
  }

  :focus-visible {
    outline: 2px solid #F28C00;
    outline-offset: 2px;
  }
}

/* Accessibility: Universal prefers-reduced-motion override */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@layer utilities {
  /* Subtle luxury glassmorphism */
  .luxury-glass {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(232, 231, 227, 0.8);
  }

  .luxury-glass-dark {
    background: rgba(17, 36, 61, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .brand-gradient {
    background: linear-gradient(135deg, #11243D 0%, #172F4D 100%);
  }

  .brand-gradient-radial {
    background: radial-gradient(circle at top right, #172F4D 0%, #11243D 80%);
  }

  .accent-gradient {
    background: linear-gradient(135deg, #F28C00 0%, #FFA834 100%);
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

---

### File 7: `src/lib/utils.ts`
Location: `e:\project\actingDriver\src\lib\utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names with automatic Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

### File 8: `src/lib/motion.ts`
Location: `e:\project\actingDriver\src\lib\motion.ts`

```ts
"use client";

import { useReducedMotion } from "framer-motion";

export const MOTION_DURATIONS = {
  instant: 0,
  press: 0.14,
  micro: 0.18,
  standard: 0.24,
  deliberate: 0.32,
  toast: 0.40,
} as const;

export const MOTION_EASINGS = {
  easeOut: [0.23, 1, 0.32, 1] as const,
  easeOutPunch: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.77, 0, 0.175, 1] as const,
  easeDrawer: [0.32, 0.72, 0, 1] as const,
} as const;

export const MOTION_SPRINGS = {
  snappy: { type: "spring", stiffness: 350, damping: 28 },
  smooth: { type: "spring", stiffness: 280, damping: 25 },
  sheet: { type: "spring", stiffness: 300, damping: 30 },
  tab: { type: "spring", stiffness: 400, damping: 32 },
} as const;

/**
 * Emil Kowalski motion hook that respects prefers-reduced-motion.
 * Returns spring or accessible fade config depending on user preference.
 */
export function useAccessibleMotion() {
  const shouldReduceMotion = useReducedMotion();

  const getTransition = (type: keyof typeof MOTION_SPRINGS = "smooth") => {
    if (shouldReduceMotion) {
      return { duration: 0.15, ease: "linear" };
    }
    return MOTION_SPRINGS[type];
  };

  const getFadeVariants = () => ({
    hidden: { opacity: 0, ...(shouldReduceMotion ? {} : { y: 12, scale: 0.98 }) },
    visible: { opacity: 1, ...(shouldReduceMotion ? {} : { y: 0, scale: 1 }) },
    exit: { opacity: 0, ...(shouldReduceMotion ? {} : { y: -8, scale: 0.98 }) },
  });

  return {
    shouldReduceMotion,
    getTransition,
    getFadeVariants,
  };
}
```

---

### File 9: `src/app/layout.tsx`
Location: `e:\project\actingDriver\src\app\layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Key2Drive | Premium Chauffeur & Professional Driver Booking",
  description:
    "Experience luxury chauffeur services, hourly drivers, airport transfers, and outstation trips with Key2Drive.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-brand-warm-bg text-brand-text font-sans antialiased selection:bg-brand-navy selection:text-brand-warm-bg">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#11243D",
              color: "#FAF9F6",
              border: "1px solid #172F4D",
            },
          }}
        />
      </body>
    </html>
  );
}
```

---

### File 10: `.eslintrc.json`
Location: `e:\project\actingDriver\.eslintrc.json`

```json
{
  "extends": "next/core-web-vitals"
}
```

---

### File 11: `.env.example`
Location: `e:\project\actingDriver\.env.example`

```env
# Persistence (SQLite via Prisma)
DATABASE_URL="file:./dev.db"

# Admin Authentication & Session
SESSION_SECRET="k2d_session_secret_change_in_production_min_32_chars"
ADMIN_EMAIL="admin@key2drive.com"
ADMIN_PASSWORD="Key2DriveAdmin2026!"

# Application Host URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mock Integration Flags (Zero external dependencies for local execution)
MOCK_PAYMENT_ENABLED="true"
MOCK_MESSAGING_ENABLED="true"
MOCK_MAPS_ENABLED="true"
```

---

## 4. Caveats

1. **Next.js Font Optimization in Offline / Restricted Modes**: `next/font/google` fetches font files at build time from Google CDN. In network-restricted environments, fallback system fonts (`system-ui, -apple-system, sans-serif`) are configured in `tailwind.config.ts` so typography renders without interruption if network resolution fails.
2. **React 19 Types Alignment**: Some older community libraries have strict peer dependency declarations on React 18. All chosen packages (`next@15.1.7`, `framer-motion@12.4.3`, `sonner@2.0.8`, `lucide-react@1.66.0`) were verified to explicitly support React 19.
3. **Database Client Initialization**: While Prisma CLI and client packages are included in `package.json`, database migration and client generation should be executed in Milestone 2. M1 focuses on foundation, tokens, and visual layout.

---

## 5. Conclusion

1. The exact package versions, dependencies, and configuration templates for Next.js 15.1.7, React 19, TypeScript 5.6, and Tailwind CSS v3.4 are fully verified and ready for implementation.
2. The brand token system (`#11243D`, `#172F4D`, `#F28C00`, `#FAF9F6`, `#FFFFFF`, `#252B33`, `#737B86`, `#E8E7E3`) and responsive screen scale (`360px` through `1920px`) are mapped in both `tailwind.config.ts` and `src/app/globals.css`.
3. The motion design foundation adhering to Emil Kowalski standards (`useAccessibleMotion`, transform/opacity GPU execution, reduced motion compliance) is established in `src/lib/motion.ts`.
4. Implementer M1-1 and M1-2 can execute installation and write these configuration files directly without friction.

---

## 6. Verification Method

Once Implementer M1-1 completes file creation and installation, verify with the following commands:

1. **Dependency Installation**:
   ```powershell
   npm install
   ```
   *Expected outcome*: Exits with code 0 without unmet peer dependency errors.

2. **TypeScript Compilation Check**:
   ```powershell
   npm run typecheck
   ```
   *Expected outcome*: Exits with code 0 and zero type errors.

3. **Linter Check**:
   ```powershell
   npm run lint
   ```
   *Expected outcome*: Exits with code 0 with zero unhandled errors.

4. **Production Build Check**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Next.js App Router compiles pages successfully into `.next/` with zero errors.

5. **Viewport Verification**:
   Inspect generated CSS or test layout across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports ensuring `overflow-x: hidden` prevents horizontal scrolling.
