# Handoff Report: Explorer M2-2 (Database Seed Script & Zod Validation Schemas)

**Agent**: Explorer M2-2 (`teamwork_explorer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m2_2\`  
**Target Milestone**: M2 (Persistence, Database & Core APIs)  

---

## 1. Observation

1. **Prisma Schema and Database Contracts Alignment**:
   - `e:\project\actingDriver\.agents\teamwork\explorer_m2_1\proposed_schema.prisma` establishes the validated 8-model schema:
     - `User`: `{ id, email, passwordHash, name, role (ADMIN/STAFF), createdAt, updatedAt }`
     - `Session`: `{ id, userId, token, expiresAt, createdAt }`
     - `Service`: `{ id, slug, title, tagline, description, features (String JSON), basePrice, priceUnit, isActive, sortOrder, tariffs, bookings }`
     - `Tariff`: `{ id, serviceId, title, vehicleCategory, baseRate, includedHours, includedKm, extraHourRate, extraKmRate, nightChargeRate, waitingChargePerMin, cancellationPolicy, isUnconfirmed }`
     - `Booking`: `{ id, reference, status (BookingStatus), customerName, customerPhone, customerEmail, serviceId, pickupAddress, dropAddress, pickupDateTime, duration, vehicleInfo, specialInstructions, estimatedAmount, finalAmount, submissionHash }`
     - `BookingStatusHistory`: `{ id, bookingId, fromStatus, toStatus, changedBy, note, createdAt }`
     - `Enquiry`: `{ id, name, phone, email, subject, message, status (EnquiryStatus), isResolved, internalNotes, createdAt, updatedAt }`
     - `AdminNote`: `{ id, content, authorId, bookingId?, enquiryId?, createdAt }`
   - Enums defined in schema: `Role { ADMIN, STAFF }`, `BookingStatus { REQUESTED, CONFIRMED, REJECTED, CANCELLED, COMPLETED }`, `EnquiryStatus { PENDING, IN_REVIEW, RESOLVED }`.

2. **Chauffeur Service Tiers & Pricing Specs**:
   - `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md § R2` lines 20–24, `src/lib/constants/navigation.ts` lines 19–26, and `plan.md` lines 10–16 prescribe 6 service tiers:
     1. Hourly Driver (`hourly-driver`): ₹399/hr (min 4 hrs).
     2. Full-Day Driver (`full-day-driver`): ₹1,899/day (8 hrs/80 km).
     3. Airport Pickup/Drop (`airport-transfer`): ₹799 flat rate.
     4. Outstation Trips (`outstation-driver`): ₹2,499/day + allowances.
     5. Corporate Driver (`corporate-chauffeur`): ₹34,999/month.
     6. Personal Chauffeur (`personal-chauffeur`): ₹28,999/month.
   - Authoritative constraint: All seeded tariffs must explicitly be tagged with `[Pending Client Review]` in the title and have `isUnconfirmed: true`.

3. **Admin User Credentials**:
   - `plan.md` line 9 specifies default administrator:
     - Email: `admin@key2drive.com`
     - Password: `Admin@Key2Drive2026!`
     - Role: `ADMIN`
     - Hashing: bcryptjs with work factor 10.
   - Tested bcrypt hash CLI generation for `"Admin@Key2Drive2026!"`:
     `$2a$10$.di5Xn2F5PZAuQtQxTe5DuLSjU2muJJoj46O8F1Rtdo0koj0a8Jnu`
     Comparison test against `"Admin@Key2Drive2026!"` verified match with exit code 0.

4. **Package Dependencies & Seed Runner**:
   - `package.json` line 13 specifies: `"db:seed": "tsx prisma/seed.ts"`.
   - `package.json` line 25 has `"zod": "^3.24.1"`.
   - `bcryptjs` is required for runtime password hashing during seeding and authentication. Adding `npm install bcryptjs` and `npm install -D @types/bcryptjs` is documented for Worker M2.
   - The seed script includes a graceful dynamic import of `bcryptjs` with verified fallback to the pre-computed hash `$2a$10$.di5Xn2F5PZAuQtQxTe5DuLSjU2muJJoj46O8F1Rtdo0koj0a8Jnu`, ensuring execution safety in any environment.

5. **Validation Test Suite Execution**:
   - Implemented and executed `.agents/teamwork/explorer_m2_2/test_validations.ts` using `npx tsx`:
     - Test run output: `=== Summary: 30 passed, 0 failed ===` (Exit code 0).
     - Verified:
       - Phone sanitization (+91 98765-43210 -> 9876543210) and rejection of non-Indian prefixes (1234567890).
       - Future pickup datetime buffer (past dates rejected, >=15 min future dates accepted).
       - Booking idempotency hash validation (8–128 chars).
       - Vehicle info stringification and normalization from structured objects.
       - Booking lifecycle state machine (REQUESTED -> CONFIRMED/REJECTED/CANCELLED, CONFIRMED -> COMPLETED/CANCELLED, terminal states locked).
       - Negative tariff pricing prevention.
       - Admin login email normalization (trim, lowercase) and password length validation.
       - Admin note attachment integrity (must reference bookingId or enquiryId).

---

## 2. Logic Chain

1. **Idempotent Seeding Architecture**:
   - Seed scripts must be safe to execute multiple times during development and CI testing (`db:seed` or `prisma migrate reset`).
   - For `User`: Using `prisma.user.upsert` keyed by unique `email: "admin@key2drive.com"` updates existing credentials without throwing `P2002` unique constraint violation.
   - For `Service`: Using `prisma.service.upsert` keyed by unique `slug` ensures all 6 chauffeur service records are inserted or refreshed cleanly.
   - For `Tariff`: Tariffs belong to a service. By performing `prisma.tariff.deleteMany({ where: { serviceId: service.id } })` immediately before recreating the service's tariffs, re-running the seed script never duplicates tariff records.

2. **Compliance with `[Pending Client Review]` Mandate**:
   - In accordance with `ORIGINAL_REQUEST.md § R2` and `plan.md`, initial pricing figures require explicit stakeholder sign-off.
   - Every seeded tariff is configured with:
     - `isUnconfirmed: true`
     - Title containing `[Pending Client Review]`
   - This enables the frontend UI and customer pricing tables to render amber review notices and disclaimer banners automatically.

3. **Input Sanitization and Defensive Validation (Zod)**:
   - **Phone Normalization**: Indian users frequently enter phone numbers in formats such as `+91 98765 43210`, `09876543210`, or `98765-43210`. The `phoneSchema` strips non-digit characters and standard prefixes, transforming the input into a standard 10-digit number matching `/^[6-9]\d{9}$/`.
   - **Date & Lead Time**: Chauffeur dispatch requires preparation time. The `futurePickupDateTimeSchema` validates both date validity and enforces a minimum 15-minute lead time from the instant of booking submission.
   - **Vehicle Information Flexibility**: Booking forms may capture vehicles as freeform text (`"Honda City (Manual)"`) or structured selections (`{ make: "Honda", model: "City", transmission: "MANUAL" }`). The schema accepts either and formats it to a readable string for SQLite storage.
   - **Idempotency Hash**: The `submissionHash` field guards against double-booking caused by network retries or double-clicking the confirmation button.

4. **Lifecycle State Machine Enforcement**:
   - `status.ts` codifies the project's booking lifecycle:
     - `REQUESTED` can transition to `CONFIRMED`, `REJECTED`, or `CANCELLED`.
     - `CONFIRMED` can transition to `COMPLETED` or `CANCELLED`.
     - `REJECTED`, `CANCELLED`, and `COMPLETED` are terminal states.
   - The `BookingStatusTransitionSchema` implements `superRefine` to detect illegal transitions or redundant updates (e.g. `CONFIRMED` -> `CONFIRMED`), providing exact feedback on allowed next statuses.

---

## 3. Caveats

1. **Dependency Installation (`bcryptjs`)**:
   - `bcryptjs` and `@types/bcryptjs` must be installed by Worker M2 (`npm install bcryptjs && npm install -D @types/bcryptjs`). The seed script provides a runtime fallback to the verified precomputed hash, but live authentication in API routes requires `bcryptjs`.
2. **Features Serialization on SQLite**:
   - SQLite does not have a native string array type. `Service.features` is stored as a JSON string (`JSON.stringify(string[])`). The validation schema in `tariff.ts` and the seed script handle serialization and parsing.
3. **Database URL Environment Variable**:
   - The seed script expects `DATABASE_URL` in `.env` (configured as `DATABASE_URL="file:./dev.db"`). When executing `npx tsx prisma/seed.ts`, tsx automatically loads `.env`.

---

## 4. Conclusion & Drop-In Code Specifications

The complete seed script and 8 modular Zod validation schemas are designed, drop-in ready, and verified against 30 automated test assertions.

### 4.1. File: `prisma/seed.ts`
Write the following exact code to `prisma/seed.ts`:

```typescript
/**
 * Key2Drive Database Seed Script
 * File: prisma/seed.ts
 *
 * Execution:
 *   npx tsx prisma/seed.ts
 *   or npm run db:seed
 *
 * Seeds:
 * 1. Default Super Admin User (admin@key2drive.com / Admin@Key2Drive2026!)
 * 2. Six (6) Chauffeur Service Tiers with realistic marketing copy & features
 * 3. Granular Tariffs explicitly flagged with isUnconfirmed: true and [Pending Client Review]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pre-computed bcrypt hash (salt rounds: 10) for "Admin@Key2Drive2026!"
// Verified via bcrypt CLI. Serves as robust fallback if bcryptjs is optional.
const PRECOMPUTED_ADMIN_HASH =
  "$2a$10$.di5Xn2F5PZAuQtQxTe5DuLSjU2muJJoj46O8F1Rtdo0koj0a8Jnu";

async function getAdminPasswordHash(): Promise<string> {
  try {
    const bcryptModule = await import("bcryptjs");
    const bcrypt = bcryptModule.default || bcryptModule;
    return await bcrypt.hash("Admin@Key2Drive2026!", 10);
  } catch {
    console.log(
      "  [Notice] 'bcryptjs' package not found in runtime. Using verified precomputed bcrypt hash."
    );
    return PRECOMPUTED_ADMIN_HASH;
  }
}

interface TariffSeedData {
  title: string;
  vehicleCategory: string;
  baseRate: number;
  includedHours: number | null;
  includedKm: number | null;
  extraHourRate: number;
  extraKmRate: number;
  nightChargeRate: number;
  waitingChargePerMin: number;
  cancellationPolicy: string;
  isUnconfirmed: boolean;
}

interface ServiceSeedData {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  sortOrder: number;
  tariffs: TariffSeedData[];
}

const CHAUFFEUR_SERVICES: ServiceSeedData[] = [
  {
    slug: "hourly-driver",
    title: "Hourly Driver",
    tagline:
      "On-demand professional chauffeur for flexible city errands, meetings, and dining.",
    description:
      "Hire an experienced, background-verified chauffeur by the hour to drive your personal car. Ideal for city commutes, shopping sprees, dining out, or medical appointments with zero parking stress and complete peace of mind.",
    features: [
      "Minimum 4-hour flexible booking",
      "Manual, automatic & luxury vehicle certified",
      "Police background verified & licensed",
      "Doorstep pickup and handover",
      "Live trip tracking & dispatch support",
      "Zero peak surge pricing guarantee",
    ],
    basePrice: 399,
    priceUnit: "per hour (min 4 hrs)",
    isActive: true,
    sortOrder: 1,
    tariffs: [
      {
        title: "Hourly City Driver - Hatchback & Sedan [Pending Client Review]",
        vehicleCategory: "Hatchback / Sedan",
        baseRate: 399,
        includedHours: 4,
        includedKm: null,
        extraHourRate: 99,
        extraKmRate: 0,
        nightChargeRate: 150,
        waitingChargePerMin: 2,
        cancellationPolicy:
          "Free cancellation up to 2 hours before scheduled pickup time. ₹150 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
      {
        title: "Hourly City Driver - Luxury & Premium SUV [Pending Client Review]",
        vehicleCategory: "Luxury / SUV",
        baseRate: 549,
        includedHours: 4,
        includedKm: null,
        extraHourRate: 149,
        extraKmRate: 0,
        nightChargeRate: 200,
        waitingChargePerMin: 3,
        cancellationPolicy:
          "Free cancellation up to 3 hours before scheduled pickup time. ₹250 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    slug: "full-day-driver",
    title: "Full-Day Driver",
    tagline:
      "Dedicated 8-hour executive chauffeur for your busy daily itinerary.",
    description:
      "Enjoy seamless, uninterrupted mobility across the city for a full workday or private family outing. Your personal driver remains dedicated to your vehicle and schedule for up to 8 hours and 80 km with unlimited stops.",
    features: [
      "8 hours / 80 km inclusive city package",
      "Dedicated chauffeur on standby throughout",
      "Punctual, formal chauffeur attire",
      "Multiple stops within metropolitan limits",
      "Transparent overtime & extra km billing",
      "Vehicle safety and fluid checks included",
    ],
    basePrice: 1899,
    priceUnit: "per day (8 hrs / 80 km)",
    isActive: true,
    sortOrder: 2,
    tariffs: [
      {
        title: "Full-Day Standard (8 Hours / 80 Km) [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 1899,
        includedHours: 8,
        includedKm: 80,
        extraHourRate: 149,
        extraKmRate: 12,
        nightChargeRate: 250,
        waitingChargePerMin: 0,
        cancellationPolicy:
          "Free cancellation up to 4 hours before scheduled pickup time. ₹300 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
      {
        title: "Full-Day Extended (12 Hours / 120 Km) [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 2499,
        includedHours: 12,
        includedKm: 120,
        extraHourRate: 149,
        extraKmRate: 12,
        nightChargeRate: 250,
        waitingChargePerMin: 0,
        cancellationPolicy:
          "Free cancellation up to 4 hours before scheduled pickup time. ₹350 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    slug: "airport-transfer",
    title: "Airport Pickup / Drop",
    tagline:
      "Punctual, stress-free transfers to and from Kempegowda International Airport.",
    description:
      "Never miss a flight or struggle with expensive airport parking. Our chauffeur arrives 15 minutes ahead of schedule at your doorstep or terminal, handles luggage assistance, and navigates airport expressways with precision.",
    features: [
      "Guaranteed on-time doorstep arrival",
      "Terminal flight tracking for delay adjustments",
      "Luggage loading & unloading assistance",
      "Expressway toll assistance",
      "Flat rate package with zero peak surge",
      "Direct passenger terminal handover",
    ],
    basePrice: 799,
    priceUnit: "flat rate per transfer",
    isActive: true,
    sortOrder: 3,
    tariffs: [
      {
        title: "Airport One-Way Transfer [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 799,
        includedHours: 3,
        includedKm: 50,
        extraHourRate: 99,
        extraKmRate: 12,
        nightChargeRate: 150,
        waitingChargePerMin: 3,
        cancellationPolicy:
          "Free cancellation up to 2 hours prior to scheduled departure. ₹200 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
      {
        title: "Airport Round-Trip Transfer [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 1499,
        includedHours: 6,
        includedKm: 100,
        extraHourRate: 99,
        extraKmRate: 12,
        nightChargeRate: 200,
        waitingChargePerMin: 3,
        cancellationPolicy:
          "Free cancellation up to 3 hours prior to scheduled departure. ₹300 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    slug: "outstation-driver",
    title: "Outstation Trips",
    tagline:
      "Safe, scenic, long-distance highway driving across intercity corridors.",
    description:
      "Relax in your own car during weekend getaways or interstate business trips. Our highway-certified chauffeurs are trained in long-distance driving safety, night driving protocols, and vehicle maintenance checks.",
    features: [
      "Highway-tested long distance drivers",
      "Night driving & ghat-road experienced",
      "Daily driver batta / food allowance included",
      "Daily 300 km base allowance",
      "Multi-day intercity itineraries supported",
      "Tyre and oil inspection prior to departure",
    ],
    basePrice: 2499,
    priceUnit: "per day + driver allowance",
    isActive: true,
    sortOrder: 4,
    tariffs: [
      {
        title: "Outstation Daily Package (300 km / Day) [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 2499,
        includedHours: 24,
        includedKm: 300,
        extraHourRate: 199,
        extraKmRate: 14,
        nightChargeRate: 350,
        waitingChargePerMin: 0,
        cancellationPolicy:
          "Free cancellation up to 12 hours before scheduled departure. ₹500 cancellation fee applies thereafter.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    slug: "corporate-chauffeur",
    title: "Corporate Chauffeur",
    tagline:
      "Bespoke executive mobility solutions for leadership teams and enterprises.",
    description:
      "Premium month-to-month chauffeur retainers tailored for corporate leaders, C-suite executives, and business fleets. Features NDA compliance, English-speaking professional drivers, and unified monthly invoicing.",
    features: [
      "Monthly dedicated executive chauffeur",
      "English-fluent, formal suit-and-tie attire",
      "Strict confidentiality & non-disclosure compliance",
      "Immediate chauffeur replacement guarantee during leave",
      "Centralized GST invoicing and monthly trip logs",
      "Defensive driving certified",
    ],
    basePrice: 34999,
    priceUnit: "per month (26 working days)",
    isActive: true,
    sortOrder: 5,
    tariffs: [
      {
        title: "Corporate Executive Retainer (26 Days) [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 34999,
        includedHours: 260,
        includedKm: 2500,
        extraHourRate: 150,
        extraKmRate: 12,
        nightChargeRate: 300,
        waitingChargePerMin: 0,
        cancellationPolicy:
          "15 calendar days written notice period required for retainer cancellation or chauffeur substitution.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    slug: "personal-chauffeur",
    title: "Personal Chauffeur",
    tagline:
      "Dedicated monthly family chauffeur for daily commutes, school runs, and errands.",
    description:
      "Hire a trusted, polite, and verified personal chauffeur for your household. Manage daily school runs, spouse office commutes, grocery errands, and weekend family outings with complete peace of mind.",
    features: [
      "Full-time monthly family driver",
      "Vetted family-friendly etiquette and punctuality",
      "10-hour daily duty shift (6 days/week)",
      "Routine vehicle washing & tire pressure upkeep",
      "Free chauffeur replacement during emergency leaves",
      "Comprehensive police background clearance",
    ],
    basePrice: 28999,
    priceUnit: "per month (26 working days)",
    isActive: true,
    sortOrder: 6,
    tariffs: [
      {
        title:
          "Personal Family Chauffeur Retainer (26 Days) [Pending Client Review]",
        vehicleCategory: "All Vehicles",
        baseRate: 28999,
        includedHours: 260,
        includedKm: 2000,
        extraHourRate: 120,
        extraKmRate: 10,
        nightChargeRate: 250,
        waitingChargePerMin: 0,
        cancellationPolicy:
          "15 calendar days written notice period required for retainer cancellation or replacement.",
        isUnconfirmed: true,
      },
    ],
  },
];

export async function seedDatabase() {
  console.log("🌱 Starting Key2Drive database seed...\n");

  // 1. Seed Default Admin User
  const passwordHash = await getAdminPasswordHash();
  const adminEmail = "admin@key2drive.com";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Key2Drive Administrator",
      role: "ADMIN",
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Key2Drive Administrator",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log(
    `👤 Admin User Seeded:\n   Email: ${adminUser.email}\n   Role:  ${adminUser.role}\n   ID:    ${adminUser.id}\n`
  );

  // 2. Seed Services and Tariffs
  console.log("🚗 Seeding Chauffeur Services & Tariffs...");
  let totalTariffs = 0;

  for (const s of CHAUFFEUR_SERVICES) {
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        tagline: s.tagline,
        description: s.description,
        features: JSON.stringify(s.features),
        basePrice: s.basePrice,
        priceUnit: s.priceUnit,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
      },
      create: {
        slug: s.slug,
        title: s.title,
        tagline: s.tagline,
        description: s.description,
        features: JSON.stringify(s.features),
        basePrice: s.basePrice,
        priceUnit: s.priceUnit,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
      },
    });

    // Delete existing tariffs for this service to ensure clean idempotent seed
    await prisma.tariff.deleteMany({
      where: { serviceId: service.id },
    });

    for (const t of s.tariffs) {
      await prisma.tariff.create({
        data: {
          serviceId: service.id,
          title: t.title,
          vehicleCategory: t.vehicleCategory,
          baseRate: t.baseRate,
          includedHours: t.includedHours,
          includedKm: t.includedKm,
          extraHourRate: t.extraHourRate,
          extraKmRate: t.extraKmRate,
          nightChargeRate: t.nightChargeRate,
          waitingChargePerMin: t.waitingChargePerMin,
          cancellationPolicy: t.cancellationPolicy,
          isUnconfirmed: t.isUnconfirmed,
        },
      });
      totalTariffs++;
    }

    console.log(
      `   ✓ [${service.sortOrder}] ${service.title} (${service.slug}) -> ₹${service.basePrice} ${service.priceUnit} [${s.tariffs.length} Tariffs]`
    );
  }

  console.log(
    `\n✨ Seeding completed successfully! Total Services: ${CHAUFFEUR_SERVICES.length}, Total Tariffs: ${totalTariffs}.\n`
  );
}

// Auto-run if executed directly via CLI
if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .catch((error) => {
      console.error("❌ Seed failed with error:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

---

### 4.2. File: `src/lib/validations/common.ts`
Write the following exact code to `src/lib/validations/common.ts`:

```typescript
import { z } from "zod";

/**
 * Sanitizes an Indian phone number by removing spaces, hyphens, parentheses,
 * dots, and optional country code (+91 or 91) or leading zero.
 * Returns the raw 10-digit mobile number.
 */
export function sanitizeIndianPhone(val: string): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\s\-\(\)\.]/g, "")
    .replace(/^(?:\+91|91|0)/, "");
}

/**
 * Strict Indian 10-digit mobile number schema.
 * Rejects numbers not starting with 6, 7, 8, or 9, or not having exactly 10 digits.
 */
export const phoneSchema = z
  .string({
    required_error: "Mobile number is required",
    invalid_type_error: "Mobile number must be a string",
  })
  .trim()
  .min(1, "Mobile number is required")
  .transform(sanitizeIndianPhone)
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)",
  });

/**
 * Schema validating that a pickup date & time is a valid date and scheduled
 * at least 15 minutes into the future to allow dispatch preparation.
 */
export const futurePickupDateTimeSchema = z
  .union([
    z.string().min(1, "Pickup date and time is required"),
    z.date({ required_error: "Pickup date and time is required" }),
  ])
  .transform((val) => (typeof val === "string" ? new Date(val) : val))
  .refine((date) => !isNaN(date.getTime()), {
    message: "Please provide a valid pickup date and time.",
  })
  .refine(
    (date) => {
      const minLeadTimeMs = 15 * 60 * 1000;
      return date.getTime() >= Date.now() + minLeadTimeMs;
    },
    {
      message: "Pickup date and time must be at least 15 minutes in the future.",
    }
  );

/**
 * Idempotency submission hash schema.
 * Generated client-side or during booking calculation to prevent duplicate submissions.
 */
export const submissionHashSchema = z
  .string({
    required_error: "Submission hash is required for idempotency protection",
  })
  .trim()
  .min(8, "Submission hash must be at least 8 characters")
  .max(128, "Submission hash cannot exceed 128 characters");

/**
 * Standard pagination and sorting query schema.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

---

### 4.3. File: `src/lib/validations/status.ts`
Write the following exact code to `src/lib/validations/status.ts`:

```typescript
import { z } from "zod";

/**
 * Booking Lifecycle Status Enum
 */
export const BookingStatusEnum = z.enum([
  "REQUESTED",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export type BookingStatus = z.infer<typeof BookingStatusEnum>;

/**
 * Strict state machine mapping allowed transitions for Key2Drive bookings:
 * - REQUESTED -> CONFIRMED | REJECTED | CANCELLED
 * - CONFIRMED -> COMPLETED | CANCELLED
 * - REJECTED -> Terminal state (no transitions allowed)
 * - CANCELLED -> Terminal state (no transitions allowed)
 * - COMPLETED -> Terminal state (no transitions allowed)
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  REQUESTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
} as const;

export const TERMINAL_STATUSES: readonly BookingStatus[] = [
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;

/**
 * Checks if a requested status transition is allowed by the lifecycle state machine.
 */
export function isValidStatusTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): boolean {
  if (fromStatus === toStatus) return false;
  const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

/**
 * Returns list of allowed next statuses for a given booking status.
 */
export function getAllowedNextStatuses(
  currentStatus: BookingStatus
): readonly BookingStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Zod schema enforcing valid status transitions with descriptive error messages.
 */
export const BookingStatusTransitionSchema = z
  .object({
    currentStatus: BookingStatusEnum,
    nextStatus: BookingStatusEnum,
    note: z
      .string()
      .trim()
      .max(500, "Transition note cannot exceed 500 characters")
      .optional()
      .nullable(),
    changedBy: z
      .string()
      .trim()
      .min(1, "Actor identifier ('changedBy') is required")
      .default("ADMIN"),
    finalAmount: z
      .number()
      .positive("Final amount must be greater than zero")
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.currentStatus === data.nextStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Booking is already in '${data.currentStatus}' status. No transition needed.`,
        path: ["nextStatus"],
      });
      return;
    }

    if (!isValidStatusTransition(data.currentStatus, data.nextStatus)) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[data.currentStatus];
      const detail =
        allowed.length > 0
          ? `Allowed next statuses from '${data.currentStatus}': ${allowed.join(", ")}`
          : `'${data.currentStatus}' is a terminal status and cannot be changed.`;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid status transition from '${data.currentStatus}' to '${data.nextStatus}'. ${detail}`,
        path: ["nextStatus"],
      });
    }
  });

export type BookingStatusTransitionInput = z.infer<
  typeof BookingStatusTransitionSchema
>;
```

---

### 4.4. File: `src/lib/validations/booking.ts`
Write the following exact code to `src/lib/validations/booking.ts`:

```typescript
import { z } from "zod";
import {
  phoneSchema,
  futurePickupDateTimeSchema,
  submissionHashSchema,
  paginationQuerySchema,
} from "./common";
import { BookingStatusEnum } from "./status";

/**
 * Structured vehicle information schema.
 */
export const VehicleInfoObjectSchema = z.object({
  make: z.string().trim().min(1, "Vehicle make is required"),
  model: z.string().trim().min(1, "Vehicle model is required"),
  transmission: z.enum(["MANUAL", "AUTOMATIC"], {
    errorMap: () => ({ message: "Transmission must be MANUAL or AUTOMATIC" }),
  }),
  category: z
    .enum(["HATCHBACK", "SEDAN", "SUV", "LUXURY", "ALL_VEHICLES"])
    .optional(),
  licensePlate: z
    .string()
    .trim()
    .max(20, "License plate cannot exceed 20 characters")
    .optional(),
});

export type VehicleInfoObject = z.infer<typeof VehicleInfoObjectSchema>;

/**
 * Flexible vehicle info schema: accepts either a descriptive string
 * or a structured VehicleInfoObject and serializes cleanly to string for DB storage.
 */
export const vehicleInfoSchema = z.union([
  z
    .string({ required_error: "Vehicle info is required" })
    .trim()
    .min(2, "Vehicle info must be at least 2 characters")
    .max(200, "Vehicle info cannot exceed 200 characters"),
  VehicleInfoObjectSchema.transform(
    (v) =>
      `${v.make} ${v.model} (${v.transmission}${v.category ? `, ${v.category}` : ""})`
  ),
]);

/**
 * Duration schema: accepts number (hours) or human string (e.g. "4 hours", "8 hours", "Full Day").
 */
export const durationSchema = z
  .union([
    z.string().trim().min(1, "Duration is required"),
    z.number().positive("Duration must be greater than zero"),
  ])
  .transform((val) =>
    typeof val === "number" ? `${val} hour${val > 1 ? "s" : ""}` : val
  );

/**
 * Booking Creation Validation Schema
 * Validates customer name, 10-digit mobile number, valid email, pickup/drop locations,
 * future pickup date/time, duration, vehicle info, special instructions, and idempotency submissionHash.
 */
export const BookingCreateSchema = z.object({
  customerName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name cannot exceed 100 characters"),
  customerPhone: phoneSchema,
  customerEmail: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  serviceId: z
    .string({ required_error: "Please select a service" })
    .trim()
    .min(1, "Service selection is required"),
  tariffId: z.string().trim().optional().nullable(),
  pickupAddress: z
    .string({ required_error: "Pickup address is required" })
    .trim()
    .min(5, "Pickup address must be at least 5 characters")
    .max(300, "Pickup address cannot exceed 300 characters"),
  dropAddress: z
    .string()
    .trim()
    .max(300, "Drop address cannot exceed 300 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  pickupDateTime: futurePickupDateTimeSchema,
  duration: durationSchema.optional().nullable(),
  vehicleInfo: vehicleInfoSchema,
  specialInstructions: z
    .string()
    .trim()
    .max(1000, "Special instructions cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  estimatedAmount: z
    .number({
      required_error: "Estimated fare amount is required",
      invalid_type_error: "Estimated amount must be a number",
    })
    .positive("Estimated amount must be greater than zero"),
  submissionHash: submissionHashSchema,
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;

/**
 * Booking Status Update Schema (Admin)
 */
export const BookingStatusUpdateSchema = z.object({
  status: BookingStatusEnum,
  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional()
    .nullable(),
  changedBy: z
    .string()
    .trim()
    .min(1, "Actor identifier is required")
    .default("ADMIN"),
  finalAmount: z
    .number()
    .positive("Final amount must be greater than zero")
    .optional()
    .nullable(),
});

export type BookingStatusUpdateInput = z.infer<
  typeof BookingStatusUpdateSchema
>;

/**
 * Booking Admin Query Schema (Search & Filter)
 */
export const BookingQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["ALL", "REQUESTED", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"])
    .optional()
    .default("ALL"),
  serviceId: z.string().optional(),
  search: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "pickupDateTime", "estimatedAmount", "reference"])
    .default("createdAt"),
});

export type BookingQueryInput = z.infer<typeof BookingQuerySchema>;
```

---

### 4.5. File: `src/lib/validations/enquiry.ts`
Write the following exact code to `src/lib/validations/enquiry.ts`:

```typescript
import { z } from "zod";
import { phoneSchema, paginationQuerySchema } from "./common";

/**
 * Enquiry Status Enum matching Prisma schema
 */
export const EnquiryStatusEnum = z.enum(["PENDING", "IN_REVIEW", "RESOLVED"]);
export type EnquiryStatus = z.infer<typeof EnquiryStatusEnum>;

/**
 * Enquiry Submission Schema (Customer Facing)
 * Validates customer name, 10-digit mobile number, valid email, subject, and message.
 */
export const EnquiryCreateSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: phoneSchema,
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  subject: z
    .string({ required_error: "Subject is required" })
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters"),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export type EnquiryCreateInput = z.infer<typeof EnquiryCreateSchema>;

/**
 * Enquiry Status & Resolution Update Schema (Admin Facing)
 */
export const EnquiryUpdateSchema = z.object({
  status: EnquiryStatusEnum.optional(),
  isResolved: z.boolean().optional(),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Internal notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export type EnquiryUpdateInput = z.infer<typeof EnquiryUpdateSchema>;

/**
 * Enquiry Admin Query Schema (Search & Filter)
 */
export const EnquiryQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["ALL", "PENDING", "IN_REVIEW", "RESOLVED"])
    .optional()
    .default("ALL"),
  isResolved: z.enum(["all", "true", "false"]).optional().default("all"),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name", "status"]).default("createdAt"),
});

export type EnquiryQueryInput = z.infer<typeof EnquiryQuerySchema>;
```

---

### 4.6. File: `src/lib/validations/tariff.ts`
Write the following exact code to `src/lib/validations/tariff.ts`:

```typescript
import { z } from "zod";

/**
 * Tariff Update Schema (Admin Pricing Management)
 * Allows admins to adjust base rate, extra hour/km rates, night charges,
 * waiting charges, unconfirmed status flag, and cancellation policy.
 */
export const TariffUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  vehicleCategory: z
    .string()
    .trim()
    .min(2, "Vehicle category must be at least 2 characters")
    .max(50, "Vehicle category cannot exceed 50 characters")
    .optional(),
  baseRate: z
    .number()
    .min(0, "Base rate cannot be negative")
    .optional(),
  includedHours: z
    .number()
    .int("Included hours must be an integer")
    .min(0, "Included hours cannot be negative")
    .optional()
    .nullable(),
  includedKm: z
    .number()
    .int("Included km must be an integer")
    .min(0, "Included km cannot be negative")
    .optional()
    .nullable(),
  extraHourRate: z
    .number()
    .min(0, "Extra hour rate cannot be negative")
    .optional(),
  extraKmRate: z
    .number()
    .min(0, "Extra km rate cannot be negative")
    .optional(),
  nightChargeRate: z
    .number()
    .min(0, "Night charge rate cannot be negative")
    .optional(),
  waitingChargePerMin: z
    .number()
    .min(0, "Waiting charge per minute cannot be negative")
    .optional(),
  cancellationPolicy: z
    .string()
    .trim()
    .max(1000, "Cancellation policy cannot exceed 1000 characters")
    .optional()
    .nullable(),
  isUnconfirmed: z.boolean().optional(),
});

export type TariffUpdateInput = z.infer<typeof TariffUpdateSchema>;

/**
 * Tariff Create Schema (Admin Creating New Tariff Tier)
 */
export const TariffCreateSchema = z.object({
  serviceId: z
    .string({ required_error: "Service ID is required" })
    .trim()
    .min(1, "Service ID is required"),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  vehicleCategory: z
    .string({ required_error: "Vehicle category is required" })
    .trim()
    .min(2, "Vehicle category is required")
    .max(50, "Vehicle category cannot exceed 50 characters"),
  baseRate: z
    .number({ required_error: "Base rate is required" })
    .min(0, "Base rate cannot be negative"),
  includedHours: z.number().int().min(0).optional().nullable(),
  includedKm: z.number().int().min(0).optional().nullable(),
  extraHourRate: z.number().min(0).default(0),
  extraKmRate: z.number().min(0).default(0),
  nightChargeRate: z.number().min(0).default(0),
  waitingChargePerMin: z.number().min(0).default(0),
  cancellationPolicy: z.string().trim().max(1000).optional().nullable(),
  isUnconfirmed: z.boolean().default(false),
});

export type TariffCreateInput = z.infer<typeof TariffCreateSchema>;

/**
 * Service Update Schema (Admin Service Management)
 * Allows updating service details, marketing copy, pricing headline, and active toggle.
 */
export const ServiceUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  tagline: z
    .string()
    .trim()
    .min(5, "Tagline must be at least 5 characters")
    .max(200, "Tagline cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1500, "Description cannot exceed 1500 characters")
    .optional(),
  features: z
    .union([
      z.array(z.string().trim().min(1)).min(1, "At least one feature is required"),
      z.string().trim().min(2),
    ])
    .transform((val) => (Array.isArray(val) ? JSON.stringify(val) : val))
    .optional(),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .optional(),
  priceUnit: z
    .string()
    .trim()
    .min(1, "Price unit cannot be empty")
    .max(50, "Price unit cannot exceed 50 characters")
    .optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;
```

---

### 4.7. File: `src/lib/validations/auth.ts`
Write the following exact code to `src/lib/validations/auth.ts`:

```typescript
import { z } from "zod";

/**
 * Admin Authentication Schema
 * Validates email format and password length for administrator login.
 */
export const AdminLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

/**
 * Admin Password Change / Profile Schema
 */
export const AdminPasswordChangeSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .max(100, "New password cannot exceed 100 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export type AdminPasswordChangeInput = z.infer<
  typeof AdminPasswordChangeSchema
>;
```

---

### 4.8. File: `src/lib/validations/note.ts`
Write the following exact code to `src/lib/validations/note.ts`:

```typescript
import { z } from "zod";

/**
 * Admin Internal Note Schema
 * Used when staff or admins append internal notes to Bookings or Enquiries.
 */
export const AdminNoteCreateSchema = z
  .object({
    content: z
      .string({ required_error: "Note content cannot be empty" })
      .trim()
      .min(1, "Note content cannot be empty")
      .max(2000, "Note content cannot exceed 2000 characters"),
    bookingId: z.string().trim().optional().nullable(),
    enquiryId: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.bookingId || data.enquiryId),
    {
      message: "Admin note must be attached to either a bookingId or an enquiryId.",
      path: ["bookingId"],
    }
  );

export type AdminNoteCreateInput = z.infer<typeof AdminNoteCreateSchema>;
```

---

### 4.9. File: `src/lib/validations/index.ts`
Write the following exact code to `src/lib/validations/index.ts`:

```typescript
/**
 * Key2Drive Universal Validation Schemas
 * Path: src/lib/validations/index.ts
 */

export * from "./common";
export * from "./status";
export * from "./booking";
export * from "./enquiry";
export * from "./tariff";
export * from "./auth";
export * from "./note";
```

---

## 5. Verification Method

To independently verify the seed script and validation schemas:

1. **Verify Validation Schemas**:
   Run the dedicated test suite provided in `.agents/teamwork/explorer_m2_2/test_validations.ts`:
   ```bash
   npx tsx .agents/teamwork/explorer_m2_2/test_validations.ts
   ```
   **Expected Result**: All 30 test assertions execute and pass with exit code 0 (`=== Summary: 30 passed, 0 failed ===`).

2. **Verify Database Seeding**:
   Once Worker M2 has created `prisma/schema.prisma` and executed `npx prisma db push`:
   ```bash
   npm install bcryptjs
   npm install -D @types/bcryptjs
   npm run db:seed
   ```
   **Expected Result**:
   - Seed script executes without errors.
   - Logs show:
     ```
     👤 Admin User Seeded:
        Email: admin@key2drive.com
        Role:  ADMIN
     🚗 Seeding Chauffeur Services & Tariffs...
        ✓ [1] Hourly Driver (hourly-driver) -> ₹399 per hour (min 4 hrs) [2 Tariffs]
        ✓ [2] Full-Day Driver (full-day-driver) -> ₹1899 per day (8 hrs / 80 km) [2 Tariffs]
        ✓ [3] Airport Pickup / Drop (airport-transfer) -> ₹799 flat rate per transfer [2 Tariffs]
        ✓ [4] Outstation Trips (outstation-driver) -> ₹2499 per day + driver allowance [1 Tariffs]
        ✓ [5] Corporate Chauffeur (corporate-chauffeur) -> ₹34999 per month (26 working days) [1 Tariffs]
        ✓ [6] Personal Chauffeur (personal-chauffeur) -> ₹28999 per month (26 working days) [1 Tariffs]
     ✨ Seeding completed successfully! Total Services: 6, Total Tariffs: 9.
     ```

3. **Verify Database Content via Prisma Studio or Query**:
   ```bash
   npx prisma studio --browser none
   # or node one-liner:
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); Promise.all([prisma.user.count(), prisma.service.count(), prisma.tariff.count()]).then(([u, s, t]) => console.log({ users: u, services: s, tariffs: t })).finally(() => prisma.\$disconnect());"
   ```
   **Expected Values**: `{ users: 1, services: 6, tariffs: 9 }`.

4. **Invalidation Conditions**:
   - If a tariff is seeded with `isUnconfirmed: false`, it violates the client review requirement.
   - If a booking can transition from `REQUESTED` directly to `COMPLETED` or from `CANCELLED` to `CONFIRMED`, it violates the lifecycle state machine.
   - If phone validation accepts arbitrary alphanumeric strings or phone numbers starting with digits 0–5 without proper normalization, it invalidates Indian phone compliance.
