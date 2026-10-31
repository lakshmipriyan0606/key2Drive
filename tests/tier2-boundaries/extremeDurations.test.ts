import { describe, it, expect } from 'vitest';
import { BookingCreateSchema } from '@/../tests/contracts/bookingContract';
import { calculateFare, CHAUFFEUR_SERVICES } from '@/../tests/contracts/tariffContract';

describe('Tier 2: Boundary - Extreme and Edge Durations', () => {
  const baseBooking = {
    customerName: 'Karthik Varma',
    customerPhone: '9988776655',
    customerEmail: 'karthik.varma@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Koramangala 4th Block, Bangalore',
    pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
    vehicleInfo: 'Skoda Octavia',
  };

  it('rejects non-positive durations (0, -1, -24)', () => {
    [0, -1, -5, -24].forEach((dur) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        duration: dur,
      });
      expect(res.success, `Duration ${dur} should be rejected`).toBe(false);
    });
  });

  it('rejects floating-point / fractional durations (integer hours required)', () => {
    [1.5, 4.25, 8.75].forEach((dur) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        duration: dur,
      });
      expect(res.success, `Fractional duration ${dur} should be rejected`).toBe(false);
    });
  });

  it('rejects excessively large durations exceeding 720 hours (30-day cap)', () => {
    [721, 1000, 9999].forEach((dur) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        duration: dur,
      });
      expect(res.success, `Duration ${dur} should exceed maximum threshold`).toBe(false);
    });
  });

  it('accepts boundary durations (1, 4, 8, 24, 720 hours)', () => {
    [1, 4, 8, 24, 720].forEach((dur) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        duration: dur,
      });
      expect(res.success, `Duration ${dur} should be valid`).toBe(true);
    });
  });

  it('fare calculator enforces minimum billable duration when requested duration is lower', () => {
    const hourlyService = CHAUFFEUR_SERVICES.find((s) => s.slug === 'hourly-driver');
    expect(hourlyService?.minDurationHours).toBe(4);

    // If customer requests 2 hours on hourly service, base fare still covers 4 hours minimum
    const breakdown = calculateFare({
      serviceId: 'srv_hourly',
      durationHours: 2,
      pickupDateTime: '2026-11-01T12:00:00',
    });

    expect(breakdown.baseFare).toBe(4 * 399); // 4 hours minimum
    expect(breakdown.extraHours).toBe(0);
    expect(breakdown.totalFare).toBe(4 * 399);
  });
});
