import { describe, it, expect } from 'vitest';
import {
  BookingCreateSchema,
  generateBookingReference,
  computeSubmissionHash,
} from '@/../tests/contracts/bookingContract';

describe('Tier 1: Feature 8 & 15 - Booking Validation & Reference Contract', () => {
  const getFutureDate = (hoursAhead: number = 24): string => {
    return new Date(Date.now() + hoursAhead * 3600 * 1000).toISOString();
  };

  const sampleValidPayload = {
    customerName: 'Rajesh Sharma',
    customerPhone: '9876543210',
    customerEmail: 'rajesh.sharma@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Block 4, Jubilee Hills, Hyderabad',
    dropAddress: 'Hitech City, Hyderabad',
    pickupDateTime: getFutureDate(12),
    duration: 4,
    vehicleInfo: 'Honda City (Sedan)',
    specialInstructions: 'Please arrive 10 minutes early.',
  };

  it('validates a complete, compliant booking payload successfully', () => {
    const result = BookingCreateSchema.safeParse(sampleValidPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerName).toBe('Rajesh Sharma');
      expect(result.data.customerPhone).toBe('9876543210');
      expect(result.data.duration).toBe(4);
    }
  });

  it('enforces customerName constraints (min 2, max 100 characters)', () => {
    // Too short
    const shortResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerName: 'A',
    });
    expect(shortResult.success).toBe(false);

    // Whitespace only
    const wsResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerName: '   ',
    });
    expect(wsResult.success).toBe(false);

    // Max boundary
    const longName = 'A'.repeat(101);
    const longResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerName: longName,
    });
    expect(longResult.success).toBe(false);
  });

  it('validates 10-digit Indian mobile numbers and accepts +91 prefix', () => {
    // Standard 10-digit starting with 9
    const valid1 = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerPhone: '9848022338',
    });
    expect(valid1.success).toBe(true);

    // With +91 prefix
    const valid2 = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerPhone: '+919848022338',
    });
    expect(valid2.success).toBe(true);

    // Invalid: only 9 digits
    const invalidShort = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerPhone: '984802233',
    });
    expect(invalidShort.success).toBe(false);

    // Invalid: letters
    const invalidAlpha = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      customerPhone: '984802ABCD',
    });
    expect(invalidAlpha.success).toBe(false);
  });

  it('rejects malformed email addresses', () => {
    const badEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain..com'];
    badEmails.forEach((email) => {
      const result = BookingCreateSchema.safeParse({
        ...sampleValidPayload,
        customerEmail: email,
      });
      expect(result.success).toBe(false);
    });
  });

  it('rejects pickup dates in the past', () => {
    const pastDate = new Date(Date.now() - 3600 * 1000 * 24).toISOString();
    const result = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      pickupDateTime: pastDate,
    });
    expect(result.success).toBe(false);
  });

  it('validates duration boundaries (min 1 hour, max 720 hours)', () => {
    // 0 hours rejected
    const zeroResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      duration: 0,
    });
    expect(zeroResult.success).toBe(false);

    // Negative duration rejected
    const negResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      duration: -2,
    });
    expect(negResult.success).toBe(false);

    // Valid duration 8 hours
    const validResult = BookingCreateSchema.safeParse({
      ...sampleValidPayload,
      duration: 8,
    });
    expect(validResult.success).toBe(true);
  });

  it('generates unique booking reference conforming to K2D-YYYYMMDD-XXXX format', () => {
    const date = new Date('2026-10-31T10:00:00Z');
    const ref1 = generateBookingReference(date, 42);
    expect(ref1).toBe('K2D-20261031-0042');

    // Pattern matching regex
    const refPattern = /^K2D-\d{8}-\d{4}$/;
    expect(refPattern.test(ref1)).toBe(true);

    // Distinct sequences
    const ref2 = generateBookingReference(date, 999);
    expect(ref2).toBe('K2D-20261031-0999');
  });

  it('generates consistent deterministic submissionHash for idempotency lock', () => {
    const hash1 = computeSubmissionHash({
      customerPhone: '9876543210',
      serviceId: 'srv_hourly',
      pickupDateTime: '2026-11-01T10:00:00.000Z',
    });

    const hash2 = computeSubmissionHash({
      customerPhone: '  9876543210  ',
      serviceId: 'srv_hourly',
      pickupDateTime: '2026-11-01T10:00:00.000Z',
    });

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });
});
