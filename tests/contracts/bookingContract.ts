import { z } from 'zod';
import crypto from 'crypto';

// Phone regex: Indian 10-digit mobile number starting with 6-9, or with +91 country code
export const PHONE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;

export const BookingCreateSchema = z.object({
  customerName: z
    .string({ required_error: 'Customer name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  customerPhone: z
    .string({ required_error: 'Mobile phone number is required' })
    .trim()
    .regex(PHONE_REGEX, 'Please enter a valid 10-digit mobile phone number'),
  customerEmail: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address'),
  serviceId: z
    .string({ required_error: 'Service selection is required' })
    .min(1, 'Service selection is required'),
  pickupAddress: z
    .string({ required_error: 'Pickup address is required' })
    .trim()
    .min(5, 'Pickup address must be at least 5 characters')
    .max(300, 'Pickup address cannot exceed 300 characters'),
  dropAddress: z
    .string()
    .trim()
    .min(5, 'Drop address must be at least 5 characters')
    .max(300, 'Drop address cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
  pickupDateTime: z
    .string({ required_error: 'Pickup date and time are required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date/time format',
    })
    .refine((val) => new Date(val).getTime() > Date.now() - 60000, {
      message: 'Pickup date and time cannot be in the past',
    }),
  duration: z
    .number({ required_error: 'Duration is required' })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 hour')
    .max(720, 'Duration cannot exceed 720 hours (30 days)'),
  vehicleInfo: z
    .string({ required_error: 'Vehicle type or info is required' })
    .trim()
    .min(2, 'Vehicle info must be at least 2 characters')
    .max(100, 'Vehicle info cannot exceed 100 characters'),
  specialInstructions: z
    .string()
    .trim()
    .max(500, 'Special instructions cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;

/**
 * Generate unique booking reference matching PROJECT.md: K2D-YYYYMMDD-XXXX
 */
export function generateBookingReference(date: Date = new Date(), sequence: number = 1): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const seq = String(sequence % 10000).padStart(4, '0');
  return `K2D-${yyyy}${mm}${dd}-${seq}`;
}

/**
 * Compute submission hash for duplicate submission detection (5-min idempotency lock)
 */
export function computeSubmissionHash(input: {
  customerPhone: string;
  serviceId: string;
  pickupDateTime: string;
}): string {
  const normalized = `${input.customerPhone.trim()}:${input.serviceId.trim()}:${new Date(input.pickupDateTime).toISOString()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * In-memory idempotency tracker to simulate server double-submit locks (5-minute TTL)
 */
export class IdempotencyManager {
  private cache = new Map<string, { bookingReference: string; expiresAt: number }>();

  public checkAndLock(hash: string, reference: string, ttlMs: number = 300000): { isDuplicate: boolean; existingReference?: string } {
    const now = Date.now();
    const entry = this.cache.get(hash);
    if (entry && entry.expiresAt > now) {
      return { isDuplicate: true, existingReference: entry.bookingReference };
    }
    this.cache.set(hash, { bookingReference: reference, expiresAt: now + ttlMs });
    return { isDuplicate: false };
  }

  public clear(): void {
    this.cache.clear();
  }
}
