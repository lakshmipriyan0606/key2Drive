# Task Plan: Challenger M2-2 (API Routes, Idempotency & Security Challenger)

**Agent**: Challenger M2-2 (`teamwork_challenger`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\challenger_m2_2\`  
**Milestone**: Milestone 2 Gate Challenge  

## Objective:
1. Empirically test API route handlers and Zod validation rules:
   - Challenge idempotency lock: Attempt duplicate booking submissions with identical `submissionHash` within 5 minutes.
   - Challenge lifecycle transitions: Attempt illegal transitions (e.g. `REQUESTED` -> `COMPLETED`, `CANCELLED` -> `CONFIRMED`) and verify HTTP 422 rejection.
   - Challenge security & PII: Check public booking lookup masks phone numbers (`98******10`) and email addresses (`a***@example.com`).
   - Challenge SQL / XSS injection: Feed malicious strings through booking, enquiry, and admin schemas.
2. Execute automated test suites:
   - `npm test`
   - `npm run typecheck`
3. Deliver empirical challenge results and verdict: `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.
