import { describe, it, expect } from 'vitest';
import { PHONE_REGEX, BookingCreateSchema } from '@/../tests/contracts/bookingContract';

describe('Tier 2: Boundary - Malformed Phone Numbers', () => {
  const baseBooking = {
    customerName: 'Kavita Menon',
    customerEmail: 'kavita.menon@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Indiranagar 12th Main, Bangalore',
    pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 4,
    vehicleInfo: 'Honda City',
  };

  it('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
    const validNumbers = [
      '9876543210',
      '8765432109',
      '7654321098',
      '6543210987',
      '+919876543210',
      '919876543210',
    ];

    validNumbers.forEach((phone) => {
      expect(PHONE_REGEX.test(phone), `Phone ${phone} should be valid`).toBe(true);
      const res = BookingCreateSchema.safeParse({ ...baseBooking, customerPhone: phone });
      expect(res.success, `Booking with phone ${phone} should pass schema`).toBe(true);
    });
  });

  it('rejects numbers that start with invalid leading digits (0, 1, 2, 3, 4, 5)', () => {
    const invalidStarters = [
      '0987654321',
      '1234567890',
      '2345678901',
      '3456789012',
      '4567890123',
      '5678901234',
    ];

    invalidStarters.forEach((phone) => {
      expect(PHONE_REGEX.test(phone), `Phone ${phone} should be rejected`).toBe(false);
      const res = BookingCreateSchema.safeParse({ ...baseBooking, customerPhone: phone });
      expect(res.success).toBe(false);
    });
  });

  it('rejects numbers with incorrect lengths (under 10 or over 10 digits without +91)', () => {
    const wrongLengths = [
      '987654321', // 9 digits
      '98765432', // 8 digits
      '98765', // 5 digits
      '98765432100', // 11 digits without +91
      '987654321000', // 12 digits without +91
    ];

    wrongLengths.forEach((phone) => {
      expect(PHONE_REGEX.test(phone), `Length of ${phone} should be invalid`).toBe(false);
    });
  });

  it('rejects numbers containing alphabet characters, punctuation, or spaces', () => {
    const malformed = [
      '98765ABCD0',
      '98765-43210',
      '(987) 654-3210',
      '98765 43210',
      '98765.43210',
      '++919876543210',
    ];

    malformed.forEach((phone) => {
      expect(PHONE_REGEX.test(phone), `Malformed ${phone} should be invalid`).toBe(false);
    });
  });
});
