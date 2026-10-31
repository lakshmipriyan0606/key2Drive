# Task Plan: Challenger M2-1 (Database, Seed & Concurrency Challenger)

**Agent**: Challenger M2-1 (`teamwork_challenger`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\challenger_m2_1\`  
**Milestone**: Milestone 2 Gate Challenge  

## Objective:
1. Empirically challenge the SQLite database and seed scripts:
   - Run seed script multiple times (`npx tsx prisma/seed.ts` or `npm run db:seed`) to prove idempotency (no duplicate users, services, or tariffs).
   - Test simultaneous queries against SQLite `prisma/dev.db` to verify connection pooling and lack of `SQLITE_BUSY` file locking errors on Windows.
   - Verify unconfirmed rate tags (`isUnconfirmed: true` and `[Pending Client Review]`).
2. Run automated tests and production build:
   - `npm test`
   - `npm run build`
3. Deliver empirical challenge results and verdict: `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.
