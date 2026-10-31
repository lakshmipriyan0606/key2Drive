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
    tagline: "On-demand professional chauffeur for flexible city errands, meetings, and dining.",
    description: "Hire an experienced, background-verified chauffeur by the hour to drive your personal car. Ideal for city commutes, shopping sprees, dining out, or medical appointments with zero parking stress and complete peace of mind.",
    features: JSON.stringify([
      "Minimum 4-hour flexible booking",
      "Manual, automatic & luxury vehicle certified",
      "Police background verified & licensed",
      "Doorstep pickup and handover",
      "Live trip tracking & dispatch support",
      "Zero peak surge pricing guarantee",
    ]),
    featuresList: [
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
    tagline: "Dedicated 8-hour executive chauffeur for your busy daily itinerary.",
    description: "Enjoy seamless, uninterrupted mobility across the city for a full workday or private family outing. Your personal driver remains dedicated to your vehicle and schedule for up to 8 hours and 80 km with unlimited stops.",
    features: JSON.stringify([
      "8 hours / 80 km inclusive city package",
      "Dedicated chauffeur on standby throughout",
      "Punctual, formal chauffeur attire",
      "Multiple stops within metropolitan limits",
      "Transparent overtime & extra km billing",
      "Vehicle safety and fluid checks included",
    ]),
    featuresList: [
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
    tagline: "Punctual, stress-free transfers to and from Kempegowda International Airport.",
    description: "Never miss a flight or struggle with expensive airport parking. Our chauffeur arrives 15 minutes ahead of schedule at your doorstep or terminal, handles luggage assistance, and navigates airport expressways with precision.",
    features: JSON.stringify([
      "Guaranteed on-time doorstep arrival",
      "Terminal flight tracking for delay adjustments",
      "Luggage loading & unloading assistance",
      "Expressway toll assistance",
      "Flat rate package with zero peak surge",
      "Direct passenger terminal handover",
    ]),
    featuresList: [
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
    tagline: "Safe, scenic, long-distance highway driving across intercity corridors.",
    description: "Relax in your own car during weekend getaways or interstate business trips. Our highway-certified chauffeurs are trained in long-distance driving safety, night driving protocols, and vehicle maintenance checks.",
    features: JSON.stringify([
      "Highway-tested long distance drivers",
      "Night driving & ghat-road experienced",
      "Daily driver batta / food allowance included",
      "Daily 300 km base allowance",
      "Multi-day intercity itineraries supported",
      "Tyre and oil inspection prior to departure",
    ]),
    featuresList: [
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
      "Comprehensive background check & police vetting",
      "Polite, family-friendly demeanor",
      "Daily vehicle cleaning & maintenance checks",
      "Consistent, familiar driver for your family",
      "Flexible monthly or weekly contracts",
      "Emergency standby support",
    ]),
    featuresList: [
      "Comprehensive background check & police vetting",
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

