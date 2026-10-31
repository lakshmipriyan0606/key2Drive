# Task Plan: Explorer M2-2 (Seed Script & Zod Validation Schemas)

**Agent**: Explorer M2-2 (`teamwork_explorer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m2_2\`  
**Objective**:
1. Read `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Design database seed script (`prisma/seed.ts` runnable via `npx tsx prisma/seed.ts` or `npm run db:seed`):
   - Default admin account: `admin@key2drive.com` (hashed password with bcryptjs, e.g., `Admin@Key2Drive2026!`).
   - 6 chauffeur service tiers:
     1. Hourly Driver (`hourly-driver`): ₹399/hr (min 4 hrs).
     2. Full-Day Driver (`full-day-driver`): ₹1,899/day (8 hrs/80 km).
     3. Airport Pickup/Drop (`airport-transfer`): ₹799 flat rate.
     4. Outstation Trips (`outstation-driver`): ₹2,499/day + allowances.
     5. Corporate Driver (`corporate-chauffeur`): ₹34,999/month.
     6. Personal Chauffeur (`personal-chauffeur`): ₹28,999/month.
   - Tariffs for each service, explicitly marking unconfirmed rates with `[Pending Client Review]` / `isUnconfirmed: true`.
3. Design end-to-end Zod validation schemas (`src/lib/validations/`):
   - `booking.ts`: `BookingCreateSchema`, `BookingStatusUpdateSchema`, `BookingQuerySchema`.
   - `enquiry.ts`: `EnquiryCreateSchema`, `EnquiryUpdateSchema`.
   - `tariff.ts`: `TariffUpdateSchema`, `ServiceUpdateSchema`.
   - `auth.ts`: `AdminLoginSchema`.
4. Deliver structured `handoff.md` with complete code specifications and verification plan.
