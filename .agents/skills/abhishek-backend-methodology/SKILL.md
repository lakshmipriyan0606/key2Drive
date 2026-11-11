---
name: abhishek-backend-methodology
description: Enterprise Clean Architecture and Domain-Driven Design (DDD) for Node.js / TypeScript, based on Abhishek Sharma's live stream backend methodology. Use whenever the user asks to "use this methodology", build production-grade Node.js backends, or apply DDD with tsyringe, Prisma, PostgreSQL, Redis, and BullMQ.
---

# Abhishek Sharma Backend Methodology (Enterprise Clean Architecture & DDD)

This skill provides the comprehensive implementation guide and code templates for building backend services using the **Domain-Driven Design (DDD) + Clean Architecture** methodology stream-tested by Abhishek Sharma across 136+ live coding sessions.

---

## 1. Directory Blueprint

When scaffolding or modifying backend services under this methodology, structure every business domain under `src/modules/<module-name>/`:

```
src/
├── app/
│   ├── app.ts                         # Express app configuration
│   ├── bootstrap.ts                   # Bootstrapping container & db connections
│   ├── server.ts                      # Server entry point
│   ├── shutdown.ts                    # Graceful shutdown handler (SIGTERM/SIGINT)
│   └── middleware/
│       ├── authentication.middleware.ts
│       ├── authorization.middleware.ts
│       └── error-handler.middleware.ts
├── config/
│   ├── env.config.ts                  # Zod environment schema validation
│   ├── redis.ts                       # Redis client instance
│   └── rate-limit.config.ts           # Rate limit configurations
├── infrastructure/
│   ├── cache/                         # Redis cache service, TTLs, keys
│   ├── container/                     # tsyringe container & registration modules
│   │   ├── container.ts
│   │   ├── registrations.ts
│   │   └── modules/                   # Per-domain DI registrations
│   └── database/
│       ├── prisma.ts                  # Prisma client instance
│       └── base.repository.ts         # Generic repository contract
└── modules/
    └── <domain>/                      # E.g., customer, order, identity, delivery
        ├── domain/
        │   ├── entities/              # Core business entities
        │   ├── value-objects/         # Immutable self-validating value objects
        │   ├── errors/                # Domain-specific errors
        │   └── repositories/          # Repository interfaces (ports)
        ├── application/
        │   ├── use-cases/             # Single-purpose use cases (contract + impl)
        │   ├── dto/                   # Request/Response DTO contracts
        │   └── dto/mapper/            # Entity <-> DTO mappers
        ├── infrastructure/
        │   ├── persistence/prisma/    # Prisma repository implementations (adapters)
        │   ├── persistence/tokens/    # DI injection tokens
        │   └── persistence/prisma/mappers/ # Database record <-> Entity mappers
        └── presentation/
            ├── controllers/           # Thin HTTP controllers
            └── routes/                # Express router declarations
```

---

## 2. Core Implementation Patterns

### Pattern A: Self-Validating Value Objects
Value objects normalize and validate input upon creation. They throw `DomainError` when invalid:

```typescript
import { DomainError } from "../errors/domain.error";

export class UserEmail {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): UserEmail {
    const normalized = UserEmail.normalize(value);
    UserEmail.validate(normalized);
    return new UserEmail(normalized);
  }

  private static normalize(value: string): string {
    if (typeof value !== "string") throw new DomainError("Email must be a string", 400);
    return value.trim().toLowerCase();
  }

  private static validate(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) throw new DomainError("Invalid email format", 400);
  }

  public getValue(): string {
    return this.value;
  }
}
```

---

### Pattern B: Dependency Injection with `tsyringe`
Use `tsyringe` to inject repository contracts into use cases:

```typescript
// Token
export const UserTokens = {
  UserRepository: Symbol("UserRepository"),
  UserRegistrationUseCase: Symbol("UserRegistrationUseCase"),
};

// Use Case Implementation
import { injectable, inject } from "tsyringe";
import { UserTokens } from "../../infrastructure/persistence/tokens/user.tokens";
import type { IUserRepository } from "../../domain/repositories/user.repository";

@injectable()
export class RegisterUserUseCaseImpl implements RegisterUserUseCase {
  constructor(
    @inject(UserTokens.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: RegisterUserInput): Promise<UserResultDto> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new UserAlreadyExistsError(input.email);

    const user = User.create(input);
    const saved = await this.userRepository.save(user);
    return UserResultMapper.toDto(saved);
  }
}
```

---

### Pattern C: Distributed Rate Limiting & Auth
* Store `refreshTokenHash` with device info in database/Redis.
* Apply Redis-backed rate limiting on all public authentication routes:

```typescript
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "@/config/redis";

export const createRedisRateLimiter = (prefix: string, maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
      prefix: `rl:${prefix}:`,
    }),
    handler: (_, res) => {
      res.status(429).json({
        success: false,
        message: `Too many requests for ${prefix}. Please try again later.`,
      });
    },
  });
};
```

---

### Pattern D: Fail-Fast Zod Environment Schema
Never start the application if environment variables are invalid:

```typescript
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Environment Validation Failed:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}
export const env = parsed.data;
```

