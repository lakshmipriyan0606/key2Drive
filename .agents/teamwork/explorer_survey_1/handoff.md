# Architecture & Full-Stack Infrastructure Handoff Report

**Agent**: Explorer Survey 1 (`explorer_survey_1`)  
**Mission**: Investigate workspace environment, evaluate toolchains and libraries, and formulate the production-grade technical architecture for Key2Drive.  
**Date**: 2026-10-31  

---

## 1. Observations

### 1.1 Workspace State
- File inspection of root workspace `e:\project\actingDriver`:
  - Contains only `.agents/` directory containing teamwork metadata.
  - Zero existing source files, `package.json`, or lockfiles.
  - Greenfield development workspace.

### 1.2 System Environment & Toolchains
Directly executed system checks via PowerShell:
- **Operating System**: Windows (win32 x64)
- **Node.js**: `v24.8.0` (Confirmed via `node -v`)
- **Package Managers**:
  - `npm`: `11.6.2` (Confirmed via `npm -v`)
  - `pnpm`: `10.28.1` (Confirmed via `pnpm -v`)
  - `yarn`: `4.11.0` (Confirmed via `yarn -v`)
  - `bun`: `1.3.9` (Confirmed via `bun -v`)
- **Git Version**: `2.51.0.windows.1` (Confirmed via `git --version`)

### 1.3 Library & Runtime Compatibility Checks
- **Native Add-on & SQLite Compatibility on Node v24.8.0 (win32 x64)**:
  - Tested installation of `better-sqlite3`: Installed in 2 seconds, compiled/linked cleanly, verified with `SELECT 1 as val` returning `{ val: 1 }`.
  - Tested installation of `prisma` and `@prisma/client`: Installed cleanly with zero errors on Node 24.
- **Peer Dependency Compatibility**:
  - `framer-motion`: Peer dependencies accept `react: '^18.0.0 || ^19.0.0'`.
  - `motion`: Peer dependencies accept `react: '^18.0.0 || ^19.0.0'`.
  - `lucide-react`: Peer dependencies accept `react: '^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0'`.
  - `sonner`: Peer dependencies accept `react: '^18.0.0 || ^19.0.0 || ^19.0.0-rc'`.

### 1.4 Authoritative Requirements & Brand Palette
From `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md`:
- **Brand Colors**:
  - Primary navy: `#11243D`
  - Deep navy: `#172F4D`
  - Accent orange: `#F28C00`
  - Warm background: `#FAF9F6`
  - White: `#FFFFFF`
  - Primary text: `#252B33`
  - Secondary text: `#737B86`
  - Border: `#E8E7E3`
- **Emil Kowalski Motion Skills**: Transform and opacity only, no layout thrashing, cubic-bezier(0.16, 1, 0.3, 1), interactive durations < 300ms, scale starts at 0.94-0.97, full support for `prefers-reduced-motion`.
- **Database & Persistence**: Real local persistent storage (SQLite) via Prisma or Drizzle for users, bookings, services, pricing, and enquiries with server-side validation (Zod).
- **Test Infra**: Automated test suite from scratch covering unit, integration, and end-to-end workflows (with responsive breakpoints: 360px, 390px, 768px, 1024px, 1440px, 1920px).

---

## 2. Logic Chain

1. **Workspace Greenfield Status (Observation 1.1)**:
   Because the workspace has no pre-existing legacy code, we have the freedom to establish a clean, modern Next.js App Router project structure with TypeScript, ensuring modular separation of concerns from day one.

2. **Toolchain & Runtime Suitability (Observation 1.2 & 1.3)**:
   Node.js v24.8.0 and npm 11.6.2/pnpm 10.28.1 are modern and stable. Both Prisma and SQLite drivers function without friction on Windows x64.
   - Next.js 15 (or 14.2+) App Router with TypeScript is recommended.
   - React 19 is fully supported by `framer-motion`, `lucide-react`, and `sonner`.

3. **Database Layer Selection (Prisma vs Drizzle)**:
   - *Requirement*: Real local persistent storage for users, bookings, services, pricing, enquiries, and notes with relational integrity and server-side validation.
   - *Reasoning*: Prisma provides a unified declarative schema (`schema.prisma`), zero-configuration SQLite provider (`file:./dev.db`), automated type-safe client generation, built-in migration tracking (`prisma db push` / `prisma migrate`), relation joins (`include`), and straightforward seeding (`prisma/seed.ts`). This maximizes reliability, prevents SQL injection, and eliminates boilerplate for complex relational queries.

4. **Styling & Brand Tokens (Observation 1.4)**:
   - Tailwind CSS v3.4 configured with custom semantic color tokens mapping 1:1 to the brand palette ensures design consistency across all pages and components.
   - Setting `#FAF9F6` as the default body background immediately establishes the warm, luxury editorial aesthetic requested in the prompt.
   - CSS variables in `globals.css` provide smooth contrast and dark/light accents for cards (`#FFFFFF`, `#172F4D`) and callouts (`#F28C00`).

5. **Motion System Design (Observation 1.4 & SKILL.md)**:
   - Emil Kowalski guidelines dictate high performance (transform & opacity only, GPU accelerated), entrance curve `cubic-bezier(0.16, 1, 0.3, 1)`, snappy durations (<300ms), and spring physics (damping 24-30, stiffness 280-350).
   - Reusable motion components (`FadeIn`, `ScalePress`, `StaggerContainer`, `SheetTransition`) and toast notifications via `sonner` guarantee high visual polish without performance degradation.
   - An accessibility hook/check (`prefers-reduced-motion`) must disable transitions when enabled by user OS preferences.

6. **Testing Architecture**:
   - Fast unit & integration tests via **Vitest** + **React Testing Library** + `@testing-library/jest-dom` for schemas, calculations, state machine transitions, and API routes.
   - End-to-end browser automation via **Playwright** covering customer booking flows and admin management across all 6 required viewport widths (360px, 390px, 768px, 1024px, 1440px, 1920px), verifying zero horizontal overflow.

---

## 3. Recommended Architecture Specification

### 3.1 Technology Stack Matrix

| Layer | Selected Technology | Version / Spec | Justification |
|---|---|---|---|
| **Runtime** | Node.js | v24.8.0 (win32 x64) | Existing workspace runtime |
| **Framework** | Next.js App Router | 15.1.x / 14.2.x | Modern React Server Components, Server Actions, streaming, and nested layouts |
| **Language** | TypeScript | ^5.6.x | Strict type safety across database, API contracts, and UI components |
| **Styling** | Tailwind CSS + Tailwind Merge | ^3.4.x | Fast, zero-runtime CSS utility engine, custom brand design tokens |
| **Icons & UI** | Lucide React + Sonner | ^0.460.x / ^1.7.x | Featherweight luxury iconography, polished toast notifications |
| **Animations** | Framer Motion / Motion | ^11.11.x | Emil Kowalski motion standard: springs, gestures, layout animations |
| **Database** | SQLite (`dev.db`) | 3.x embedded | Real zero-config local persistence without requiring external database servers |
| **ORM** | Prisma ORM | ^6.0.x / ^5.22.x | Declarative relational schema, automatic TypeScript types, migration tooling |
| **Validation** | Zod | ^3.23.x | Single source of truth for runtime validation on both client and server |
| **Form Handling**| React Hook Form + @hookform/resolvers | ^7.53.x | Performant uncontrolled forms with instant Zod schema validation |
| **Unit/Integration Test**| Vitest + React Testing Library | ^2.1.x | Lightning-fast ESM test runner, DOM assertions, API route mocking |
| **E2E Test** | Playwright | ^1.48.x | Multi-viewport cross-browser testing across 360px - 1920px screens |

---

### 3.2 Design Tokens & Tailwind Configuration

#### A. Brand Palette Definition
```typescript
// tailwind.config.ts brand tokens
export const brandColors = {
  navy: {
    primary: '#11243D', // Primary headers, dark backgrounds, navigation
    deep: '#172F4D',    // Dark cards, elevated dark surfaces, footer
    light: '#1D3B61',   // Interactive hover for navy elements
  },
  accent: {
    DEFAULT: '#F28C00', // Primary CTA buttons, highlight badges, accents
    hover: '#D97D00',   // Darker hover state
    light: '#FFF4E5',   // Subtle accent background tint
  },
  surface: {
    warm: '#FAF9F6',    // Default page background (warm editorial tone)
    white: '#FFFFFF',   // Card surfaces, dialog backgrounds
    muted: '#F3F2EE',   // Input backgrounds, table headers
  },
  text: {
    primary: '#252B33',   // High contrast headings and body text
    secondary: '#737B86', // Subtitles, metadata, form labels
    muted: '#9DA4AE',     // Placeholder text, disabled labels
    inverse: '#FFFFFF',   // Text on dark navy backgrounds
  },
  border: {
    DEFAULT: '#E8E7E3', // Subtle warm dividing lines and input borders
    dark: '#CBD0D6',    // High-emphasis borders
  },
  status: {
    requested: '#3B82F6', // Blue
    confirmed: '#10B981', // Green
    rejected: '#EF4444',  // Red
    cancelled: '#6B7280', // Gray
    completed: '#8B5CF6', // Purple
  }
};
```

#### B. Tailwind Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        brand: {
          navy: '#11243D',
          deep: '#172F4D',
          accent: '#F28C00',
          'accent-hover': '#D97D00',
          warm: '#FAF9F6',
          white: '#FFFFFF',
          text: '#252B33',
          muted: '#737B86',
          border: '#E8E7E3',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'serif'],
      },
      transitionTimingFunction: {
        'emil-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'emil-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(17, 36, 61, 0.05), 0 2px 6px -1px rgba(17, 36, 61, 0.03)',
        'luxury-hover': '0 12px 30px -4px rgba(17, 36, 61, 0.10), 0 4px 12px -2px rgba(17, 36, 61, 0.05)',
        'modal': '0 24px 48px -12px rgba(17, 36, 61, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
```

#### C. CSS Variables & Global Styling (`src/app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #FAF9F6;
  --foreground: #252B33;
  --card: #FFFFFF;
  --card-foreground: #252B33;
  --primary: #11243D;
  --primary-foreground: #FFFFFF;
  --accent: #F28C00;
  --accent-foreground: #FFFFFF;
  --muted: #737B86;
  --border: #E8E7E3;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Emil Kowalski Animation Utilities */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 3.3 Emil Kowalski Motion System Architecture

To conform strictly to the motion design rules in `C:\Users\LAKSHMI\.gemini\config\skills\emil-botanical-motion\SKILL.md`:
1. **Spring Configurations**:
   ```typescript
   export const springPhysics = {
     interactive: { type: "spring", stiffness: 320, damping: 28 },
     gentle: { type: "spring", stiffness: 220, damping: 26 },
     quick: { type: "spring", stiffness: 400, damping: 32 },
   };
   ```
2. **Transition Standards**:
   - `ease`: `[0.16, 1, 0.3, 1]` (custom cubic bezier for all entrances)
   - Duration: Maximum `0.28s` (under the 300ms budget)
   - Scale animations start at `0.95` or `0.97`, never `0`
   - Active press tactile feedback: `active:scale-[0.97]` or `whileTap={{ scale: 0.96 }}`
   - Animate only `opacity` and `transform` (`scale`, `y`, `x`)

---

### 3.4 Database Schema Architecture (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum BookingStatus {
  REQUESTED
  CONFIRMED
  REJECTED
  CANCELLED
  COMPLETED
}

enum AdminRole {
  ADMIN
  SUPERADMIN
}

enum EnquiryStatus {
  NEW
  IN_REVIEW
  RESOLVED
}

model User {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String
  name         String
  role         AdminRole   @default(ADMIN)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  sessions     Session[]
  notes        AdminNote[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Service {
  id          String    @id @default(cuid())
  slug        String    @unique // e.g. "hourly-driver", "full-day-driver", "airport-transfer"
  title       String
  tagline     String
  description String
  features    String    // JSON stringified array of feature bullets
  imageUrl    String?
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  basePrice   Float     // Display base price
  priceUnit   String    // e.g. "per 4 hrs", "per day", "flat rate"
  tariffs     Tariff[]
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Tariff {
  id                    String   @id @default(cuid())
  serviceId             String
  service               Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  title                 String   // e.g. "4 Hours / 40 km", "Airport Pickup Standard"
  vehicleCategory       String   // e.g. "Sedan", "SUV", "Luxury"
  minDurationHours      Float?
  includedKm            Int?
  baseRate              Float
  extraHourRate         Float
  extraKmRate           Float
  nightChargeRate       Float    // Charge between 10:00 PM and 06:00 AM
  waitingChargePerMin   Float    @default(0.0)
  isUnconfirmed         Boolean  @default(false) // Flag unconfirmed rates for client review
  unconfirmedNote       String?  // Clarification on unconfirmed items
  cancellationPolicy    String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Booking {
  id                  String        @id @default(cuid())
  reference           String        @unique // e.g. "K2D-2026-8941"
  status              BookingStatus @default(REQUESTED)
  customerName        String
  customerPhone       String
  customerEmail       String
  serviceId           String
  service             Service       @relation(fields: [serviceId], references: [id])
  serviceType         String        // Denormalized snapshot title
  pickupAddress       String
  dropAddress         String?
  pickupDateTime      DateTime
  duration            String        // Selected package / duration label
  vehicleInfo         String        // Selected vehicle model/class
  specialInstructions String?
  estimatedAmount     Float
  finalAmount         Float?
  submissionHash      String?       // Deduplication idempotency key
  clientIp            String?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  notes               AdminNote[]

  @@index([status])
  @@index([reference])
  @@index([createdAt])
}

model Enquiry {
  id         String        @id @default(cuid())
  name       String
  phone      String
  email      String
  subject    String
  message    String
  status     EnquiryStatus @default(NEW)
  isResolved Boolean       @default(false)
  clientIp   String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  notes      AdminNote[]

  @@index([status])
}

model AdminNote {
  id         String    @id @default(cuid())
  content    String
  authorId   String
  author     User      @relation(fields: [authorId], references: [id])
  bookingId  String?
  booking    Booking?  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  enquiryId  String?
  enquiry    Enquiry?  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())
}
```

---

### 3.5 Booking Lifecycle State Machine

The booking lifecycle transitions must be validated on every update:

```
                  ┌──────────────┐
                  │  REQUESTED   │
                  └──────┬───────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    ┌─────────────┐             ┌─────────────┐
    │  CONFIRMED  │             │  REJECTED   │
    └──────┬──────┘             └─────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌───────────┐
│CANCELLED│ │ COMPLETED │
└─────────┘ └───────────┘
```

- **Valid Transitions**:
  - `REQUESTED` -> `CONFIRMED`
  - `REQUESTED` -> `REJECTED`
  - `REQUESTED` -> `CANCELLED`
  - `CONFIRMED` -> `COMPLETED`
  - `CONFIRMED` -> `CANCELLED`
- **Invalid / Terminal Transitions**:
  - `REJECTED` is terminal (cannot transition).
  - `CANCELLED` is terminal.
  - `COMPLETED` is terminal.
- Server validation enforces that illegal status transitions return HTTP 422 Unprocessable Entity.

---

### 3.6 Authentication & Admin Protection Architecture

1. **Session Cookie**:
   - Cookie name: `k2d_admin_session`
   - Attributes: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800` (7 days)
2. **Password Hashing**:
   - Utilizes `bcryptjs` (compatible with all Node environments) or native `crypto.scryptSync`.
3. **Route Guard Middleware (`src/middleware.ts`)**:
   - Intercepts all requests matching `/admin/:path*` (except `/admin/login`).
   - Checks presence and validity of session cookie.
   - If invalid or expired, issues redirect to `/admin/login?returnUrl=...`.
4. **Server Component & Action Session Helper (`src/lib/auth.ts`)**:
   - `getAdminSession()` checks session from `cookies()` and verifies against SQLite database.

---

### 3.7 Form Validation Schemas (Zod)

- **Booking Creation Schema (`src/lib/validations/booking.ts`)**:
  - `customerName`: min 2 chars, max 60 chars.
  - `customerPhone`: Indian mobile format regex `/^[6-9]\d{9}$/` or international format `^\+?[1-9]\d{7,14}$`.
  - `customerEmail`: valid email string.
  - `serviceId`: required cuid string.
  - `pickupAddress`: min 5 chars, required.
  - `dropAddress`: optional for hourly/local, required for outstation/airport drop.
  - `pickupDateTime`: ISO date string, must be at least 30 minutes in the future.
  - `duration`: required duration package identifier.
  - `vehicleInfo`: required vehicle category.
  - `specialInstructions`: max 500 characters, optional.
  - `submissionToken`: client-generated idempotency string to prevent double submission clicks.
- **Enquiry Creation Schema (`src/lib/validations/enquiry.ts`)**:
  - `name`: min 2 chars.
  - `phone`: valid mobile number.
  - `email`: valid email address.
  - `subject`: min 3 chars, max 100 chars.
  - `message`: min 10 chars, max 1000 chars.
- **Price Management Schema (`src/lib/validations/pricing.ts`)**:
  - `baseRate`: positive number.
  - `extraHourRate`: non-negative number.
  - `extraKmRate`: non-negative number.
  - `nightChargeRate`: non-negative number.
  - `waitingChargePerMin`: non-negative number.
  - `isUnconfirmed`: boolean flag.

---

### 3.8 Third-Party Mock Boundaries & Environment Variables

All external integrations must be cleanly isolated in `src/lib/integrations/`:
1. **Messaging Service (`src/lib/integrations/messaging.ts`)**:
   - Interface:
     ```typescript
     export interface MessagingService {
       sendBookingConfirmation(phone: string, bookingRef: string, details: BookingSummary): Promise<boolean>;
       sendWhatsAppSummary(phone: string, bookingRef: string, details: BookingSummary): Promise<boolean>;
     }
     ```
   - Default implementation: `MockMessagingService` logs structured JSON event to console/database and returns `{ success: true, mock: true }`.
2. **Payment Gateway (`src/lib/integrations/payment.ts`)**:
   - Mock Razorpay/Stripe checkout simulator with idempotency handling.
3. **Map & Address Service (`src/lib/integrations/maps.ts`)**:
   - Address lookup and distance calculation fallback (deterministic distance matrix between common landmarks / city points).

#### `.env.example` Specification
```bash
# Database (SQLite)
DATABASE_URL="file:./dev.db"

# Admin Authentication
ADMIN_SESSION_SECRET="k2d-development-secret-key-min-32-characters-long"
DEFAULT_ADMIN_EMAIL="admin@key2drive.com"
DEFAULT_ADMIN_PASSWORD="Key2DriveAdmin2026!"

# Application Host
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mock Integration Toggles
MOCK_INTEGRATIONS_ENABLED="true"
WHATSAPP_API_KEY=""
SMS_GATEWAY_URL=""
PAYMENT_GATEWAY_KEY=""
GOOGLE_MAPS_API_KEY=""
```

---

### 3.9 Testing Infrastructure Architecture

1. **Vitest Unit & Integration Configuration (`vitest.config.ts`)**:
   - Environment: `jsdom`
   - Setup files: `tests/setup.ts` with `@testing-library/jest-dom` extensions.
   - Tests:
     - `tests/unit/validations.test.ts`: Zod schema validation rules, phone regex, date constraints.
     - `tests/unit/reference-generator.test.ts`: Unique reference format (`K2D-YYYY-XXXX`) and entropy checks.
     - `tests/unit/pricing-calculator.test.ts`: Tariff computation, night charges, overtime calculations.
     - `tests/integration/booking-lifecycle.test.ts`: State machine transition enforcement, invalid state rejections.
     - `tests/integration/api-routes.test.ts`: Direct handler tests for booking submission, enquiries, and admin endpoints.
2. **Playwright End-to-End Suite (`playwright.config.ts`)**:
   - Viewport testing across all 6 required widths:
     - Mobile Compact: `360x640`
     - Mobile Standard: `390x844`
     - Tablet: `768x1024`
     - Small Laptop: `1024x768`
     - Desktop Standard: `1440x900`
     - Ultra-wide: `1920x1080`
   - Zero horizontal overflow check assertion:
     ```typescript
     const hasHorizontalScroll = await page.evaluate(() => {
       return document.documentElement.scrollWidth > window.innerWidth;
     });
     expect(hasHorizontalScroll).toBe(false);
     ```
   - Customer E2E Flow: Home -> Services -> Tariff -> Complete Booking -> Confirmation page with reference.
   - Admin E2E Flow: Login -> Metrics Overview -> Filter Bookings -> Transition status to CONFIRMED -> Edit tariff -> Resolve enquiry.

---

### 3.10 Complete Proposed Project Directory Layout

```
e:\project\actingDriver/
├── .agents/                      # Teamwork orchestration metadata
├── prisma/
│   ├── schema.prisma             # SQLite schema (User, Session, Service, Tariff, Booking, Enquiry, Note)
│   ├── seed.ts                   # Seed script (tariffs, 6 chauffeur services, admin credentials)
│   └── dev.db                    # Real local SQLite database
├── public/
│   ├── images/
│   │   ├── hero-chauffeur.webp   # Automotive luxury hero background
│   │   ├── service-hourly.webp
│   │   ├── service-airport.webp
│   │   └── logo.svg
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML shell, fonts, Sonner Toaster
│   │   ├── page.tsx              # Customer Home page (Hero, Process, Tariffs, Testimonials, FAQ)
│   │   ├── globals.css           # Brand tokens, CSS variables, Emil Kowalski easings
│   │   ├── services/
│   │   │   └── page.tsx          # 6 Service categories with pricing & CTAs
│   │   ├── tariffs/
│   │   │   └── page.tsx          # Transparent Tariff Matrix & unconfirmed rates review
│   │   ├── book/
│   │   │   └── page.tsx          # Multi-step booking flow with client & server validation
│   │   ├── contact/
│   │   │   └── page.tsx          # Contact info, WhatsApp link, validated enquiry form
│   │   ├── terms/
│   │   │   └── page.tsx          # Booking conditions, cancellation, waiting time & refunds
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Admin authentication login
│   │   │   ├── layout.tsx        # Admin dashboard shell, sidebar, auth guard
│   │   │   ├── page.tsx          # Dashboard overview: real database-backed metrics
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx      # Filterable & searchable bookings list
│   │   │   │   └── [id]/page.tsx # Booking details, status transitions, admin notes
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx      # Inspect and edit service tariffs & availability
│   │   │   └── enquiries/
│   │   │       └── page.tsx      # Customer contact enquiry review & resolution
│   │   └── api/
│   │       ├── bookings/
│   │       │   ├── route.ts      # POST booking, GET bookings
│   │       │   └── [id]/route.ts # PATCH booking status & add notes
│   │       ├── enquiries/
│   │       │   ├── route.ts      # POST enquiry, GET enquiries
│   │       │   └── [id]/route.ts # PATCH enquiry status
│   │       ├── tariffs/
│   │       │   └── route.ts      # GET / PATCH service tariffs
│   │       └── auth/
│   │           ├── login/route.ts
│   │           └── logout/route.ts
│   ├── components/
│   │   ├── ui/                   # Button, Input, Modal, Badge, Card, Select
│   │   ├── motion/               # Emil Kowalski motion primitives: FadeIn, ScalePress, Stagger
│   │   ├── layout/               # Header, Footer, AdminSidebar, MobileNavigation
│   │   ├── customer/             # HeroSection, ProcessGuide, TariffPreview, BookingForm
│   │   └── admin/                # MetricsCard, StatusBadge, BookingFilter, PriceEditorModal
│   ├── lib/
│   │   ├── db.ts                 # Prisma SQLite singleton instance
│   │   ├── auth.ts               # Session verification & password hashing
│   │   ├── motion.ts             # Motion presets, spring physics, cubic-bezier curves
│   │   ├── validations/          # Zod validation schemas
│   │   │   ├── booking.ts
│   │   │   ├── enquiry.ts
│   │   │   ├── pricing.ts
│   │   │   └── auth.ts
│   │   ├── integrations/         # Mock WhatsApp/SMS, Payment, Maps boundaries
│   │   │   ├── messaging.ts
│   │   │   ├── payment.ts
│   │   │   └── maps.ts
│   │   └── utils.ts              # cn (clsx + twMerge), currency/date formatters, ref generator
│   └── middleware.ts             # Route protection middleware for /admin routes
├── tests/
│   ├── setup.ts                  # Vitest setup file
│   ├── unit/                     # Validations, reference generator, calculations
│   ├── integration/              # State machine transitions, API route tests
│   └── e2e/                      # Playwright E2E specs across 6 viewports
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── PROGRESS.md                   # Single source of truth tracking implementation phases
```

---

### 3.11 Full `package.json` Dependency Specification

```json
{
  "name": "key2drive",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:all": "npm run typecheck && npm run lint && npm run test && npm run test:e2e"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@prisma/client": "^6.0.1",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.17",
    "lucide-react": "^0.460.0",
    "next": "15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.53.2",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-config-next": "15.1.4",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "prisma": "^6.0.1",
    "tailwindcss": "^3.4.15",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

---

## 4. Caveats

1. **Node 24 Bleeding Edge**:
   Node.js v24.8.0 was released very recently. While our live test proved that both `better-sqlite3` and `prisma` compile and execute queries cleanly on Windows x64, using standard pure-JS dependencies (`bcryptjs` instead of native `bcrypt`) eliminates any secondary node-gyp native compilation failure risks.
2. **Next.js 15 Async Request APIs**:
   In Next.js 15, route handler parameters, `cookies()`, and page `params` are asynchronous (`await cookies()`, `await params`). All workers implementing server routes and components must write `await cookies()` and `await params` to adhere to Next.js 15 App Router standards.
3. **Third-Party Live Credentials**:
   WhatsApp, SMS gateway, payment processor, and map APIs are intentionally mocked with realistic boundaries and documented `.env.example` configurations, satisfying Requirement R5.

---

## 5. Conclusion

The Key2Drive project should be structured as a **Next.js 15 App Router** application with **React 19**, **TypeScript**, **Tailwind CSS v3**, **Prisma ORM with SQLite**, and **Framer Motion + Sonner** implementing Emil Kowalski motion principles.

### Key Architectural Strengths:
1. **Zero-Configuration Local Persistence**: SQLite stored directly in `prisma/dev.db` requires no external server setup, runs instantaneously in the local environment, and is populated by an automated seed script (`prisma/seed.ts`).
2. **Iron-Clad Validation & Lifecycle**: Zod schemas validate inputs on both client and server; the booking lifecycle state machine strictly validates state transitions (`REQUESTED` -> `CONFIRMED`/`REJECTED` -> `CANCELLED`/`COMPLETED`).
3. **Emil Kowalski Motion Compliance**: GPU-only animations (transform & opacity), custom cubic-bezier easing `[0.16, 1, 0.3, 1]`, snappy durations (<300ms), and automatic `prefers-reduced-motion` compliance.
4. **Comprehensive Test Suite**: Multi-layered testing with Vitest for unit/integration logic and Playwright for cross-viewport (360px - 1920px) end-to-end user flows.

---

## 6. Verification Method

To independently verify the architecture and setup:
1. **Toolchain check**:
   ```powershell
   node -v     # Must be >= 18.x (observed v24.8.0)
   npm -v      # Must be >= 9.x (observed 11.6.2)
   git --version # Must be installed (observed 2.51.0)
   ```
2. **Package compilation & type check**:
   ```powershell
   npm run typecheck # tsc --noEmit (zero errors)
   npm run lint      # next lint (zero errors)
   ```
3. **Database verification**:
   ```powershell
   npx prisma db push
   npx tsx prisma/seed.ts
   # Verify tables and initial rows in dev.db
   ```
4. **Unit and Integration test execution**:
   ```powershell
   npm run test      # Vitest suite for Zod validation, pricing calculation, state machine
   ```
5. **End-to-End responsive verification**:
   ```powershell
   npx playwright test --project=all-viewports # Verifies 360px, 390px, 768px, 1024px, 1440px, 1920px with 0 overflow
   ```
6. **Production build check**:
   ```powershell
   npm run build     # Must succeed cleanly producing production Next.js bundle
   ```
