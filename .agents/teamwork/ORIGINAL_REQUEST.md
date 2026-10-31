# Original User Request

## Approved Task Prompt — 2026-10-31T08:44:09Z

Build Key2Drive as a premium chauffeur and driver-booking platform, delivering a complete, production-ready full-stack application in the workspace with a customer-facing website, complete booking experience, persistent database storage, administrative dashboard, and Emil Kowalski motion design system.

Working directory: e:\project\actingDriver
Integrity mode: development

Reference material:
- Emil Kowalski skills repository: https://github.com/emilkowalski/skills

## Requirements

### R1. Foundation, Design System, and Project Architecture
Initialize and build the Key2Drive application directly in the workspace (`e:\project\actingDriver`) using a modern full-stack web architecture (such as Next.js/React with Tailwind CSS). Establish design tokens, typography, and responsive layouts based on the specified brand palette (Primary navy: #11243D, Deep navy: #172F4D, Accent orange: #F28C00, Warm background: #FAF9F6, White: #FFFFFF, Primary text: #252B33, Secondary text: #737B86, Border: #E8E7E3). Maintain `PROGRESS.md` in the repository root as the single source of truth tracking progress across all implementation phases.

### R2. Customer-Facing Website
Implement responsive customer-facing pages:
- Home page: Responsive navigation, brand identity, hero section with automotive imagery, Book a Driver and Explore Services CTAs, service highlights, booking process guide, tariff preview, customer testimonials (only if genuine data exists), FAQ, and footer.
- Services page: Service categories (hourly driver, full-day driver, airport pickup/drop, outstation trips, corporate driver, personal chauffeur) with descriptions, applicable pricing/conditions, and booking CTAs.
- Tariff and Pricing page: Transparent pricing interface for hourly, full-day, airport, and outstation bookings detailing minimum durations, extra-hour/km rates, night charges, waiting charges, and cancellation policy. Clearly mark unconfirmed rates for client review.
- Booking page: Complete booking flow capturing customer name, mobile number, email, pickup/destination locations, pickup date and time, service type, duration, vehicle info, and special instructions, featuring client- and server-side validation, duplicate submission prevention, and unique booking reference generation upon confirmation.
- Contact page & Terms: Contact details (no fabricated values; unconfirmed values marked for review), WhatsApp contact link, enquiry submission form with validation, and structured terms and conditions (booking conditions, cancellation, waiting time, liability, refunds).

### R3. Persistent Booking Lifecycle and Admin Dashboard
Implement a consistent booking lifecycle (REQUESTED, CONFIRMED, REJECTED, CANCELLED, COMPLETED) shared across customer, database, and admin interfaces.
Admin dashboard capabilities:
- Admin authentication with secure login, protected routes, and server-side session verification.
- Overview dashboard displaying real database-backed metrics (total bookings, requested, confirmed, completed, cancelled, upcoming trips, enquiries, and trends) with clear empty states.
- Booking management: searchable and filterable booking list (by date and status), trip detail view, internal admin notes, and server-validated status transitions.
- Pricing management: interface to inspect and update service prices, toggle service availability, and persist changes.
- Enquiry management: review customer contact enquiries, track status, add internal notes, and mark as resolved.

### R4. Premium Emil Kowalski Animation System
Install and apply the Emil Kowalski animation skills (from https://github.com/emilkowalski/skills, including emil-design-eng, animate, animation-vocabulary, animation-performance, find-animation-opportunities, improve-animations, review-animations, remove-animations, pick-ui-library, prototype, break-ui, apple-design, ask-sonner). Implement purposeful animations for navigation transitions, hero reveal, scroll reveals, card/button hover and pressed states, multi-step booking transitions, and admin dialogs/toasts. Adhere strictly to performance rules: prioritize transform and opacity, avoid layout thrashing, respect prefers-reduced-motion, maintain mobile performance, and document skill usage in PROGRESS.md.

### R5. Backend Persistence, Infrastructure, and Test Suite
Use real local persistent storage (e.g., SQLite or local PostgreSQL via Prisma or Drizzle) for users, bookings, services, pricing, and enquiries with server-side validation (Zod) and safe database queries. Implement clean integration boundaries and mocks for external third-party services (payments, SMS/WhatsApp messaging, maps) with documented environment variables in `.env.example`. Build an automated test suite from scratch covering unit, integration, and end-to-end user workflows.

## Acceptance Criteria

### Customer Experience & Booking
- [ ] Customer website renders correctly across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports without horizontal overflow.
- [ ] Booking form validates all inputs both client-side and server-side with user-friendly error messages.
- [ ] Valid booking submission creates a persistent database record and generates a unique booking reference.
- [ ] Duplicate form submissions are prevented and success confirmation is shown only after server persistence.
- [ ] Customer contact enquiries are validated, persisted to the database, and display submission feedback.

### Admin Dashboard & Management
- [ ] Admin routes are strictly protected; unauthenticated access attempts are rejected or redirected.
- [ ] Dashboard metrics and charts load real data from the database with meaningful empty states when empty.
- [ ] Admin can search, filter by date and status, view booking details, and update booking status with server-side validation.
- [ ] Admin can view and update service pricing and toggle service availability with changes persisted to storage.
- [ ] Admin can view, track status, add internal notes, and mark customer enquiries as resolved.

### Motion, Accessibility, and Quality
- [ ] Animations adhere to Emil Kowalski guidelines with transform/opacity optimization and zero layout jank.
- [ ] All animations respect `prefers-reduced-motion` settings.
- [ ] Semantic HTML, accessible labels, keyboard navigation, and visible focus states are implemented.
- [ ] Core SEO meta tags (titles, meta descriptions, Open Graph) are present on public pages.
- [ ] PROGRESS.md is maintained throughout all phases tracking audit findings, installed/applied skills, phase status, known issues, and verification evidence.

### Verification & Build
- [ ] TypeScript typecheck passes with zero errors.
- [ ] Linter passes with zero errors or unhandled warnings.
- [ ] Automated tests (unit, integration, and end-to-end flows for customer booking and admin management) execute and pass.
- [ ] Production build succeeds cleanly without errors.
