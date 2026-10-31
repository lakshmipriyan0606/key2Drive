# Dispatch for Worker M1 (Foundation, Design Tokens, Motion Primitives & Universal Shell)

## Identity
- Role: Full-Stack Foundation & Shell Worker
- Working directory: e:\project\actingDriver\.agents\teamwork\worker_m1\
- Master Project Scope: e:\project\actingDriver\.agents\teamwork\orchestrator\PROJECT.md
- Authoritative User Request: e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md

## Explorer Reports (Mandatory Inputs)
- Toolchain & Configuration: e:\project\actingDriver\.agents\teamwork\explorer_m1_1\handoff.md
- Layout Shell & Responsive Nav: e:\project\actingDriver\.agents\teamwork\explorer_m1_2\handoff.md
- Motion Primitives & PROGRESS.md: e:\project\actingDriver\.agents\teamwork\explorer_m1_3\handoff.md

## Exclusive File Ownership
Worker M1 owns and implements:
1. `package.json` (Next.js 15.1.7, React 19, TypeScript, Tailwind 3.4.17, Framer Motion 12.4.3, Sonner 2.0.8, Lucide React, Zod, Prisma, clsx, tailwind-merge)
2. `tsconfig.json` (strict checking, `@/*` aliases)
3. `next.config.ts` (strict typecheck/lint)
4. `postcss.config.mjs` & `tailwind.config.ts` (exact brand palette #11243D, #172F4D, #F28C00, #FAF9F6, #FFFFFF, #252B33, #737B86, #E8E7E3; responsive screens xs: 360px through 3xl: 1920px)
5. `.eslintrc.json` & `.env.example`
6. `PROGRESS.md` at project root (`e:\project\actingDriver\PROGRESS.md`) tracking all milestones, skills registry, audit findings, and verification matrix per R1/R4.
7. `src/lib/utils.ts` (`cn` helper)
8. `src/lib/constants/navigation.ts` (navigation links, trust badges, unconfirmed review badges)
9. `src/lib/motion/motionTokens.ts` (Emil Kowalski duration scale, custom cubic-beziers, spring physics)
10. `src/lib/motion/useAccessibleMotion.ts` (`prefers-reduced-motion` compliance with gentle 150ms opacity fades)
11. `src/components/ui/ButtonMotion.tsx` (tactile press `whileTap={{ scale: 0.97 }}`, 140ms, brand variants)
12. `src/components/ui/ServiceCardMotion.tsx` (GPU elevation `y: -4`, border highlight overlay)
13. `src/components/ui/SonnerToaster.tsx` (luxury brand styled Sonner toaster)
14. `src/components/layout/Header.tsx` (SVG luxury brand mark, nav links, active states, CTA, mobile trigger)
15. `src/components/layout/MobileNav.tsx` (responsive drawer, 44px+ touch targets, focus trap, escape handler)
16. `src/components/layout/Footer.tsx` (brand mission, quick links, contact details with [Pending Client Review] tags, WhatsApp trigger, trust badges)
17. `src/app/globals.css` (CSS variables, `@tailwind base/components/utilities`, reduced motion global guard)
18. `src/app/layout.tsx` (metadata, Inter/Plus Jakarta Sans font, Sonner Toaster, universal shell)
19. `src/app/page.tsx` (initial landing page integrating Header, Hero preview, sample service card, and Footer)

## Verification Commands
After implementing:
1. `npm install`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
Document all commands, stdout/stderr, and exit codes in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-10-31T09:04:06Z
You are Worker M1 for Key2Drive.
Your working directory is: e:\project\actingDriver\.agents\teamwork\worker_m1\
Read e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md completely.
Read e:\project\actingDriver\.agents\teamwork\orchestrator\PROJECT.md.
Read e:\project\actingDriver\.agents\teamwork\worker_m1\DISPATCH.md.
Also read the Explorer handoff reports:
- e:\project\actingDriver\.agents\teamwork\explorer_m1_1\handoff.md
- e:\project\actingDriver\.agents\teamwork\explorer_m1_2\handoff.md
- e:\project\actingDriver\.agents\teamwork\explorer_m1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task is to implement Milestone 1:
1. Initialize package.json with Next.js 15.1.7, React 19, TypeScript, Tailwind CSS 3.4.17, Framer Motion 12.4.3, Sonner 2.0.8, Lucide React, Zod, Prisma, clsx, tailwind-merge.
2. Initialize tsconfig.json, next.config.ts, postcss.config.mjs, .eslintrc.json, .env.example.
3. Configure tailwind.config.ts with the exact brand palette:
   - Primary navy: #11243D
   - Deep navy: #172F4D
   - Accent orange: #F28C00
   - Warm background: #FAF9F6
   - White: #FFFFFF
   - Primary text: #252B33
   - Secondary text: #737B86
   - Border: #E8E7E3
   - Breakpoints covering 360px to 1920px (xs: 360px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1440px, 3xl: 1920px).
4. Create PROGRESS.md at the project root (e:\project\actingDriver\PROGRESS.md) following the exact specification in explorer_m1_3/handoff.md.
5. Implement src/lib/utils.ts, src/lib/constants/navigation.ts, src/lib/motion/motionTokens.ts, src/lib/motion/useAccessibleMotion.ts.
6. Implement reusable UI components: src/components/ui/ButtonMotion.tsx, src/components/ui/ServiceCardMotion.tsx, src/components/ui/SonnerToaster.tsx.
7. Implement universal application shell: src/components/layout/Header.tsx, src/components/layout/MobileNav.tsx, src/components/layout/Footer.tsx.
8. Implement src/app/globals.css and src/app/layout.tsx.
9. Implement initial src/app/page.tsx landing page showcasing Header, Hero section preview, service card preview, and Footer.
10. Run verification commands:
    - npm install
    - npm run typecheck
    - npm run lint
    - npm run build
11. Document all executed commands, exit codes, and output logs in e:\project\actingDriver\.agents\teamwork\worker_m1\handoff.md.
12. Update your progress.md regularly. Send a completion message via send_message when handoff.md is ready.
