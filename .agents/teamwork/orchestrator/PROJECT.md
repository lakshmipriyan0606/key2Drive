# Project: Key2Drive — Premium Chauffeur Platform

## Architecture
Key2Drive is engineered as a modern, production-grade full-stack web application with zero external service dependencies required for local execution.
- **Framework & Runtime**: Next.js 15 (App Router) + React 19 + TypeScript on Node.js v24.
- **Styling & Design System**: Tailwind CSS v3.4 configured with exact brand tokens (Primary navy: `#11243D`, Deep navy: `#172F4D`, Accent orange: `#F28C00`, Warm background: `#FAF9F6`, White: `#FFFFFF`, Primary text: `#252B33`, Secondary text: `#737B86`, Border: `#E8E7E3`).
- **Motion System**: Emil Kowalski motion design principles via Framer Motion / Motion. GPU-only animations (transform & opacity exclusively), custom cubic-bezier easings (`[0.16, 1, 0.3, 1]`), spring physics, snappy durations (<300ms), and universal `prefers-reduced-motion` compliance.
- **Persistence Layer**: Embedded SQLite (`prisma/dev.db`) managed via Prisma ORM for zero-configuration, robust local persistence.
- **Validation**: Zod schemas providing end-to-end type safety and validation on both client and server.
- **Third-Party Boundaries**: Deterministic mock services for payments, WhatsApp/SMS messaging, and maps, with full `.env.example` documentation.
- **Testing Track**: Dual-track architecture with independent opaque-box E2E testing suite (Playwright + Vitest) covering 6 viewport widths (360px, 390px, 768px, 1024px, 1440px, 1920px) and complete user/admin workflows.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Full-Stack Setup & Dependencies | Next.js 15, React 19, TS, Tailwind, Prisma, Lucide, Sonner | M1 | Survey Arch |
| 2 | Brand Design Tokens & Palette | #11243D, #172F4D, #F28C00, #FAF9F6, #FFFFFF, #252B33, #737B86, #E8E7E3 | M1 | R1 |
| 3 | Emil Kowalski Motion Primitives | `useAccessibleMotion`, `ButtonMotion`, `ServiceCardMotion`, `SonnerToaster` | M1 | R4, Survey Motion |
| 4 | Responsive Navigation & Shell | Header, luxury brand mark, drawer menu, footer, trust badges | M1 | R2 |
| 5 | PROGRESS.md Single Source of Truth | Master progress tracker initialized at repo root | M1 | R1 |
| 6 | Database Schema & Relations | 7 relational models: User, Session, Service, Tariff, Booking, StatusHistory, Enquiry, Note | M2 | R3, R5 |
| 7 | Seed Script & Initial Data | Seed 6 chauffeur services, tariffs, and admin credentials in SQLite | M2 | R5 |
| 8 | Zod Validation Schemas | Validation schemas for bookings, enquiries, tariffs, auth, status transitions | M2 | R5 |
| 9 | Mock Integration Boundaries | TypeScript interfaces & mocks for Payments, WhatsApp/SMS, Maps & `.env.example` | M2 | R5 |
| 10 | Core Server API Routes | REST endpoints for services, bookings, enquiries, tariffs, auth | M2 | R3, R5 |
| 11 | Customer Home Page | Hero section, booking CTAs, 4-step process guide, tariff teaser, testimonials, FAQ | M3 | R2 |
| 12 | Customer Services Page | 6 chauffeur tiers with pricing, included hours/km, and deep booking CTAs | M3 | R2 |
| 13 | Tariff and Pricing Page | Transparent pricing matrix, surcharges, cancellation policy, unconfirmed rates banner | M3 | R2 |
| 14 | Multi-Step Booking Wizard | 4-step wizard (Service, Route/Vehicle, Details/Fare, Confirmation) | M3 | R2 |
| 15 | Booking Validation & Idempotency | Client/server validation, double-submit lock, reference generation `K2D-YYYYMMDD-XXXX` | M3 | R2 |
| 16 | Contact Page & Enquiry Form | Contact details with review notice, WhatsApp link, validated enquiry form | M3 | R2 |
| 17 | Terms and Conditions Page | Structured terms: booking conditions, cancellation, waiting time, liability, refunds | M3 | R2 |
| 18 | Cross-Viewport Responsiveness | Renders cleanly across 360px, 390px, 768px, 1024px, 1440px, 1920px with zero overflow | M3 | Acceptance Criteria |
| 19 | Admin Authentication & Guard | Secure login, password hashing, httpOnly session cookies, route protection middleware | M4 | R3 |
| 20 | Admin Overview Dashboard | Real DB metrics (total, requested, confirmed, completed, cancelled, revenue) + empty state | M4 | R3 |
| 21 | Admin Booking Management | Searchable/filterable booking table, detail drawer, internal notes | M4 | R3 |
| 22 | Booking Lifecycle Transitions | Strict state machine: `REQUESTED` -> `CONFIRMED`/`REJECTED` -> `CANCELLED`/`COMPLETED` | M4 | R3 |
| 23 | Admin Pricing Management | Interface to inspect & update service base/extra rates, toggle active status | M4 | R3 |
| 24 | Admin Enquiry Management | Review customer enquiries, track status, add internal notes, mark resolved | M4 | R3 |
| 25 | Motion System Integration & Polish | Complete Emil Kowalski motion across all interactions, zero layout jank | M5 | R4 |
| 26 | 100% E2E Test Suite Pass | Verify full test suite passes against application (Tiers 1-4) | M5 | R5, Acceptance Criteria |
| 27 | Adversarial Hardening & Build Pass | White-box edge case hardening (Tier 5), `npm run build` zero-error pass | M5 | Acceptance Criteria |
| 28 | E2E Testing Suite (Tiers 1-4) | Opaque-box test infrastructure, runner, and test cases covering all features | E2E Track | Project Pattern |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| **E2E** | E2E Testing Track | Test infra, Vitest/Playwright runner, test cases Tiers 1-4, `TEST_READY.md` | none | DONE |
| **M1** | Foundation, Design System & Shell | Next.js, TS, Tailwind, Brand Tokens, Motion Primitives, Layout Shell, `PROGRESS.md` | none | DONE |
| **M2** | Persistence, Database & Core APIs | Prisma SQLite, 7 models, seed data, Zod schemas, mock services, REST APIs | M1 | PLANNED |
| **M3** | Customer Website & Booking Flow | 5 responsive pages, 4-step booking wizard, validation, idempotency, reference gen | M1, M2 | PLANNED |
| **M4** | Admin Dashboard & Lifecycle | Admin auth, session cookie, metrics, booking management, pricing CRUD, enquiry CRUD | M2 | PLANNED |
| **M5** | Motion Polish & 100% E2E Pass | Emil Kowalski motion integration, zero jank, 100% E2E test pass, clean build | M3, M4, E2E | PLANNED |

---

## Interface Contracts

### 1. Database Model & Persistence Contract
- SQLite database location: `prisma/dev.db`.
- ORM Client: `@/lib/db` exporting singleton `prisma` client.
- Entities:
  - `User`: `{ id, email, passwordHash, name, role, createdAt, updatedAt }`
  - `Session`: `{ id, userId, token, expiresAt, createdAt }`
  - `Service`: `{ id, slug, title, tagline, description, features, basePrice, priceUnit, isActive, sortOrder }`
  - `Tariff`: `{ id, serviceId, title, vehicleCategory, baseRate, extraHourRate, extraKmRate, nightChargeRate, waitingChargePerMin, isUnconfirmed, cancellationPolicy }`
  - `Booking`: `{ id, reference, status, customerName, customerPhone, customerEmail, serviceId, pickupAddress, dropAddress, pickupDateTime, duration, vehicleInfo, estimatedAmount, finalAmount, submissionHash }`
  - `BookingStatusHistory`: `{ id, bookingId, fromStatus, toStatus, changedBy, note, createdAt }`
  - `Enquiry`: `{ id, name, phone, email, subject, message, status, isResolved, createdAt }`
  - `AdminNote`: `{ id, content, authorId, bookingId, enquiryId, createdAt }`

### 2. Validation & API Contracts
- Booking Submission (`POST /api/bookings`):
  - Request: Validated by `BookingCreateSchema`
  - Response (201): `{ success: true, bookingReference: "K2D-YYYYMMDD-XXXX", status: "REQUESTED", estimatedFare: number }`
  - Idempotency: `submissionHash` checked to prevent duplicate submissions within 5 minutes.
- Booking Status Transition (`PATCH /api/admin/bookings/[id]/status`):
  - Valid transitions enforced:
    - `REQUESTED` -> `CONFIRMED` | `REJECTED` | `CANCELLED`
    - `CONFIRMED` -> `COMPLETED` | `CANCELLED`
  - Any illegal transition returns HTTP 422 with `{ error: "Invalid status transition" }`.
- Enquiry Submission (`POST /api/enquiries`):
  - Request: Validated by `EnquiryCreateSchema`
  - Response (201): `{ success: true, message: string }`

### 3. Motion System Contract
- Import tokens from `@/lib/motion`:
  - `MOTION_DURATIONS`: `{ instant: 0, press: 0.14, micro: 0.18, standard: 0.24, deliberate: 0.32, toast: 0.40 }`
  - `MOTION_EASINGS`: `{ easeOut: [0.23, 1, 0.32, 1], easeOutPunch: [0.16, 1, 0.3, 1], easeInOut: [0.77, 0, 0.175, 1], easeDrawer: [0.32, 0.72, 0, 1] }`
  - `MOTION_SPRINGS`: `{ snappy, smooth, sheet, tab }`
  - Accessibility: `useAccessibleMotion()` hook must wrap all interactive animations, falling back to 150ms opacity fades when `prefers-reduced-motion` is active.

### 4. Third-Party Mock Boundaries
- `@/lib/integrations/messaging`: `MockMessagingService` logs WhatsApp/SMS notifications and generates click-to-chat WhatsApp deep links.
- `@/lib/integrations/payment`: `MockPaymentService` returns synthetic authorization tokens.
- `@/lib/integrations/maps`: `MockMapsService` returns deterministic distance/duration estimates.

---

## Code Layout

```
e:\project\actingDriver/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db
├── public/
│   ├── images/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── services/page.tsx
│   │   ├── tariffs/page.tsx
│   │   ├── book/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   └── enquiries/page.tsx
│   │   └── api/
│   │       ├── services/route.ts
│   │       ├── bookings/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── enquiries/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── tariffs/route.ts
│   │       └── admin/auth/
│   │           ├── login/route.ts
│   │           └── logout/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── motion/
│   │   ├── layout/
│   │   ├── customer/
│   │   └── admin/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── motion.ts
│   │   ├── validations/
│   │   ├── integrations/
│   │   └── utils.ts
│   └── middleware.ts
├── tests/
│   ├── setup.ts
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── PROGRESS.md
```
