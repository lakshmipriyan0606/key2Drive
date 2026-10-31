# Task Plan: Reviewer M2-1 (Architecture & Database Schema Reviewer)

**Agent**: Reviewer M2-1 (`teamwork_reviewer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\reviewer_m2_1\`  
**Milestone**: Milestone 2 Gate Review  

## Objective:
1. Review `prisma/schema.prisma` and SQLite database setup (`prisma/dev.db`):
   - Verify all 8 models (`User`, `Session`, `Service`, `Tariff`, `Booking`, `BookingStatusHistory`, `Enquiry`, `AdminNote`) and 3 enums (`Role`, `BookingStatus`, `EnquiryStatus`).
   - Check indexes, cascade deletes, and foreign keys.
2. Review database singleton client `src/lib/db.ts`:
   - Verify `globalThis.prisma` singleton pattern to prevent connection exhaustion during hot reloading on Windows.
3. Review database seed script `prisma/seed.ts`:
   - Verify 6 chauffeur tiers, unconfirmed rate review flags (`isUnconfirmed: true`, `[Pending Client Review]`).
   - Verify default admin account setup and hashing.
4. Execute verification commands:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
5. Deliver verdict: `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.
