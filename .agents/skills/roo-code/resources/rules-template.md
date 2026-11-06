# Project Rules Specification

Place project-specific rules in `.roo/rules/` or `.agents/rules/` to enforce guidelines across all sessions.

## 1. Codebase Architecture & Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript (strict mode enabled)
- Styling: Tailwind CSS
- Database: SQLite / Prisma ORM
- Testing: Vitest

## 2. Universal Non-Negotiables
- **No Build Failures**: Never push or mark a turn complete if `npm run typecheck` or `next build` fails.
- **Maintain Test Coverage**: Every new API route or mutation must have accompanying automated unit/integration tests.
- **Preserve Comments & Docstrings**: Do not delete existing comments or documentation unrelated to your changes.
- **Atomic Commits**: Group related changes into single, cleanly labeled git commits.

## 3. Security & Validation
- Validate all incoming request payloads with Zod schemas.
- Sanitize HTML and prevent XSS injection.
- Ensure authentication checks guard all admin routes.

