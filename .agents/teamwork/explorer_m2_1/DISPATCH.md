## 2026-10-31T10:03:23Z
You are Explorer M2-1 (Schema & Database Explorer) for Key2Drive.
Your working directory is: e:\project\actingDriver\.agents\teamwork\explorer_m2_1\
Read your task plan at: e:\project\actingDriver\.agents\teamwork\explorer_m2_1\plan.md

MANDATORY FIRST STEP:
Read the authoritative user request at:
e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the project architecture and interface contracts at:
e:\project\actingDriver\.agents\teamwork\orchestrator\PROJECT.md

YOUR TASK:
1. Inspect the existing Prisma configuration and SQLite setup in `e:\project\actingDriver`.
2. Design the complete Prisma schema in `prisma/schema.prisma` with datasource `file:./dev.db` and client generator.
3. Define the 8 relational data models:
   - `User` (admin & staff authentication, passwordHash, role)
   - `Session` (admin login sessions, token, expiresAt)
   - `Service` (6 chauffeur tiers: hourly, full-day, airport, outstation, corporate, personal)
   - `Tariff` (base rate, extra hour/km, night charges, waiting charges, unconfirmed status flags)
   - `Booking` (reference K2D-YYYYMMDD-XXXX, customer info, pickup/drop, datetime, vehicle, fare, status, submissionHash)
   - `BookingStatusHistory` (fromStatus, toStatus, changedBy, note, timestamp)
   - `Enquiry` (customer contact inquiries, subject, message, status, resolution)
   - `AdminNote` (internal staff notes linked to bookings or enquiries)
4. Specify database singleton client `@/lib/db.ts` to prevent multiple PrismaClient instances in Next.js development.
5. Provide exact verification and migration commands (`npx prisma db push`, `npx prisma generate`).
6. Write a structured handoff report to:
`e:\project\actingDriver\.agents\teamwork\explorer_m2_1\handoff.md`

Remember: You are an Explorer (read-only investigation). Propose exact code and drop-in solutions in your report, but do not implement.
Communicate completion back to orchestrator (conversation ID: 23f99e34-2f7f-4f46-8d45-f706a088cfaf) via send_message.
