export interface SeedTariff {
  id: string;
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
  serviceId?: string;
  service?: {
    id: string;
    slug: string;
    title: string;
    priceUnit: string;
  };
}

export interface SeedService {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string;
  featuresList: string[];
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  sortOrder: number;
  tariffs: SeedTariff[];
}

export const SEED_SERVICES: SeedService[] = [
  {
    id: "srv-hourly-01",
    slug: "hourly-driver",
    title: "Hourly Driver",
    tagline: "Flexible hourly driver for city traffic, shopping & errands.",
    description: "Hire an experienced acting driver by the hour to drive your personal car. Enjoy your shopping, meetings, dining, or appointments with zero parking or traffic stress.",
    features: JSON.stringify([
      "Minimum 4-hour flexible booking",
      "Manual & automatic car specialists",
      "Govt ID & driving license verified",
      "Doorstep pickup & polite service",
      "Zero peak surge guarantee",
    ]),
    featuresList: [
      "Minimum 4-hour flexible booking",
      "Manual & automatic car specialists",
      "Govt ID & driving license verified",
      "Doorstep pickup & polite service",
      "Zero peak surge guarantee",
    ],
    basePrice: 399,
    priceUnit: "per hour (min 4 hrs)",
    isActive: true,
    sortOrder: 1,
    tariffs: [
      {
        id: "trf-hourly-sedan-01",
        title: "Hourly City Driver - Hatchback & Sedan",
        vehicleCategory: "Hatchback / Sedan",
        baseRate: 399,
        includedHours: 4,
        includedKm: null,
        extraHourRate: 99,
        extraKmRate: 0,
        nightChargeRate: 150,
        waitingChargePerMin: 2,
        cancellationPolicy: "Free cancellation up to 2 hours before scheduled pickup time.",
        isUnconfirmed: true,
      },
      {
        id: "trf-hourly-luxury-02",
        title: "Hourly City Driver - Luxury & Premium SUV",
        vehicleCategory: "Luxury / SUV",
        baseRate: 549,
        includedHours: 4,
        includedKm: null,
        extraHourRate: 149,
        extraKmRate: 0,
        nightChargeRate: 200,
        waitingChargePerMin: 3,
        cancellationPolicy: "Free cancellation up to 3 hours before scheduled pickup time.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    id: "srv-fullday-02",
    slug: "full-day-driver",
    title: "Full-Day Driver",
    tagline: "Dedicated 8-hour personal driver for your daily itinerary.",
    description: "Dedicated driver for 8 hours and 80 km. Ideal for office commutes, client visits, or family outings with unlimited stops across the city.",
    features: JSON.stringify([
      "8 hours / 80 km inclusive city package",
      "Dedicated driver on standby throughout",
      "Multiple stops within city limits",
      "Govt ID & driving license verified",
      "Transparent hourly & extra km billing",
    ]),
    featuresList: [
      "8 hours / 80 km inclusive city package",
      "Dedicated driver on standby throughout",
      "Multiple stops within city limits",
      "Govt ID & driving license verified",
      "Transparent hourly & extra km billing",
    ],
    basePrice: 1899,
    priceUnit: "per day (8 hrs / 80 km)",
    isActive: true,
    sortOrder: 2,
    tariffs: [
      {
        id: "trf-fullday-std-01",
        title: "Full-Day Standard (8 Hours / 80 Km)",
        vehicleCategory: "All Vehicles",
        baseRate: 1899,
        includedHours: 8,
        includedKm: 80,
        extraHourRate: 149,
        extraKmRate: 12,
        nightChargeRate: 250,
        waitingChargePerMin: 0,
        cancellationPolicy: "Free cancellation up to 4 hours before scheduled pickup time.",
        isUnconfirmed: true,
      },
      {
        id: "trf-fullday-ext-02",
        title: "Full-Day Extended (12 Hours / 120 Km)",
        vehicleCategory: "All Vehicles",
        baseRate: 2499,
        includedHours: 12,
        includedKm: 120,
        extraHourRate: 149,
        extraKmRate: 12,
        nightChargeRate: 250,
        waitingChargePerMin: 0,
        cancellationPolicy: "Free cancellation up to 4 hours before scheduled pickup time.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    id: "srv-airport-03",
    slug: "airport-transfer",
    title: "Airport Pickup / Drop",
    tagline: "On-time driver for smooth airport terminal drops & pickups.",
    description: "Never worry about airport parking or night traffic. Our verified driver drives your car safely to or from the airport terminal on time.",
    features: JSON.stringify([
      "Guaranteed on-time doorstep arrival",
      "Flight delay tracking & terminal pickup",
      "Luggage loading & unloading help",
      "24/7 day and night dispatch",
      "Zero peak surge pricing",
    ]),
    featuresList: [
      "Guaranteed on-time doorstep arrival",
      "Flight delay tracking & terminal pickup",
      "Luggage loading & unloading help",
      "24/7 day and night dispatch",
      "Zero peak surge pricing",
    ],
    basePrice: 799,
    priceUnit: "flat rate per transfer",
    isActive: true,
    sortOrder: 3,
    tariffs: [
      {
        id: "trf-airport-oneway-01",
        title: "Airport One-Way Transfer",
        vehicleCategory: "All Vehicles",
        baseRate: 799,
        includedHours: 3,
        includedKm: 50,
        extraHourRate: 99,
        extraKmRate: 12,
        nightChargeRate: 150,
        waitingChargePerMin: 3,
        cancellationPolicy: "Free cancellation up to 2 hours prior to scheduled departure.",
        isUnconfirmed: true,
      },
      {
        id: "trf-airport-round-02",
        title: "Airport Round-Trip Transfer",
        vehicleCategory: "All Vehicles",
        baseRate: 1499,
        includedHours: 6,
        includedKm: 100,
        extraHourRate: 99,
        extraKmRate: 12,
        nightChargeRate: 200,
        waitingChargePerMin: 3,
        cancellationPolicy: "Free cancellation up to 3 hours prior to scheduled departure.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    id: "srv-outstation-04",
    slug: "outstation-driver",
    title: "Outstation Trips",
    tagline: "Experienced highway driver for weekend getaways & road trips.",
    description: "Relax from the passenger seat of your own car. Our highway-experienced drivers handle long distances, tolls, ghats, and night driving safely.",
    features: JSON.stringify([
      "Highway & long-distance experienced",
      "Night driving & ghat-road competent",
      "Daily driver allowance included",
      "Multi-day intercity travel supported",
      "Disciplined defensive driving",
    ]),
    featuresList: [
      "Highway & long-distance experienced",
      "Night driving & ghat-road competent",
      "Daily driver allowance included",
      "Multi-day intercity travel supported",
      "Disciplined defensive driving",
    ],
    basePrice: 2499,
    priceUnit: "per day + driver allowance",
    isActive: true,
    sortOrder: 4,
    tariffs: [
      {
        id: "trf-outstation-pkg-01",
        title: "Outstation Daily Package (300 km / Day)",
        vehicleCategory: "All Vehicles",
        baseRate: 2499,
        includedHours: 24,
        includedKm: 300,
        extraHourRate: 199,
        extraKmRate: 14,
        nightChargeRate: 350,
        waitingChargePerMin: 0,
        cancellationPolicy: "Free cancellation up to 12 hours before scheduled departure.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    id: "srv-corporate-05",
    slug: "corporate-chauffeur",
    title: "Corporate Chauffeur",
    tagline: "Bespoke executive mobility solutions for leadership teams and enterprises.",
    description: "Premium month-to-month chauffeur retainers tailored for corporate leaders, C-suite executives, and business fleets. Features NDA compliance, English-speaking professional drivers, and unified monthly invoicing.",
    features: JSON.stringify([
      "Monthly dedicated executive chauffeur",
      "English-fluent, formal suit-and-tie attire",
      "Strict confidentiality & non-disclosure compliance",
      "Immediate chauffeur replacement guarantee during leave",
      "Centralized GST invoicing and monthly trip logs",
      "Defensive driving certified",
    ]),
    featuresList: [
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
        id: "trf-corp-monthly-01",
        title: "Corporate Dedicated Monthly Chauffeur (26 Days)",
        vehicleCategory: "Corporate Saloon & SUV",
        baseRate: 34999,
        includedHours: 260,
        includedKm: null,
        extraHourRate: 150,
        extraKmRate: 0,
        nightChargeRate: 200,
        waitingChargePerMin: 0,
        cancellationPolicy: "15-day written notice required for monthly contract cancellation.",
        isUnconfirmed: true,
      },
    ],
  },
  {
    id: "srv-personal-06",
    slug: "personal-chauffeur",
    title: "Personal Chauffeur",
    tagline: "Your family's trusted, verified chauffeur for daily routines and school runs.",
    description: "Enjoy effortless everyday travel for your family. A dedicated personal chauffeur for regular school pickups, family elder medical appointments, grocery runs, and daily office commuting.",
    features: JSON.stringify([
      "Comprehensive background check & license verification",
      "Polite, family-friendly demeanor",
      "Daily vehicle cleaning & maintenance checks",
      "Consistent, familiar driver for your family",
      "Flexible monthly or weekly contracts",
      "Emergency standby support",
    ]),
    featuresList: [
      "Comprehensive background check & license verification",
      "Polite, family-friendly demeanor",
      "Daily vehicle cleaning & maintenance checks",
      "Consistent, familiar driver for your family",
      "Flexible monthly or weekly contracts",
      "Emergency standby support",
    ],
    basePrice: 28999,
    priceUnit: "per month (26 working days)",
    isActive: true,
    sortOrder: 6,
    tariffs: [
      {
        id: "trf-personal-monthly-01",
        title: "Personal Family Chauffeur (26 Days / Month)",
        vehicleCategory: "All Vehicles",
        baseRate: 28999,
        includedHours: 234,
        includedKm: null,
        extraHourRate: 120,
        extraKmRate: 0,
        nightChargeRate: 150,
        waitingChargePerMin: 0,
        cancellationPolicy: "7-day advance notice required for retainer cancellation.",
        isUnconfirmed: true,
      },
    ],
  },
];

export const SEED_TARIFFS: SeedTariff[] = SEED_SERVICES.flatMap((s) =>
  s.tariffs.map((t) => ({
    ...t,
    serviceId: s.id,
    service: {
      id: s.id,
      slug: s.slug,
      title: s.title,
      priceUnit: s.priceUnit,
    },
  }))
);

