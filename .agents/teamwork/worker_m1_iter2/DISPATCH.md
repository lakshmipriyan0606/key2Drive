# Dispatch for Worker M1 Iteration 2 (Remediation of Header, MobileNav, Footer, globals.css, and page.tsx)

## Identity
- Role: Full-Stack Remediation Worker
- Working directory: e:\project\actingDriver\.agents\teamwork\worker_m1_iter2\
- Master Project Scope: e:\project\actingDriver\.agents\teamwork\orchestrator\PROJECT.md
- Authoritative User Request: e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md
- Previous Gate Status: e:\project\actingDriver\.agents\teamwork\orchestrator\GATE_STATUS.md

## Explorer Remediation Reports (Mandatory Inputs)
- Explorer 1 (Header & Footer): e:\project\actingDriver\.agents\teamwork\explorer_m1_iter2_1\handoff.md
- Explorer 2 (MobileNav Focus Restoration): e:\project\actingDriver\.agents\teamwork\explorer_m1_iter2_2\handoff.md
- Explorer 3 (globals.css & page.tsx): e:\project\actingDriver\.agents\teamwork\explorer_m1_iter2_3\handoff.md

## Exclusive File Ownership
Worker M1 Iteration 2 owns and modifies:
1. `src/components/layout/Header.tsx`:
   - Keep padding constant (`py-3.5`) across all scroll states.
   - Replace `transition-all duration-200` on `<header>` with `transition-[background-color,border-color,box-shadow] duration-200`.
   - Replace `transition-all duration-150` on nav links and CTA with `transition-colors duration-150`.
   - Add `menuButtonRef = useRef<HTMLButtonElement>(null)`, attach to hamburger button, and pass `triggerRef={menuButtonRef}` to `<MobileNav />`.
2. `src/components/layout/MobileNav.tsx`:
   - Add `triggerRef?: React.RefObject<HTMLButtonElement | null>` to `MobileNavProps`.
   - Add `handleDismiss` callback that calls `onClose()` and restores focus to `triggerRef` (or `previousActiveElementRef`) via `setTimeout(..., 0)` on Escape, backdrop click, and Close button.
   - Replace `transition-all` on close button and CTA link with `transition-colors duration-150`.
3. `src/components/layout/Footer.tsx`:
   - Replace `transition-all duration-150` on WhatsApp link (line 119) with `transition-colors duration-150`.
4. `src/app/globals.css`:
   - Refine `@media (prefers-reduced-motion: reduce)` to suppress spatial transforms while allowing 150ms opacity fades (`transition-opacity`, `transition-colors`).
5. `src/app/page.tsx`:
   - Standardize Hero CTA button using `<ButtonMotion variant="accent" size="lg">` and eliminate `transition-all`.
6. `PROGRESS.md`:
   - Update `PROGRESS.md` logging the remediation of `AUD-003` (layout thrashing fix in Header.tsx and transition-all replacement) and `AUD-004` (focus restoration in MobileNav.tsx).

## Verification Commands
After modifying:
1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. Automated grep check: `rg "transition-all" src/` (Must return 0 results).
Document all commands, stdout/stderr, and exit codes in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-10-31T09:48:46Z
Dispatched to apply Milestone 1 Iteration 2 remediations:
- Header.tsx: constant py-3.5, replace transition-all, triggerRef
- MobileNav.tsx: triggerRef, handleDismiss focus restoration, replace transition-all
- Footer.tsx: replace transition-all on WhatsApp link
- globals.css: refine prefers-reduced-motion for 150ms opacity/color transitions while suppressing spatial transforms
- page.tsx: standardize Hero CTA with ButtonMotion variant="accent" size="lg"
- PROGRESS.md: update AUD-003 and AUD-004 remediations
- Verification: npm run typecheck, npm run lint, npm run build, rg "transition-all" src/ (0 matches)
