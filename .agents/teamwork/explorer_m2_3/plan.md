# Task Plan: Explorer M2-3 (Mock Integration Boundaries & Server API Routes)

**Agent**: Explorer M2-3 (`teamwork_explorer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m2_3\`  
**Objective**:
1. Read `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md` and `PROJECT.md § Interface Contracts`.
2. Design clean mock boundaries with TypeScript interfaces in `src/lib/integrations/`:
   - `messaging.ts`: WhatsApp and SMS notification mock service with deterministic logging and deep-link generation.
   - `payment.ts`: Payment gateway mock service (Razorpay/Stripe simulation) with test authorization tokens.
   - `maps.ts`: Distance/duration matrix and address geocode mock with realistic city distance calculations.
   - Document all necessary environment variables in `.env.example` and update `.env`.
3. Design Next.js 15 App Router server route handlers:
   - Public APIs:
     - `GET /api/services`: List active chauffeur services and tariffs.
     - `POST /api/bookings`: Create new booking with idempotency lock, fare calculation, and confirmation reference `K2D-YYYYMMDD-XXXX`.
     - `GET /api/bookings/[reference]`: Retrieve booking status by reference.
     - `POST /api/enquiries`: Create customer contact enquiry.
   - Admin APIs:
     - `POST /api/admin/auth/login`: Admin credential check & session cookie issuance.
     - `POST /api/admin/auth/logout`: Invalidate session cookie.
     - `GET /api/admin/auth/me`: Check current admin session.
     - `GET /api/admin/metrics`: Real DB counts (total, requested, confirmed, completed, cancelled, revenue, enquiries).
     - `GET /api/admin/bookings`: Search & filter bookings by date/status.
     - `PATCH /api/admin/bookings/[id]/status`: Validate and apply lifecycle transitions, record history.
     - `POST /api/admin/bookings/[id]/notes`: Attach internal admin notes.
     - `GET /api/admin/pricing`: Inspect & update tariff rates or toggle service active flag.
     - `GET /api/admin/enquiries` & `PATCH /api/admin/enquiries/[id]`: Enquiry tracking and resolution.
4. Deliver structured `handoff.md` with complete route specifications and verification commands.
