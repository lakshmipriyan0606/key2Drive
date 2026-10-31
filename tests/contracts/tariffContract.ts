import { z } from 'zod';

export interface ChauffeurService {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  basePrice: number;
  priceUnit: 'hourly' | 'daily' | 'flat' | 'monthly';
  minDurationHours: number;
  isActive: boolean;
  isUnconfirmed: boolean;
  extraHourRate: number;
  nightSurchargeRate: number;
  waitingChargePerMin: number;
}

export const CHAUFFEUR_SERVICES: ChauffeurService[] = [
  {
    id: 'srv_hourly',
    slug: 'hourly-driver',
    title: 'Hourly Chauffeur',
    tagline: 'Flexible on-demand driver by the hour',
    description: 'Professional chauffeur for shopping trips, business meetings, or local errands.',
    basePrice: 399,
    priceUnit: 'hourly',
    minDurationHours: 4,
    isActive: true,
    isUnconfirmed: false,
    extraHourRate: 99,
    nightSurchargeRate: 250,
    waitingChargePerMin: 3,
  },
  {
    id: 'srv_fullday',
    slug: 'full-day-driver',
    title: 'Full-Day Driver',
    tagline: 'Dedicated 8-hour city chauffeur service',
    description: 'Comprehensive 8-hour / 80 km chauffeur coverage for complete daily transport peace of mind.',
    basePrice: 1899,
    priceUnit: 'daily',
    minDurationHours: 8,
    isActive: true,
    isUnconfirmed: false,
    extraHourRate: 149,
    nightSurchargeRate: 250,
    waitingChargePerMin: 4,
  },
  {
    id: 'srv_airport',
    slug: 'airport-transfer',
    title: 'Airport Transfer Chauffeur',
    tagline: 'Punctual airport pickup and drop-off',
    description: 'Flight-tracked airport transfer with 30-minute complimentary buffer for luggage handling.',
    basePrice: 799,
    priceUnit: 'flat',
    minDurationHours: 2,
    isActive: true,
    isUnconfirmed: false,
    extraHourRate: 120,
    nightSurchargeRate: 250,
    waitingChargePerMin: 5,
  },
  {
    id: 'srv_outstation',
    slug: 'outstation-driver',
    title: 'Outstation Trip Driver',
    tagline: 'Experienced intercity road journey driver',
    description: 'Reliable highway chauffeur for weekend getaways and multi-day out-of-station travels.',
    basePrice: 2499,
    priceUnit: 'daily',
    minDurationHours: 12,
    isActive: true,
    isUnconfirmed: false,
    extraHourRate: 150,
    nightSurchargeRate: 300,
    waitingChargePerMin: 4,
  },
  {
    id: 'srv_corporate',
    slug: 'corporate-chauffeur',
    title: 'Corporate Chauffeur Service',
    tagline: 'Executive monthly chauffeur for business fleets',
    description: 'Bespoke corporate chauffeur package with dedicated driver, background verified and suit-attired.',
    basePrice: 34999,
    priceUnit: 'monthly',
    minDurationHours: 200,
    isActive: true,
    isUnconfirmed: true, // Marked pending review per requirement
    extraHourRate: 120,
    nightSurchargeRate: 350,
    waitingChargePerMin: 5,
  },
  {
    id: 'srv_personal',
    slug: 'personal-chauffeur',
    title: 'Personal Chauffeur Monthly',
    tagline: 'Full-time monthly family or executive driver',
    description: 'Experienced full-time chauffeur assigned exclusively to your vehicle and household.',
    basePrice: 28999,
    priceUnit: 'monthly',
    minDurationHours: 180,
    isActive: true,
    isUnconfirmed: true, // Marked pending review per requirement
    extraHourRate: 100,
    nightSurchargeRate: 300,
    waitingChargePerMin: 4,
  },
];

export interface FareCalculationInput {
  serviceId: string;
  durationHours: number;
  pickupDateTime: string | Date;
  waitingMinutes?: number;
}

export interface FareBreakdown {
  baseFare: number;
  extraHours: number;
  extraHoursCharge: number;
  nightSurcharge: number;
  waitingCharge: number;
  totalFare: number;
  isNightTrip: boolean;
  service: ChauffeurService;
}

/**
 * Check if a given date/time falls within the night window: 22:00 (10 PM) to 06:00 (6 AM)
 */
export function isNightTime(dateOrIso: string | Date): boolean {
  const d = new Date(dateOrIso);
  const hour = d.getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Calculate deterministic fare breakdown according to service tariff specifications
 */
export function calculateFare(input: FareCalculationInput): FareBreakdown {
  const service = CHAUFFEUR_SERVICES.find((s) => s.id === input.serviceId || s.slug === input.serviceId);
  if (!service) {
    throw new Error(`Service not found for ID or slug: ${input.serviceId}`);
  }

  let baseFare = service.basePrice;
  let extraHours = 0;
  let extraHoursCharge = 0;

  if (service.priceUnit === 'hourly') {
    // For hourly: baseFare covers minDurationHours (e.g. 4 hrs * basePrice)
    const effectiveDuration = Math.max(input.durationHours, service.minDurationHours);
    baseFare = service.basePrice * service.minDurationHours;
    extraHours = Math.max(0, effectiveDuration - service.minDurationHours);
    extraHoursCharge = extraHours * service.extraHourRate;
  } else if (service.priceUnit === 'daily') {
    if (input.durationHours > service.minDurationHours) {
      extraHours = input.durationHours - service.minDurationHours;
      extraHoursCharge = extraHours * service.extraHourRate;
    }
  }

  const isNight = isNightTime(input.pickupDateTime);
  const nightSurcharge = isNight ? service.nightSurchargeRate : 0;

  const waitingMinutes = Math.max(0, input.waitingMinutes || 0);
  const waitingCharge = waitingMinutes * service.waitingChargePerMin;

  const totalFare = baseFare + extraHoursCharge + nightSurcharge + waitingCharge;

  return {
    baseFare,
    extraHours,
    extraHoursCharge,
    nightSurcharge,
    waitingCharge,
    totalFare,
    isNightTrip: isNight,
    service,
  };
}

export const TariffUpdateSchema = z.object({
  baseRate: z.number().positive('Base rate must be positive'),
  extraHourRate: z.number().nonnegative('Extra hour rate must be non-negative'),
  nightChargeRate: z.number().nonnegative('Night charge rate must be non-negative'),
  waitingChargePerMin: z.number().nonnegative('Waiting charge must be non-negative'),
  isUnconfirmed: z.boolean(),
  cancellationPolicy: z.string().min(5, 'Cancellation policy must be specified'),
});
