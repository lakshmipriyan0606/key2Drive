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

async function getAdminPasswordHash(): Promise<string> {
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "K2D_SecureInitPass_2026!#";
  try {
    const bcryptModule = await import("bcryptjs");
    const bcrypt = bcryptModule.default || bcryptModule;
    return await bcrypt.hash(adminPassword, 12);
  } catch {
    const crypto = await import("crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.pbkdf2Sync(adminPassword, salt, 100000, 64, "sha512").toString("hex");
    return `pbkdf2$100000$${salt}$${derivedKey}`;
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
