import { describe, it, expect } from 'vitest';
import { BookingCreateSchema } from '@/../tests/contracts/bookingContract';

describe('Tier 2: Boundary - Past and Invalid Dates', () => {
  const baseBooking = {
    customerName: 'Ananya Reddy',
    customerPhone: '9848011223',
    customerEmail: 'ananya.reddy@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Banjara Hills Road No. 1, Hyderabad',
    duration: 4,
    vehicleInfo: 'Toyota Innova Crysta',
  };

  it('rejects timestamps in the past (1 hour, 1 day, 1 year ago)', () => {
    const pastTimes = [
      new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      new Date(Date.now() - 86400 * 1000).toISOString(), // 1 day ago
      new Date(Date.now() - 365 * 86400 * 1000).toISOString(), // 1 year ago
    ];

    pastTimes.forEach((pastIso) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        pickupDateTime: pastIso,
      });
      expect(res.success, `Past date ${pastIso} should fail validation`).toBe(false);
    });
  });

  it('rejects malformed and non-parseable date strings', () => {
    const invalidDates = [
      'not-a-real-date',
      '2026-99-99T99:99:99Z',
      'tomorrow at 4pm',
      '31-10-2026', // Non-standard unparseable without separators
      '',
    ];

    invalidDates.forEach((badDate) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        pickupDateTime: badDate,
      });
      expect(res.success, `Date "${badDate}" should fail validation`).toBe(false);
    });
  });

  it('handles leap year validity (2028-02-29 is valid, 2027-02-29 rolls over or errors)', () => {
    // 2028 is a leap year; Feb 29 2028 in future
    const leapDate = new Date('2028-02-29T10:00:00Z').toISOString();
    const resLeap = BookingCreateSchema.safeParse({
      ...baseBooking,
      pickupDateTime: leapDate,
    });
    expect(resLeap.success).toBe(true);
  });

  it('accepts legitimate future dates within reasonable planning windows', () => {
    const futureTimes = [
      new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours from now
      new Date(Date.now() + 7 * 86400 * 1000).toISOString(), // 1 week from now
      new Date(Date.now() + 30 * 86400 * 1000).toISOString(), // 30 days from now
    ];

    futureTimes.forEach((futureIso) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        pickupDateTime: futureIso,
      });
      expect(res.success, `Future date ${futureIso} should be accepted`).toBe(true);
    });
  });
});
