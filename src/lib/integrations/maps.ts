/**
 * Key2Drive Mock Maps & Routing Service
 * Target path: src/lib/integrations/maps.ts
 *
 * Provides deterministic distance and duration estimates, city zone validation,
 * night charge detection, and fare computation helpers without external API keys.
 */

export interface ZoneValidationResult {
  isValid: boolean;
  normalizedAddress: string;
  zone: 'METRO_CORE' | 'AIRPORT_ZONE' | 'SUBURBAN' | 'OUTSTATION';
  isOutstation: boolean;
  message?: string;
}

export interface RouteEstimationResult {
  pickup: string;
  drop: string;
  distanceKm: number;
  durationMinutes: number;
  durationFormatted: string;
  isNightTime: boolean;
  isOutstation: boolean;
  routeSummary: string;
}

export interface FareCalculationInput {
  baseRate: number;
  includedHours?: number | null;
  includedKm?: number | null;
  extraHourRate: number;
  extraKmRate: number;
  nightChargeRate: number;
  actualDurationHours: number;
  estimatedDistanceKm: number;
  pickupDateTime: string | Date;
}

export interface FareBreakdownResult {
  baseFare: number;
  extraHourFare: number;
  extraKmFare: number;
  nightCharge: number;
  totalFare: number;
  isNightChargeApplied: boolean;
  billableHours: number;
  billableKm: number;
}

export interface MapsService {
  validateLocation(address: string): ZoneValidationResult;
  estimateRoute(pickup: string, drop?: string | null, pickupDateTime?: string | Date): RouteEstimationResult;
  isNightTime(dateTime: string | Date): boolean;
  calculateFare(input: FareCalculationInput): FareBreakdownResult;
}

class MockMapsServiceImpl implements MapsService {
  private benchmarkRoutes: { pair: [string, string]; distanceKm: number; durationMinutes: number }[] = [
    { pair: ['airport', 'central'], distanceKm: 22, durationMinutes: 45 },
    { pair: ['airport', 'omr'], distanceKm: 18, durationMinutes: 35 },
    { pair: ['airport', 'guindy'], distanceKm: 9, durationMinutes: 20 },
    { pair: ['airport', 'tambaram'], distanceKm: 12, durationMinutes: 25 },
    { pair: ['central', 'omr'], distanceKm: 26, durationMinutes: 55 },
    { pair: ['central', 'anna nagar'], distanceKm: 11, durationMinutes: 25 },
    { pair: ['central', 'tambaram'], distanceKm: 29, durationMinutes: 60 },
    { pair: ['metro', 'mahabalipuram'], distanceKm: 55, durationMinutes: 75 },
    { pair: ['chennai', 'pondicherry'], distanceKm: 155, durationMinutes: 190 },
    { pair: ['chennai', 'bangalore'], distanceKm: 345, durationMinutes: 390 },
  ];

  /**
   * Validates if the given address string is a recognized city zone or outstation point.
   */
  public validateLocation(address: string): ZoneValidationResult {
    if (!address || address.trim().length < 5) {
      return {
        isValid: false,
        normalizedAddress: address || '',
        zone: 'METRO_CORE',
        isOutstation: false,
        message: 'Address must contain at least 5 characters including street and area name.',
      };
    }

    const lower = address.toLowerCase();

    if (lower.includes('pondicherry') || lower.includes('bangalore') || lower.includes('vellore') || lower.includes('tirupati')) {
      return {
        isValid: true,
        normalizedAddress: address.trim(),
        zone: 'OUTSTATION',
        isOutstation: true,
      };
    }

    if (lower.includes('airport') || lower.includes('terminal') || lower.includes('meenambakkam')) {
      return {
        isValid: true,
        normalizedAddress: address.trim(),
        zone: 'AIRPORT_ZONE',
        isOutstation: false,
      };
    }

    if (lower.includes('tambaram') || lower.includes('avadi') || lower.includes('vandalur') || lower.includes('chengalpattu')) {
      return {
        isValid: true,
        normalizedAddress: address.trim(),
        zone: 'SUBURBAN',
        isOutstation: false,
      };
    }

    return {
      isValid: true,
      normalizedAddress: address.trim(),
      zone: 'METRO_CORE',
      isOutstation: false,
    };
  }

  /**
   * Checks if a trip start time falls within night surcharge hours (22:00 to 06:00).
   */
  public isNightTime(dateTime: string | Date): boolean {
    const d = new Date(dateTime);
    if (isNaN(d.getTime())) return false;
    const hours = d.getHours();
    return hours >= 22 || hours < 6;
  }

  /**
   * Estimates route distance and travel duration deterministically.
   */
  public estimateRoute(
    pickup: string,
    drop?: string | null,
    pickupDateTime?: string | Date
  ): RouteEstimationResult {
    const cleanPickup = (pickup || '').toLowerCase().trim();
    const cleanDrop = (drop || '').toLowerCase().trim();
    const isNight = pickupDateTime ? this.isNightTime(pickupDateTime) : false;

    // Check benchmark matches
    for (const route of this.benchmarkRoutes) {
      const [p1, p2] = route.pair;
      if (
        (cleanPickup.includes(p1) && cleanDrop.includes(p2)) ||
        (cleanPickup.includes(p2) && cleanDrop.includes(p1))
      ) {
        return {
          pickup,
          drop: drop || 'Within City Limits',
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          durationFormatted: `${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m`,
          isNightTime: isNight,
          isOutstation: route.distanceKm > 80,
          routeSummary: `Via Major Arterial Corridor (~${route.distanceKm} km)`,
        };
      }
    }

    // Single-location or round-trip local estimation
    if (!drop || drop.trim().length === 0) {
      return {
        pickup,
        drop: 'Hourly Driver Service Area',
        distanceKm: 35,
        durationMinutes: 90,
        durationFormatted: '1h 30m',
        isNightTime: isNight,
        isOutstation: false,
        routeSummary: 'Citywide Driver Standby',
      };
    }

    // Deterministic pseudo-hash distance for arbitrary address pairs
    let hash = 0;
    const combined = cleanPickup + '|' + cleanDrop;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const distanceKm = 8 + (Math.abs(hash) % 32); // Range: 8km - 39km
    const durationMinutes = Math.round(distanceKm * 2.3);

    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

    return {
      pickup,
      drop,
      distanceKm,
      durationMinutes,
      durationFormatted,
      isNightTime: isNight,
      isOutstation: distanceKm > 80,
      routeSummary: `Standard Metro Route (~${distanceKm} km)`,
    };
  }

  /**
   * Calculates comprehensive fare breakdown based on tariff rules.
   */
  public calculateFare(input: FareCalculationInput): FareBreakdownResult {
    const includedHours = input.includedHours || 0;
    const includedKm = input.includedKm || 0;

    const extraHours = Math.max(0, input.actualDurationHours - includedHours);
    const extraKm = Math.max(0, input.estimatedDistanceKm - includedKm);

    const baseFare = input.baseRate;
    const extraHourFare = extraHours * input.extraHourRate;
    const extraKmFare = extraKm * input.extraKmRate;

    const isNight = this.isNightTime(input.pickupDateTime);
    const nightCharge = isNight ? input.nightChargeRate : 0;

    const totalFare = Math.round((baseFare + extraHourFare + extraKmFare + nightCharge) * 100) / 100;

    return {
      baseFare,
      extraHourFare,
      extraKmFare,
      nightCharge,
      totalFare,
      isNightChargeApplied: isNight,
      billableHours: input.actualDurationHours,
      billableKm: input.estimatedDistanceKm,
    };
  }
}

export const mapsService: MapsService = new MockMapsServiceImpl();
export default mapsService;
