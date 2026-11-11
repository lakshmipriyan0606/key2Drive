# Backend Architecture & Methodology Rules (Abhishek Sharma / Enterprise Clean Architecture)

When the user asks to "use this methodology", "use the backend methodology", or build backend features according to this standard, follow this exact architectural blueprint.

## 1. Core Architectural Paradigm: Domain-Driven Design (DDD) & Clean Architecture
Never write fat, mixed-concern Express controllers. Every backend module must be divided into 4 strict layers:

```
src/modules/<module-name>/
├── domain/                         # Pure business logic (Zero external dependencies)
│   ├── entities/                   # Domain entities with private fields & business methods
│   ├── value-objects/              # Self-validating, immutable value objects (e.g., Pin, Email)
│   ├── errors/                     # Domain-specific errors extending Error
│   └── repositories/               # Repository interfaces (Ports)
├── application/                    # Application use cases & orchestration
│   ├── use-cases/                  # Single-responsibility use cases (interfaces & .impl.ts)
│   ├── dto/                        # Input/Output DTOs
│   └── dto/mapper/                 # Entity-to-DTO and DTO-to-Entity mappers
├── infrastructure/                 # External tools, persistence & framework adapters
│   ├── persistence/prisma/         # Prisma repository implementations (Adapters)
│   ├── persistence/tokens/         # Dependency injection symbol/string tokens
│   └── persistence/prisma/mappers/ # Database-to-Entity mappers
└── presentation/                   # HTTP / REST Layer
    ├── controllers/                # Thin controllers calling Use Cases via DI
    └── routes/                     # Express router definitions with middlewares
```

## 2. Dependency Injection & Inversion of Control (tsyringe)
- Use `tsyringe` for IoC container management.
- Every Use Case, Service, and Repository implementation must be annotated with `@injectable()`.
- Inject repository interfaces using typed tokens (`@inject(ModuleTokens.Repository)`).
- Register all bindings in `src/infrastructure/container/registrations.ts`.

## 3. Self-Validating Value Objects & Entities
- Do not pass raw strings or primitives directly into domain logic.
- Wrap critical primitives in Value Objects (e.g. `AddressPin`, `Email`, `PhoneNumber`) that normalize and validate upon instantiation (`.create()` static factory).
- Entities protect invariants and encapsulate state mutation.

## 4. Security & Production Auth Standards
- **Token Strategy**: Dual-token pattern (short-lived JWT Access Token, long-lived Refresh Token).
- **Session Tracking**: Never store plain refresh tokens. Store `refreshTokenHash` in DB/Redis along with `ipAddress`, `userAgent`, and `isRevoked` status for remote revocation.
- **Account Linking**: Separate core user accounts from authentication providers (`EMAIL`, `GOOGLE`) via an `AuthAccount` model.
- **Distributed Rate Limiting**: Protect authentication endpoints (`/login`, `/register`, `/auth/google/callback`) using `express-rate-limit` backed by Redis (`rate-limit-redis`).

## 5. Fail-Fast Configuration & Infrastructure
- Validate all `process.env` keys at startup using `zod` (`env.schema.ts`). If validation fails, crash immediately with `process.exit(1)`.
- Use Redis for multi-level caching (with defined keys, TTLs, and serializers) and BullMQ for decoupled asynchronous task queues (emails, heavy processing).
- Provide graceful shutdown (`SIGTERM`/`SIGINT`) to drain active connections, close database pools, and disconnect Redis cleanly.

