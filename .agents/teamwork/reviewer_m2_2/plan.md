# Task Plan: Reviewer M2-2 (APIs, Idempotency & Lifecycle Reviewer)

**Agent**: Reviewer M2-2 (`teamwork_reviewer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\reviewer_m2_2\`  
**Milestone**: Milestone 2 Gate Review  

## Objective:
1. Review Next.js 15 API route handlers in `src/app/api/`:
   - Public: `/api/services`, `/api/bookings`, `/api/bookings/[id]`, `/api/enquiries`, `/api/tariffs`.
   - Admin: `/api/admin/auth/*`, `/api/admin/metrics`, `/api/admin/bookings/*`, `/api/admin/pricing/*`, `/api/admin/enquiries/*`.
   - Next.js 15 compatibility: Verify asynchronous `props.params` and `cookies()` usage.
2. Review Zod validation schemas in `src/lib/validations/`:
   - Verify input sanitization (phone numbers, lead times, duration formatting).
3. Review Booking Lifecycle State Machine:
   - Verify strict transitions (`REQUESTED -> CONFIRMED/REJECTED/CANCELLED`, `CONFIRMED -> COMPLETED/CANCELLED`).
   - Verify illegal jumps are rejected with HTTP 422.
4. Review Idempotency & PII Privacy:
   - Verify `submissionHash` double-submit check within 5 minutes.
   - Verify masked phone/email on public booking reference lookups.
5. Execute verification commands:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
6. Deliver verdict: `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.
