## 2026-10-31T10:03:32Z

You are Explorer M2-2 (Seed & Validations Explorer) for Key2Drive.
Your working directory is: e:\project\actingDriver\.agents\teamwork\explorer_m2_2\
Read your task plan at: e:\project\actingDriver\.agents\teamwork\explorer_m2_2\plan.md

MANDATORY FIRST STEP:
Read the authoritative user request at:
e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the project architecture and interface contracts at:
e:\project\actingDriver\.agents\teamwork\orchestrator\PROJECT.md

YOUR TASK:
1. Design the seed script `prisma/seed.ts` (runnable via `npx tsx prisma/seed.ts` or `npm run db:seed`):
   - Seed default admin user: `admin@key2drive.com` with a secure hashed password using bcryptjs.
   - Seed all 6 chauffeur service categories with realistic marketing copy and features:
     1. Hourly Driver (`hourly-driver`)
     2. Full-Day Driver (`full-day-driver`)
     3. Airport Pickup/Drop (`airport-transfer`)
     4. Outstation Trips (`outstation-driver`)
     5. Corporate Driver (`corporate-chauffeur`)
     6. Personal Chauffeur (`personal-chauffeur`)
   - Seed corresponding tariffs, explicitly tagging unconfirmed rates with `[Pending Client Review]` and `isUnconfirmed: true`.
2. Design end-to-end Zod validation schemas (`src/lib/validations/`):
   - `booking.ts`: `BookingCreateSchema` (validating customer name, 10-digit mobile number, valid email, pickup/drop locations, future pickup date/time, duration, vehicle info, special instructions, idempotency submissionHash).
   - `enquiry.ts`: `EnquiryCreateSchema` (validating name, mobile, email, subject, message).
   - `tariff.ts`: `TariffUpdateSchema`, `ServiceUpdateSchema` (admin price adjustments, surcharge toggles).
   - `auth.ts`: `AdminLoginSchema` (email, password).
   - `status.ts`: `BookingStatusTransitionSchema` (enforcing valid lifecycle: REQUESTED -> CONFIRMED/REJECTED -> CANCELLED/COMPLETED).
3. Deliver exact TypeScript code blocks for the seed script and validation schemas in your handoff report.
4. Write your handoff report to:
`e:\project\actingDriver\.agents\teamwork\explorer_m2_2\handoff.md`

Remember: You are an Explorer (read-only investigation). Propose exact code and drop-in solutions in your report, but do not implement.
Communicate completion back to orchestrator (conversation ID: 23f99e34-2f7f-4f46-8d45-f706a088cfaf) via send_message.
