# Task Plan: Worker M2 (Persistence, SQLite Database & Core Server APIs)

**Agent**: Worker M2 (`teamwork_worker`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\worker_m2\`  
**Milestone**: Milestone 2 (Persistence, Database & Core APIs)  

## Scope of Files Owned Exclusively by Worker M2:
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/lib/validations/` (`common.ts`, `status.ts`, `booking.ts`, `enquiry.ts`, `tariff.ts`, `auth.ts`, `note.ts`, `index.ts`)
- `src/lib/integrations/` (`messaging.ts`, `payment.ts`, `maps.ts`)
- `src/app/api/` (`services/`, `bookings/`, `enquiries/`, `admin/`)
- `.env.example` and `.env` (database & mock service configs)
- `package.json` (install `bcryptjs` and `@types/bcryptjs` if needed)
- `PROGRESS.md` (update Milestone 2 progress)

## Implementation Steps:
1. Install `bcryptjs` & `@types/bcryptjs`: `npm install bcryptjs && npm install -D @types/bcryptjs`.
2. Write `prisma/schema.prisma` from `explorer_m2_1/proposed_schema.prisma`.
3. Write `src/lib/db.ts` singleton client from `explorer_m2_1/proposed_db.ts`.
4. Run `npx prisma db push` and `npx prisma generate` to create SQLite tables in `prisma/dev.db`.
5. Write `src/lib/validations/` files from `explorer_m2_2/handoff.md`.
6. Write `prisma/seed.ts` from `explorer_m2_2/handoff.md`.
7. Execute `npm run db:seed` (or `npx tsx prisma/seed.ts`) to populate default admin, 6 chauffeur tiers, and tariffs.
8. Write `src/lib/auth.ts` and `src/lib/integrations/` (`messaging.ts`, `payment.ts`, `maps.ts`) from `explorer_m2_3`.
9. Write all 15 public and admin server route handlers in `src/app/api/` from `explorer_m2_3/proposed_routes.md`.
10. Update `.env.example` and ensure `.env` has all necessary variables.
11. Run verification commands:
    - `npm run typecheck` (Exit code 0)
    - `npm run lint` (Exit code 0)
    - `npm run build` (Exit code 0)
    - API unit tests / verification scripts
12. Update `PROGRESS.md` at project root with Milestone 2 implementation and verification evidence.
13. Write `handoff.md` and report completion to orchestrator.
