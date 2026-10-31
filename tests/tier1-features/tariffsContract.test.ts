import { describe, it, expect } from 'vitest';
import {
  CHAUFFEUR_SERVICES,
  TariffUpdateSchema,
  isNightTime,
  calculateFare,
} from '@/../tests/contracts/tariffContract';

describe('Tier 1: Feature 7, 12, 13 & 23 - Tariffs and Pricing Contract', () => {
  it('defines exactly 6 distinct chauffeur service tiers', () => {
    expect(CHAUFFEUR_SERVICES.length).toBe(6);

    const expectedSlugs = [
      'hourly-driver',
      'full-day-driver',
      'airport-transfer',
      'outstation-driver',
      'corporate-chauffeur',
      'personal-chauffeur',
    ];

    const actualSlugs = CHAUFFEUR_SERVICES.map((s) => s.slug);
    expectedSlugs.forEach((slug) => {
      expect(actualSlugs).toContain(slug);
    });
  });

  it('explicitly marks unconfirmed rates for client review (Requirement R2 / R3)', () => {
    const corporate = CHAUFFEUR_SERVICES.find((s) => s.slug === 'corporate-chauffeur');
    const personal = CHAUFFEUR_SERVICES.find((s) => s.slug === 'personal-chauffeur');
    const hourly = CHAUFFEUR_SERVICES.find((s) => s.slug === 'hourly-driver');

    expect(corporate?.isUnconfirmed).toBe(true);
    expect(personal?.isUnconfirmed).toBe(true);
    expect(hourly?.isUnconfirmed).toBe(false);
  });

  it('specifies confirmed base rates for public consumer tiers', () => {
    const hourly = CHAUFFEUR_SERVICES.find((s) => s.slug === 'hourly-driver');
    const fullDay = CHAUFFEUR_SERVICES.find((s) => s.slug === 'full-day-driver');
    const airport = CHAUFFEUR_SERVICES.find((s) => s.slug === 'airport-transfer');
    const outstation = CHAUFFEUR_SERVICES.find((s) => s.slug === 'outstation-driver');

    expect(hourly?.basePrice).toBe(399);
    expect(fullDay?.basePrice).toBe(1899);
    expect(airport?.basePrice).toBe(799);
    expect(outstation?.basePrice).toBe(2499);
  });

  it('correctly classifies night hours (22:00 to 06:00)', () => {
    expect(isNightTime('2026-11-01T22:30:00')).toBe(true);
    expect(isNightTime('2026-11-01T23:59:00')).toBe(true);
    expect(isNightTime('2026-11-01T02:15:00')).toBe(true);
    expect(isNightTime('2026-11-01T05:59:00')).toBe(true);

    // Daytime
    expect(isNightTime('2026-11-01T06:01:00')).toBe(false);
    expect(isNightTime('2026-11-01T12:00:00')).toBe(false);
    expect(isNightTime('2026-11-01T18:45:00')).toBe(false);
    expect(isNightTime('2026-11-01T21:59:00')).toBe(false);
  });

  it('validates TariffUpdateSchema against valid and invalid payloads', () => {
    const validUpdate = {
      baseRate: 450,
      extraHourRate: 110,
      nightChargeRate: 250,
      waitingChargePerMin: 5,
      isUnconfirmed: false,
      cancellationPolicy: 'Free cancellation up to 2 hours prior to scheduled pickup.',
    };
    const validResult = TariffUpdateSchema.safeParse(validUpdate);
    expect(validResult.success).toBe(true);

    // Invalid negative rate
    const invalidResult = TariffUpdateSchema.safeParse({
      ...validUpdate,
      baseRate: -100,
    });
    expect(invalidResult.success).toBe(false);
  });

  it('calculates daytime hourly fare accurately without night surcharges', () => {
    const breakdown = calculateFare({
      serviceId: 'srv_hourly',
      durationHours: 6, // 4 hours min base + 2 extra hours
      pickupDateTime: '2026-11-01T10:00:00', // 10 AM (daytime)
      waitingMinutes: 0,
    });

    // Base fare: 4 hrs * 399 = 1596
    expect(breakdown.baseFare).toBe(1596);
    // Extra hours: 2 hrs * 99 = 198
    expect(breakdown.extraHours).toBe(2);
    expect(breakdown.extraHoursCharge).toBe(198);
    expect(breakdown.nightSurcharge).toBe(0);
    expect(breakdown.isNightTrip).toBe(false);
    expect(breakdown.totalFare).toBe(1596 + 198);
  });
});
