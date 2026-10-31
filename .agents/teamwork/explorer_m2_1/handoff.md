# Handoff Report: Explorer M2-1 (Prisma Schema, SQLite Database & Migration Strategy)

**Agent**: Explorer M2-1 (`teamwork_explorer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m2_1\`  
**Target Milestone**: M2 (Persistence, Database & Core APIs)  

---

## 1. Observation

1. **Prisma Environment & Version**:
   - `package.json` specifies:
     - `@prisma/client`: `^6.2.1` (installed: `6.19.3`)
     - `prisma`: `^6.2.1` (installed: `6.19.3`)
     - Runtime: Node.js `v24.8.0`, win32-x64, TypeScript `5.9.3`.
   - Tool execution `npx prisma --version` output:
     ```
     prisma                  : 6.19.3
     @prisma/client          : 6.19.3
     Computed binaryTarget   : windows
     Operating System        : win32
     Architecture            : x64
     Node.js                 : v24.8.0
     Query Engine (Node-API) : libquery-engine c2990dca591cba766e3b7ef5d9e8a84796e47ab7
     PSL                     : @prisma/prisma-schema-wasm 7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7
     Schema Engine           : schema-engine-cli c2990dca591cba766e3b7ef5d9e8a84796e47ab7
     ```

2. **Persistence Configuration & Database Path**:
   - `.env` specifies: `DATABASE_URL="file:./dev.db"` (line 2).
   - `PROJECT.md § Interface Contracts` establishes:
     - Database location: `prisma/dev.db`.
     - Singleton client path: `@/lib/db.ts` (`src/lib/db.ts`).
   - The directory `prisma/` currently does not exist in the root repository; it must be created by Worker M2 when creating `prisma/schema.prisma`.

3. **Prisma Schema Validation Test**:
   - A complete 8-model schema was constructed in `.agents/teamwork/explorer_m2_1/proposed_schema.prisma` and validated against the Prisma CLI engine:
     `npx prisma validate --schema=.agents/teamwork/explorer_m2_1/proposed_schema.prisma`
     Result: `The schema at .agents\teamwork\explorer_m2_1\proposed_schema.prisma is valid 🚀` (Exit code 0).
   - Formatting test executed:
     `npx prisma format --schema=.agents/teamwork/explorer_m2_1/proposed_schema.prisma`
     Result: `Formatted .agents\teamwork\explorer_m2_1\proposed_schema.prisma in 35ms 🚀` (Exit code 0).

4. **Service Tiers and Constant Alignment**:
   - `src/lib/constants/navigation.ts` lines 19–26 and `explorer_m2_2/plan.md` lines 10–16 define the 6 chauffeur tiers:
     1. Hourly Driver (`hourly-driver`): ₹399/hr (min 4 hrs).
     2. Full-Day Driver (`full-day-driver`): ₹1,899/day (8 hrs/80 km).
     3. Airport Transfers (`airport-transfer`): ₹799 flat rate.
     4. Outstation Journeys (`outstation-driver`): ₹2,499/day + allowances.
     5. Corporate Retainers (`corporate-chauffeur`): ₹34,999/month.
     6. Personal Chauffeur (`personal-chauffeur`): ₹28,999/month.

5. **Lifecycle State Machine & Idempotency Constraints**:
   - `PROJECT.md § 2. Validation & API Contracts` lines 82–86 specifies the booking lifecycle states:
     - `REQUESTED` -> `CONFIRMED` | `REJECTED` | `CANCELLED`
     - `CONFIRMED` -> `COMPLETED` | `CANCELLED`
   - Booking reference format: `K2D-YYYYMMDD-XXXX`.
   - Double-submit lock: `submissionHash` index to check for duplicate submissions within 5 minutes.

---

## 2. Logic Chain

1. **Relational Modeling & Schema Cohesion**:
   - **User & Session**: Admin authentication requires password-hashed user records and persistent session tokens that can be stored in httpOnly cookies. With `onDelete: Cascade` on `Session.userId`, terminating or deleting a staff account automatically invalidates their active sessions.
   - **Service & Tariff**: Chauffeur offerings have base attributes (`slug`, `title`, `features`, `basePrice`, `priceUnit`, `isActive`, `sortOrder`) and granular tariff breakdowns (`vehicleCategory`, `baseRate`, `includedHours`, `includedKm`, `extraHourRate`, `extraKmRate`, `nightChargeRate`, `waitingChargePerMin`, `cancellationPolicy`, `isUnconfirmed`). Separating `Service` and `Tariff` allows multiple vehicle categories per service (e.g., Sedan vs SUV vs Luxury) while allowing base prices to be quickly displayed on service overview cards.
   - **Booking**: Central entity linking customer contact details, service selection, pickup and drop coordinates/addresses, schedule, vehicle info, initial price estimate (`estimatedAmount`), settled amount (`finalAmount`), status enum, and idempotency key (`submissionHash`).
   - **BookingStatusHistory**: Dedicated audit trail recording every state change with prior state (`fromStatus`), target state (`toStatus`), actor (`changedBy` - e.g., admin email or customer), transition note (`note`), and exact timestamp (`createdAt`). This supports the admin dashboard timeline view and dispute verification.
   - **Enquiry & AdminNote**: Customer support inquiries (`Enquiry`) capture name, contact information, subject, message, and lifecycle status (`PENDING`, `IN_REVIEW`, `RESOLVED`). Staff can attach contextual `AdminNote` records to either a `Booking` or an `Enquiry` via optional foreign keys (`bookingId`, `enquiryId`), linking to `User.id` as `authorId`.

2. **Enum Support on SQLite**:
   - Prisma v6.19.3 supports enum declarations (`enum Role`, `enum BookingStatus`, `enum EnquiryStatus`) when using the `sqlite` datasource provider. Prisma CLI maps these to text columns in SQLite dev.db while generating strongly typed TypeScript enums in `@prisma/client`. This ensures compile-time type safety across API routes without fragile string literals.

3. **Performance & Query Optimization (Indexes)**:
   - Queries in Next.js API routes filter heavily by `reference`, `status`, `serviceId`, `customerEmail`, `customerPhone`, `pickupDateTime`, and `submissionHash`.
   - Composite and single-column `@@index` declarations were added to ensure constant-time lookups on SQLite B-trees.

4. **Next.js Fast Refresh & Database Singleton**:
   - In Next.js development mode, file changes trigger module re-evaluation. If `new PrismaClient()` is instantiated at module scope without attaching to `globalThis`, each hot reload opens a new SQLite connection handle.
   - On Windows, unclosed file locks on `prisma/dev.db` cause `EBUSY: resource busy or locked` or `SQLITE_BUSY: database is locked`.
   - The `@/lib/db.ts` implementation stores the singleton on `globalThis.prisma` when `NODE_ENV !== "production"`, preventing redundant instances.

5. **Synchronization Strategy (`db push` vs `migrate dev`)**:
   - For embedded SQLite in local development, `npx prisma db push` is faster, non-interactive, and directly synchronizes the schema state into `prisma/dev.db` without accumulating historical SQL migration files.
   - `npx prisma generate` updates the generated client in `node_modules/@prisma/client` immediately following `db push`.

---

## 3. Caveats

1. **SQLite Type Limitations**:
   - SQLite does not have a native JSON type or Array type. The `Service.features` field is typed as `String` in Prisma and should store JSON stringified arrays (e.g. `JSON.stringify(["Min 4 hours", "Sedan & SUV"])`). The seed script and API routes should parse/serialize this field using `JSON.parse` / `JSON.stringify` or Zod transforms.
2. **Database File Exclusion**:
   - `prisma/dev.db`, `prisma/dev.db-journal`, `prisma/dev.db-wal`, and `prisma/dev.db-shm` are generated binary files. A `.gitignore` entry should ensure these are excluded from Git repository commits.
3. **Foreign Keys on SQLite**:
   - Foreign key constraints are enforced by Prisma's query engine at runtime. Cascade deletes configured in the Prisma schema (`onDelete: Cascade`) will execute cleanly through the Prisma client.

---

## 4. Conclusion & Drop-In Code Specifications

The Prisma configuration, 8 relational models, database singleton, and synchronization workflow are fully specified and validated.

### 4.1. Drop-In Code: `prisma/schema.prisma`

Worker M2 should write the following exact content to `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  STAFF
}

enum BookingStatus {
  REQUESTED
  CONFIRMED
  REJECTED
  CANCELLED
  COMPLETED
}

enum EnquiryStatus {
  PENDING
  IN_REVIEW
  RESOLVED
}

model User {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String
  name         String
  role         Role        @default(ADMIN)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  sessions     Session[]
  adminNotes   AdminNote[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model Service {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  tagline     String
  description String
  features    String
  basePrice   Float
  priceUnit   String
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tariffs     Tariff[]
  bookings    Booking[]

  @@index([slug])
  @@index([isActive])
  @@map("services")
}

model Tariff {
  id                  String   @id @default(cuid())
  serviceId           String
  title               String
  vehicleCategory     String
  baseRate            Float
  includedHours       Int?
  includedKm          Int?
  extraHourRate       Float
  extraKmRate         Float
  nightChargeRate     Float
  waitingChargePerMin Float
  cancellationPolicy  String?
  isUnconfirmed       Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  service             Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
  @@map("tariffs")
}

model Booking {
  id                  String                 @id @default(cuid())
  reference           String                 @unique
  status              BookingStatus          @default(REQUESTED)
  customerName        String
  customerPhone       String
  customerEmail       String
  serviceId           String
  pickupAddress       String
  dropAddress         String?
  pickupDateTime      DateTime
  duration            String?
  vehicleInfo         String?
  specialInstructions String?
  estimatedAmount     Float
  finalAmount         Float?
  submissionHash      String?
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt
  service             Service                @relation(fields: [serviceId], references: [id])
  statusHistory       BookingStatusHistory[]
  notes               AdminNote[]

  @@index([reference])
  @@index([status])
  @@index([serviceId])
  @@index([customerEmail])
  @@index([customerPhone])
  @@index([pickupDateTime])
  @@index([submissionHash])
  @@map("bookings")
}

model BookingStatusHistory {
  id         String        @id @default(cuid())
  bookingId  String
  fromStatus BookingStatus
  toStatus   BookingStatus
  changedBy  String
  note       String?
  createdAt  DateTime      @default(now())
  booking    Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@index([createdAt])
  @@map("booking_status_histories")
}

model Enquiry {
  id            String        @id @default(cuid())
  name          String
  phone         String
  email         String
  subject       String
  message       String
  status        EnquiryStatus @default(PENDING)
  isResolved    Boolean       @default(false)
  internalNotes String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  notes         AdminNote[]

  @@index([status])
  @@index([isResolved])
  @@index([createdAt])
  @@map("enquiries")
}

model AdminNote {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  bookingId String?
  enquiryId String?
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  booking   Booking? @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  enquiry   Enquiry? @relation(fields: [enquiryId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@index([bookingId])
  @@index([enquiryId])
  @@map("admin_notes")
}
```

*(Reference file created and pre-validated at `.agents/teamwork/explorer_m2_1/proposed_schema.prisma`)*

---

### 4.2. Drop-In Code: `src/lib/db.ts`

Worker M2 should write the following exact content to `src/lib/db.ts`:

```ts
/**
 * Key2Drive Prisma Client Singleton
 * Path: src/lib/db.ts
 *
 * Ensures a single shared PrismaClient instance across hot-reloading
 * in Next.js development and prevents SQLite connection/lock exhaustion.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

*(Reference file created at `.agents/teamwork/explorer_m2_1/proposed_db.ts`)*

---

## 5. Verification Method

Once Worker M2 implements `prisma/schema.prisma` and `src/lib/db.ts`, execute the following commands to independently verify:

1. **Schema Validation**:
   ```powershell
   npx prisma validate --schema=prisma/schema.prisma
   ```
   *Expected*: `The schema at prisma\schema.prisma is valid 🚀` (Exit code 0).

2. **Schema Formatting**:
   ```powershell
   npx prisma format --schema=prisma/schema.prisma
   ```
   *Expected*: `Formatted prisma\schema.prisma in XXms 🚀` (Exit code 0).

3. **Database Push (SQLite Table Creation)**:
   ```powershell
   npx prisma db push --schema=prisma/schema.prisma
   ```
   *Expected*: SQLite database `prisma/dev.db` created with all 8 tables and indexes without data loss or error.

4. **Client Generation**:
   ```powershell
   npx prisma generate --schema=prisma/schema.prisma
   ```
   *Expected*: Prisma Client generated into `node_modules/@prisma/client` with TypeScript types for `User`, `Session`, `Service`, `Tariff`, `Booking`, `BookingStatusHistory`, `Enquiry`, `AdminNote`, `Role`, `BookingStatus`, `EnquiryStatus`.

5. **TypeScript Verification**:
   ```powershell
   npm run typecheck
   ```
   *Expected*: Zero TypeScript compilation errors.

6. **Invalidation Conditions**:
   - If `npx prisma validate` reports syntax errors or missing opposite relations.
   - If `npx prisma db push` fails due to SQLite path misresolution.
   - If `npm run typecheck` fails due to missing client types.
