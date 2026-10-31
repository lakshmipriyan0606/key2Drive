import { describe, it, expect } from 'vitest';
import { calculateFare } from '@/../tests/contracts/tariffContract';

describe('Tier 3: Interaction - Fare Calculation with Surcharges & Night Rates', () => {
  it('combines base fare, extra hours, night charge, and waiting fee for Hourly Chauffeur', () => {
    // 7 hours booked at 23:00 (Night trip) with 20 minutes waiting
    const breakdown = calculateFare({
      serviceId: 'srv_hourly',
      durationHours: 7,
      pickupDateTime: '2026-11-01T23:00:00',
      waitingMinutes: 20,
    });

    // Base fare: 4 hrs min * 399 = 1596
    expect(breakdown.baseFare).toBe(1596);
    // Extra hours: (7 - 4) = 3 hrs * 99 = 297
    expect(breakdown.extraHours).toBe(3);
    expect(breakdown.extraHoursCharge).toBe(297);
    // Night surcharge: 23:00 falls in [22:00-06:00] -> 250
    expect(breakdown.isNightTrip).toBe(true);
    expect(breakdown.nightSurcharge).toBe(250);
    // Waiting charge: 20 min * 3/min = 60
    expect(breakdown.waitingCharge).toBe(60);
    // Total: 1596 + 297 + 250 + 60 = 2203
    expect(breakdown.totalFare).toBe(2203);
  });

  it('computes Full-Day Chauffeur with extra hours during daytime (zero night surcharge)', () => {
    // 10 hours booked (8 hours min base + 2 extra hours) at 09:00 AM
    const breakdown = calculateFare({
      serviceId: 'srv_fullday',
      durationHours: 10,
      pickupDateTime: '2026-11-01T09:00:00',
    });

    // Base fare: 1899
    expect(breakdown.baseFare).toBe(1899);
    // Extra hours: 2 hrs * 149 = 298
    expect(breakdown.extraHours).toBe(2);
    expect(breakdown.extraHoursCharge).toBe(298);
    // Daytime -> no night surcharge
    expect(breakdown.isNightTrip).toBe(false);
    expect(breakdown.nightSurcharge).toBe(0);
    expect(breakdown.totalFare).toBe(1899 + 298);
  });

  it('computes Airport Transfer flat rate with early-morning night charge and luggage waiting', () => {
    // Airport transfer at 04:30 AM with 30 min waiting
    const breakdown = calculateFare({
      serviceId: 'srv_airport',
      durationHours: 2,
      pickupDateTime: '2026-11-01T04:30:00',
      waitingMinutes: 30,
    });

    expect(breakdown.baseFare).toBe(799);
    expect(breakdown.isNightTrip).toBe(true);
    expect(breakdown.nightSurcharge).toBe(250);
    // Waiting charge: 30 min * 5/min = 150
    expect(breakdown.waitingCharge).toBe(150);
    expect(breakdown.totalFare).toBe(799 + 250 + 150);
  });

  it('computes Outstation Chauffeur daily rate with night driver allowance', () => {
    const breakdown = calculateFare({
      serviceId: 'srv_outstation',
      durationHours: 12,
      pickupDateTime: '2026-11-01T22:30:00',
    });

    expect(breakdown.baseFare).toBe(2499);
    expect(breakdown.isNightTrip).toBe(true);
    expect(breakdown.nightSurcharge).toBe(300);
    expect(breakdown.totalFare).toBe(2499 + 300);
  });

  it('throws an error for unrecognized or non-existent service ID', () => {
    expect(() =>
      calculateFare({
        serviceId: 'invalid_service_xyz',
        durationHours: 4,
        pickupDateTime: '2026-11-01T12:00:00',
      })
    ).toThrow(/Service not found/);
  });
});
