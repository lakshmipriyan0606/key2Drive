# Task Plan: E2E Testing Suite (Tiers 1-4) & TEST_INFRA.md

**Agent**: E2E Test Writer (`teamwork_test_writer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\test_writer_e2e\`  
**Objective**:
1. Create `TEST_INFRA.md` at repository root documenting the opaque-box test architecture, runner commands, test directory structure, and coverage methodology (Category-Partition, BVA, Pairwise, Workload testing).
2. Set up test framework (e.g. Vitest for unit/integration/API testing and multi-viewport tests).
3. Create comprehensive automated test suites covering Tiers 1-4 based on `PROJECT.md § Feature Inventory` and `ORIGINAL_REQUEST.md`:
   - Tier 1: Feature Coverage (>=5 tests per major feature area)
   - Tier 2: Boundary & Corner Cases (empty inputs, edge dates, invalid phone/email, rapid submissions, max durations)
   - Tier 3: Cross-Feature Interactions (booking status lifecycle, pricing calculation with surcharges, enquiry to note association)
   - Tier 4: Real-World Workload Scenarios (complete customer journey, admin dispatch lifecycle, dispute/cancellation)
4. Verify tests run with `npm test` or test runner command.
5. Create `TEST_READY.md` at project root summarizing test commands and tier breakdown.
6. Write `handoff.md` in this directory upon completion.
