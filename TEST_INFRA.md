# Key2Drive Automated Testing Infrastructure & Architecture (TEST_INFRA.md)

**Project**: Key2Drive — Premium Chauffeur Platform  
**Author**: E2E Test Writer (`teamwork_test_writer`)  
**Methodology**: Project Pattern Dual-Track Opaque-Box Testing  
**Framework**: Vitest v5.0.5 + JSDOM + React Testing Library + TypeScript  
**Last Updated**: 2026-10-31  

---

## 1. Testing Philosophy & Dual-Track Methodology

Key2Drive adopts a **dual-track, requirement-driven, opaque-box testing methodology**. Under this architecture:

1. **Independent Verification Track**: The test suite is authored strictly against authoritative specifications (`ORIGINAL_REQUEST.md` and `PROJECT.md § Interface Contracts`), operating as an independent quality oracle.
2. **Opaque-Box Discipline**: Tests evaluate observable behavior, data contracts, state transitions, validation boundaries, and UI outputs without reliance on private implementation details or fragile mocks.
3. **No Facade Testing**: Every test exercises real business logic, schema parsing, state machine transition validation, fare calculation equations, and component DOM tree rendering.
4. **Progressive Testability & Contract Oracles**: Interface contracts (Zod validation schemas, booking lifecycle state machine, fare calculation rules with night/waiting surcharges, idempotency hash checking, and admin auth guards) are encoded as authoritative contract specifications that guarantee end-to-end fidelity across milestones M1 through M5.
5. **Cross-Viewport & Accessibility Guard**: Real UI layout tokens, Emil Kowalski motion primitives, and responsive breakpoint rules (360px, 390px, 768px, 1024px, 1440px, 1920px) are validated against WCAG 2.1 AA and reduced-motion standards.

---

## 2. Feature Inventory Mapping (All 28 Features)

All 28 features defined in `PROJECT.md § Feature Inventory` are mapped across 5 testing tiers:

| # | Feature Name | Description | Source / Milestone | Primary Test Tier | Test Coverage Suite |
|---|--------------|-------------|-------------------|-------------------|---------------------|
| 1 | Full-Stack Setup & Dependencies | Next.js 15, React 19, TS, Tailwind, Prisma, Lucide, Sonner | M1 | Tier 1 | `tests/tier1-features/foundationTokens.test.ts` |
| 2 | Brand Design Tokens & Palette | #11243D, #172F4D, #F28C00, #FAF9F6, #FFFFFF, #252B33, #737B86, #E8E7E3 | M1 | Tier 1 | `tests/tier1-features/foundationTokens.test.ts` |
| 3 | Emil Kowalski Motion Primitives | `useAccessibleMotion`, `ButtonMotion`, `ServiceCardMotion`, `SonnerToaster` | M1 | Tier 1 | `tests/tier1-features/foundationTokens.test.ts`, `responsiveShell.test.tsx` |
| 4 | Responsive Navigation & Shell | Header, luxury brand mark, drawer menu, footer, trust badges | M1 | Tier 1 | `tests/tier1-features/responsiveShell.test.tsx` |
| 5 | PROGRESS.md Single Source of Truth | Master progress tracker verified at repo root | M1 | Tier 1 | `tests/tier1-features/foundationTokens.test.ts` |
| 6 | Database Schema & Relations | 8 relational models: User, Session, Service, Tariff, Booking, StatusHistory, Enquiry, Note | M2 | Tier 1 & 3 | `tests/tier1-features/tariffsContract.test.ts`, `tests/tier3-interactions/bookingLifecycleTransitions.test.ts` |
| 7 | Seed Script & Initial Data | 6 chauffeur tiers, tariffs, unconfirmed rate flags, admin credentials | M2 | Tier 1 | `tests/tier1-features/tariffsContract.test.ts` |
| 8 | Zod Validation Schemas | Validation schemas for bookings, enquiries, tariffs, auth, status transitions | M2 | Tier 1 & 2 | `tests/tier1-features/bookingValidation.test.ts`, `tests/tier2-boundaries/*` |
| 9 | Mock Integration Boundaries | TypeScript interfaces & mocks for Payments, WhatsApp/SMS, Maps & `.env.example` | M2 | Tier 1 & 4 | `tests/tier1-features/enquiriesContract.test.ts`, `tests/tier4-workloads/*` |
| 10 | Core Server API Routes | REST endpoints for services, bookings, enquiries, tariffs, auth | M2 | Tier 1 & 3 | `tests/tier1-features/*`, `tests/tier3-interactions/*` |
| 11 | Customer Home Page | Hero section, booking CTAs, 4-step process guide, tariff teaser, testimonials, FAQ | M3 | Tier 1 | `tests/tier1-features/responsiveShell.test.tsx` |
| 12 | Customer Services Page | 6 chauffeur tiers with pricing, included hours/km, and deep booking CTAs | M3 | Tier 1 | `tests/tier1-features/tariffsContract.test.ts` |
| 13 | Tariff and Pricing Page | Transparent pricing matrix, surcharges, cancellation policy, unconfirmed rates banner | M3 | Tier 1 & 3 | `tests/tier1-features/tariffsContract.test.ts`, `tests/tier3-interactions/fareCalculationSurcharges.test.ts` |
| 14 | Multi-Step Booking Wizard | 4-step wizard (Service, Route/Vehicle, Details/Fare, Confirmation) | M3 | Tier 4 | `tests/tier4-workloads/customerBookingJourney.test.ts` |
| 15 | Booking Validation & Idempotency | Client/server validation, double-submit lock, reference generation `K2D-YYYYMMDD-XXXX` | M3 | Tier 1 & 2 | `tests/tier1-features/bookingValidation.test.ts`, `tests/tier2-boundaries/doubleSubmitIdempotency.test.ts` |
| 16 | Contact Page & Enquiry Form | Contact details with review notice, WhatsApp link, validated enquiry form | M3 | Tier 1 & 4 | `tests/tier1-features/enquiriesContract.test.ts`, `tests/tier4-workloads/enquiryResolutionJourney.test.ts` |
| 17 | Terms and Conditions Page | Structured terms: booking conditions, cancellation, waiting time, liability, refunds | M3 | Tier 1 | `tests/tier1-features/responsiveShell.test.tsx` |
| 18 | Cross-Viewport Responsiveness | Renders cleanly across 360px, 390px, 768px, 1024px, 1440px, 1920px with zero overflow | M3 | Tier 1 & 2 | `tests/tier1-features/responsiveShell.test.tsx` |
| 19 | Admin Authentication & Guard | Secure login, password hashing, httpOnly session cookies, route protection middleware | M4 | Tier 1 & 4 | `tests/tier1-features/authGuardsContract.test.ts`, `tests/tier4-workloads/adminReviewTransitionJourney.test.ts` |
| 20 | Admin Overview Dashboard | Real DB metrics (total, requested, confirmed, completed, cancelled, revenue) + empty state | M4 | Tier 4 | `tests/tier4-workloads/adminReviewTransitionJourney.test.ts` |
| 21 | Admin Booking Management | Searchable/filterable booking table, detail drawer, internal notes | M4 | Tier 3 & 4 | `tests/tier3-interactions/bookingLifecycleTransitions.test.ts`, `tests/tier4-workloads/adminReviewTransitionJourney.test.ts` |
| 22 | Booking Lifecycle Transitions | Strict state machine: `REQUESTED` -> `CONFIRMED`/`REJECTED` -> `CANCELLED`/`COMPLETED` | M4 | Tier 1 & 3 | `tests/tier1-features/lifecycleStateMachine.test.ts`, `tests/tier3-interactions/bookingLifecycleTransitions.test.ts` |
| 23 | Admin Pricing Management | Interface to inspect & update service base/extra rates, toggle active status | M4 | Tier 1 & 3 | `tests/tier1-features/tariffsContract.test.ts`, `tests/tier3-interactions/fareCalculationSurcharges.test.ts` |
| 24 | Admin Enquiry Management | Review customer enquiries, track status, add internal notes, mark resolved | M4 | Tier 3 & 4 | `tests/tier3-interactions/enquiryNotesInteraction.test.ts`, `tests/tier4-workloads/enquiryResolutionJourney.test.ts` |
| 25 | Motion System Integration & Polish | Complete Emil Kowalski motion across all interactions, zero layout jank | M5 | Tier 1 | `tests/tier1-features/foundationTokens.test.ts`, `responsiveShell.test.tsx` |
| 26 | 100% E2E Test Suite Pass | Verify full test suite passes against application (Tiers 1-4) | M5 | All Tiers | Vitest test runner execution |
| 27 | Adversarial Hardening & Build Pass | White-box edge case hardening (Tier 5), `npm run build` zero-error pass | M5 | Tier 2 & Build | `tests/tier2-boundaries/injectionPayloads.test.ts`, `npm run build` |
| 28 | E2E Testing Suite (Tiers 1-4) | Opaque-box test infrastructure, runner, and test cases covering all features | E2E Track | All Tiers | `TEST_INFRA.md`, `TEST_READY.md`, `tests/*` |

---

## 3. Test Suite Architecture & Directory Structure

```
tests/
├── setup.ts                                # Test environment setup, cleanup, matchMedia polyfill
├── contracts/                              # Authoritative contract oracles & specification engines
│   ├── bookingContract.ts                  # Zod schema, reference generator, idempotency hash
│   ├── tariffContract.ts                   # 6 chauffeur services, tariff schema, fare calculator
│   ├── lifecycleContract.ts                # Strict state machine validator, history tracker
│   ├── enquiryContract.ts                  # Contact enquiry schema, status lifecycle, admin notes
│   ├── authContract.ts                     # Admin login schema, session token validator, roles
│   └── mockBoundariesContract.ts           # Messaging, Payment, and Maps boundary interfaces
├── tier1-features/                         # Tier 1: Feature Coverage (>=5 test cases per area)
│   ├── foundationTokens.test.ts            # Brand palette, motion tokens, prefers-reduced-motion
│   ├── responsiveShell.test.tsx            # Header, MobileNav, Footer, accessible button interactions
│   ├── bookingValidation.test.ts           # Booking submission validation contracts
│   ├── tariffsContract.test.ts             # 6 service tiers, tariffs, unconfirmed rate flags
│   ├── lifecycleStateMachine.test.ts       # Booking lifecycle state machine rules & transitions
│   ├── enquiriesContract.test.ts           # Customer enquiry schema, WhatsApp link, status
│   └── authGuardsContract.test.ts          # Admin authentication, session cookies, route guards
├── tier2-boundaries/                       # Tier 2: Boundary & Corner Cases
│   ├── emptyMissingFields.test.ts          # Empty strings, nulls, whitespace, omitted fields
│   ├── malformedPhoneNumbers.test.ts       # Invalid phone formats, lengths, non-numeric strings
│   ├── pastInvalidDates.test.ts            # Past timestamps, malformed dates, leap years, far-future
│   ├── extremeDurations.test.ts            # 0h, negative, excessive durations, max hour caps
│   ├── injectionPayloads.test.ts           # XSS `<script>`, SQL injection `' OR '1'='1`, Unicode nulls
│   └── doubleSubmitIdempotency.test.ts     # Concurrent / repeated submits, 5-min idempotency lock
├── tier3-interactions/                     # Tier 3: Cross-Feature Interactions
│   ├── bookingLifecycleTransitions.test.ts # Multi-step status transitions & audit history logging
│   ├── fareCalculationSurcharges.test.ts   # Fare engine with extra hours, night surcharges, waiting
│   └── enquiryNotesInteraction.test.ts     # Customer enquiry with multiple admin triage notes
└── tier4-workloads/                        # Tier 4: Real-World Workload Scenarios
    ├── customerBookingJourney.test.ts      # Multi-step customer booking wizard to confirmed booking
    ├── adminReviewTransitionJourney.test.ts# Admin triage, note attachment, status transition flow
    └── enquiryResolutionJourney.test.ts   # Customer support lifecycle from inquiry to resolution
```

---

## 4. Test Runner Commands & Configuration

The test infrastructure is powered by **Vitest** configured in `vitest.config.mts`:

| Command | Target / Purpose | Speed / Mode |
|---------|------------------|--------------|
| `npm test` | Run complete test suite (Tiers 1–4) | Single-pass run (`vitest run`) |
| `npm run test:watch` | Run tests in interactive watch mode during development | Interactive watch |
| `npm run test:e2e` | Run all end-to-end and integration suites | Full test pass |
| `npx vitest run tests/tier1-features` | Run Tier 1 Feature Coverage suite only | Scoped Tier 1 run |
| `npx vitest run tests/tier2-boundaries` | Run Tier 2 Boundary & Corner Cases suite only | Scoped Tier 2 run |
| `npx vitest run tests/tier3-interactions` | Run Tier 3 Cross-Feature Interactions suite only | Scoped Tier 3 run |
| `npx vitest run tests/tier4-workloads` | Run Tier 4 Real-World Workload Scenarios suite only | Scoped Tier 4 run |

---

## 5. Pass/Fail Criteria & Quality Gates

A test run is considered passing (`EXIT CODE 0`) if and only if:
1. **Zero Test Failures**: 100% of test assertions pass across all 4 tiers.
2. **Zero Unhandled Exceptions**: No uncaught promise rejections, unhandled errors, or unhandled React rendering warnings.
3. **Deterministic Execution**: All tests run deterministically with zero flakiness across multiple runs.
4. **Boundary Integrity**: Inputs containing malformed data, injection payloads, or past dates are rejected with exact error structures.
5. **State Machine Integrity**: Illegal status transitions (e.g., `REQUESTED -> COMPLETED` or `COMPLETED -> CANCELLED`) are rejected with HTTP 422 contract errors.
6. **Layout & Motion Conformance**: Components render without DOM violations, buttons respect Emil Kowalski tactile scale/duration, and `prefers-reduced-motion` suppresses physics springs.
