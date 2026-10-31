import { describe, it, expect } from 'vitest';
import { BookingCreateSchema } from '@/../tests/contracts/bookingContract';
import { EnquiryCreateSchema } from '@/../tests/contracts/enquiryContract';
import { AdminLoginSchema } from '@/../tests/contracts/authContract';

describe('Tier 2: Boundary - Empty and Missing Fields', () => {
  const baseBooking = {
    customerName: 'Aarav Patel',
    customerPhone: '9876543210',
    customerEmail: 'aarav.patel@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Road No. 36, Jubilee Hills',
    dropAddress: 'Gachibowli Stadium',
    pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 4,
    vehicleInfo: 'Hyundai Verna',
    specialInstructions: '',
  };

  it('rejects booking when mandatory fields are omitted or undefined', () => {
    const requiredKeys: (keyof typeof baseBooking)[] = [
      'customerName',
      'customerPhone',
      'customerEmail',
      'serviceId',
      'pickupAddress',
      'pickupDateTime',
      'duration',
      'vehicleInfo',
    ];

    requiredKeys.forEach((key) => {
      const copy: Record<string, unknown> = { ...baseBooking };
      delete copy[key];
      const result = BookingCreateSchema.safeParse(copy);
      expect(result.success, `Expected omitting ${key} to fail validation`).toBe(false);
    });
  });

  it('rejects booking when fields contain empty strings or whitespace only', () => {
    const whitespaceFields = ['customerName', 'customerPhone', 'customerEmail', 'pickupAddress', 'vehicleInfo'];

    whitespaceFields.forEach((field) => {
      const copy = { ...baseBooking, [field]: '   \t  ' };
      const result = BookingCreateSchema.safeParse(copy);
      expect(result.success, `Expected whitespace in ${field} to fail validation`).toBe(false);
    });
  });

  it('allows optional fields (dropAddress, specialInstructions) to be omitted or empty', () => {
    const withoutOptional = {
      ...baseBooking,
      dropAddress: undefined,
      specialInstructions: undefined,
    };
    const res1 = BookingCreateSchema.safeParse(withoutOptional);
    expect(res1.success).toBe(true);

    const withEmptyOptional = {
      ...baseBooking,
      dropAddress: '',
      specialInstructions: '',
    };
    const res2 = BookingCreateSchema.safeParse(withEmptyOptional);
    expect(res2.success).toBe(true);
  });

  it('rejects enquiry when name, phone, email, subject, or message are empty/whitespace', () => {
    const baseEnquiry = {
      name: 'Rohan Gupta',
      phone: '9812345678',
      email: 'rohan.gupta@example.com',
      subject: 'Outstation chauffeur enquiry',
      message: 'Need chauffeur for 3-day trip to Mysore next weekend.',
    };

    expect(EnquiryCreateSchema.safeParse({ ...baseEnquiry, name: '  ' }).success).toBe(false);
    expect(EnquiryCreateSchema.safeParse({ ...baseEnquiry, subject: ' ' }).success).toBe(false);
    expect(EnquiryCreateSchema.safeParse({ ...baseEnquiry, message: '\n\t  ' }).success).toBe(false);
  });

  it('rejects admin login when email or password is empty or null', () => {
    expect(AdminLoginSchema.safeParse({ email: '', password: 'AdminPassword1!' }).success).toBe(false);
    expect(AdminLoginSchema.safeParse({ email: 'admin@key2drive.com', password: '' }).success).toBe(false);
    expect(AdminLoginSchema.safeParse({ email: null, password: null }).success).toBe(false);
  });
});
